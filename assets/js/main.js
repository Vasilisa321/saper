const BoardSize = 10;
const Mines = 15;

let board = [];
let firstMove = true;
let gameActive = true;
let cellsRevealed = 0;
let timerInterval;
let seconds = 0;

const gameBoard = document.getElementById('board');
const resetButton = document.getElementById('restartButton');
const startButton = document.getElementById('startButton');
const gameStatus = document.getElementById('statusMessage');
const mineCounter = document.getElementById('mineCounter');
const timerDisplay = document.getElementById('timer');

function initBoard() {
    board = Array(BoardSize).fill().map(() =>
        Array(BoardSize).fill().map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
        element: null
    })));
    cellsRevealed = 0;
    gameActive = true;
    firstMove = true;
    seconds = 0;
    updateTimer();
    updateMineCounter();
    if (gameStatus) gameStatus.textContent = 'Игра началась';
}

function placeMines(firstRow, firstCol) {
    let minesPlaced = 0;
    while (minesPlaced < Mines) {
        const randRow = Math.floor(Math.random() * BoardSize);
        const randCol = Math.floor(Math.random() * BoardSize);

        if (!board[randRow][randCol].isMine &&
            !(randRow === firstRow && randCol === firstCol)) {
            board[randRow][randCol].isMine = true;
            minesPlaced++;
        }
    }
}

function updateMineCounter() {
    if (!mineCounter) return;

    let flaggedCount = 0;
    for (let row of board) {
        for (let cell of row) {
            if (cell.isFlagged) flaggedCount++;
        }
    }

    const remaining = Mines - flaggedCount;
    mineCounter.textContent = remaining;
}

function updateTimerDisplay() {
    if (timerDisplay) {
        timerDisplay.textContent = seconds;
    }
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function startTimer() {
    if (timerInterval) stopTimer();
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

function resetTimer() {
    seconds = 0;
    updateTimerDisplay();
    stopTimer();
}


function calculateNumbers() {
    for (let i = 0; i < BoardSize; i++) {
        for (let j = 0; j < BoardSize; j++) {
            if (board[i][j].isMine) continue;

            let count = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    const row = i + x;
                    const col = j + y;
                    if (row >= 0 && row < BoardSize && col >= 0 && col < BoardSize) {
                        if (board[row][col].isMine) count++;
                    }
                }
            }
            board[i][j].neighborMines = count;
        }
    }
}


function handleCellClick(row, col, event) {
    if (!gameActive) return;

    const cell = board[row][col];

    if (event.type === 'click') {
        if (cell.isRevealed || cell.isFlagged) return;

        if (firstMove) {
            startTimer();
            placeMines(row, col);
            calculateNumbers();
            firstMove = false;
        }

        if (cell.isMine) {
            gameLose();
            return;
        }

        if (cell.neighborMines === 0) {
            revealEmptyCells(row, col);
        } else {
            cell.isRevealed = true;
            cellsRevealed++;
            updateCellVisual(row, col);
        }
        checkWin();

    } else if (event.type === 'contextmenu') {
        event.preventDefault();
        if (cell.isRevealed) return;
        cell.isFlagged = !cell.isFlagged;
        updateCellVisual(row, col);
        updateMineCounter();
    }
}


function renderBoard() {
    if (!gameBoard) return;

    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${BoardSize}, 40px)`;
    gameBoard.style.gridTemplateRows = `repeat(${BoardSize}, 40px)`;

    for (let i = 0; i < BoardSize; i++) {
        for (let j = 0; j < BoardSize; j++) {
            const cell = board[i][j];
            const cellDiv = document.createElement('div');

            cellDiv.className = 'cell';
            cellDiv.dataset.row = i;
            cellDiv.dataset.col = j;

            cell.element = cellDiv;

            cellDiv.addEventListener('click', () => handleCellClick(i, j, { type: 'click' }));
            cellDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleCellClick(i, j, e);
            });

            gameBoard.appendChild(cellDiv);

            updateCellVisual(i, j);
        }
    }
}

function revealEmptyCells(row, col) {
    const queue = [{row: row, col: col}];
    const visited = new Set();

    while (queue.length > 0) {
        const {row: r, col: c} = queue.shift();
        const key = `${r},${c}`;

        if (visited.has(key)) continue;
        visited.add(key);

        if (r < 0 || r >= BoardSize || c < 0 || c >= BoardSize) continue;

        const cell = board[r][c];

        if (cell.isMine || cell.isFlagged || cell.isRevealed) continue;

        cell.isRevealed = true;
        cellsRevealed++;
        updateCellVisual(r, c);

        if (cell.neighborMines === 0) {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x === 0 && y === 0) continue;
                    queue.push({row: r + x, col: c + y});
                }
            }
        }
    }
}


function updateCellVisual(row, col) {
    const cell = board[row][col];
    const cellDiv = cell.element;

    if (!cellDiv) return;

    cellDiv.classList.remove('revealed', 'flagged', 'mine-revealed');
    cellDiv.removeAttribute('data-value');

    if (cell.isRevealed) {
        cellDiv.classList.add('revealed');
        cellDiv.classList.remove('flagged');

        if (cell.isMine) {
            cellDiv.classList.add('mine-revealed');
            cellDiv.textContent = '💣';
        } else if (cell.neighborMines > 0) {
            cellDiv.textContent = cell.neighborMines;
            cellDiv.setAttribute('data-value', cell.neighborMines);
        } else {
            cellDiv.textContent = '';
        }
    } else if (cell.isFlagged) {
        cellDiv.classList.add('flagged');
        cellDiv.textContent = '🚩';
    } else {
        cellDiv.textContent = '';
    }
}


function checkWin() {
    const totalSafeCells = BoardSize * BoardSize - Mines;

    if (cellsRevealed === totalSafeCells) {
        gameWin();
    }
}


function gameWin() {
    gameActive = false;
    stopTimer();

    for (let i = 0; i < BoardSize; i++) {
        for (let j = 0; j < BoardSize; j++) {
            const cell = board[i][j];
            if (cell.isMine && !cell.isRevealed) {
                cell.isFlagged = true;
                updateCellVisual(i, j);
            }
        }
    }

    if (gameStatus) gameStatus.textContent = 'ПОБЕДА! 🎉';
    updateMineCounter();
    setTimeout(() => alert('Победа!'), 100);
}



function gameLose() {
    gameActive = false;
    stopTimer();

    for (let i = 0; i < BoardSize; i++) {
        for (let j = 0; j < BoardSize; j++) {
            const cell = board[i][j];
            if (cell.isMine && !cell.isRevealed) {
                cell.isRevealed = true;
                updateCellVisual(i, j);
            }
        }
    }

    if (gameStatus) gameStatus.textContent = 'ПОРАЖЕНИЕ! 💥';
    setTimeout(() => alert('Вы проиграли!'), 100);
}


function startNewGame() {
    stopTimer();
    initBoard();
    renderBoard();
}


if (startButton) {
    startButton.addEventListener('click', startNewGame);
}
if (resetButton) {
    resetButton.addEventListener('click', startNewGame);
}


initBoard();
renderBoard();