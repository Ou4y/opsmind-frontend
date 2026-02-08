# Ticket System Updates Summary

## Overview
Updated the OpsMind frontend to match the new backend API schema and endpoints for the ticketing system. The system now supports role-based ticket access (regular users see only their tickets, admins see all tickets).

---

## Backend Schema Changes

### New Ticket Fields
- `title` - Ticket title (was `subject`)
- `requester_id` - User ID who created the ticket (required)
- `type_of_request` - Type enum: `INCIDENT`, `SERVICE_REQUEST`, `MAINTENANCE` (replaced `category`)
- `building` - Building location (required)
- `room` - Room number (required)
- `assigned_to_level` - Support level: `L1`, `L2`, `L3`, `L4`
- `support_level` - Current support level
- `escalation_count` - Number of times escalated
- `resolution_summary` - Resolution details when closing
- `is_deleted` - Soft delete flag
- `closed_at` - Timestamp when ticket was closed

### Status Values (Updated)
- `OPEN` (was `open`)
- `IN_PROGRESS` (was `in_progress`)
- `RESOLVED` (was `resolved`)
- `CLOSED` (was `closed`)
- Removed: `PENDING`

### Priority Values (Updated)
- `LOW` (was `low`)
- `MEDIUM` (was `medium`)
- `HIGH` (was `high`)
- Removed: `CRITICAL`

### State Transitions
Valid transitions are enforced:
- OPEN → IN_PROGRESS
- IN_PROGRESS → RESOLVED
- RESOLVED → CLOSED

---

## API Endpoints Updated

### 1. **GET /tickets**
- Returns all tickets (admin only)
- Supports pagination with `limit` and `offset`
- Filters: `status`, `priority`, `requester_id`

### 2. **GET /tickets/requester/{requester_id}** ⭐ NEW
- Returns tickets for specific requester (regular users)
- Supports same filters and pagination

### 3. **POST /tickets**
**Required fields only:**
- `title`
- `description`
- `type_of_request` (INCIDENT, SERVICE_REQUEST, MAINTENANCE)
- `building`
- `room`
- `requester_id`

**System-assigned fields:**
- `priority` - Assigned by backend (default: MEDIUM)
- `support_level` - Assigned by backend (default: L1)
- `assigned_to_level` - Assigned by backend (default: L1)
- `status` - Always starts as OPEN
- `escalation_count` - Starts at 0

### 4. **PATCH /tickets/{id}**
**Allowed update fields:**
- `title`
- `description`
- `type_of_request`
- `building`
- `room`
- `status` (must follow valid transitions)
- `resolution_summary`

### 5. **POST /tickets/{id}/escalate** ⭐ NEW
Escalate ticket to higher support level:
```json
{
  "from_level": "L1",
  "to_level": "L2",
  "reason": "Requires advanced troubleshooting"
}
```

### 6. **DELETE /tickets/{id}**
- Soft deletes ticket (sets `is_deleted = true`)

---

## Frontend Changes

### 1. **services/ticketService.js**

#### Updated Methods:
```javascript
// Updated to match new schema
createTicket(ticketData) 
// Expects: { title, description, type_of_request, building, room, requester_id }

// Updated to use PATCH /tickets/{id}
updateStatus(ticketId, status, resolution_summary)

// New method for requester-specific tickets
getTicketsByRequester(requesterId, options)

// New method for escalation
escalateTicket(ticketId, escalationData)
```

### 2. **assets/js/pages/tickets.js**

#### Role-Based Ticket Loading:
```javascript
async function loadTickets() {
  const currentUser = AuthService.getUser();
  const isAdmin = AuthService.isAdmin();
  
  if (!isAdmin && currentUser?.id) {
    // Regular users: GET /tickets/requester/{requester_id}
    response = await TicketService.getTicketsByRequester(currentUser.id, { ... });
  } else {
    // Admins: GET /tickets
    response = await TicketService.getTickets({ ... });
  }
}
```

#### Updated State Filters:
```javascript
filters: {
  search: '',
  status: '',          // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  priority: '',        // LOW, MEDIUM, HIGH
  type_of_request: '', // INCIDENT, SERVICE_REQUEST, MAINTENANCE
  dateRange: ''
}
```

#### Updated Create Ticket:
```javascript
async function handleCreateTicket(e) {
  const currentUser = AuthService.getUser();
  const ticketData = {
    title,
    description,
    type_of_request,  // From dropdown: INCIDENT, SERVICE_REQUEST, MAINTENANCE
    building,         // User input
    room,            // User input
    requester_id: currentUser.id  // Auto-filled from logged-in user
  };
  // Priority, support_level, status are system-assigned
}
```

### 3. **tickets.html**

