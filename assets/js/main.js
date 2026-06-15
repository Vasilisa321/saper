const BOARD_SIZE = 10;
const TOTAL_MINES = 1;
const INITIAL_TIME_SEC = 300;

let gameBoard = [];
let gameActive = false;
let firstMoveFlag = true;
let revealedCount = 0;
let timerInterval = null;
let timeLeft = INITIAL_TIME_SEC;
let currentScore = 0;
let playerName = "";

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");
const startBtn = document.getElementById("startGameBtn");
const playerNameInput = document.getElementById("playerName");
const gamePlayerNameSpan = document.getElementById("gamePlayerName");
const timerDisplay = document.getElementById("timerDisplay");
const scoreValueSpan = document.getElementById("scoreValue");
const boardContainer = document.getElementById("board");
const newGameFromGameBtn = document.getElementById("newGameFromGameBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const finalPlayerNameSpan = document.getElementById("finalPlayerName");
const finalScoreSpan = document.getElementById("finalScore");
const finalTimeSpan = document.getElementById("finalTime");
const resultTitle = document.getElementById("resultTitle");


function formatTime(seconds) {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerUI() {
    timerDisplay.textContent = formatTime(timeLeft);
}

function updateScoreUI() {
    scoreValueSpan.textContent = currentScore;
}

function stopGameTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function startCountdownTimer() {
    if (timerInterval) stopGameTimer();
    timerInterval = setInterval(() => {
        if (!gameActive) return;

        if (timeLeft > 0) {
            timeLeft--;
            updateTimerUI();
            if (timeLeft === 0) {
                if (gameActive) {
                    gameLose("Время вышло!");
                }
            }
        } else {
            if (gameActive) {
                gameLose("Время вышло!");
            }
        }
    }, 1000);
}

function createEmptyBoard() {
    const board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
                element: null
            };
        }
    }
    return board;
}

function placeMines(board, excludeRow, excludeCol) {
    let minesPlaced = 0;
    while (minesPlaced < TOTAL_MINES) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        if (!board[row][col].isMine && !(row === excludeRow && col === excludeCol)) {
            board[row][col].isMine = true;
            minesPlaced++;
        }
    }
}

function calculateNeighbors(board) {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j].isMine) continue;
            let count = 0;
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
                    const ni = i + di, nj = j + dj;
                    if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && board[ni][nj].isMine) {
                        count++;
                    }
                }
            }
            board[i][j].neighborMines = count;
        }
    }
}

function generateFieldAfterFirstClick(excludeRow, excludeCol) {
    const newBoard = createEmptyBoard();
    placeMines(newBoard, excludeRow, excludeCol);
    calculateNeighbors(newBoard);
    return newBoard;
}

function renderCell(row, col) {
    const cell = gameBoard[row][col];
    const el = cell.element;
    if (!el) return;

    el.classList.remove("revealed", "flagged", "mine-revealed");
    el.removeAttribute("data-value");
    el.textContent = "";

    if (cell.isRevealed) {
        el.classList.add("revealed");
        if (cell.isMine) {
            el.classList.add("mine-revealed");
            el.textContent = "💣";
        } else if (cell.neighborMines > 0) {
            el.textContent = cell.neighborMines;
            el.setAttribute("data-value", cell.neighborMines);
        } else {
            el.textContent = "";
        }
    } else if (cell.isFlagged) {
        el.classList.add("flagged");
        el.textContent = "🚩";
    } else {
        el.textContent = "";
    }
}

function revealEmptyArea(startRow, startCol) {
    const queue = [{row: startRow, col: startCol}];
    const visited = new Set();

    while (queue.length > 0) {
        const {row, col} = queue.shift();
        const key = `${row},${col}`;
        if (visited.has(key)) continue;
        visited.add(key);

        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) continue;
        const cell = gameBoard[row][col];
        if (cell.isRevealed || cell.isFlagged || cell.isMine) continue;

        cell.isRevealed = true;
        revealedCount++;
        renderCell(row, col);

        if (cell.neighborMines === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    queue.push({row: row + dr, col: col + dc});
                }
            }
        }
    }
}

function checkVictory() {
    const totalSafe = BOARD_SIZE * BOARD_SIZE - TOTAL_MINES;
    if (revealedCount === totalSafe && gameActive) {
        gameWin();
    }
}

function gameWin() {
    if (!gameActive) return;
    gameActive = false;
    stopGameTimer();


    currentScore = timeLeft;
    updateScoreUI();

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (gameBoard[i][j].isMine && !gameBoard[i][j].isRevealed) {
                gameBoard[i][j].isFlagged = true;
                renderCell(i, j);
            }
        }
    }

    showEndScreen("win", currentScore, timeLeft);
}

