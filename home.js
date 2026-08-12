/* =========================================================
   MOVIEZONE HOME
   Dynamic films from JSON Server
========================================================= */

const API_URL = "https://server-e0jw.onrender.com";

let movies = [];

let currentSlide = 0;


/* =========================================================
   DOM
========================================================= */

const userName =
    document.getElementById("userName");

const logoutButton =
    document.getElementById("logout");

const searchInput =
    document.getElementById("searchInput");

const moviesGrid =
    document.getElementById("moviesGrid");

const newMoviesGrid =
    document.getElementById("newMoviesGrid");

const actionMoviesGrid =
    document.getElementById("actionMoviesGrid");

const heroSlides =
    document.querySelectorAll(".hero-slide");

const sliderDots =
    document.getElementById("sliderDots");

const prevButton =
    document.getElementById("prev");

const nextButton =
    document.getElementById("next");


/* =========================================================
   USER
========================================================= */

const savedUser =
    localStorage.getItem("user");


if (!savedUser) {

    window.location.href =
        "index.html";

} else {

    try {

        const user =
            JSON.parse(savedUser);

        userName.textContent =
            user.name ||
            user.email ||
            "Пользователь";

    } catch (error) {

        console.error(
            "Ошибка пользователя:",
            error
        );

        userName.textContent =
            "Пользователь";

    }

}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "user"
        );

        window.location.href =
            "index.html";

    }
);


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   GET FILMS
========================================================= */

async function loadMovies() {

    try {

        const response =
            await fetch(
                `${API_URL}/films`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        movies =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "MovieZone: загружено фильмов:",
            movies.length
        );


        renderMovies();

        renderHero();


    } catch (error) {

        console.error(
            "MovieZone: ошибка загрузки фильмов:",
            error
        );


        movies = [];


        showMoviesError();

    }

}


/* =========================================================
   MOVIE CARD
========================================================= */

function createMovieCard(movie) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "movie-card";


    const image =
        document.createElement(
            "div"
        );


    image.className =
        "movie-image";


    if (movie.image) {

        image.style.backgroundImage =
            `url("${movie.image}")`;

    } else {

        image.innerHTML = `
            <i
                class="
                    fa-solid
                    fa-film
                "
            ></i>
        `;

    }


    const info =
        document.createElement(
            "div"
        );


    info.className =
        "movie-info";


    info.innerHTML = `

        <h3>
            ${escapeHtml(
                movie.title ||
                "Без названия"
            )}
        </h3>


        <div class="movie-meta">

            <span>
                ${escapeHtml(
                    movie.year ||
                    "—"
                )}
            </span>


            <span class="rating">

                ★

                ${escapeHtml(
                    movie.rating ||
                    "0"
                )}

            </span>

        </div>

    `;


    card.appendChild(
        image
    );


    card.appendChild(
        info
    );


    card.addEventListener(
        "click",
        () => {

            showMovieInfo(
                movie
            );

        }
    );


    return card;

}


/* =========================================================
   MOVIE INFO
========================================================= */

function showMovieInfo(movie) {

    alert(

        `${movie.title || "Без названия"}\n\n` +

        `Год: ${
            movie.year || "—"
        }\n` +

        `Жанр: ${
            movie.genre || "—"
        }\n` +

        `Рейтинг: ${
            movie.rating || "—"
        }\n\n` +

        `${
            movie.description ||
            "Описание отсутствует."
        }`

    );

}


/* =========================================================
   RENDER MOVIES
========================================================= */

