const API_URL = "https://server-e0jw.onrender.com";

let users = [];
let films = [];


/* =========================================================
   DOM
========================================================= */

const navItems =
    document.querySelectorAll(".nav-item");

const sections =
    document.querySelectorAll(".content-section");

const pageTitle =
    document.getElementById("pageTitle");

const sidebar =
    document.querySelector(".sidebar");

const mobileMenu =
    document.getElementById("mobileMenu");

const accountSearch =
    document.getElementById("accountSearch");

const filmSearch =
    document.getElementById("filmSearch");


/* =========================================================
   NAVIGATION
========================================================= */

const navigationMap = {
    dashboard: "Dashboard",
    accounts: "Accounts",
    films: "Films",
    settings: "Settings"
};


function openSection(sectionName) {

    sections.forEach(section => {

        section.classList.remove("active");

    });


    navItems.forEach(item => {

        item.classList.remove("active");

    });


    const target =
        document.getElementById(sectionName);


    const navItem =
        document.querySelector(
            `.nav-item[data-section="${sectionName}"]`
        );


    if (!target) {
        return;
    }


    target.classList.add("active");


    if (navItem) {
        navItem.classList.add("active");
    }


    if (pageTitle) {
        pageTitle.textContent =
            navigationMap[sectionName];
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (sidebar) {
        sidebar.classList.remove("open");
    }

}


navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            openSection(
                item.dataset.section
            );

        }
    );

});


document
    .querySelectorAll("[data-go]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openSection(
                    button.dataset.go
                );

            }
        );

    });


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("open");

        }
    );

}


/* =========================================================
   HELPERS
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function getInitials(value) {

    const text =
        String(value || "User")
            .trim();


    if (!text) {
        return "U";
    }


    const parts =
        text.split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .slice(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[1][0]
    ).toUpperCase();

}


function getCurrentUser() {

    const saved =
        localStorage.getItem("user");


    if (!saved) {
        return null;
    }


    try {

        return JSON.parse(saved);

    } catch {

        return null;

    }

}


function isCurrentUser(id) {

    const current =
        getCurrentUser();


    if (!current) {
        return false;
    }


    return (
        String(current.id) ===
        String(id)
    );

}


function updateCurrentUser(user) {

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {
        return;
    }


    clearTimeout(
        toastTimer
    );


    toast.textContent =
        message;


    toast.className =
        `toast show ${type}`;


    toastTimer =
        setTimeout(
            () => {

                toast.className =
                    "toast";

            },
            3000
        );

}


/* =========================================================
   API
========================================================= */

async function request(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})

                }

            }
        );


    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status}`
        );

    }


    if (response.status === 204) {
        return null;
    }


    return response.json();

}


/* =========================================================
   LOAD
========================================================= */

async function loadUsers() {

    users =
        await request("/users");


    if (!Array.isArray(users)) {
        users = [];
    }


    renderUsers();
    renderRecentUsers();
    updateUserCounters();

}


async function loadFilms() {

    films =
        await request("/films");


    if (!Array.isArray(films)) {
        films = [];
    }


    renderFilms();
    renderRecentFilms();
    updateFilmCounters();

}


async function loadAll() {

    try {

        await Promise.all([
            loadUsers(),
            loadFilms()
        ]);


        setServerStatus(true);

    } catch (error) {

        console.error(
            "JSON Server error:",
            error
        );


        setServerStatus(false);


        showToast(
            "JSON Server недоступен. Проверь порт 3001.",
            "error"
        );

    }

}


/* =========================================================
   STATUS
========================================================= */

function setServerStatus(
    online
) {

    const serverText =
        document.getElementById(
            "serverText"
        );


    const apiStatus =
        document.getElementById(
            "apiStatus"
        );


    const databaseStatus =
        document.getElementById(
            "databaseStatus"
        );


    if (online) {

        serverText.textContent =
            "JSON Server online";


        apiStatus.textContent =
            "Online";


        databaseStatus.textContent =
            "Healthy";

    } else {

        serverText.textContent =
            "JSON Server offline";


        apiStatus.textContent =
            "Offline";


        databaseStatus.textContent =
            "Offline";

    }

}


/* =========================================================
   COUNTERS
========================================================= */

function updateUserCounters() {

    document.getElementById(
        "totalUsers"
    ).textContent =
        users.length;


    document.getElementById(
        "accountsNavCount"
    ).textContent =
        users.length;

}


function updateFilmCounters() {

    document.getElementById(
        "totalFilms"
    ).textContent =
        films.length;


    document.getElementById(
        "filmsNavCount"
    ).textContent =
        films.length;

}


/* =========================================================
   USERS TABLE
========================================================= */

function renderUsers() {

    const container =
        document.getElementById(
            "usersTableBody"
        );


    if (!container) {
        return;
    }


    const search =
        accountSearch.value
            .trim()
            .toLowerCase();


    const filtered =
        users.filter(user => {

            const text = `
                ${user.name || ""}
                ${user.email || ""}
                ${user.id || ""}
            `.toLowerCase();


            return text.includes(
                search
            );

        });


    container.innerHTML = "";


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Пользователи не найдены.
            </div>
        `;

        return;
    }


    filtered.forEach(user => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "table-row";


        const initials =
            getInitials(
                user.name ||
                user.email
            );


        row.innerHTML = `

            <div class="table-user">

                <div class="table-avatar orange-bg">
                    ${escapeHtml(
                        initials
                    )}
                </div>


                <div class="table-user-info">

                    <strong>

                        ${escapeHtml(
                            user.name ||
                            "Без имени"
                        )}

                        ${
                            isCurrentUser(user.id)
                            ? `
                                <span
                                    style="
                                        color:#f97316;
                                        margin-left:5px;
                                        font-size:8px;
                                    "
                                >
                                    YOU
                                </span>
                              `
                            : ""
                        }

                    </strong>


                    <span>

                        ID:
                        ${escapeHtml(
                            user.id ||
                            "—"
                        )}

                    </span>

                </div>

            </div>


            <div class="table-email">

                ${escapeHtml(
                    user.email ||
                    "—"
                )}

            </div>


            <div>

                <span class="status-pill">

                    <span></span>

                    Active

                </span>

            </div>


            <div class="row-actions">

                <button
                    type="button"
                    data-edit-user="${escapeHtml(
                        user.id
                    )}"
                    title="Edit"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    data-delete-user="${escapeHtml(
                        user.id
                    )}"
                    title="Delete"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        `;


        container.appendChild(
            row
        );

    });

}


