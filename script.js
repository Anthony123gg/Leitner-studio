/* ==========================
   VARIABLES PRINCIPALES
========================== */

let cards = JSON.parse(
    localStorage.getItem("leitner") || "[]"
);

let current = -1;
let isAnimating = false;
let studyList = [];
let confirmAction = null;
let studyTotalCards = 0;
let studyCurrentPosition = 0;


/* ==========================
   ELEMENTOS DEL HTML
========================== */

const question = document.getElementById("question");
const answer = document.getElementById("answer");
const study = document.getElementById("study");


/* ==========================
   GUARDAR DATOS
========================== */

function save() {

    localStorage.setItem(
        "leitner",
        JSON.stringify(cards)
    );

    render();
    stats();
}


/* ==========================
   AGREGAR TARJETA
========================== */

function addCard() {

    const questionInput =
        document.getElementById("q");

    const answerInput =
        document.getElementById("a");

    const q = questionInput.value.trim();
    const a = answerInput.value.trim();

    if (!q || !a) {

        showMessage(
            "✍️ Campos incompletos",
            "Completa la pregunta y la respuesta antes de guardar.",
            "warning"
        );

        return;
    }

    cards.push({
        q: q,
        a: a,
        box: 1
    });

    questionInput.value = "";
    answerInput.value = "";

    save();

    questionInput.focus();
}


/* ==========================
   MOSTRAR TARJETAS
========================== */

function render() {

    const cardsContainer =
        document.getElementById("cards");

    cardsContainer.innerHTML = "";

    if (cards.length === 0) {

        cardsContainer.innerHTML = `
<div class="item empty-cards">

    <div class="empty-icon">
        📚
    </div>

    <div class="empty-title">
        Aún no tienes tarjetas
    </div>

    <div class="empty-text">
        Crea tu primera tarjeta para comenzar a estudiar.
    </div>

</div>
`;

        return;
    }

    cards.forEach((card, index) => {

        const item = document.createElement("div");

        item.className = `item box-card-${card.box}`;

        item.innerHTML = `
            <b class="item-question"></b>

            <span class="item-box">
                Caja ${card.box}
            </span>

            <div class="small card-actions">

                <button
                    type="button"
                    onclick="editCard(${index})"
                >
                    ✏️ Editar
                </button>

                <button
    type="button"
    onclick="deleteCard(${index})"
>
    <span class="delete-icon">🗑</span>
    Eliminar
</button>

            </div>
        `;

        item.querySelector(".item-question").textContent =
            card.q;

        cardsContainer.appendChild(item);
    });
    animateCardList();
}


/* ==========================
   EDITAR TARJETA
========================== */

function editCard(index) {

    const newQuestion = prompt(
        "Pregunta",
        cards[index].q
    );

    if (newQuestion === null) {
        return;
    }

    const cleanQuestion =
        newQuestion.trim();

    if (!cleanQuestion) {

        showMessage(
            "⚠️ Pregunta vacía",
            "La pregunta no puede quedar vacía.",
            "warning"
        );

        return;
    }

    const newAnswer = prompt(
        "Respuesta",
        cards[index].a
    );

    if (newAnswer === null) {
        return;
    }

    const cleanAnswer =
        newAnswer.trim();

    if (!cleanAnswer) {

        showMessage(
            "⚠️ Respuesta vacía",
            "La respuesta no puede quedar vacía.",
            "warning"
        );

        return;
    }

    cards[index].q = cleanQuestion;
    cards[index].a = cleanAnswer;

    save();
}


/* ==========================
   ELIMINAR UNA TARJETA
   SIN CONFIRMACIÓN
========================== */

function deleteCard(index) {

    cards.splice(index, 1);

    studyList = [];
    current = -1;

    save();

    study.style.display = "none";
}


/* ==========================
   ELIMINAR TODAS
========================== */

