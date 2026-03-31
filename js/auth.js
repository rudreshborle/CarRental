document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }
});

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    
    if (!username || !password) {
        showToast("Please fill all fields", "error");
        return;
    }

    const users = db.get("users");
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        showToast(`Welcome back, ${user.name}!`, "success");
        // Simulate network delay
        setTimeout(() => loginUser(user), 1000);
    } else {
        showToast("Invalid credentials", "error");
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const license = document.getElementById("license").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (password !== confirmPassword) {
        showToast("Passwords do not match", "error");
        return;
    }

    const users = db.get("users");
    if (users.some(u => u.username === username || u.email === email)) {
        showToast("Username or email already exists", "error");
        return;
    }

    const newUser = {
        id: utils.generateId("u"),
        name, email, phone, address, license, username, password, role: "user"
    };

    db.add("users", newUser);
    showToast("Registration successful! Logging in...", "success");
    setTimeout(() => loginUser(newUser), 1500);
}
