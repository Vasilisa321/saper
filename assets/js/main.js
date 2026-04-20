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