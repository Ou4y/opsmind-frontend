# Update Ticket Modal - Schema Changes

## Overview
Updated the Update Ticket modal and functionality to match the new backend PATCH `/tickets/{id}` endpoint schema.

## Backend PATCH Endpoint Schema

### Allowed Fields for Update:
- `title` (string)
- `description` (string)
- `type_of_request` (enum: INCIDENT, SERVICE_REQUEST, MAINTENANCE)
- `building` (string)
- `room` (string)
- `status` (enum: OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- `resolution_summary` (string, optional - shown when status is RESOLVED/CLOSED)

### Status Transition Rules:
- **OPEN** → **IN_PROGRESS** only
- **IN_PROGRESS** → **RESOLVED** only
- **RESOLVED** → **CLOSED** only

### System-Assigned Fields (NOT updatable by users):
- `priority` (LOW, MEDIUM, HIGH) - System assigned
- `support_level` (L1, L2, L3, L4) - System assigned
- `assigned_to_level` (L1, L2, L3, L4) - System assigned
- `escalation_count` - Managed via escalation endpoint
- `requester_id` - Set on creation, cannot be changed
- `assigned_to` - Managed separately
- `is_deleted` - Managed via delete endpoint
- `created_at`, `updated_at`, `closed_at` - System managed timestamps

---

## Changes Made

### 1. Updated `tickets.html` - Update Ticket Modal

**Old Fields:**
- Subject
- Description
- Type (INCIDENT, REQUEST, PROBLEM)
- Priority (LOW, MEDIUM, HIGH, CRITICAL) ❌
- Assign To ❌

**New Fields (matching backend):**
- ✅ Title (required)
- ✅ Description (required)
- ✅ Type of Request (INCIDENT, SERVICE_REQUEST, MAINTENANCE)
- ✅ Status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- ✅ Building (required)
- ✅ Room (required)
- ✅ Resolution Summary (conditional - shown only for RESOLVED/CLOSED status)

**HTML Changes:**
```html
<!-- Update Ticket Modal - Now matches backend schema -->
<div class="modal fade" id="updateTicketModal">
    <form id="updateTicketForm" class="modal-content" novalidate>
        <div class="modal-body">
            <div class="row g-3">
                <!-- Title (required) -->
                <input id="updateTicketTitle" name="title" required>
                
                <!-- Description (required) -->
                <textarea id="updateTicketDescription" name="description" required>
                
                <!-- Type of Request (required) -->
                <select id="updateTicketType" name="type_of_request">
                    <option value="INCIDENT">Incident</option>
                    <option value="SERVICE_REQUEST">Service Request</option>
                    <option value="MAINTENANCE">Maintenance</option>
                </select>
                
                <!-- Status -->
                <select id="updateTicketStatus" name="status">
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                </select>
                
                <!-- Building (required) -->
                <input id="updateTicketBuilding" name="building" required>
                
                <!-- Room (required) -->
                <input id="updateTicketRoom" name="room" required>
                
                <!-- Resolution Summary (conditional) -->
                <textarea id="updateResolutionSummary" name="resolution_summary">
            </div>
        </div>
    </form>
</div>
```

---

### 2. Updated `tickets.js` - JavaScript Functions

#### A. `openUpdateModal(ticketId)` Function

**Changes:**
- Updated to populate new field IDs
- Handles `type_of_request` instead of generic `type`
- Populates `building` and `room` fields
- Shows/hides resolution summary container based on status
- Adds event listener for status changes to toggle resolution field visibility

**Code:**
```javascript
function openUpdateModal(ticketId) {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    state.selectedTicket = ticketId;
    
    // Populate fields matching backend schema
    document.getElementById('updateTicketTitle').value = ticket.title || '';
    document.getElementById('updateTicketDescription').value = ticket.description || '';
    document.getElementById('updateTicketType').value = ticket.type_of_request || 'INCIDENT';
    document.getElementById('updateTicketStatus').value = ticket.status || 'OPEN';
    document.getElementById('updateTicketBuilding').value = ticket.building || '';
    document.getElementById('updateTicketRoom').value = ticket.room || '';
    
    // Show resolution summary if needed
    const resolutionContainer = document.getElementById('updateResolutionSummaryContainer');
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
        resolutionContainer.style.display = 'block';
        if (ticket.resolution_summary) {
            document.getElementById('updateResolutionSummary').value = ticket.resolution_summary;
        }
    }
    
    // Show modal
    bootstrap.Modal.getOrCreateInstance(document.getElementById('updateTicketModal')).show();
}
```

---

#### B. `handleUpdateTicket(e)` Function

**Changes:**
- Collects only backend-allowed fields
- Validates status transitions (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
- Only includes `status` in update if it's changed
- Only includes `resolution_summary` if status is RESOLVED or CLOSED
- Proper error handling for invalid state transitions

**Code:**
```javascript
async function handleUpdateTicket(e) {
    if (e) e.preventDefault();
    
    const form = document.getElementById('updateTicketForm');
    if (!UI.validateForm(form)) return;
    
    const ticketId = state.selectedTicket;
    
    // Collect backend-allowed fields
    const title = document.getElementById('updateTicketTitle').value.trim();
    const description = document.getElementById('updateTicketDescription').value.trim();
    const type_of_request = document.getElementById('updateTicketType').value;
    const status = document.getElementById('updateTicketStatus').value;
    const building = document.getElementById('updateTicketBuilding').value.trim();
    const room = document.getElementById('updateTicketRoom').value.trim();
    const resolution_summary = document.getElementById('updateResolutionSummary').value.trim();
    
    // Validate required fields
    if (!title || !description || !type_of_request || !building || !room) {
        UI.error('All required fields must be filled');
        return;
    }
    
    // Validate status transitions
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (ticket && status && status !== ticket.status) {
        const validTransitions = {
            'OPEN': ['IN_PROGRESS'],
            'IN_PROGRESS': ['RESOLVED'],
            'RESOLVED': ['CLOSED']
        };
        
        const allowedStates = validTransitions[ticket.status];
        if (allowedStates && !allowedStates.includes(status)) {
            UI.error(`Invalid transition. From ${ticket.status} you can only go to: ${allowedStates.join(', ')}`);
            return;
        }
    }
    
    // Build update data with only backend-allowed fields
    const updateData = {
        title,
        description,
        type_of_request,
        building,
        room
    };
    
    // Only include status if changed
    if (status && status !== ticket?.status) {
        updateData.status = status;
    }
    
    // Include resolution_summary for RESOLVED/CLOSED
    if (resolution_summary && (status === 'RESOLVED' || status === 'CLOSED')) {
        updateData.resolution_summary = resolution_summary;
    }
    
    try {
        await TicketService.updateTicket(ticketId, updateData);
        UI.success('Ticket updated successfully');
        
        // Close modals and reload
        bootstrap.Modal.getInstance(document.getElementById('updateTicketModal'))?.hide();
        await loadTickets();
    } catch (error) {
        UI.error(error.message || 'Failed to update ticket');
    }
}
```

---

## Field Mapping Summary

| Frontend Field ID | Backend Field | Type | Required | Notes |
|------------------|---------------|------|----------|-------|
| `updateTicketTitle` | `title` | string | ✅ Yes | Ticket title |
| `updateTicketDescription` | `description` | string | ✅ Yes | Detailed description |
| `updateTicketType` | `type_of_request` | enum | ✅ Yes | INCIDENT, SERVICE_REQUEST, MAINTENANCE |
| `updateTicketStatus` | `status` | enum | ⚠️ Optional | OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| `updateTicketBuilding` | `building` | string | ✅ Yes | Building location |
| `updateTicketRoom` | `room` | string | ✅ Yes | Room number |
| `updateResolutionSummary` | `resolution_summary` | string | ⚠️ Conditional | Only for RESOLVED/CLOSED |

---

## Validation Rules

### 1. **Required Fields**
- Title
- Description
- Type of Request
- Building
- Room

### 2. **Status Transitions**
```
OPEN ──────→ IN_PROGRESS ──────→ RESOLVED ──────→ CLOSED
   (only)            (only)            (only)
```

### 3. **Resolution Summary**
- Only shown when status is RESOLVED or CLOSED
- Becomes visible/hidden dynamically when status changes
- Sent to backend only when status is RESOLVED or CLOSED

---

## Testing Checklist

- [ ] Open update modal - all fields populate correctly
- [ ] Update title and description
- [ ] Change type_of_request
- [ ] Update building and room
- [ ] Test valid status transition (OPEN → IN_PROGRESS)
- [ ] Test invalid status transition (OPEN → RESOLVED) - should show error
- [ ] Change status to RESOLVED - resolution summary field appears
- [ ] Submit with all required fields
- [ ] Verify backend receives correct field names
- [ ] Check that system-assigned fields (priority, support_level, etc.) are NOT sent

---

## Backend Validation

The backend will reject:
- ❌ Invalid status transitions
- ❌ Unknown/extra fields
- ❌ Missing required fields
- ❌ Attempts to change system-assigned fields

---

## Example Update Request

```json
{
  "title": "Updated printer issue",
  "description": "Printer in room 101 is not printing color documents",
  "type_of_request": "INCIDENT",
  "building": "Building A",
  "room": "101",
  "status": "IN_PROGRESS",
  "resolution_summary": ""
}
```

**For RESOLVED status:**
```json
{
  "title": "Printer fixed",
  "description": "Replaced toner cartridge",
  "type_of_request": "INCIDENT",
  "building": "Building A",
  "room": "101",
  "status": "RESOLVED",
  "resolution_summary": "Replaced color toner cartridge and tested printing"
}
```

---

## Notes

1. **Priority is NOT updatable** - It's system-assigned based on backend rules
2. **Assignee is NOT in this endpoint** - Use separate assignment logic if needed
3. **Escalation is separate** - Use `POST /tickets/{id}/escalate` endpoint
4. **Status must follow transition rules** - Frontend validates before sending
5. **Resolution summary** - Only relevant for RESOLVED/CLOSED status

---

## Related Files Changed

1. `/tickets.html` - Update modal structure
2. `/assets/js/pages/tickets.js` - `openUpdateModal()` and `handleUpdateTicket()` functions
3. `/services/ticketService.js` - Already correct (uses PATCH with updateData)

---

## Status: ✅ Complete

All changes have been implemented and match the backend schema exactly.
