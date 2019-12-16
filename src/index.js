import React, {useEffect, useState} from 'react';
import { render } from 'react-dom';
import "./styles.css";

// Размер поля
const size = 3;
// Двумерный массив (квадрат), заданного размера, заполненный нулями
const initialField = (new Array(size)).fill(
    (new Array(size)).fill(0)
);

/**
 * turn: 0 - нолик, 1 - крестик
 * cell: 0 - пусто, 1 - нолик, 2 - крестик
 * mode: 0 - игрок с игроком, 1 - игрок с ботом
 * @returns {*}
 * @constructor
 */
const Field = () => {
    const [field, setField] = useState(initialField.map(row => row.slice()));
    const [turn, changeTurn] = useState(0);
    const [mode, changeMode] = useState(0);
    const [gameStatus, changeGameStatus] = useState("Ходят");

    // // при изменении значений поля накидываем проверки на выигрыш игрока или ничью
    // useEffect(() => {
    //
    //
    //
    // }, [field]);

    function handleClick(row, index) {
        const cell = field[row][index];
        let nextTurn = turn;
        let newField = field.slice();

        // проверка на победу либо ничью
        const checkStatus = field => {
            if (checkWinner(field)) {
                changeGameStatus("Победили");
            } else if (checkDraw()) {
                changeGameStatus("Ничья");
            }
        };

        if (gameStatus !== "Ходят") {
            return;
        }

        if (!cell) {
            nextTurn  = +!turn;
            newField[row][index] = nextTurn ? 1 : 2;

            checkStatus(newField);

            // Если бот включен - то делаем ход
            if (mode) {
                nextTurn = turn;
                newField = makeMove(newField, nextTurn ? 1 : 2);
                // console.log(newField);

                checkStatus(newField);
            }

            changeTurn(nextTurn);
            setField(newField);
        }
    }

    function switchMode() {
        changeMode(mode => +!mode);
    }

    // проверка на ничью
    function checkDraw() {
        return !field.flat().filter(cell => !cell).length;
    }

    // продолжаем играть
    function moveOn() {
        setField(initialField.map(row => row.slice()));
        changeGameStatus("Ходят");
    }

    return (
        <div id="main">
            <div id="bot">
                <input type="checkbox" id="switch" onChange={() => switchMode()}/>
                <label htmlFor="switch">ChangeMode</label>
                <h2>{mode ? "Выключить" : "Включить"} бота</h2>
            </div>
            <div id="msg">
                <h1 id="turn"> {gameStatus}
                {gameStatus !== "Ничья" &&
                (gameStatus === "Ходят" ? (
                    !turn ? " Крестики" : " Нолики"
                ) : (
                    turn ? " Крестики" : " Нолики"
                ))}
                </h1>
                {gameStatus !== "Ходят" && <button onClick={() => moveOn()}>Круто!</button>}
            </div>
            <div id="field">
                {
                    field.map((arr, index) => <Row key={index}
                                                   row={arr}
                                                   rowIndex={index}
                                                   handleClick={handleClick}/>)
                }
            </div>
        </div>
    )
};

const Row = ({ row, rowIndex, handleClick }) => {
    return (
        <div id="row">
            {
                row.map((cell, index) => <Cell key={index}
                                               value={cell}
                                               handleClick={() => handleClick(rowIndex, index)}/>)
            }
        </div>
    )
};

const Cell = ({ value, handleClick }) => {
    return (
        <div id='cell' onClick={handleClick}>
            {
                !!value && <img src={value === 1 ? "./img/tic.png" : "./img/tac.png"} alt="img"/>
            }
        </div>
    )
};

render(
    <Field/>,
    document.getElementById('root')
);

// проверка на то, что в массиве все значения равны и не равны 0
const checkAllEqual = array => array.every(val => val && val === array[0]);

// проверка столбца поля на выигрыш игрока
const checkVertical = array => {
    let index = size;
    while (index--) {
        if (checkAllEqual(array.map(row => row[index]))) {
            return true;
        }
    }
    return false;
};

const checkWinner = field => {
    let left = 0,
        right = size - 1;

     return field.filter(row => checkAllEqual(row)).length      // првоерка строк
            || checkVertical(field)                             // столбцов
            || checkAllEqual(field.map(row => row[left++]))     // диагонали \
            || checkAllEqual(field.map(row => row[right--]))    // диагонали /
};

// примтивный бот для игры 3х3 (пока адекватно себя ведет только на поле этих размеров)
const makeMove = (field, figure, turn) => {
    const center = Math.floor(size / 2.0);

    // проверка - может ли игрок выиграть следующим ходом?
    const future = (field, figure) => {
        const decision = {
            willWin: false,
            place: {
                row: 0,
                cell: 0
            }
        };
        let tempField = field.map(row => row.slice());

        for (let rowIndex = 0; rowIndex < size; rowIndex++) {
            for (let cellIndex = 0; cellIndex < size; cellIndex++) {
                if (!field[rowIndex][cellIndex]) {
                    tempField[rowIndex][cellIndex] = figure;
                    if (checkWinner(tempField)) {
                        decision.willWin = true;
                        decision.place.row = rowIndex;
                        decision.place.cell = cellIndex;
                        break;
                    } else {
                        tempField = field.map(row => row.slice());
                    }
                }
            }
            if (decision.willWin) break;
        }

        return decision;
    };


    if (!field[center][center]) {
        field[center][center] = figure;
    } else {
        // если у нас есть шанс победить - использовать шанс!
        const result = future(field, turn ? 1 : 2);
        if (result.willWin){
            field[result.place.row][result.place.cell] = figure;
        } else {
            // если игрок победит следующим ходом - не дать ему!
            const result = future(field, turn ? 2 : 1);
            if (result.willWin) {
                field[result.place.row][result.place.cell] = figure;
            } else {
                // // если свободен угол -
                // const cornerAvailable = field.filter((row, rowIndex) => {
                //     return (!row || row === 2) &&
                // });
                // field[0][0]
                // field[0][2]
                // field[2][0]
                // field[2][2]
                //
                // field[Math.round(Math.random()) ? 2 : 0][emptyCell] = figure;

                // хоть куда нибудь то мы сходим уже
                let emptyCell = 0;
                const emptyRow = field.findIndex(row => {
                    if (row.includes(0)) {
                        emptyCell = row.indexOf(0);
                        return true;
                    }
                    return false;
                });

                if (emptyRow !== -1) {
                    field[emptyRow][emptyCell] = figure;
                }
            }
        }
    }

    return field;
};