function clearAll() {

    if (cards.length === 0) {

        showMessage(
            "📭 Sin tarjetas",
            "No tienes tarjetas para eliminar.",
            "info"
        );

        return;
    }

    showConfirm(
        "🗑 Eliminar todas",
        "¿Deseas eliminar TODAS las tarjetas? Esta acción no se puede deshacer.",
        () => {

            cards = [];
            studyList = [];
            current = -1;

            localStorage.removeItem("leitner");

            render();
            stats();

            study.style.display = "none";
        }
    );
}


/* ==========================
   ESTADÍSTICAS
========================== */

function stats() {

    for (let i = 1; i <= 5; i++) {

        const total = cards.filter(
            card => card.box === i
        ).length;

        document.getElementById(
            "b" + i
        ).innerHTML = `
            <div class="box-title">
                Caja ${i}
            </div>

            <div class="box-number">
                ${total}
            </div>
        `;
    }
}

/* ==========================
   COLOR DE LA CAJA DE ESTUDIO
========================== */

function updateStudyBoxStyle(boxNumber) {

    study.classList.remove(
        "study-box-1",
        "study-box-2",
        "study-box-3",
        "study-box-4",
        "study-box-5"
    );

    study.classList.add(
        `study-box-${boxNumber}`
    );

    const badge =
        document.getElementById(
            "currentBoxBadge"
        );

    badge.textContent =
        `📦 Caja ${boxNumber}`;
}


/* ==========================
   PROGRESO DE LA SESIÓN
========================== */

function updateStudyProgress() {

    const dotsContainer =
        document.getElementById(
            "progressDots"
        );

    const progressText =
        document.getElementById(
            "studyProgressText"
        );

    dotsContainer.innerHTML = "";

    if (studyTotalCards === 0) {

        progressText.textContent =
            "Sin tarjetas";

        return;
    }

    const visibleDots =
        Math.min(
            studyTotalCards,
            8
        );

    const progressRatio =
        studyCurrentPosition /
        studyTotalCards;

    const activeDot =
        Math.max(
            1,
            Math.ceil(
                progressRatio *
                visibleDots
            )
        );

    for (
        let i = 1;
        i <= visibleDots;
        i++
    ) {

        const dot =
            document.createElement(
                "span"
            );

        dot.className =
            "progress-dot";

        if (i < activeDot) {

            dot.classList.add(
                "completed"
            );
        }

        if (i === activeDot) {

            dot.classList.add(
                "current"
            );
        }

        dotsContainer.appendChild(dot);
    }

    progressText.textContent =
        `${studyCurrentPosition} de ${studyTotalCards} tarjetas`;
}

/* ==========================
   MODO ENFOQUE
========================== */

function enterFocusMode() {

    document.body.classList.add(
        "focus-mode"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function exitFocusMode() {

    document.body.classList.remove(
        "focus-mode"
    );

    study.style.display = "none";

    studyList = [];
    current = -1;

    document.getElementById(
        "startBtn"
    ).style.display = "block";

    document.getElementById(
        "finish"
    ).style.display = "none";

    document.getElementById(
        "finishButtons"
    ).style.display = "none";

    answer.style.display = "none";

    question.textContent = "";
    answer.textContent = "";
}



/* ==========================
   COMENZAR ESTUDIO
========================== */

function startStudy() {

    const selectedBox =
        Number(
            document.getElementById(
                "box"
            ).value
        );

    studyList = cards
        .map(
            (card, index) => ({
                index: index,
                ...card
            })
        )
        .filter(
            card =>
                card.box === selectedBox
        );

    if (studyList.length === 0) {

        showMessage(
            "📚 Sin tarjetas",
            "No hay tarjetas en esta caja.\n\nPrueba otra caja o crea nuevas tarjetas.",
            "info"
        );

        study.style.display =
            "none";

        document.getElementById(
            "startBtn"
        ).style.display = "block";

        return;
    }

    shuffleArray(studyList);

    current = -1;

    studyTotalCards =
        studyList.length;

    studyCurrentPosition = 0;

    updateStudyBoxStyle(
        selectedBox
    );

    document.getElementById(
        "startBtn"
    ).style.display = "none";

    study.style.display =
        "block";

        enterFocusMode();

    nextCard();
}


/* ==========================
   MOSTRAR SIGUIENTE TARJETA
========================== */

function nextCard() {

    const finish =
        document.getElementById(
            "finish"
        );

    const finishButtons =
        document.getElementById(
            "finishButtons"
        );

    const studyButtons =
        document.getElementById(
            "studyButtons"
        );

    finish.style.display =
        "none";

    finishButtons.style.display =
        "none";

    if (studyList.length === 0) {

        finishBox();

        return;
    }

    const card =
        studyList.shift();

    current =
        card.index;

    studyCurrentPosition =
        studyTotalCards -
        studyList.length;

    question.textContent =
        card.q;

    answer.textContent =
        card.a;

    answer.style.display =
        "none";

    study.style.display =
        "block";

    studyButtons.style.display =
        "flex";

    document.getElementById(
        "showAnswerBtn"
    ).style.display = "block";

    document.getElementById(
        "correctBtn"
    ).style.display = "none";

    document.getElementById(
        "wrongBtn"
    ).style.display = "none";

    document.getElementById(
        "studyProgress"
    ).style.display = "block";

    updateStudyProgress();
}


/* ==========================
   MEZCLAR TARJETAS
========================== */

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(Math.random() * (i + 1));

        [
            array[i],
            array[randomIndex]
        ] = [
            array[randomIndex],
            array[i]
        ];
    }
}


