// DOM elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginBtnText = document.getElementById('login-btn-text');
const loginBtnLoading = document.getElementById('login-btn-loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Check if already logged in
checkAuthStatus();

async function checkAuthStatus() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated) {
            // Already logged in, redirect to main page
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }
    
    // Show loading state
    setLoading(true);
    hideError();
    
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Login successful
            showSuccess();
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        } else {
            // Login failed
            showError(data.error || 'Invalid email or password');
            setLoading(false);
            shakeForm();
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Connection error. Please try again.');
        setLoading(false);
        shakeForm();
    }
});

// Helper functions
function setLoading(loading) {
    loginBtn.disabled = loading;
    if (loading) {
        loginBtnText.classList.add('hidden');
        loginBtnLoading.classList.remove('hidden');
    } else {
        loginBtnText.classList.remove('hidden');
        loginBtnLoading.classList.add('hidden');
    }
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('shake');
    
    setTimeout(() => {
        errorMessage.classList.remove('shake');
    }, 500);
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showSuccess() {
    loginBtn.classList.remove('btn-login');
    loginBtn.classList.add('bg-green-500');
    loginBtnText.textContent = '✓ Success!';
    loginBtnText.classList.remove('hidden');
    loginBtnLoading.classList.add('hidden');
}

function shakeForm() {
    loginForm.classList.add('shake');
    setTimeout(() => {
        loginForm.classList.remove('shake');
    }, 500);
}

// Auto-hide error after 5 seconds
let errorTimeout;
errorMessage.addEventListener('DOMNodeInserted', () => {
    if (!errorMessage.classList.contains('hidden')) {
        clearTimeout(errorTimeout);
        errorTimeout = setTimeout(() => {
            hideError();
        }, 5000);
    }
});

// Add enter key support
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

