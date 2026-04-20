const BoardSize = 10;
const Mines=15;

let board = [];
let firstMove = 0;
let gameActive = true;
let cellsRevealed = 0;

const GameBoard = document.getElementById('GameBoard');
const mineCount =document.getElementById('mineCount');
const resetButton = document.getElementById('resetButton');
const GameStatus = document.getElementById('GameStatus');
const restart = document.getElementById('restart');

function initBoard() {
    board = Array(BoardSize).fill().map(() => Array(BoardSize).fill().map(()=> {
        isMine = true;
        isRevealed = true;
        isFlagged = true;
        neighborMines = 0;
        element: null
    }));
}

cellsRevealed = 0;
gameActive = true;
firstMove = true;
GameStatus.textContent = 'Игра началась';

updateMineCounter();
renderBoard();

function placeMines(row, col){
    let minesPlaced = 0;

    while (minesPlaced < Mines){
        const row = Math.floor(Math.random()*BoardSize);
        const col = Math.floor(Math.random()*BoardSize);
    }

    if(!board[row][col].isMine && !(row == firstRow && col == firstCol)){
        board[row][col] = true;
        minesPlaced++;
    }
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
        }
    }
}