/* ==========================
   MOSTRAR RESPUESTA
========================== */

function showAnswer() {

    document.getElementById(
        "finish"
    ).style.display = "none";

    answer.style.display = "block";

    document.getElementById(
        "showAnswerBtn"
    ).style.display = "none";

    document.getElementById(
        "correctBtn"
    ).style.display = "block";

    document.getElementById(
        "wrongBtn"
    ).style.display = "block";
}
/* ==========================
   ANIMACIÓN DE TARJETAS
========================== */

function animateCard(type, callback) {

    if (isAnimating) {
        return;
    }

    isAnimating = true;

    const animationClass =
        type === "correct"
            ? "answer-correct"
            : "answer-wrong";

    study.classList.add(animationClass);

    setTimeout(() => {

        study.classList.remove(animationClass);

        callback();

        study.classList.add("card-enter");

        setTimeout(() => {

            study.classList.remove("card-enter");

            isAnimating = false;

        }, 180);

    }, 180);
}


/* ==========================
   RESPUESTA CORRECTA
========================== */

function correct() {

    if (
        current < 0 ||
        !cards[current]
    ) {
        return;
    }

    animateCard("correct", function () {

        if (cards[current].box < 5) {
            cards[current].box++;
        }

        save();

        continueStudy();

    });

}




/* ==========================
   RESPUESTA INCORRECTA
========================== */

function wrong() {

    if (
        current < 0 ||
        !cards[current] ||
        answer.style.display !== "block"
    ) {
        return;
    }

    animateCard(
        "wrong",
        function () {

            cards[current].box = 1;

            save();

            continueStudy();
        }
    );
}


/* ==========================
   CONTINUAR O TERMINAR
========================== */

function continueStudy() {

    if (studyList.length === 0) {

        finishBox();

    } else {

        nextCard();
    }
}


/* ==========================
   FINALIZAR CAJA
========================== */

function finishBox() {

    const selectedBox =
        Number(
            document.getElementById(
                "box"
            ).value
        );

    studyCurrentPosition =
        studyTotalCards;

    updateStudyProgress();

    document.getElementById(
        "finish"
    ).style.display = "block";

    document.getElementById(
        "studyButtons"
    ).style.display = "none";

    document.getElementById(
        "studyProgress"
    ).style.display = "none";

    document.getElementById(
        "finishButtons"
    ).style.display = "block";

    document.getElementById(
        "repeatBtn"
    ).style.display =
        selectedBox === 1
            ? "inline-block"
            : "none";

    question.textContent = "";
    answer.textContent = "";
    answer.style.display = "none";

    current = -1;
}


/* ==========================
   REPETIR CAJA
========================== */

