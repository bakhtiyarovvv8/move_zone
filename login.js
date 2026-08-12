const API_URL = "https://server-e0jw.onrender.com";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Введите email и пароль");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );

        if (!response.ok) {
            throw new Error("Ошибка при подключении к серверу");
        }

        const users = await response.json();

        if (users.length === 0) {
            alert("Неверный email или пароль");
            return;
        }

        const user = users[0];

        // Сохраняем данные вошедшего пользователя
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Проверяем роль пользователя
        if (user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "home.html";
        }

    } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось подключиться к серверу. Убедитесь, что JSON Server запущен.");
    }
});