/* =========================================================
   RECENT USERS
========================================================= */

function renderRecentUsers() {

    const container =
        document.getElementById(
            "recentUsers"
        );


    container.innerHTML = "";


    users
        .slice()
        .reverse()
        .slice(0, 5)
        .forEach(user => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "account-row";


            row.innerHTML = `

                <div class="table-avatar orange-bg">

                    ${escapeHtml(
                        getInitials(
                            user.name ||
                            user.email
                        )
                    )}

                </div>


                <div class="account-info">

                    <strong>
                        ${escapeHtml(
                            user.name ||
                            "Без имени"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            user.email ||
                            "—"
                        )}
                    </span>

                </div>


                <span class="user-status">

                    ${
                        isCurrentUser(user.id)
                        ? "You"
                        : "Active"
                    }

                </span>

            `;


            container.appendChild(
                row
            );

        });

}


/* =========================================================
   FILMS
========================================================= */

function renderFilms() {

    const container =
        document.getElementById(
            "filmsGrid"
        );


    const search =
        filmSearch.value
            .trim()
            .toLowerCase();


    const filtered =
        films.filter(film => {

            const text = `
                ${film.title || ""}
                ${film.genre || ""}
                ${film.year || ""}
                ${film.description || ""}
            `.toLowerCase();


            return text.includes(
                search
            );

        });


    container.innerHTML =
        "";


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Фильмы не найдены.
            </div>
        `;

        return;
    }


    filtered.forEach(film => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "admin-film-card";


        const background =
            film.image
            ? `
                background-image:
                url("${escapeHtml(
                    film.image
                )}");
              `
            : "";


        card.innerHTML = `

            <div
                class="admin-film-poster"
                style="${background}"
            >

                ${
                    film.image
                    ? ""
                    : `
                        <i
                            class="
                                fa-solid
                                fa-film
                            "
                        ></i>
                      `
                }


                <div class="poster-overlay">

                    <button
                        type="button"
                        data-edit-film="${escapeHtml(
                            film.id
                        )}"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        data-delete-film="${escapeHtml(
                            film.id
                        )}"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>


            <div class="admin-film-content">

                <div class="admin-film-title-row">

                    <h3>
                        ${escapeHtml(
                            film.title ||
                            "Без названия"
                        )}
                    </h3>


                    <span>
                        ★
                        ${escapeHtml(
                            film.rating ||
                            "0"
                        )}
                    </span>

                </div>


                <p>

                    ${escapeHtml(
                        film.year ||
                        "—"
                    )}

                    ·

                    ${escapeHtml(
                        film.genre ||
                        "—"
                    )}

                </p>

            </div>

        `;


        container.appendChild(
            card
        );

    });

}


function renderRecentFilms() {

    const container =
        document.getElementById(
            "recentFilms"
        );


    container.innerHTML =
        "";


    films
        .slice()
        .reverse()
        .slice(0, 5)
        .forEach(film => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "film-row";


            row.innerHTML = `

                <div class="film-poster">

                    <i class="fa-solid fa-film"></i>

                </div>


                <div class="film-info">

                    <strong>
                        ${escapeHtml(
                            film.title ||
                            "Без названия"
                        )}
                    </strong>

                    <span>

                        ${escapeHtml(
                            film.year ||
                            "—"
                        )}

                        ·

                        ${escapeHtml(
                            film.genre ||
                            "—"
                        )}

                    </span>

                </div>


                <div class="film-rating">

                    ★
                    ${escapeHtml(
                        film.rating ||
                        "0"
                    )}

                </div>

            `;


            container.appendChild(
                row
            );

        });

}


/* =========================================================
   USER MODAL
========================================================= */

function openUserModal(
    user = null
) {

    document.getElementById(
        "userId"
    ).value =
        user?.id || "";


    document.getElementById(
        "userName"
    ).value =
        user?.name || "";


    document.getElementById(
        "userEmail"
    ).value =
        user?.email || "";


    document.getElementById(
        "userPassword"
    ).value =
        user?.password || "";


    document.getElementById(
        "userModalTitle"
    ).textContent =
        user
        ? "Edit Account"
        : "Add Account";


    document.getElementById(
        "userModal"
    ).classList.remove(
        "hidden"
    );

}


function closeUserModal() {

    document.getElementById(
        "userModal"
    ).classList.add(
        "hidden"
    );

}


/* =========================================================
   ADD / EDIT USER
   POST / PATCH
========================================================= */

async function saveUser(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "userId"
        ).value.trim();


    const name =
        document.getElementById(
            "userName"
        ).value.trim();


    const email =
        document.getElementById(
            "userEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "userPassword"
        ).value;


    if (
        !name ||
        !email ||
        !password
    ) {

        showToast(
            "Заполни все поля.",
            "error"
        );

        return;
    }


    const duplicate =
        users.some(user => {

            return (
                String(user.email).toLowerCase()
                ===
                email.toLowerCase()
            )
            &&
            String(user.id)
            !==
            String(id);

        });


    if (duplicate) {

        showToast(
            "Этот email уже используется.",
            "error"
        );

        return;
    }


    try {

        let savedUser;


        if (id) {

            savedUser =
                await request(
                    `/users/${encodeURIComponent(
                        id
                    )}`,
                    {

                        method: "PATCH",

                        body:
                            JSON.stringify({
                                name,
                                email,
                                password
                            })

                    }
                );


            if (
                isCurrentUser(id)
            ) {

                updateCurrentUser(
                    savedUser
                );

            }


            showToast(
                "Аккаунт изменён."
            );

        } else {

            await request(
                "/users",
                {

                    method: "POST",

                    body:
                        JSON.stringify({
                            name,
                            email,
                            password
                        })

                }
            );


            showToast(
                "Аккаунт добавлен."
            );

        }


        closeUserModal();

        await loadUsers();


    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Ошибка сохранения аккаунта.",
            "error"
        );

    }

}


/* =========================================================
   DELETE USER
========================================================= */

async function deleteUser(id) {

    const user =
        users.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!user) {
        return;
    }


    const ownAccount =
        isCurrentUser(id);


    const message =
        ownAccount
        ? "Это твой аккаунт. После удаления ты выйдешь из системы. Продолжить?"
        : `Удалить аккаунт "${user.name || user.email}"?`;


    if (!confirm(message)) {
        return;
    }


    try {

        await request(
            `/users/${encodeURIComponent(
                id
            )}`,
            {
                method: "DELETE"
            }
        );


        if (ownAccount) {

            localStorage.removeItem(
                "user"
            );


            window.location.href =
                "index.html";


            return;
        }


        showToast(
            "Аккаунт удалён."
        );


        await loadUsers();


    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Ошибка удаления аккаунта.",
            "error"
        );

    }

}


/* =========================================================
   FILM MODAL
========================================================= */

function openFilmModal(
    film = null
) {

    document.getElementById(
        "filmId"
    ).value =
        film?.id || "";


    document.getElementById(
        "filmTitle"
    ).value =
        film?.title || "";


    document.getElementById(
        "filmYear"
    ).value =
        film?.year || "";


    document.getElementById(
        "filmGenre"
    ).value =
        film?.genre || "";


    document.getElementById(
        "filmRating"
    ).value =
        film?.rating || "";


    document.getElementById(
        "filmImage"
    ).value =
        film?.image || "";


    document.getElementById(
        "filmDescription"
    ).value =
        film?.description || "";


    document.getElementById(
        "filmModalTitle"
    ).textContent =
        film
        ? "Edit Film"
        : "Add Film";


    document.getElementById(
        "filmModal"
    ).classList.remove(
        "hidden"
    );

}


function closeFilmModal() {

    document.getElementById(
        "filmModal"
    ).classList.add(
        "hidden"
    );

}


/* =========================================================
   ADD / EDIT FILM
   POST / PATCH
========================================================= */

async function saveFilm(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "filmId"
        ).value.trim();


    const title =
        document.getElementById(
            "filmTitle"
        ).value.trim();


    const year =
        document.getElementById(
            "filmYear"
        ).value.trim();


    const genre =
        document.getElementById(
            "filmGenre"
        ).value.trim();


    const rating =
        document.getElementById(
            "filmRating"
        ).value.trim();


    const image =
        document.getElementById(
            "filmImage"
        ).value.trim();


    const description =
        document.getElementById(
            "filmDescription"
        ).value.trim();


    if (
        !title ||
        !year ||
        !genre ||
        !rating
    ) {

        showToast(
            "Заполни обязательные поля.",
            "error"
        );

        return;
    }


    const numericRating =
        Number(rating);


    if (
        Number.isNaN(numericRating) ||
        numericRating < 0 ||
        numericRating > 10
    ) {

        showToast(
            "Рейтинг должен быть от 0 до 10.",
            "error"
        );

        return;
    }


    const data = {

        title,
        year,
        genre,

        rating:
            numericRating.toFixed(1),

        image,
        description

    };


    try {

        if (id) {

            await request(
                `/films/${encodeURIComponent(
                    id
                )}`,
                {

                    method: "PATCH",

                    body:
                        JSON.stringify(
                            data
                        )

                }
            );


            showToast(
                "Фильм изменён."
            );

        } else {

            await request(
                "/films",
                {

                    method: "POST",

                    body:
                        JSON.stringify(
                            data
                        )

                }
            );


            showToast(
                "Фильм добавлен."
            );

        }


        closeFilmModal();

        await loadFilms();


    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Ошибка сохранения фильма.",
            "error"
        );

    }

}


/* =========================================================
   DELETE FILM
========================================================= */

async function deleteFilm(id) {

    const film =
        films.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!film) {
        return;
    }


    if (
        !confirm(
            `Удалить фильм "${film.title || "Без названия"}"?`
        )
    ) {

        return;
    }


    try {

        await request(
            `/films/${encodeURIComponent(
                id
            )}`,
            {
                method: "DELETE"
            }
        );


        showToast(
            "Фильм удалён."
        );


        await loadFilms();


    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Ошибка удаления фильма.",
            "error"
        );

    }

}


/* =========================================================
   ADD BUTTONS
========================================================= */

document
    .getElementById("addUserBtn")
    .addEventListener(
        "click",
        () => {

            openUserModal();

        }
    );


document
    .getElementById("addFilmBtn")
    .addEventListener(
        "click",
        () => {

            openFilmModal();

        }
    );


/* =========================================================
   FORMS
========================================================= */

document
    .getElementById("userForm")
    .addEventListener(
        "submit",
        saveUser
    );


document
    .getElementById("filmForm")
    .addEventListener(
        "submit",
        saveFilm
    );


/* =========================================================
   CLOSE BUTTONS
========================================================= */

document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const id =
                    button.dataset.close;


                document
                    .getElementById(id)
                    .classList.add(
                        "hidden"
                    );

            }
        );

    });


/* =========================================================
   SEARCH
========================================================= */

accountSearch.addEventListener(
    "input",
    renderUsers
);


filmSearch.addEventListener(
    "input",
    renderFilms
);


/* =========================================================
   EDIT / DELETE BUTTONS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const editUserButton =
            event.target.closest(
                "[data-edit-user]"
            );


        const deleteUserButton =
            event.target.closest(
                "[data-delete-user]"
            );


        const editFilmButton =
            event.target.closest(
                "[data-edit-film]"
            );


        const deleteFilmButton =
            event.target.closest(
                "[data-delete-film]"
            );


        if (editUserButton) {

            const user =
                users.find(
                    item =>
                        String(item.id) ===
                        String(
                            editUserButton.dataset.editUser
                        )
                );


            if (user) {
                openUserModal(user);
            }


            return;

        }


        if (deleteUserButton) {

            deleteUser(
                deleteUserButton.dataset.deleteUser
            );


            return;

        }


        if (editFilmButton) {

            const film =
                films.find(
                    item =>
                        String(item.id) ===
                        String(
                            editFilmButton.dataset.editFilm
                        )
                );


            if (film) {
                openFilmModal(film);
            }


            return;

        }


        if (deleteFilmButton) {

            deleteFilm(
                deleteFilmButton.dataset.deleteFilm
            );

        }

    }
);


/* =========================================================
   CLOSE MODALS BY BACKDROP
========================================================= */

document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );

                }

            }
        );

    });


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        document
            .getElementById(
                "userModal"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "filmModal"
            )
            .classList.add(
                "hidden"
            );

    }
);


/* =========================================================
   START
========================================================= */

openSection(
    "dashboard"
);

loadAll();