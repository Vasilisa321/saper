const BoardSize = 10;
const Mines = 15;

let board = [];
let firstMove = true;
let gameActive = true;
let cellsRevealed = 0;

const gameBoard = document.getElementById('board');
const resetButton = document.getElementById('restartButton');
const startButton = document.getElementById('startButton');
const gameStatus = document.getElementById('statusMessage');

function initBoard() {
    board = Array(BoardSize).fill().map(() => Array(BoardSize).fill().map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
    })));
    cellsRevealed = 0;
    gameActive = true;
    firstMove = true;
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

function handleCellClick(row, col, event){
    if (!gameActive) return;

    const cell = board[row][col];

    if (event.type === 'click') {
        if (cell.isRevealed || cell.isFlagged) return;

        if (firstMove) {
            placeMines(row, col);
            calculateNumbers();
            firstMove = false;
        }

        if (cell.isMine){
            gameLose();
            return;
        }

        if (cell.neighborMines === 0){
            revealEmptyCells(row, col);
        } else {
            cell.isRevealed = true;
            cellsRevealed++;
            updateCellVisual(row, col);
        }

        checkWin();
    }

    else if (event.type === 'contextMenu') {
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

    for (let i = 0; i < BoardSize; i++) {
        for (let j = 0; j < BoardSize; j++) {
            const cell = board[i][j];
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';

            cell.element = cellDiv;

            cellDiv.addElementListener('click',);
        }
    }
}

function updateCellVisual(row, col) {
    const cell = board[row][col];
    const cellDiv = cell.element;

    if (!cellDiv) return;

    cellDiv.classList.add('revealed');
    cellDiv.classList.remove('flagged');

    if (cell.isMine){
        cellDiv.classList.add('Mine-revealed');
        cellDiv.textContent ='';
    } else if (cell.neighborMines > 0) {
        cellDiv.textContent = cell.neighborMines;
        cellDiv.setAttribute('data-value', cell.neighborMines);
    } else {
        cellDiv.textContent = '';
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
            if (cell.isMine && !cell.isRevealed){
                cell.isFlagged = true;
                updateCellVisual(i,j);
            }
        }
    }

    setTimeout(() => alert('Победа.'))
}

function gameLose() {
    gamActive = false;

    for(let i = 0; i < BoardSize; i++){
        for (let j = 0; j < BoardSize; j++) {
            const cell = board[i][j];
            if (cell.isMine && !cell.isRevealed){
                cell.isRevealed = true;
                updateCellVisual++;
            }
        }
    }

    setTimeout(() => alert('Вы проиграли.'))
}

function startNewGame() {
    initBoard();
    renderBoard();
}

if (startButton) {
    startButton.addEventListener('click', startNewGame);
}


initBoard();
renderBoard();