function renderMovies(
    movieList = movies
) {

    moviesGrid.innerHTML =
        "";

    newMoviesGrid.innerHTML =
        "";

    actionMoviesGrid.innerHTML =
        "";


    /* =====================================================
       POPULAR
    ===================================================== */

    const popular =
        [...movieList]
            .sort(
                (
                    a,
                    b
                ) => {

                    return (
                        Number(
                            b.rating || 0
                        )
                        -
                        Number(
                            a.rating || 0
                        )
                    );

                }
            )
            .slice(
                0,
                6
            );


    popular.forEach(
        movie => {

            moviesGrid.appendChild(
                createMovieCard(
                    movie
                )
            );

        }
    );


    /* =====================================================
       NEW
    ===================================================== */

    const newMovies =
        [...movieList]
            .sort(
                (
                    a,
                    b
                ) => {

                    return (
                        Number(
                            b.year || 0
                        )
                        -
                        Number(
                            a.year || 0
                        )
                    );

                }
            )
            .slice(
                0,
                6
            );


    newMovies.forEach(
        movie => {

            newMoviesGrid.appendChild(
                createMovieCard(
                    movie
                )
            );

        }
    );


    /* =====================================================
       ACTION
    ===================================================== */

    const actionMovies =
        movieList
            .filter(
                movie => {

                    const genre =
                        String(
                            movie.genre ||
                            ""
                        )
                            .toLowerCase();


                    return (
                        genre.includes(
                            "боевик"
                        )
                        ||
                        genre.includes(
                            "action"
                        )
                    );

                }
            )
            .slice(
                0,
                6
            );


    actionMovies.forEach(
        movie => {

            actionMoviesGrid.appendChild(
                createMovieCard(
                    movie
                )
            );

        }
    );


    if (
        popular.length === 0
    ) {

        moviesGrid.innerHTML = `
            <div class="movie-error">
                Фильмов пока нет.
            </div>
        `;

    }


    if (
        newMovies.length === 0
    ) {

        newMoviesGrid.innerHTML = `
            <div class="movie-error">
                Новинок пока нет.
            </div>
        `;

    }


    if (
        actionMovies.length === 0
    ) {

        actionMoviesGrid.innerHTML = `
            <div class="movie-error">
                Боевиков пока нет.
            </div>
        `;

    }

}


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    () => {

        const value =
            searchInput.value
                .toLowerCase()
                .trim();


        if (!value) {

            renderMovies();

            return;

        }


        const filtered =
            movies.filter(
                movie => {

                    const title =
                        String(
                            movie.title ||
                            ""
                        )
                            .toLowerCase();


                    const genre =
                        String(
                            movie.genre ||
                            ""
                        )
                            .toLowerCase();


                    const description =
                        String(
                            movie.description ||
                            ""
                        )
                            .toLowerCase();


                    return (
                        title.includes(
                            value
                        )
                        ||
                        genre.includes(
                            value
                        )
                        ||
                        description.includes(
                            value
                        )
                    );

                }
            );


        renderMovies(
            filtered
        );

    }
);


/* =========================================================
   HERO
========================================================= */

function renderHero() {

    if (
        !heroSlides.length
    ) {

        return;

    }


    const heroMovies =
        [...movies]
            .sort(
                (
                    a,
                    b
                ) => {

                    return (
                        Number(
                            b.rating || 0
                        )
                        -
                        Number(
                            a.rating || 0
                        )
                    );

                }
            )
            .slice(
                0,
                3
            );


    heroSlides.forEach(
        (
            slide,
            index
        ) => {

            const movie =
                heroMovies[index];


            if (!movie) {

                slide.style.display =
                    "none";

                return;

            }


            slide.style.display =
                "";


            slide.dataset.movieId =
                movie.id || "";


            const image =
                slide.querySelector(
                    "img"
                );


            const title =
                slide.querySelector(
                    "h1"
                );


            const meta =
                slide.querySelector(
                    ".hero-meta"
                );


            const description =
                slide.querySelector(
                    ".hero-content p"
                );


            if (image) {

                image.src =
                    movie.image ||
                    "https://placehold.co/1920x900/111111/6d1f32?text=MOVIEZONE";

                image.alt =
                    movie.title ||
                    "Movie";

            }


            if (title) {

                title.textContent =
                    movie.title ||
                    "Без названия";

            }


            if (meta) {

                meta.innerHTML = `

                    <span>
                        ${escapeHtml(
                            movie.year ||
                            "—"
                        )}
                    </span>

                    <span>•</span>

                    <span>
                        ${escapeHtml(
                            movie.genre ||
                            "—"
                        )}
                    </span>

                    <span>•</span>

                    <span class="rating">

                        ★

                        ${escapeHtml(
                            movie.rating ||
                            "0"
                        )}

                    </span>

                `;

            }


            if (description) {

                description.textContent =
                    movie.description ||
                    "Описание фильма отсутствует.";

            }

        }
    );


    renderDots(
        heroMovies.length
    );


    currentSlide = 0;

    showSlide(
        0
    );

}


