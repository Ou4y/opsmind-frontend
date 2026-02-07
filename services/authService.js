/**
 * OpsMind - Authentication Service
 * 
 * Handles all authentication-related API calls including:
 * - User signup with OTP verification
 * - User login with OTP verification
 * - Token management
 * - Session validation
 * 
 * Backend API: http://localhost:3002
 */

// API base URL - can be configured for different environments
const API_BASE_URL = 'http://localhost:3002';

// Storage keys
const TOKEN_KEY = 'opsmind_token';
const USER_KEY = 'opsmind_user';
const REMEMBER_KEY = 'opsmind_remember';
const PENDING_VERIFICATION_KEY = 'opsmind_pending_verification';

/**
 * AuthService - Singleton service for authentication operations
 */
const AuthService = {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {string} userData.firstName - User's first name
     * @param {string} userData.lastName - User's last name
     * @param {string} userData.email - User's email (must end with @miuegypt.edu.eg)
     * @param {string} userData.password - User's password (min 8 chars, uppercase, lowercase, number, special char)
     * @param {string} userData.role - User's role ("STUDENT" or "DOCTOR")
     * @returns {Promise<Object>} Response with requiresOTP: true
     */
    async signup(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    password: userData.password,
                    role: userData.role.toUpperCase() // Convert to uppercase for backend
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            // Store pending verification info
            this.setPendingVerification({
                email: userData.email,
                purpose: 'VERIFICATION'
            });

            return data;
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    },

    /**
     * Verify OTP code
     * @param {string} email - User's email
     * @param {string} otp - OTP code received via email
     * @param {string} purpose - "VERIFICATION" (after signup) or "LOGIN" (after login)
     * @returns {Promise<Object>} User data and token (for LOGIN), or requiresOTP for next step
     */
    async verifyOTP(email, otp, purpose) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp, purpose })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'OTP verification failed');
            }

            // If this was VERIFICATION, backend sends LOGIN OTP automatically
            if (purpose === 'VERIFICATION') {
                // Update pending verification to LOGIN
                this.setPendingVerification({
                    email: email,
                    purpose: 'LOGIN'
                });
            } else if (purpose === 'LOGIN') {
                // Login OTP verified - store auth data
                if (data.data.token && data.data.user) {
                    const userData = data.data.user;
                    
                    // Ensure role is stored in uppercase format
                    if (userData.role) {
                        userData.role = userData.role.toUpperCase();
                    }
                    
                    // Combine firstName and lastName into name property for easy access
                    if (userData.firstName && userData.lastName) {
                        userData.name = `${userData.firstName} ${userData.lastName}`;
                    }
                    
                    this.setToken(data.data.token);
                    this.setUser(userData);
                    this.clearPendingVerification();
                }
            }

            return data;
        } catch (error) {
            console.error('OTP verification failed:', error);
            throw error;
        }
    },

    /**
     * Authenticate user with email and password
     * This will trigger OTP send to email
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Response with requiresOTP: true
     */
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid credentials');
            }

            // Store pending verification info
            // Backend sends VERIFICATION OTP if not verified, LOGIN OTP if verified
            const purpose = data.message?.includes('verification') ? 'VERIFICATION' : 'LOGIN';
            this.setPendingVerification({
                email: email,
                purpose: purpose
            });

            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    /**
     * Resend OTP code
     * @param {string} email - User's email
     * @param {string} purpose - "VERIFICATION" or "LOGIN"
     * @returns {Promise<Object>} Response confirming OTP sent
     */
    async resendOTP(email, purpose) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, purpose })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            return data;
        } catch (error) {
            console.error('Resend OTP failed:', error);
            throw error;
        }
    },

    /**
     * Log out the current user
     * Clears all stored auth data
     */
    async logout() {
        // Clear local data (no backend logout endpoint)
        this.clearAuth();
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validatePassword(password) {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate email for MIU domain
     * @param {string} email - Email to validate
     * @returns {boolean} True if email ends with @miuegypt.edu.eg
     */
    validateMIUEmail(email) {
        return email.toLowerCase().endsWith('@miuegypt.edu.eg');
    },

    /**
     * Get pending verification info
     * @returns {Object|null} { email, purpose }
     */
    getPendingVerification() {
        try {
            const data = sessionStorage.getItem(PENDING_VERIFICATION_KEY);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    /**
     * Store pending verification info
     * @param {Object} data - { email, purpose }
     */
    setPendingVerification(data) {
        sessionStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(data));
    },

    /**
     * Clear pending verification info
     */
    clearPendingVerification() {
        sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
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
            if (!userData) return null;
            
            const user = JSON.parse(userData);
            
            // Ensure role is in uppercase format (fix for old data)
            if (user.role && typeof user.role === 'string') {
                user.role = user.role.toUpperCase();
            }
            
            // Ensure name property exists
            if (!user.name && user.firstName && user.lastName) {
                user.name = `${user.firstName} ${user.lastName}`;
            }
            
            return user;
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
        return user?.role === 'ADMIN';
    },

    /**
     * Check if current user is a doctor
     * @returns {boolean} True if user is doctor
     */
    isDoctor() {
        const user = this.getUser();
        return user?.role === 'DOCTOR';
    },

    /**
     * Check if current user is a student
     * @returns {boolean} True if user is student
     */
    isStudent() {
        const user = this.getUser();
        return user?.role === 'STUDENT';
    },

    /**
     * Clear all authentication data from storage
     */
    clearAuth() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        this.clearPendingVerification();
    },

    /**
     * Get authorization headers for API requests
     * @returns {Object} Headers object with Authorization
     */
    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    },

    /**
     * Fetch all users (Admin only)
     * @returns {Promise<Array>} List of users
     */
    async getUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch users');
            }

            return data.data;
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    },

    /**
     * Check backend health
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }
};

// Freeze the service to prevent modifications
Object.freeze(AuthService);

export default AuthService;
