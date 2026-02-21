let size = 4;
let state = [];
let moves = 0;
let timer = 0;
let timerInterval = null;
let playerName = "";

const menuScreen = document.getElementById("menu-screen");
const difficultySelect = document.getElementById("difficulty");
const gameScreen = document.getElementById("game-screen");
const board = document.getElementById("board");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const nameInput = document.getElementById("player-name");


const movesSpan = document.getElementById("moves");
const timerSpan = document.getElementById("timer");
const currentPlayerSpan = document.getElementById("current-player");

const music = document.getElementById("bg-music");
const musicToggleBtn = document.getElementById("music-toggle-btn");

let musicEnabled = true;

musicToggleBtn.addEventListener("click", () => {
    if (musicEnabled) {
        music.pause();
        musicToggleBtn.textContent = "Включить музыку";
    } else {
        music.play();
        musicToggleBtn.textContent = "Выключить музыку";
    }

    musicEnabled = !musicEnabled;
});

startBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
        alert("Введите имя");
        return;
    }

    playerName = name;
    currentPlayerSpan.textContent = playerName;

    size = parseInt(difficultySelect.value);

    menuScreen.classList.remove("active");
    gameScreen.classList.add("active");

    startGame();

    music.play();
});

restartBtn.addEventListener("click", startGame);

function startGame() {
    moves = 0;
    timer = 0;
    movesSpan.textContent = moves;
    timerSpan.textContent = timer;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        timerSpan.textContent = timer;
    }, 1000);

    generateSolvableState();
    renderBoard();
}
function generateSolvableState() {
    const solved = [...Array(size * size - 1).keys()].map(n => n + 1);
    solved.push(null);

    do {
        state = [...solved].sort(() => Math.random() - 0.5);
    } while (!isSolvable(state) || isWinningState());
}

function isWinningState() {
    const totalTiles = size * size;

    for (let i = 0; i < totalTiles - 1; i++) {
        if (state[i] !== i + 1) return false;
    }

    return state[totalTiles - 1] === null;
}

function isSolvable(arr) {
    let inversions = 0;
    const flat = arr.filter(n => n !== null);

    for (let i = 0; i < flat.length; i++) {
        for (let j = i + 1; j < flat.length; j++) {
            if (flat[i] > flat[j]) inversions++;
        }
    }

    const emptyRow = Math.floor(arr.indexOf(null) / size);

    if (size % 2 === 0) {
        return (inversions + emptyRow) % 2 !== 0;
    }

    return inversions % 2 === 0;
}

const boardSize = 288;
const tileSize = boardSize / gridSize;

function renderBoard() {
  board.innerHTML = "";

  const tileSize = boardSize / size;

  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  state.forEach((value, index) => {
    const tile = document.createElement("div");

    tile.style.width = tileSize + "px";
    tile.style.height = tileSize + "px";

    if (value === null) {
      tile.classList.add("empty");
    } else {
      tile.classList.add("tile");

      const row = Math.floor((value - 1) / size);
      const col = (value - 1) % size;

      tile.style.backgroundSize = `${boardSize}px ${boardSize}px`;
      tile.style.backgroundPosition =
        `-${col * tileSize}px -${row * tileSize}px`;

      tile.addEventListener("click", () => moveTile(index));
    }

    board.appendChild(tile);
  });
}

function moveTile(index) {
    const emptyIndex = state.indexOf(null);
    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(index)) {
        [state[index], state[emptyIndex]] =
        [state[emptyIndex], state[index]];

        moves++;
        movesSpan.textContent = moves;

        renderBoard();
        checkWin();
    }
}

function getValidMoves(emptyIndex) {
    const moves = [];
    const row = Math.floor(emptyIndex / size);
    const col = emptyIndex % size;

    if (row > 0) moves.push(emptyIndex - size);
    if (row < size - 1) moves.push(emptyIndex + size);
    if (col > 0) moves.push(emptyIndex - 1);
    if (col < size - 1) moves.push(emptyIndex + 1);

    return moves;
}

function checkWin() {
    if (!isWinningState()) return;

    clearInterval(timerInterval);

    const best = localStorage.getItem("bestScore");
    const score = timer;

    if (!best || score < best) {
        localStorage.setItem("bestScore", score);
    }

    setTimeout(() => {
        alert(`Победа, ${playerName}! Время: ${timer} сек`);
    }, 200);
}
