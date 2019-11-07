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
    // const [mode, changeMode] = useState(0);
    const [gameStatus, changeGameStatus] = useState("Ходят");

    // при изменении значений поля накидываем проверки на выигрыш игрока или ничью
    useEffect(() => {
        let left = 0,
            right = size - 1;

        // Проверка на победу игрока
        if (field.filter(row => checkAllEqual(row)).length      // првоерка строк
            || checkVertical(field)                             // столбцов
            || checkAllEqual(field.map(row => row[left++]))     // диагонали \
            || checkAllEqual(field.map(row => row[right--]))) { // диагонали /

            changeGameStatus("Победили");
        } else if (checkDraw()) {
            changeGameStatus("Ничья");
        }

    }, [field]);

    function handleClick(row, index) {
        const cell = field[row][index];
        let newField = field.slice();

        if (gameStatus !== "Ходят") {
            return;
        }

        if (!cell) {
            changeTurn(turn => +!turn);
            newField[row][index] = turn ? 1 : 2;
            setField(newField);
        }

        // // Если бот включен - то делаем ход
        // if (mode) {
        //     changeTurn(turn => +!turn);
        //     let f = makeMove(field, turn);
        //     setField(f);
        // }
    }

    // function switchMode() {
    //     changeMode(mode => +!mode);
    // }

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
            {/*<div id="bot">*/}
            {/*    <input type="checkbox" id="switch" onChange={() => switchMode()}/>*/}
            {/*    <label htmlFor="switch">ChangeMode</label>*/}
            {/*    <h2>{mode ? "Выключить" : "Включить"} бота</h2>*/}
            {/*</div>*/}
            <div id="msg">
                <h1 id="turn"> {gameStatus}
                {gameStatus !== "Ничья" &&
                (gameStatus === "Ходят" ? (
                    turn ? " Крестики" : " Нолики"
                ) : (
                    !turn ? " Крестики" : " Нолики"
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
        if (checkAllEqual(array.map(row => row[index - 1]))) {
            return true;
        }
    }
    return false;
};

// const makeMove = (field, turn) => {
//     const center = Math.floor(size / 2.0);
//
//     if (!field[center][center]) {
//         field[center][center] = turn;
//     }s
//      ...
//
//     return field;
// };