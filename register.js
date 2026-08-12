const API_URL = "http://localhost:3001";

const registerForm =
    document.getElementById("registerForm");

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        if (!name || !email || !password) {

            alert("Заполните все поля");

            return;
        }

        try {

            // Проверяем, существует ли такой email
            const checkResponse =
                await fetch(
                    `${API_URL}/users?email=${encodeURIComponent(email)}`
                );

            const existingUsers =
                await checkResponse.json();

            if (existingUsers.length > 0) {

                alert(
                    "Пользователь с таким email уже существует."
                );

                return;
            }

            // Создаём обычного пользователя
            const newUser = {

                name: name,

                email: email,

                password: password,

                role: "user"

            };

            const response =
                await fetch(
                    `${API_URL}/users`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(newUser)
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Ошибка создания пользователя"
                );

            }

            alert(
                "Аккаунт успешно создан!"
            );

            window.location.href =
                "index.html";

        } catch (error) {

            console.error(
                "Ошибка регистрации:",
                error
            );

            alert(
                "Не удалось создать аккаунт. Проверь JSON Server."
            );

        }

    }
);