function repeatBox() {

    studyTotalCards = 0;
    studyCurrentPosition = 0;

    startStudy();
}


/* ==========================
   CAMBIAR CAJA
========================== */

function changeBox() {

    document.body.classList.remove(
        "focus-mode"
    );

    studyList = [];
    current = -1;

    studyTotalCards = 0;
    studyCurrentPosition = 0;

    study.style.display = "none";

    document.getElementById(
        "finish"
    ).style.display = "none";

    document.getElementById(
        "finishButtons"
    ).style.display = "none";

    document.getElementById(
        "studyProgress"
    ).style.display = "none";

    document.getElementById(
        "startBtn"
    ).style.display = "block";

    question.textContent = "";
    answer.textContent = "";
    answer.style.display = "none";
}


/* ==========================
   SIGUIENTE CAJA
========================== */

function nextBox() {

    const select =
        document.getElementById(
            "box"
        );

    const currentBox =
        Number(select.value);

    if (currentBox < 5) {

        select.value =
            String(currentBox + 1);

        studyList = [];
        current = -1;

        studyTotalCards = 0;
        studyCurrentPosition = 0;

        startStudy();

    } else {

        showMessage(
            "🏆 ¡Excelente!",
            "Has completado todas las cajas del método Leitner.",
            "success"
        );

        changeBox();
    }
}


/* ==========================
   REINICIAR PROGRESO
========================== */

function resetBoxes() {

    if (cards.length === 0) {

        showMessage(
            "📭 Sin tarjetas",
            "No tienes tarjetas para reiniciar.",
            "info"
        );

        return;
    }

    showConfirm(
        "🔄 Reiniciar progreso",
        "Todas las tarjetas volverán a la Caja 1.",
        () => {

            cards.forEach(card => {
                card.box = 1;
            });

            studyList = [];
            current = -1;

            save();

            study.style.display = "none";
        }
    );
}


/* ==========================
   CAMBIO MANUAL DE CAJA
========================== */

document.getElementById(
    "box"
).addEventListener(
    "change",
    () => {

        studyList = [];
        current = -1;

        study.style.display = "none";

        question.textContent = "";
        answer.textContent = "";
        answer.style.display = "none";

        document.getElementById(
            "finish"
        ).style.display = "none";

        document.getElementById(
            "finishButtons"
        ).style.display = "none";
        document.getElementById(
    "startBtn"
).style.display = "block";
    }
);


/* ==========================
   TECLA ENTER EN CAMPOS
========================== */

document.getElementById(
    "q"
).addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            document.getElementById(
                "a"
            ).focus();
        }
    }
);


document.getElementById(
    "a"
).addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            addCard();
        }
    }
);


/* ==========================
   MODAL DE CONFIRMACIÓN
========================== */

function showConfirm(
    title,
    message,
    action
) {

    document.getElementById(
        "modalTitle"
    ).textContent = title;

    document.getElementById(
        "modalMessage"
    ).textContent = message;

    confirmAction = action;

    document.getElementById(
        "confirmModal"
    ).classList.add("show");
}


function closeConfirm() {

    document.getElementById(
        "confirmModal"
    ).classList.remove("show");

    confirmAction = null;
}


document.getElementById(
    "cancelBtn"
).addEventListener(
    "click",
    closeConfirm
);


document.getElementById(
    "confirmBtn"
).addEventListener(
    "click",
    () => {

        const action =
            confirmAction;

        closeConfirm();

        if (typeof action === "function") {
            action();
        }
    }
);


document.getElementById(
    "confirmModal"
).addEventListener(
    "click",
    event => {

        if (
            event.target.id ===
            "confirmModal"
        ) {
            closeConfirm();
        }
    }
);


/* ==========================
   MODAL DE INFORMACIÓN
========================== */

