// SYNDITECH Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeDashboard();
});

function initializeDashboard() {
    // Dropdown menu functionality
    setupDropdowns();

    // Dark mode toggle
    setupDarkModeToggle();

    // Sidebar navigation
    setupSidebarNavigation();

    // Smooth scrolling for anchor links
    setupSmoothScrolling();

    // Authentication check (simulate for demo)
    checkAuthentication();
}

function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');

        // For mobile devices, use click instead of hover
        if (window.innerWidth <= 768) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();

                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.querySelector('.dropdown-menu').classList.remove('show');
                    }
                });

                // Toggle current dropdown
                menu.classList.toggle('show');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    });
}

function setupDarkModeToggle() {
    const toggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Check for saved theme preference or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', currentTheme);
    updateToggleIcon(currentTheme);

    toggle.addEventListener('click', function() {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleIcon(newTheme);
    });

    function updateToggleIcon(theme) {
        toggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}

function setupSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);

            // Update active state
            sidebarLinks.forEach(link => link.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');

            // Show target section
            contentSections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });

            // Smooth scroll to top of content on mobile
            if (window.innerWidth <= 768) {
                document.querySelector('.dashboard-content').scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function checkAuthentication() {
    // Simulate authentication check
    // In a real app, this would check for JWT token or session
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';

    const sidebar = document.getElementById('sidebar');
    const dashboardWrapper = document.querySelector('.dashboard-wrapper');

    if (isAuthenticated) {
        sidebar.style.display = 'block';
        dashboardWrapper.style.display = 'flex';
    } else {
        sidebar.style.display = 'none';
        dashboardWrapper.style.display = 'none';
        // Show login prompt or redirect
        showLoginPrompt();
    }
}

function showLoginPrompt() {
    // Simple login simulation for demo
    const loginPrompt = document.createElement('div');
    loginPrompt.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: var(--secondary-dark); padding: 24px; border-radius: 8px;
                    border: 1px solid var(--primary-orange); z-index: 2000; text-align: center;">
            <h3 style="color: var(--accent-white); margin-bottom: 16px;">Login Required</h3>
            <p style="color: var(--text-gray); margin-bottom: 16px;">Please log in to access the HR Dashboard.</p>
            <button id="demoLoginBtn" style="background: var(--primary-orange); color: var(--accent-white);
                    border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                Demo Login
            </button>
        </div>
    `;
    document.body.appendChild(loginPrompt);

    document.getElementById('demoLoginBtn').addEventListener('click', function() {
        localStorage.setItem('authenticated', 'true');
        loginPrompt.remove();
        checkAuthentication();
    });
}

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Re-initialize dropdowns on resize
    setupDropdowns();
});

// Add some interactive effects
function addInteractiveEffects() {
    // Add subtle animations to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Initialize interactive effects
addInteractiveEffects();