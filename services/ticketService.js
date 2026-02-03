/**
 * OpsMind - Ticket Service
 * 
 * Handles all ticket-related API operations including:
 * - Fetching tickets (list and single)
 * - Creating tickets
 * - Updating ticket status
 * - Ticket search and filtering
 * 
 * All requests include authentication headers automatically.
 */

import AuthService from './authService.js';

const API_BASE_URL = 'http://localhost:3001/tickets' || '/api';

/**
 * Handle API response and errors consistently
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed response data
 * @throws {Error} On API errors
 */
async function handleResponse(response) {
    if (response.status === 401) {
        // Token expired or invalid - redirect to login
        AuthService.clearAuth();
        window.location.href = '/index.html';
        throw new Error('Session expired');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * TicketService - Singleton service for ticket operations
 */
const TicketService = {
    /**
     * Get a paginated list of tickets with optional filters
     * @param {Object} options - Query options
     * @param {number} options.page - Page number (1-based)
     * @param {number} options.limit - Items per page
     * @param {string} options.status - Filter by status
     * @param {string} options.priority - Filter by priority
     * @param {string} options.category - Filter by category
     * @param {string} options.search - Search term
     * @param {string} options.dateRange - Date range filter
     * @param {string} options.sortBy - Sort field
     * @param {string} options.sortOrder - Sort direction (asc/desc)
     * @returns {Promise<Object>} Tickets list with pagination info
     */
    async getTickets(options = {}) {
        const params = new URLSearchParams();
        
        // Add query parameters
        if (options.page) params.append('page', options.page);
        if (options.limit) params.append('limit', options.limit);
        if (options.status) params.append('status', options.status);
        if (options.priority) params.append('priority', options.priority);
        if (options.category) params.append('category', options.category);
        if (options.search) params.append('search', options.search);
        if (options.dateRange) params.append('dateRange', options.dateRange);
        if (options.sortBy) params.append('sortBy', options.sortBy);
        if (options.sortOrder) params.append('sortOrder', options.sortOrder);

        const queryString = params.toString();
        const url = `${API_BASE_URL}/tickets${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get a single ticket by ID
     * @param {string} ticketId - Ticket ID
     * @returns {Promise<Object>} Ticket details
     */
    async getTicket(ticketId) {
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Create a new ticket
     * @param {Object} ticketData - Ticket data
     * @param {string} ticketData.subject - Ticket subject
     * @param {string} ticketData.description - Ticket description
     * @param {string} ticketData.priority - Priority level
     * @param {string} ticketData.category - Ticket category
     * @param {string} ticketData.requester - Requester email
     * @param {string} ticketData.assignee - Assignee ID (optional)
     * @returns {Promise<Object>} Created ticket
     */
    async createTicket(ticketData) {
        const response = await fetch(`${API_BASE_URL}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            },
            body: JSON.stringify(ticketData)
        });

        return handleResponse(response);
    },

    /**
     * Update ticket status
     * @param {string} ticketId - Ticket ID
     * @param {string} status - New status
     * @param {string} comment - Optional status change comment
     * @returns {Promise<Object>} Updated ticket
     */
    async updateStatus(ticketId, status, comment = '') {
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            },
            body: JSON.stringify({ status, comment })
        });

        return handleResponse(response);
    },

    /**
     * Update ticket details
     * @param {string} ticketId - Ticket ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated ticket
     */
    async updateTicket(ticketId, updates) {
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            },
            body: JSON.stringify(updates)
        });

        return handleResponse(response);
    },

    /**
     * Delete a ticket
     * @param {string} ticketId - Ticket ID
     * @returns {Promise<void>}
     */
    async deleteTicket(ticketId) {
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
            method: 'DELETE',
            headers: {
                ...AuthService.getAuthHeaders()
            }
        });

        if (response.status === 401) {
            AuthService.clearAuth();
            window.location.href = '/index.html';
            throw new Error('Session expired');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to delete ticket');
        }
    },

    /**
     * Get ticket statistics for dashboard
     * @returns {Promise<Object>} Ticket statistics
     */
    async getStatistics() {
        const response = await fetch(`${API_BASE_URL}/tickets/statistics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get high priority tickets
     * @param {number} limit - Max number of tickets to return
     * @returns {Promise<Array>} High priority tickets
     */
    async getHighPriority(limit = 5) {
        const response = await fetch(`${API_BASE_URL}/tickets/high-priority?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get recent activity for tickets
     * @param {number} limit - Max number of activities
     * @returns {Promise<Array>} Recent activities
     */
    async getRecentActivity(limit = 10) {
        const response = await fetch(`${API_BASE_URL}/tickets/activity?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get ticket trend data for charts
     * @param {number} days - Number of days of history
     * @returns {Promise<Object>} Trend data
     */
    async getTrends(days = 30) {
        const response = await fetch(`${API_BASE_URL}/tickets/trends?days=${days}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get list of available assignees
     * @returns {Promise<Array>} List of users who can be assigned tickets
     */
    async getAssignees() {
        const response = await fetch(`${API_BASE_URL}/users/assignees`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    }
};

// Freeze the service to prevent modifications
Object.freeze(TicketService);

export default TicketService;