function showMessage(
    title,
    message,
    type = "info"
) {

    const icon =
        document.getElementById(
            "messageIcon"
        );

    icon.className = "modal-icon";

    switch (type) {

        case "success":

            icon.textContent = "✅";
            icon.classList.add("success");

            break;

        case "warning":

            icon.textContent = "⚠️";
            icon.classList.add("warning");

            break;

        case "error":

            icon.textContent = "❌";
            icon.classList.add("error");

            break;

        default:

            icon.textContent = "ℹ️";
            icon.classList.add("info");
    }

    document.getElementById(
        "messageTitle"
    ).textContent = title;

    document.getElementById(
        "messageText"
    ).textContent = message;

    document.getElementById(
        "messageModal"
    ).classList.add("show");
}


function closeMessage() {

    document.getElementById(
        "messageModal"
    ).classList.remove("show");
}


document.getElementById(
    "messageOkBtn"
).addEventListener(
    "click",
    closeMessage
);


document.getElementById(
    "messageModal"
).addEventListener(
    "click",
    event => {

        if (
            event.target.id ===
            "messageModal"
        ) {
            closeMessage();
        }
    }
);


/* ==========================
   MODO OSCURO
========================== */

const themeBtn =
    document.getElementById(
        "themeToggle"
    );


if (
    localStorage.getItem("theme") ===
    "dark"
) {

    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";

} else {

    themeBtn.textContent = "🌙";
}


themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );

        if (
            document.body.classList.contains(
                "dark"
            )
        ) {

            localStorage.setItem(
                "theme",
                "dark"
            );

            themeBtn.textContent = "☀️";

        } else {

            localStorage.setItem(
                "theme",
                "light"
            );

            themeBtn.textContent = "🌙";
        }
    }
);


/* ==========================
   TECLAS EN MODALES
========================== */

document.addEventListener(
    "keydown",
    event => {

        const messageModal =
            document.getElementById(
                "messageModal"
            );

        const confirmModal =
            document.getElementById(
                "confirmModal"
            );

        if (
            messageModal.classList.contains(
                "show"
            )
        ) {

            if (
                event.key === "Enter" ||
                event.key === "Escape"
            ) {

                closeMessage();
            }

            return;
        }

        if (
            confirmModal.classList.contains(
                "show"
            )
        ) {

            if (event.key === "Escape") {

                closeConfirm();

            } else if (
                event.key === "Enter"
            ) {

                const action =
                    confirmAction;

                closeConfirm();

                if (
                    typeof action ===
                    "function"
                ) {
                    action();
                }
            }
        }
    }
);


/* ==========================
   INICIAR APLICACIÓN
========================== */

render();
stats();
/* ==========================
   ATAJOS DE TECLADO
========================== */

document.addEventListener(
    "keydown",
    function (event) {

        // No hacer nada si hay un modal abierto
        if (
            document.getElementById("messageModal").classList.contains("show") ||
            document.getElementById("confirmModal").classList.contains("show")
        ) {
            return;
        }

        // Solo funcionan mientras se estudia
        if (study.style.display === "none") {
            return;
        }

        // ESPACIO = Mostrar respuesta
        if (
            event.code === "Space" &&
            answer.style.display === "none"
        ) {

            event.preventDefault();

            showAnswer();

            return;
        }

        // ENTER = Correcto
        if (
            event.key === "Enter" &&
            answer.style.display === "block"
        ) {

            event.preventDefault();

            correct();

            return;
        }

        // RETROCESO = Incorrecto
if (
    event.key === "Backspace" &&
    answer.style.display === "block"
) {

    event.preventDefault();

    wrong();

    return;
}}
);
/* ==========================
   REPRODUCTOR DE MÚSICA
========================== */

const musicBtn =
    document.getElementById("musicToggle");

const previousMusicBtn =
    document.getElementById("previousMusicBtn");

const nextMusicBtn =
    document.getElementById("nextMusicBtn");

const backgroundMusic =
    document.getElementById("backgroundMusic");

const songName =
    document.getElementById("songName");


/* Lista de canciones */

