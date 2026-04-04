// Global User Session
function getCurrentUser() {
    const userStr = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
}

function loginUser(user, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("currentUser", JSON.stringify(user));
    window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
}

function logoutUser() {
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");
    window.location.href = 'index.html';
}

// UI Utilities
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById("toast-container") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => toast.classList.add("show"));

    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove("show");
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
    return container;
}

// Theme Toggle
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
}

function initTheme() {
    const savedTheme = localStorage.getItem("theme") || 
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", savedTheme);
}

// Navbar Injection dynamically
function renderNavbar() {
    const navPlaceholder = document.getElementById("navbar-placeholder");
    if (!navPlaceholder) return; // If manually written, skip

    const user = getCurrentUser();
    let authLinks = `
        <a href="login.html" class="nav-btn-secondary">Login</a>
        <a href="register.html" class="nav-btn-primary">Register</a>
    `;

    if (user) {
        if (user.role === 'admin') {
            authLinks = `
                <a href="admin.html" class="nav-link">Admin Panel</a>
                <button onclick="logoutUser()" class="nav-btn-secondary">Logout</button>
            `;
        } else {
            authLinks = `
                <a href="dashboard.html" class="nav-link">Dashboard</a>
                <button onclick="logoutUser()" class="nav-btn-secondary">Logout</button>
            `;
        }
    }

    const navbarHtml = `
        <nav class="navbar">
            <div class="nav-brand">
                <a href="index.html" class="logo-text">
                    Elite<span class="logo-highlight">Wheels</span>
                </a>
            </div>
            <div class="nav-links">
                <a href="index.html" class="nav-link">Home</a>
                <a href="cars.html" class="nav-link">Cars</a>
                ${authLinks}
                <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle Theme">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="moon-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </button>
            </div>
        </nav>
    `;

    navPlaceholder.innerHTML = navbarHtml;
    highlightCurrentPage();
}

function highlightCurrentPage() {
    const links = document.querySelectorAll('.nav-link');
    const path = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(link => {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });
}

// Footer Injection
function renderFooter() {
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if(!footerPlaceholder) return;
    footerPlaceholder.innerHTML = `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-brand logo-text" style="justify-content: center;">
                    Elite<span class="logo-highlight">Wheels</span>
                </div>
                <div class="footer-links">
                    <a href="index.html">Home</a>
                    <a href="cars.html">Fleet</a>
                    <a href="#">Contact Us</a>
                </div>
                <div class="footer-copy">&copy; 2026 EliteWheels. All rights reserved.</div>
            </div>
        </footer>
    `;
}

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderNavbar();
    renderFooter();
});