function gameLose() {
    if (!gameActive) return;
    gameActive = false;
    stopGameTimer();


    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (gameBoard[i][j].isMine && !gameBoard[i][j].isRevealed) {
                gameBoard[i][j].isRevealed = true;
                renderCell(i, j);
            }
        }
    }

    showEndScreen("lose", currentScore, timeLeft);
}

function showEndScreen(result, score, remainingTime) {
    finalPlayerNameSpan.textContent = playerName;
    finalScoreSpan.textContent = score;
    finalTimeSpan.textContent = formatTime(remainingTime);

    if (result === "win") {
        resultTitle.textContent = "ВЫ ПОБЕДИЛИ!";
    } else {
        resultTitle.textContent = "ВЫ ПРОИГРАЛИ!";
    }

    startScreen.classList.remove("active");
    gameScreen.classList.remove("active");
    endScreen.classList.add("active");
}

function handleCellClick(row, col, eventType) {
    if (!gameActive) return;
    const cell = gameBoard[row][col];

    if (eventType === "contextmenu") {
        if (cell.isRevealed) return;
        cell.isFlagged = !cell.isFlagged;
        renderCell(row, col);
        return;
    }

    if (eventType === "click") {
        if (cell.isRevealed || cell.isFlagged) return;

        if (firstMoveFlag) {
            firstMoveFlag = false;
            const oldElements = [];
            for (let i = 0; i < BOARD_SIZE; i++) {
                oldElements[i] = [];
                for (let j = 0; j < BOARD_SIZE; j++) {
                    oldElements[i][j] = gameBoard[i][j].element;
                }
            }
            gameBoard = generateFieldAfterFirstClick(row, col);
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    gameBoard[i][j].element = oldElements[i][j];
                }
            }
            const newCell = gameBoard[row][col];
            if (newCell.isMine) {
                gameLose();
                return;
            }
            if (newCell.neighborMines === 0) {
                revealEmptyArea(row, col);
            } else {
                newCell.isRevealed = true;
                revealedCount++;
                renderCell(row, col);
            }
            checkVictory();
            return;
        }

        if (cell.isMine) {
            gameLose("Вы проиграли");
            return;
        }

        if (cell.neighborMines === 0) {
            revealEmptyArea(row, col);
        } else {
            cell.isRevealed = true;
            revealedCount++;
            renderCell(row, col);
        }
        checkVictory();
    }
}

function buildGameBoardUI() {
    boardContainer.innerHTML = "";
    boardContainer.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 38px)`;

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cellDiv = document.createElement("div");
            cellDiv.className = "cell";
            cellDiv.dataset.row = i;
            cellDiv.dataset.col = j;

            cellDiv.addEventListener("click", (function(r, c) {
                return function() { handleCellClick(r, c, "click"); };
            })(i, j));

            cellDiv.addEventListener("contextmenu", (function(r, c) {
                return function(e) {
                    e.preventDefault();
                    handleCellClick(r, c, "contextmenu");
                };
            })(i, j));

            boardContainer.appendChild(cellDiv);
            gameBoard[i][j].element = cellDiv;
            renderCell(i, j);
        }
    }
}

function initNewGame() {
    stopGameTimer();
    gameBoard = createEmptyBoard();
    firstMoveFlag = true;
    gameActive = true;
    revealedCount = 0;
    timeLeft = INITIAL_TIME_SEC;
    currentScore = 0;
    updateTimerUI();
    updateScoreUI();
    buildGameBoardUI();
}

function startGame() {
    const name = playerNameInput.value.trim();
    if (name === "") return;
    playerName = name;
    gamePlayerNameSpan.textContent = playerName;

    initNewGame();
    startCountdownTimer();

    startScreen.classList.remove("active");
    endScreen.classList.remove("active");
    gameScreen.classList.add("active");
}

function restartGame() {
    stopGameTimer();
    initNewGame();
    startCountdownTimer();
    gameActive = true;
    gameScreen.classList.add("active");
    endScreen.classList.remove("active");
    startScreen.classList.remove("active");
}

playerNameInput.addEventListener("input", function() {
    startBtn.disabled = this.value.trim() === "";
});

startBtn.addEventListener("click", startGame);
newGameFromGameBtn.addEventListener("click", restartGame);
playAgainBtn.addEventListener("click", () => {
    restartGame();
});

startScreen.classList.add("active");
gameScreen.classList.remove("active");
endScreen.classList.remove("active");
startBtn.disabled = true;

gameBoard = createEmptyBoard();