#### Updated Create Modal:
- Removed: Priority dropdown (system-assigned)
- Removed: Assignee dropdown (system-assigned)
- Added: Building input field (required)
- Added: Room input field (required)
- Updated: Type dropdown with new values

#### Updated Filters:
```html
<!-- Type Filter (was Category) -->
<select id="typeFilter">
  <option value="">All Types</option>
  <option value="INCIDENT">Incident</option>
  <option value="SERVICE_REQUEST">Service Request</option>
  <option value="MAINTENANCE">Maintenance</option>
</select>

<!-- Updated Status Filter -->
<select id="statusFilter">
  <option value="">All Statuses</option>
  <option value="OPEN">Open</option>
  <option value="IN_PROGRESS">In Progress</option>
  <option value="RESOLVED">Resolved</option>
  <option value="CLOSED">Closed</option>
</select>

<!-- Updated Priority Filter -->
<select id="priorityFilter">
  <option value="">All Priorities</option>
  <option value="HIGH">High</option>
  <option value="MEDIUM">Medium</option>
  <option value="LOW">Low</option>
</select>
```

#### Updated Ticket Detail Modal:
- Added: Building field display
- Added: Room field display
- Added: Support Level display
- Added: Assigned Level display
- Added: Escalation Count display
- Added: Resolution Summary textarea (shown when status is RESOLVED/CLOSED)
- Updated: Status dropdown with valid transitions note

---

## User Experience Flow

### Regular User (Student/Staff):
1. **View Tickets**: Only sees their own tickets (`requester_id` matches their ID)
2. **Create Ticket**: Auto-fills `requester_id` with their user ID
3. **Update Ticket**: Can update their own ticket details
4. **View Status**: Sees current status and support level

### Admin User:
1. **View Tickets**: Sees ALL tickets in the system
2. **Filter Tickets**: Can filter by status, priority, type, requester
3. **Assign Tickets**: Can assign tickets to support levels
4. **Escalate Tickets**: Can escalate between L1 → L2 → L3 → L4
5. **Update Status**: Can move tickets through workflow states

---

## Testing Checklist

### As Regular User:
- [ ] Can only see my own tickets
- [ ] Can create a ticket with building and room
- [ ] Priority is automatically assigned
- [ ] Can view ticket details
- [ ] Cannot see other users' tickets

### As Admin:
- [ ] Can see all tickets
- [ ] Can filter by status, priority, type
- [ ] Can update ticket status with valid transitions
- [ ] Can escalate tickets
- [ ] Can add resolution summary when closing tickets

### API Integration:
- [ ] GET /tickets returns all tickets (admin)
- [ ] GET /tickets/requester/{id} returns user's tickets
- [ ] POST /tickets creates ticket with required fields
- [ ] PATCH /tickets/{id} updates ticket
- [ ] POST /tickets/{id}/escalate escalates ticket
- [ ] DELETE /tickets/{id} soft deletes ticket

---

## Migration Notes

### Data Mapping:
- Old `subject` → New `title`
- Old `category` → New `type_of_request`
- Old `createdByUserId` → New `requester_id`
- Old status values (lowercase) → New status values (UPPERCASE)
- Old priority values (lowercase) → New priority values (UPPERCASE)

### Breaking Changes:
1. **Priority Selection Removed**: Users can no longer select priority when creating tickets. It's system-assigned.
2. **Category Replaced**: The `category` field is now `type_of_request` with different values.
3. **New Required Fields**: `building` and `room` are now required when creating tickets.
4. **Assignee Removed**: The `assignee` field is replaced by `assigned_to_level` (L1-L4).

---

## Configuration

### Environment Variables:
```javascript
// services/ticketService.js
const API_BASE_URL = window.OPSMIND_API_URL || 'http://localhost:3001';
```

### Backend Expected URL:
- Default: `http://localhost:3001`
- Can be configured via `window.OPSMIND_API_URL`

---

## Future Enhancements

1. **Escalation UI**: Add dedicated escalation modal in frontend
2. **Support Level Display**: Show support level badges in ticket list
3. **Building/Room Autocomplete**: Add autocomplete for building and room fields
4. **Resolution Templates**: Pre-defined resolution summary templates
5. **Ticket History**: Show complete escalation and status change history
6. **Real-time Updates**: WebSocket integration for live ticket updates

---

## Files Modified

1. ✅ `/services/ticketService.js` - Updated all API methods
2. ✅ `/assets/js/pages/tickets.js` - Updated UI logic and data handling
3. ✅ `/tickets.html` - Updated forms, filters, and modals

## Files Created

1. 📄 `TICKET_UPDATES_SUMMARY.md` - This documentation

---

**Last Updated**: February 9, 2026  
**Version**: 2.0  
**Status**: ✅ Complete
