/**
 * OpsMind - Main Application Module
 * 
 * This is the entry point for authenticated pages.
 * It handles:
 * - Loading shared components (navbar, sidebar)
 * - Initializing common functionality
 * - Setting up global event listeners
 * - User session management
 */

import Router from './router.js';
import UI from './ui.js';
import AuthService from '/services/authService.js';

/**
 * App - Main application controller
 */
const App = {
    // Initialization flag
    initialized: false,

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;
        
        console.log('[App] Initializing...');
        
        // Check authentication and redirect if needed
        if (!Router.init()) {
            console.log('[App] Router redirecting, stopping init');
            return; // Redirecting, don't continue
        }
        
        console.log('[App] Auth check passed, initializing UI...');
        
        // Initialize common functionality
        this.initNavbar();
        this.initSidebar();
        this.initGlobalListeners();
        
        this.initialized = true;
        
        console.log('[App] Initialization complete');
        
        // Dispatch event for page-specific scripts
        document.dispatchEvent(new CustomEvent('app:ready'));
    },

    /**
     * Load navbar and sidebar components
     */
    async loadComponents() {
        const navbarContainer = document.getElementById('navbar-container');
        const sidebarContainer = document.getElementById('sidebar-container');

        try {
            // Load navbar
            if (navbarContainer) {
                const navbarResponse = await fetch('/components/navbar.html');
                if (navbarResponse.ok) {
                    navbarContainer.innerHTML = await navbarResponse.text();
                }
            }

            // Load sidebar
            if (sidebarContainer) {
                const sidebarResponse = await fetch('/components/sidebar.html');
                if (sidebarResponse.ok) {
                    sidebarContainer.innerHTML = await sidebarResponse.text();
                }
            }
        } catch (error) {
            console.error('Failed to load components:', error);
        }
    },

    /**
     * Initialize navbar functionality
     */
    initNavbar() {
        const user = AuthService.getUser();
        
        // Set user info in navbar
        this.updateUserDisplay(user);

        // Logout button handler
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const confirmed = await UI.confirm({
                title: 'Sign Out',
                message: 'Are you sure you want to sign out?',
                confirmText: 'Sign Out',
                confirmClass: 'btn-danger'
            });
            
            if (confirmed) {
                await Router.handleLogout();
            }
        });

        // Notifications button (placeholder for future implementation)
        const notificationsBtn = document.getElementById('notificationsBtn');
        notificationsBtn?.addEventListener('click', () => {
            UI.info('Notifications feature coming soon!');
        });

        // Global search (placeholder)
        const globalSearch = document.getElementById('globalSearch');
        globalSearch?.addEventListener('click', () => {
            UI.info('Global search coming soon!');
        });

        // Help button (placeholder)
        const helpBtn = document.getElementById('helpBtn');
        helpBtn?.addEventListener('click', () => {
            UI.info('Help documentation coming soon!');
        });
    },

    /**
     * Update user display in navbar
     */
    updateUserDisplay(user) {
        if (!user) return;

        // Avatar initials
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            const initials = this.getInitials(user.name || user.email);
            avatar.textContent = initials;
        }

        // User name and role
        const nameEl = document.getElementById('userName');
        const roleEl = document.getElementById('userRole');
        const dropdownName = document.getElementById('dropdownUserName');
        const dropdownEmail = document.getElementById('dropdownUserEmail');

        if (nameEl) nameEl.textContent = user.name || 'User';
        if (roleEl) roleEl.textContent = this.formatRole(user.role);
        if (dropdownName) dropdownName.textContent = user.name || 'User';
        if (dropdownEmail) dropdownEmail.textContent = user.email || '';

        // Show admin section in sidebar if user is admin
        if (AuthService.isAdmin()) {
            const adminSection = document.getElementById('adminSection');
            if (adminSection) {
                adminSection.style.display = 'block';
            }
        }
    },

    /**
     * Get initials from a name
     */
    getInitials(name) {
        if (!name) return '?';
        
        const parts = name.split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    },

    /**
     * Format role for display
     */
    formatRole(role) {
        if (!role) return 'User';
        
        const roleMap = {
            admin: 'Administrator',
            technician: 'IT Technician',
            manager: 'IT Manager',
            user: 'User'
        };
        
        return roleMap[role.toLowerCase()] || role;
    },

    /**
     * Initialize sidebar functionality
     */
    initSidebar() {
        // Mobile sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar-container');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');

        console.log('[App] Sidebar toggle:', sidebarToggle, 'Sidebar:', sidebar);

        sidebarToggle?.addEventListener('click', () => {
            console.log('[App] Sidebar toggle clicked');
            sidebar?.classList.toggle('show');
            sidebarBackdrop?.classList.toggle('show');
        });

        // Close sidebar on backdrop click
        sidebarBackdrop?.addEventListener('click', () => {
            sidebar?.classList.remove('show');
            sidebarBackdrop?.classList.remove('show');
        });

        // Close sidebar on link click (mobile)
        sidebar?.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    sidebar.classList.remove('show');
                    sidebarBackdrop?.classList.remove('show');
                }
            });
        });

        // Update active link
        Router.setActiveLink();
    },

    /**
     * Initialize global event listeners
     */
    initGlobalListeners() {
        // Handle 401 errors globally (session expired)
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason?.message?.includes('401') || 
                event.reason?.message?.includes('Session expired')) {
                UI.error('Your session has expired. Please sign in again.');
                setTimeout(() => Router.redirectToLogin(), 2000);
            }
        });

        // Handle window resize for responsive adjustments
        window.addEventListener('resize', UI.debounce(() => {
            // Close mobile sidebar on resize to desktop
            if (window.innerWidth >= 992) {
                const sidebar = document.getElementById('sidebar');
                const backdrop = document.getElementById('sidebarBackdrop');
                sidebar?.classList.remove('show');
                backdrop?.classList.remove('show');
            }
        }, 250));

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals and mobile sidebar
            if (e.key === 'Escape') {
                const sidebar = document.getElementById('sidebar');
                const backdrop = document.getElementById('sidebarBackdrop');
                if (sidebar?.classList.contains('show')) {
                    sidebar.classList.remove('show');
                    backdrop?.classList.remove('show');
                }
            }
        });
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Export for use by page-specific scripts
export default App;