const songs = [
    {
        name: "C418 - Sweden",
        file: "musica/Sweden.mp3"
    },
    {
        name: "C418 - Minecraft",
        file: "musica/Minecraft.mp3"
    },
    {
        name: "C418 - Wet Hands",
        file: "musica/Wet Hands.mp3"
    },
    {
        name: "C418 - Mice On Venus",
        file: "musica/Mice On Venus (Alpha 0.14.0).mp3"
    },
    {
        name: "It's a Vibe",
        file: "musica/It's a Vibe.mp3"
    },
    {
        name: "Golden Days",
        file: "musica/Golden Days.mp3"
    },
    {
        name: "Kerusu - Remembrance",
        file: "musica/Kerusu - Remembrance.mp3"
    },
    {
        name: "Kerusu - Irasshaimase",
        file: "musica/Kerusu - Irasshaimase.mp3"
    },
    {
        name: "Kerusu - Hanami",
        file: "musica/Kerusu - Hanami.mp3"
    },
    {
        name: "I am not your dream",
        file: "musica/i'm not your dream .mp3"
    },
    {
        name: "Billie Eilish - Ilomilo",
        file: "musica/Billie Eilish - ilomilo (Official Audio).mp3"
    },
    {
        name: "Kerusu - Hatachi",
        file: "musica/Kerusu - Hatachi (1).mp3"
    }
];


/* Canción inicial aleatoria */

let currentSong =
    Math.floor(
        Math.random() * songs.length
    );


/*
    Guarda las canciones pendientes.

    Cuando todas hayan sonado,
    se genera una nueva lista aleatoria.
*/

let songQueue = [];


/* Volumen inicial: 35 % */

backgroundMusic.volume = 0.35;


/* Cargar una canción */

function loadSong(index) {

    backgroundMusic.src =
        songs[index].file;

    backgroundMusic.load();

    songName.textContent =
        songs[index].name;

    songName.title =
        songs[index].name;
}

/* ==========================
   MEZCLAR ÍNDICES
========================== */

function shuffleSongIndexes(indexes) {

    for (
        let i = indexes.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            indexes[i],
            indexes[randomIndex]
        ] = [
            indexes[randomIndex],
            indexes[i]
        ];
    }

    return indexes;
}


/* ==========================
   CREAR COLA DE CANCIONES
========================== */

function createSongQueue() {

    songQueue = songs
        .map(
            (song, index) => index
        )
        .filter(
            index => index !== currentSong
        );

    shuffleSongIndexes(songQueue);
}


/* ==========================
   REPRODUCIR SIGUIENTE CANCIÓN
========================== */

function playNextRandomSong() {

    /*
        Cuando ya sonaron todas,
        empieza una nueva ronda.
    */

    if (songQueue.length === 0) {
        createSongQueue();
    }

    const nextSongIndex =
        songQueue.shift();

    if (
        nextSongIndex === undefined
    ) {
        return;
    }

    currentSong =
        nextSongIndex;

    loadSong(currentSong);

    nextMusicBtn.classList.remove(
        "changing"
    );

    /*
        Reinicia la animación aunque
        se presione varias veces.
    */

    void nextMusicBtn.offsetWidth;

    nextMusicBtn.classList.add(
        "changing"
    );

    playMusic();
}


/* Reproducir */

async function playMusic() {

    try {

        await backgroundMusic.play();

        musicBtn.textContent = "🔊";
        musicBtn.title = "Pausar música";
        musicBtn.classList.add("playing");
        songName.textContent =
    songs[currentSong].name;

    } catch (error) {

        showMessage(
            "🎵 No se pudo reproducir",
            "Revisa que las canciones estén dentro de la carpeta musica.",
            "warning"
        );
    }
}


/* Pausar */

function pauseMusic() {

    backgroundMusic.pause();

    musicBtn.textContent = "🔇";
    musicBtn.title = "Reproducir música";
    musicBtn.classList.remove("playing");

    songName.textContent =
        songs[currentSong].name + " — pausada";
}


/* Reproducir o pausar */

musicBtn.addEventListener(
    "click",
    () => {

        if (backgroundMusic.paused) {

            playMusic();

        } else {

            pauseMusic();
        }
    }
);

/* Cambiar canción manualmente */

