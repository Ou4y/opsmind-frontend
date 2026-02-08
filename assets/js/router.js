/**
 * OpsMind - Router Module
 * 
 * Handles client-side routing and navigation:
 * - Page protection (auth required)
 * - Active link highlighting
 * - URL parameter parsing
 */

import AuthService from '../../services/authService.js';

/**
 * Router - Simple client-side router for multi-page app
 */
const Router = {
    // Pages that don't require authentication
    publicPages: ['index.html', '/', ''],
    
    // Pages that require admin role
    adminPages: [
        'users.html',
        'settings.html',
        'admin-dashboard.html',
        'system-logs.html',
        'admin-reports.html'
    ],
    
    // Current page name
    currentPage: '',

    /**
     * Initialize the router
     * Checks auth status and redirects if needed
     */
    init() {
        this.currentPage = this.getCurrentPageName();
        
        // Check if current page requires authentication
        if (!this.isPublicPage() && !AuthService.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }

        // If on login page and already authenticated, redirect to dashboard
        if (this.isPublicPage() && AuthService.isAuthenticated()) {
            this.redirectToDashboard();
            return false;
        }

        // Check if current page requires admin role
        if (this.isAdminPage() && !AuthService.isAdmin()) {
            this.redirectToUnauthorized();
            return false;
        }

        // Highlight active sidebar link
        this.setActiveLink();
        
        return true;
    },

    /**
     * Get the current page name from URL
     * @returns {string} Page name
     */
    getCurrentPageName() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop() || 'index.html';
        return pageName;
    },

    /**
     * Check if current page is public (no auth required)
     * @returns {boolean}
     */
    isPublicPage() {
        return this.publicPages.includes(this.currentPage);
    },

    /**
     * Check if current page requires admin role
     * @returns {boolean}
     */
    isAdminPage() {
        return this.adminPages.includes(this.currentPage);
    },

    /**
     * Check if user has permission to access a specific page
     * @param {string} pageName - Page name to check
     * @returns {boolean}
     */
    canAccessPage(pageName) {
        // Public pages - everyone can access
        if (this.publicPages.includes(pageName)) {
            return true;
        }
        
        // Must be authenticated
        if (!AuthService.isAuthenticated()) {
            return false;
        }
        
        // Admin pages - only admins can access
        if (this.adminPages.includes(pageName)) {
            return AuthService.isAdmin();
        }
        
        // All other pages - authenticated users can access
        return true;
    },

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        // Store intended destination for redirect after login
        const currentUrl = window.location.href;
        if (!this.isPublicPage()) {
            sessionStorage.setItem('opsmind_redirect', currentUrl);
        }
        window.location.href = 'index.html';
    },

    /**
     * Redirect to dashboard
     */
    redirectToDashboard() {
        // Check for stored redirect URL
        const redirectUrl = sessionStorage.getItem('opsmind_redirect');
        sessionStorage.removeItem('opsmind_redirect');
        
        if (redirectUrl && !redirectUrl.includes('index.html')) {
            window.location.href = redirectUrl;
        } else {
            window.location.href = 'dashboard.html';
        }
    },

    /**
     * Redirect to dashboard with unauthorized message
     */
    redirectToUnauthorized() {
        const user = AuthService.getUser();
        console.error('[Router] Unauthorized access attempt:', {
            page: this.currentPage,
            user: user?.email,
            role: user?.role,
            roles: user?.roles,
            isAdmin: AuthService.isAdmin()
        });
        
        // Store error message in session
        sessionStorage.setItem('opsmind_error', '⚠️ Access Denied: This page requires administrator privileges.');
        window.location.href = 'dashboard.html';
    },

    /**
     * Navigate to a specific page
     * @param {string} page - Page URL
     * @param {Object} params - Query parameters
     */
    navigateTo(page, params = {}) {
        let url = page;
        
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += '?' + queryString;
        }
        
        window.location.href = url;
    },

    /**
     * Get URL query parameters
     * @returns {URLSearchParams} Query parameters
     */
    getQueryParams() {
        return new URLSearchParams(window.location.search);
    },

    /**
     * Get a specific query parameter
     * @param {string} name - Parameter name
     * @returns {string|null} Parameter value
     */
    getQueryParam(name) {
        return this.getQueryParams().get(name);
    },

    /**
     * Update URL query parameters without reload
     * @param {Object} params - Parameters to set
     */
    updateQueryParams(params) {
        const url = new URL(window.location);
        
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        });
        
        window.history.replaceState({}, '', url);
    },

    /**
     * Set active state on sidebar navigation links
     */
    setActiveLink() {
        // Wait for sidebar to be loaded
        const checkSidebar = setInterval(() => {
            const sidebar = document.getElementById('sidebar');
            if (!sidebar) return;
            
            clearInterval(checkSidebar);
            
            // Get current page without extension
            const pageName = this.currentPage.replace('.html', '');
            
            // Find matching link and set active
            const links = sidebar.querySelectorAll('.sidebar-link');
            links.forEach(link => {
                const linkPage = link.getAttribute('data-page');
                if (linkPage === pageName) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }, 100);

        // Clear interval after 5 seconds to prevent infinite loop
        setTimeout(() => clearInterval(checkSidebar), 5000);
    },

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            await AuthService.logout();
        } finally {
            this.redirectToLogin();
        }
    }
};



export default Router;
