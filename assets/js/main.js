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

function generateEmptyField() {
    const field = [];

    for (let i = 0; i < BoardSize; i++) {
        for(let j = 0; j < BoardSize; j++) {
            field[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighbourMines: 0,
                element: null
            };
        }
    }

    return field;
}

function placeMinesOnField(field, excludeRow, excludeCol) {
    let minesPlaced = 0;

    while (minesPlaced < Mines) {
        const randomRow = Math.floor(Math.random() * BoardSize);
        const randomCol = Math.floor(Math.random() * BoardSize);
        const isAlreadyMine = field[randomRow][randomCol].isMine;
        const isExcludedCell = (randomRow === excludeRow && randomCol === excludeCol);

        if (!isAlreadyMine && !isExcludedCell) {
            field[randomRow][randomCol].isMine = true;
            minesPlaced++;
        }
    }
}

function calculateNumbersOnField(field) {
    for (let row = 0; row < BoardSize; row++) {
        for (let col = 0; col < BoardSize; col++) {
            if (field[row][col].isMine) continue;

            let minesAround = 0;


            for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
                for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
                    if (deltaRow === 0 && deltaCol === 0) continue;
                    const neighborRow = row + deltaRow;
                    const neighborCol = col + deltaCol;
                    const isWithinBounds = neighborRow >= 0 && neighborRow < BoardSize &&
                        neighborCol >= 0 && neighborCol < BoardSize;

                    if (isWithinBounds && field[neighborRow][neighborCol].isMine) {
                        minesAround++;
                    }
                }
            }

            field[row][col].neighborMines = minesAround;
        }
    }
}

function generateCompleteField(excludeRow, excludeCol) {
    const newField = generateEmptyField();
    placeMinesOnField(newField, excludeRow, excludeCol);
    calculateNumbersOnField(newField);
    return newField;
}

function updateMineCounter() {
    if (!mineCounter) return;

    let flaggedCount = 0;
    for (let row of board) {
        for (let cell of row) {
            if (cell.isFlagged) flaggedCount++;
        }
    }

    const remainingMines = Mines - flaggedCount;
    mineCounter.textContent = remainingMines;
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
    stopTimer();
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

function initBoard() {
    board = generateEmptyField();
    cellsRevealed = 0;
    gameActive = true;
    firstMove = true;
    resetTimer();
    updateMineCounter();

    if (gameStatus) {
        gameStatus.textContent = 'Игра Сапёр. ЛКМ — открыть, ПКМ — флажок.';
    }
}

function renderBoard() {
    if (!gameBoard) return;

    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${BoardSize}, 40px)`;
    gameBoard.style.gridTemplateRows = `repeat(${BoardSize}, 40px)`;

    for (let row = 0; row < BoardSize; row++) {
        for (let col = 0; col < BoardSize; col++) {
            const cell = board[row][col];
            const cellDiv = document.createElement('div');

            cellDiv.className = 'cell';
            cellDiv.dataset.row = row;
            cellDiv.dataset.col = col;

            cell.element = cellDiv;
            cellDiv.addEventListener('click', (function(r, c) {
                return function() {
                    handleCellClick(r, c, { type: 'click' });
                };
            })(row, col));
            cellDiv.addEventListener('contextmenu', (function(r, c) {
                return function(e) {
                    e.preventDefault();
                    handleCellClick(r, c, e);
                };
            })(row, col));

            gameBoard.appendChild(cellDiv);
            updateCellVisual(row, col);
        }
    }
}


function updateCellVisual(row, col) {
    const cell = board[row][col];
    const element = cell.element;

    if (!element) return;

    element.classList.remove('revealed', 'flagged', 'mine-revealed');
    element.removeAttribute('data-value');

    if (cell.isRevealed) {
        element.classList.add('revealed');

        if (cell.isMine) {
            element.classList.add('mine-revealed');
            element.textContent = '💣';
        } else if (cell.neighborMines > 0) {
            element.textContent = cell.neighborMines;
            element.setAttribute('data-value', cell.neighborMines);
        } else {
            element.textContent = '';
        }
    } else if (cell.isFlagged) {
        element.classList.add('flagged');
        element.textContent = '🚩';
    } else {
        element.textContent = '';
    }
}

function revealEmptyCells(startRow, startCol) {
    const queue = [{row: startRow, col: startCol}];
    const processed = new Set();

    while (queue.length > 0) {
        const {row: r, col: c} = queue.shift();
        const key = `${r},${c}`;

        if (processed.has(key)) continue;
        processed.add(key);

        if (r < 0 || r >= BoardSize || c < 0 || c >= BoardSize) continue;

        const cell = board[r][c];

        if (cell.isMine || cell.isFlagged || cell.isRevealed) continue;

        cell.isRevealed = true;
        cellsRevealed++;
        updateCellVisual(r, c);

        if (cell.neighborMines === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    queue.push({row: r + dr, col: c + dc});
                }
            }
        }
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

    updateMineCounter();

    if (gameStatus) {
        gameStatus.textContent = 'ПОБЕДА! 🎉';
    }

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

    if (gameStatus) {
        gameStatus.textContent = 'ПОРАЖЕНИЕ! 💥';
    }

    setTimeout(() => alert('Вы проиграли!'), 100);
}

function handleCellClick(row, col, event) {
    if (!gameActive) return;

    const cell = board[row][col];

    if (event.type === 'click') {
        if (cell.isRevealed || cell.isFlagged) return;

        if (firstMove) {
            startTimer();
            board = generateCompleteField(row, col);

            for (let i = 0; i < BoardSize; i++) {
                for (let j = 0; j < BoardSize; j++) {
                    const oldCell = board[i][j];
                    const existingElement = document.querySelector(`.cell[data-row='${i}'][data-col='${j}']`);
                    if (existingElement) {
                        oldCell.element = existingElement;
                    }
                }
            }

            firstMove = false;

            const updatedCell = board[row][col];

            if (updatedCell.isMine) {
                gameLose();
                return;
            }

            if (updatedCell.neighborMines === 0) {
                revealEmptyCells(row, col);
            } else {
                updatedCell.isRevealed = true;
                cellsRevealed++;
                updateCellVisual(row, col);
            }

            checkWin();
            return;
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
    }

    else if (event.type === 'contextmenu') {
        event.preventDefault();

        if (cell.isRevealed) return;

        cell.isFlagged = !cell.isFlagged;
        updateCellVisual(row, col);
        updateMineCounter();
    }
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
