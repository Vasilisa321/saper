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
    // Проходим по всем ячейкам поля
    for (let row = 0; row < BoardSize; row++) {
        for (let col = 0; col < BoardSize; col++) {
            // Если в ячейке мина — пропускаем (у неё не может быть цифры)
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