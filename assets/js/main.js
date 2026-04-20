const boardsize = 10;
const cols = 10;
const mines=15;

let boardData = [];
let currentMinesCount = mines;
let flagsCount = 0;
let gameActive = true;

const boardContainer = document.getElementById('board');
const mineCountSpan =document.getElementById('mineCount');
const flagsCountSpan = document.getElementById('flagsCount');
const statusDiv = document.getElementById('status');
const restart = document.getElementById('restart');

function initBoard() {
    board = Array(boardsize).fill().map(() => Array(boardsize).fill().map(()=> {

    }));
}