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