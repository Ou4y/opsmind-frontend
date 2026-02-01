/**
 * OpsMind - AI Service
 * 
 * Handles all AI-related API operations including:
 * - Getting AI recommendations for tickets
 * - Retrieving AI insights for dashboard
 * - AI-powered search and categorization
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
 * AIService - Singleton service for AI operations
 */
const AIService = {
    /**
     * Get AI recommendations for a specific ticket
     * @param {string} ticketId - Ticket ID
     * @returns {Promise<Array>} List of AI recommendations
     */
    async getRecommendations(ticketId) {
        const response = await fetch(`${API_BASE_URL}/ai/recommendations/${ticketId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get AI insights summary for dashboard
     * @returns {Promise<Object>} AI insights data
     */
    async getInsights() {
        const response = await fetch(`${API_BASE_URL}/ai/insights`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get count of pending AI recommendations
     * @returns {Promise<Object>} Recommendation count
     */
    async getRecommendationCount() {
        const response = await fetch(`${API_BASE_URL}/ai/recommendations/count`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get AI-suggested category for a ticket description
     * @param {string} description - Ticket description text
     * @returns {Promise<Object>} Suggested category and confidence
     */
    async suggestCategory(description) {
        const response = await fetch(`${API_BASE_URL}/ai/suggest-category`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            },
            body: JSON.stringify({ description })
        });

        return handleResponse(response);
    },

    /**
     * Get AI-suggested priority for a ticket
     * @param {string} subject - Ticket subject
     * @param {string} description - Ticket description
     * @returns {Promise<Object>} Suggested priority and reasoning
     */
    async suggestPriority(subject, description) {
        const response = await fetch(`${API_BASE_URL}/ai/suggest-priority`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            },
            body: JSON.stringify({ subject, description })
        });

        return handleResponse(response);
    },

    /**
     * Get similar tickets based on content
     * @param {string} ticketId - Ticket ID to find similar tickets for
     * @param {number} limit - Max number of similar tickets
     * @returns {Promise<Array>} Similar tickets
     */
    async getSimilarTickets(ticketId, limit = 5) {
        const response = await fetch(`${API_BASE_URL}/ai/similar-tickets/${ticketId}?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get AI-generated summary of ticket activity
     * @param {string} ticketId - Ticket ID
     * @returns {Promise<Object>} Activity summary
     */
    async getActivitySummary(ticketId) {
        const response = await fetch(`${API_BASE_URL}/ai/activity-summary/${ticketId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...AuthService.getAuthHeaders()
            }
        });

        return handleResponse(response);
    },

    /**
     * Get AI-predicted resolution time
     * @param {Object} ticketData - Ticket data for prediction
     * @returns {Promise<Object>} Predicted resolution time
     */
    async predictResolutionTime(ticketData) {
        const response = await fetch(`${API_BASE_URL}/ai/predict-resolution`, {
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
     * Get suggested response templates for a ticket
     * @param {string} ticketId - Ticket ID
     * @returns {Promise<Array>} Suggested response templates
     */
    async getSuggestedResponses(ticketId) {
        const response = await fetch(`${API_BASE_URL}/ai/suggested-responses/${ticketId}`, {
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
Object.freeze(AIService);

export default AIService;