/* =========================================================
   DOTS
========================================================= */

function renderDots(
    count
) {

    sliderDots.innerHTML =
        "";


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const dot =
            document.createElement(
                "span"
            );


        dot.className =
            "dot";


        if (
            i === 0
        ) {

            dot.classList.add(
                "active"
            );

        }


        dot.addEventListener(
            "click",
            () => {

                showSlide(
                    i
                );

            }
        );


        sliderDots.appendChild(
            dot
        );

    }

}


/* =========================================================
   SHOW SLIDE
========================================================= */

function showSlide(
    index
) {

    const visibleSlides =
        [...heroSlides]
            .filter(
                slide =>
                    slide.style.display
                    !==
                    "none"
            );


    if (
        visibleSlides.length === 0
    ) {

        return;

    }


    if (
        index < 0
    ) {

        index =
            visibleSlides.length - 1;

    }


    if (
        index >=
        visibleSlides.length
    ) {

        index = 0;

    }


    heroSlides.forEach(
        slide => {

            slide.classList.remove(
                "active"
            );

        }
    );


    visibleSlides[index]
        .classList.add(
            "active"
        );


    const dots =
        sliderDots.querySelectorAll(
            ".dot"
        );


    dots.forEach(
        (
            dot,
            dotIndex
        ) => {

            dot.classList.toggle(
                "active",
                dotIndex === index
            );

        }
    );


    currentSlide =
        index;

}


/* =========================================================
   NEXT / PREVIOUS
========================================================= */

function nextSlide() {

    showSlide(
        currentSlide + 1
    );

}


function previousSlide() {

    showSlide(
        currentSlide - 1
    );

}


nextButton.addEventListener(
    "click",
    nextSlide
);


prevButton.addEventListener(
    "click",
    previousSlide
);


/* =========================================================
   AUTO SLIDER
========================================================= */

setInterval(
    () => {

        if (
            movies.length > 0
        ) {

            nextSlide();

        }

    },
    6000
);


/* =========================================================
   HERO BUTTONS
========================================================= */

document
    .querySelectorAll(".watch-btn")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const active =
                        document.querySelector(
                            ".hero-slide.active"
                        );


                    if (!active) {
                        return;
                    }


                    const movie =
                        movies.find(
                            item =>
                                String(
                                    item.id
                                )
                                ===
                                String(
                                    active.dataset.movieId
                                )
                        );


                    if (!movie) {
                        return;
                    }


                    alert(
                        `Сейчас открываем: ${
                            movie.title
                        }`
                    );

                }
            );

        }
    );


document
    .querySelectorAll(".more-btn")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const active =
                        document.querySelector(
                            ".hero-slide.active"
                        );


                    if (!active) {
                        return;
                    }


                    const movie =
                        movies.find(
                            item =>
                                String(
                                    item.id
                                )
                                ===
                                String(
                                    active.dataset.movieId
                                )
                        );


                    if (!movie) {
                        return;
                    }


                    showMovieInfo(
                        movie
                    );

                }
            );

        }
    );


/* =========================================================
   ERROR
========================================================= */

function showMoviesError() {

    const message = `
        <div class="movie-error">
            Не удалось загрузить фильмы.
            Проверь, что JSON Server
            запущен на порту 3001.
        </div>
    `;


    moviesGrid.innerHTML =
        message;


    newMoviesGrid.innerHTML =
        message;


    actionMoviesGrid.innerHTML =
        message;

}


/* =========================================================
   START
========================================================= */

loadMovies();