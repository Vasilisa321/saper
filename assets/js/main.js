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

    //calculateNumber(); под вопросом.
}

function calculateNumber(){
    for (let i = 0; i < BoardSize; i++){
        for (let j = 0; j < BoardSize; j++){
            if (board[i][j].isMine) continue;

            let count = 0;

            for (let di = -1; di <= 1; di++){
                for (let dj = -1; dj <= 1; dj++){
                    const ni = i + di;
                    const nj = j + dj;
                    if (ni >= 0 && ni < BoardSize && nj >= 0 && nj < BoardSize && board[i][j].isMine){
                        count++;
                    }
                }
            }
            board[i][j].neighborMines= count;
        }
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

if (resetButton) {
    resetButton.addEventListener('click', startNewGame);
}

initBoard();
renderBoard();