nextMusicBtn.addEventListener(
    "click",
    event => {

        /*
            Evita que el clic afecte
            otros elementos.
        */

        event.stopPropagation();

        playNextRandomSong();
    }
);








/* Pasar automáticamente a otra canción */

backgroundMusic.addEventListener(
    "ended",
    () => {

        playNextRandomSong();
    }
);


/* Preparar el orden de reproducción */

createSongQueue();


/* Cargar la primera canción aleatoria */

loadSong(currentSong);
/* ==========================
   SISTEMA DE PARTÍCULAS
========================== */

const particlesCanvas =
    document.getElementById("particlesCanvas");

const particlesContext =
    particlesCanvas.getContext("2d");


let canvasWidth = 0;
let canvasHeight = 0;
let deviceScale = 1;

let particles = [];
let answerParticles = [];

let animationFrameId = null;
let particlesRunning = true;

let mouseX = 0;
let mouseY = 0;


/* Cantidad de partículas según pantalla */

function getParticleAmount() {

    if (window.innerWidth < 600) {
        return 25;
    }

    if (window.innerWidth < 1000) {
        return 45;
    }

    return 70;
}


/* Ajustar canvas a la pantalla */

function resizeParticlesCanvas() {

    deviceScale = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    particlesCanvas.width =
        canvasWidth * deviceScale;

    particlesCanvas.height =
        canvasHeight * deviceScale;

    particlesCanvas.style.width =
        canvasWidth + "px";

    particlesCanvas.style.height =
        canvasHeight + "px";

    particlesContext.setTransform(
        deviceScale,
        0,
        0,
        deviceScale,
        0,
        0
    );

    createParticles();
}


/* Crear una partícula ambiental */

function createAmbientParticle() {

    return {
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,

        radius:
            Math.random() * 2.2 + 0.5,

        speedX:
            Math.random() * 0.18 - 0.09,

        speedY:
            -(Math.random() * 0.25 + 0.05),

        opacity:
            Math.random() * 0.55 + 0.15,

        pulse:
            Math.random() * Math.PI * 2,

        pulseSpeed:
            Math.random() * 0.018 + 0.006,

        depth:
            Math.random() * 0.8 + 0.2
    };
}


/* Crear todas las partículas */

function createParticles() {

    particles = [];

    const amount =
        getParticleAmount();

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        particles.push(
            createAmbientParticle()
        );
    }
}


/* Actualizar partícula ambiental */

function updateAmbientParticle(particle) {

    particle.x += particle.speedX;
    particle.y += particle.speedY;

    particle.pulse +=
        particle.pulseSpeed;

    if (
        particle.y <
        -particle.radius * 4
    ) {

        particle.y =
            canvasHeight +
            particle.radius * 4;

        particle.x =
            Math.random() *
            canvasWidth;
    }

    if (
        particle.x <
        -particle.radius * 4
    ) {

        particle.x =
            canvasWidth +
            particle.radius * 4;
    }

    if (
        particle.x >
        canvasWidth +
        particle.radius * 4
    ) {

        particle.x =
            -particle.radius * 4;
    }
}


/* Dibujar partícula ambiental */

function drawAmbientParticle(particle) {

    const pulseOpacity =
        particle.opacity +
        Math.sin(particle.pulse) * 0.12;

    const parallaxX =
        mouseX *
        particle.depth *
        8;

    const parallaxY =
        mouseY *
        particle.depth *
        8;

    const drawX =
        particle.x +
        parallaxX;

    const drawY =
        particle.y +
        parallaxY;

    const glowSize =
        particle.radius * 5;

    const glow =
        particlesContext.createRadialGradient(
            drawX,
            drawY,
            0,
            drawX,
            drawY,
            glowSize
        );

    glow.addColorStop(
        0,
        `rgba(253, 230, 138, ${pulseOpacity})`
    );

    glow.addColorStop(
        0.35,
        `rgba(191, 219, 254, ${pulseOpacity * 0.45})`
    );

    glow.addColorStop(
        1,
        "rgba(191, 219, 254, 0)"
    );

    particlesContext.beginPath();

    particlesContext.arc(
        drawX,
        drawY,
        glowSize,
        0,
        Math.PI * 2
    );

    particlesContext.fillStyle = glow;

    particlesContext.fill();
}


