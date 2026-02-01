/**
 * OpsMind - Authentication Page Module
 * 
 * Handles the login page functionality:
 * - Form validation
 * - Authentication API call
 * - Error handling
 * - Password visibility toggle
 */

import AuthService from '/services/authService.js';

/**
 * Initialize the login page
 */
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginButton = document.getElementById('loginButton');
    const loginError = document.getElementById('loginError');
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    // Check if already authenticated
    if (AuthService.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    /**
     * Toggle password visibility
     */
    togglePasswordBtn?.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        const icon = togglePasswordBtn.querySelector('i');
        icon.classList.toggle('bi-eye');
        icon.classList.toggle('bi-eye-slash');
    });

    /**
     * Show error message
     */
    function showError(message) {
        loginErrorMessage.textContent = message;
        loginError.classList.remove('d-none');
        
        // Shake animation
        loginError.classList.add('shake');
        setTimeout(() => loginError.classList.remove('shake'), 500);
    }

    /**
     * Hide error message
     */
    function hideError() {
        loginError.classList.add('d-none');
    }

    /**
     * Set loading state on login button
     */
    function setLoading(loading) {
        const btnText = loginButton.querySelector('.btn-text');
        const btnLoader = loginButton.querySelector('.btn-loader');
        
        if (loading) {
            loginButton.disabled = true;
            btnText.classList.add('d-none');
            btnLoader.classList.remove('d-none');
        } else {
            loginButton.disabled = false;
            btnText.classList.remove('d-none');
            btnLoader.classList.add('d-none');
        }
    }

    /**
     * Validate email format
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Handle form submission
     */
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        // Client-side validation
        if (!email) {
            showError('Please enter your email address.');
            emailInput.focus();
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address.');
            emailInput.focus();
            return;
        }

        if (!password) {
            showError('Please enter your password.');
            passwordInput.focus();
            return;
        }

        if (password.length < 4) {
            showError('Password must be at least 4 characters.');
            passwordInput.focus();
            return;
        }

        // Attempt login
        setLoading(true);

        try {
            await AuthService.login(email, password, rememberMe);
            
            // Redirect to dashboard or intended page
            const redirectUrl = sessionStorage.getItem('opsmind_redirect');
            sessionStorage.removeItem('opsmind_redirect');
            
            if (redirectUrl && !redirectUrl.includes('index.html')) {
                window.location.href = redirectUrl;
            } else {
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            setLoading(false);
            
            // Handle specific error types
            if (error.message.includes('Invalid credentials')) {
                showError('Invalid email or password. Please try again.');
            } else if (error.message.includes('Network') || error.message.includes('fetch')) {
                showError('Unable to connect to the server. Please check your connection.');
            } else {
                showError(error.message || 'An error occurred. Please try again.');
            }
        }
    });

    /**
     * Clear error on input change
     */
    emailInput?.addEventListener('input', hideError);
    passwordInput?.addEventListener('input', hideError);

    /**
     * Handle Enter key on password field
     */
    passwordInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginForm?.requestSubmit();
        }
    });

    // Focus on email input on page load
    emailInput?.focus();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initLoginPage);

// Add shake animation CSS if not present
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .shake { animation: shake 0.5s ease-in-out; }
`;
document.head.appendChild(style);
