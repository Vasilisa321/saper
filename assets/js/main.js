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
    board = Array(BoardSize).fill().map(() => Array(BoardSize).fill().map(() => ({
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
    const flaggedMines = board.flat().filter(cell => cell.isFlagged).length;
    const remainingMines = Mines - flaggedMines;
    if (mineCounter) mineCounter.textContent = remainingMines;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        updateTimer();
    }, 1000);
}

function updateTimer() {
    if (timerDisplay) timerDisplay.textContent = seconds;
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
    const stack = [[row, col]];
    const visited = new Set();

    while (stack.length > 0) {
        const [r, c] = stack.pop();
        const key = `${r},${c}`;

        if (visited.has(key)) continue;
        visited.add(key);

        if (r < 0 || r >= BoardSize || c < 0 || c >= BoardSize) continue;

        const cell = board[r][c];
        if (cell.isRevealed || cell.isFlagged || cell.isMine) continue;

        cell.isRevealed = true;
        cellsRevealed++;
        updateCellVisual(r, c);

        if (cell.neighborMines === 0) {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x === 0 && y === 0) continue;
                    stack.push([r + x, c + y]);
                }
            }
        }
    }
}

function updateCellVisual(row, col) {
    const cell = board[row][col];
    const cellDiv = cell.element;

    if (!cellDiv) return;

    cellDiv.classList.toggle('revealed', cell.isRevealed);
    cellDiv.classList.toggle('flagged', cell.isFlagged);

    if (cell.isRevealed) {
        cellDiv.classList.remove('flagged');
        if (cell.isMine) {
            cellDiv.classList.add('mine-revealed');
            cellDiv.textContent = '';
        } else if (cell.neighborMines > 0) {
            cellDiv.textContent = cell.neighborMines;
            cellDiv.setAttribute('data-value', cell.neighborMines);
        } else {
            cellDiv.textContent = '';
        }
    } else {
        cellDiv.textContent = cell.isFlagged ? '🚩' : '';
    }
}

function checkWin() {
    const safeCells = BoardSize * BoardSize - TOTAL_MINES;

    if(cellsRevealed === safeCells) {
        gameWin();
    }
}

function gameWin() {
    gameActive = false;

    for (let i = 0; i < BoardSize; i++) {
        for (let j = 0; j < BoardSize; j++) {
            const cell = board[i][j];
            if (cell.isMine && !cell.isRevealed) {
                cell.isFlagged = true;
                updateCellVisual(i, j);
            }
        }
    }

    setTimeout(() => alert('Победа!'), 100);
}


function gameLose() {
    gameActive = false;

    for (let i = 0; i < BoardSize; i++) {
        for (let j = 0; j < BoardSize; j++) {
            const cell = board[i][j];
            if (cell.isMine && !cell.isRevealed) {
                cell.isRevealed = true;
                updateCellVisual(i, j);
            }
        }
    }

    setTimeout(() => alert('Вы проиграли!'), 100);
}

function startNewGame() {
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