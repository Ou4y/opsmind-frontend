/**
 * OpsMind - Authentication Service
 * 
 * Handles all authentication-related API calls including:
 * - User login/logout
 * - Token management
 * - Session validation
 * 
 * All other services depend on this service for auth tokens.
 */

// API base URL - can be configured for different environments
const API_BASE_URL ='/api';

// Storage keys
const TOKEN_KEY = 'opsmind_token';
const USER_KEY = 'opsmind_user';
const REMEMBER_KEY = 'opsmind_remember';

/**
 * AuthService - Singleton service for authentication operations
 */
const AuthService = {
    /**
     * Authenticate user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {boolean} remember - Whether to persist session
     * @returns {Promise<Object>} User data and token
     */
    async login(email, password, remember = false) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Invalid credentials');
            }

            const data = await response.json();
            
            // Store authentication data
            this.setToken(data.token);
            this.setUser(data.user);
            
            if (remember) {
                localStorage.setItem(REMEMBER_KEY, 'true');
            }

            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    /**
     * Log out the current user
     * Clears all stored auth data
     */
    async logout() {
        try {
            const token = this.getToken();
            
            if (token) {
                // Notify backend of logout (optional - ignore errors)
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(() => {});
            }
        } finally {
            // Always clear local data
            this.clearAuth();
        }
    },

    /**
     * Validate current session token
     * @returns {Promise<boolean>} True if session is valid
     */
    async validateSession() {
        const token = this.getToken();
        
        if (!token) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                this.clearAuth();
                return false;
            }

            // Optionally refresh user data
            const data = await response.json();
            if (data.user) {
                this.setUser(data.user);
            }

            return true;
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    },

    /**
     * Get the stored authentication token
     * @returns {string|null} JWT token or null
     */
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Store authentication token
     * @param {string} token - JWT token
     */
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * Get stored user data
     * @returns {Object|null} User object or null
     */
    getUser() {
        try {
            const userData = localStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    },

    /**
     * Store user data
     * @param {Object} user - User object
     */
    setUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    /**
     * Check if user is currently authenticated
     * Note: This only checks local storage, use validateSession() for server verification
     * @returns {boolean} True if token exists
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * Check if current user has admin role
     * @returns {boolean} True if user is admin
     */
    isAdmin() {
        const user = this.getUser();
        return user?.role === 'admin';
    },

    /**
     * Clear all authentication data from storage
     */
    clearAuth() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(REMEMBER_KEY);
    },

    /**
     * Get authorization headers for API requests
     * @returns {Object} Headers object with Authorization
     */
    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

// Freeze the service to prevent modifications
Object.freeze(AuthService);

export default AuthService;
