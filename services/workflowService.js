/**
 * OpsMind - Workflow Service
 * 
 * Handles all workflow-related API operations including:
 * - Fetching workflows
 * - Creating/updating workflows
 * - Triggering workflow execution
 * - Viewing execution history
 */

import AuthService from './authService.js';

const API_BASE_URL = window.OPSMIND_API_URL || '/api';

/**
 * Handle API response and errors consistently
 */
async function handleResponse(response) {
    if (response.status === 401) {
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
 * WorkflowService - Singleton service for workflow operations
 */
const WorkflowService = {
    /**
     * Get all workflows with optional filters
     * @param {Object} options - Filter options
     * @param {string} options.status - Filter by status (active/inactive/draft)
     * @param {string} options.trigger - Filter by trigger type
     * @param {string} options.search - Search term
     * @returns {Promise<Array>} List of workflows
     */
    async getWorkflows(options = {}) {
        const params = new URLSearchParams();
        
        if (options.status) params.append('status', options.status);
        if (options.trigger) params.append('trigger', options.trigger);
        if (options.search) params.append('search', options.search);

        const queryString = params.toString();
        const url = `${API_BASE_URL}/workflows${queryString ? '?' + queryString : ''}`;

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
     * Get a single workflow by ID
     * @param {string} workflowId - Workflow ID
     * @returns {Promise<Object>} Workflow details with steps
     */
    async getWorkflow(workflowId) {
        const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Create a new workflow
     * @param {Object} workflowData - Workflow data
     * @param {string} workflowData.name - Workflow name
     * @param {string} workflowData.description - Description
     * @param {string} workflowData.trigger - Trigger type
     * @param {string} workflowData.status - Initial status
     * @param {Array} workflowData.steps - Workflow steps
     * @returns {Promise<Object>} Created workflow
     */
    async createWorkflow(workflowData) {
        const response = await fetch(`${API_BASE_URL}/workflows`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            },
            body: JSON.stringify(workflowData)
        });

        return handleResponse(response);
    },

    /**
     * Update a workflow
     * @param {string} workflowId - Workflow ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated workflow
     */
    async updateWorkflow(workflowId, updates) {
        const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
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
     * Toggle workflow status (active/inactive)
     * @param {string} workflowId - Workflow ID
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated workflow
     */
    async toggleStatus(workflowId, status) {
        return this.updateWorkflow(workflowId, { status });
    },

    /**
     * Delete a workflow
     * @param {string} workflowId - Workflow ID
     * @returns {Promise<void>}
     */
    async deleteWorkflow(workflowId) {
        const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
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
            throw new Error(error.message || 'Failed to delete workflow');
        }
    },

    /**
     * Trigger manual workflow execution
     * @param {string} workflowId - Workflow ID
     * @param {Object} context - Execution context (e.g., ticketId)
     * @returns {Promise<Object>} Execution details
     */
    async triggerExecution(workflowId, context = {}) {
        const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            },
            body: JSON.stringify(context)
        });

        return handleResponse(response);
    },

    /**
     * Get workflow executions with filters
     * @param {Object} options - Filter options
     * @param {string} options.workflowId - Filter by workflow
     * @param {string} options.status - Filter by status
     * @param {string} options.dateRange - Date range filter
     * @param {number} options.page - Page number
     * @param {number} options.limit - Items per page
     * @returns {Promise<Object>} Executions with pagination
     */
    async getExecutions(options = {}) {
        const params = new URLSearchParams();
        
        if (options.workflowId) params.append('workflowId', options.workflowId);
        if (options.status) params.append('status', options.status);
        if (options.dateRange) params.append('dateRange', options.dateRange);
        if (options.page) params.append('page', options.page);
        if (options.limit) params.append('limit', options.limit);

        const queryString = params.toString();
        const url = `${API_BASE_URL}/workflows/executions${queryString ? '?' + queryString : ''}`;

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
     * Get execution details by ID
     * @param {string} executionId - Execution ID
     * @returns {Promise<Object>} Execution details with step logs
     */
    async getExecution(executionId) {
        const response = await fetch(`${API_BASE_URL}/workflows/executions/${executionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Cancel a running execution
     * @param {string} executionId - Execution ID
     * @returns {Promise<Object>} Updated execution
     */
    async cancelExecution(executionId) {
        const response = await fetch(`${API_BASE_URL}/workflows/executions/${executionId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get workflow statistics
     * @returns {Promise<Object>} Workflow stats
     */
    async getStatistics() {
        const response = await fetch(`${API_BASE_URL}/workflows/statistics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get active (running) workflows for dashboard
     * @param {number} limit - Max items
     * @returns {Promise<Array>} Active workflows
     */
    async getActiveWorkflows(limit = 5) {
        const response = await fetch(`${API_BASE_URL}/workflows/active?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get workflows that can be triggered for a specific ticket
     * @param {string} ticketId - Ticket ID
     * @returns {Promise<Array>} Available workflows
     */
    async getWorkflowsForTicket(ticketId) {
        const response = await fetch(`${API_BASE_URL}/workflows/for-ticket/${ticketId}`, {
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
Object.freeze(WorkflowService);

export default WorkflowService;