/* Crear destello al responder */

function createAnswerBurst(type) {

    if (
        !document.body.classList.contains(
            "dark"
        )
    ) {
        return;
    }

    const studyPosition =
        study.getBoundingClientRect();

    const startX =
        studyPosition.left +
        studyPosition.width / 2;

    const startY =
        studyPosition.top +
        studyPosition.height / 2;

    const particleColor =
        type === "correct"
            ? "74, 222, 128"
            : "248, 113, 113";

    for (
        let i = 0;
        i < 22;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            Math.random() *
            2.4 +
            0.8;

        answerParticles.push({

            x: startX,
            y: startY,

            velocityX:
                Math.cos(angle) *
                speed,

            velocityY:
                Math.sin(angle) *
                speed,

            radius:
                Math.random() *
                2.8 +
                1,

            opacity: 1,

            color: particleColor
        });
    }
}


/* Actualizar destellos */

function updateAnswerParticles() {

    for (
        let i =
            answerParticles.length - 1;

        i >= 0;

        i--
    ) {

        const particle =
            answerParticles[i];

        particle.x +=
            particle.velocityX;

        particle.y +=
            particle.velocityY;

        particle.velocityY +=
            0.015;

        particle.opacity -=
            0.025;

        particle.radius *=
            0.985;

        if (
            particle.opacity <= 0 ||
            particle.radius <= 0.2
        ) {

            answerParticles.splice(
                i,
                1
            );
        }
    }
}


/* Dibujar destellos */

function drawAnswerParticles() {

    answerParticles.forEach(
        particle => {

            const glow =
                particlesContext.createRadialGradient(
                    particle.x,
                    particle.y,
                    0,
                    particle.x,
                    particle.y,
                    particle.radius * 4
                );

            glow.addColorStop(
                0,
                `rgba(${particle.color}, ${particle.opacity})`
            );

            glow.addColorStop(
                1,
                `rgba(${particle.color}, 0)`
            );

            particlesContext.beginPath();

            particlesContext.arc(
                particle.x,
                particle.y,
                particle.radius * 4,
                0,
                Math.PI * 2
            );

            particlesContext.fillStyle =
                glow;

            particlesContext.fill();
        }
    );
}


/* Bucle de animación */

function animateParticles() {

    if (!particlesRunning) {
        return;
    }

    particlesContext.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    if (
        document.body.classList.contains(
            "dark"
        )
    ) {

        particles.forEach(
            particle => {

                updateAmbientParticle(
                    particle
                );

                drawAmbientParticle(
                    particle
                );
            }
        );

        updateAnswerParticles();
        drawAnswerParticles();
    }

    animationFrameId =
        requestAnimationFrame(
            animateParticles
        );
}


/* Movimiento suave con el mouse */

window.addEventListener(
    "mousemove",
    event => {

        mouseX =
            event.clientX /
            window.innerWidth -
            0.5;

        mouseY =
            event.clientY /
            window.innerHeight -
            0.5;
    }
);


/* Volver lentamente al centro */

window.addEventListener(
    "mouseleave",
    () => {

        mouseX = 0;
        mouseY = 0;
    }
);


/* Ajustar al cambiar tamaño */

window.addEventListener(
    "resize",
    resizeParticlesCanvas
);


/* Pausar cuando la pestaña no está visible */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            particlesRunning = false;

            if (animationFrameId) {

                cancelAnimationFrame(
                    animationFrameId
                );
            }

        } else {

            particlesRunning = true;

            animateParticles();
        }
    }
);


/* Iniciar partículas */

resizeParticlesCanvas();
animateParticles();
/* ==========================
   ANIMACIÓN ESCALONADA
========================== */

function animateCardList() {

    const cardItems =
        document.querySelectorAll(".item");

    cardItems.forEach(
        (item, index) => {

            item.style.animationDelay =
                `${index * 0.08}s`;
        }
    );
}
