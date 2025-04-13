import { UserGameState } from "./types";
import { CELL_RELATION, CELL_TYPE } from "./constants";

const validateRowCount = (config: UserGameState, index: number) => {
    let rowCount = 0;
    const row = Math.floor(index / 6);
    const grid = config.grid;

    for (let i = 0; i < config.nCols; i++) {
        const cell = grid[row * config.nRows + i];
        if (cell.type === grid[index].type) {
            rowCount++;
        }
    }

    return rowCount <= 3;
}

const validateColumnCount = (config: UserGameState, index: number) => {
    let columnCount = 0;
    const grid = config.grid;
    const column = index % 6;

    for (let i = 0; i < config.nRows; i++) {
        const cell = grid[i * config.nCols + column];
        if (cell.type === grid[index].type) {
            columnCount++;
        }
    }

    return columnCount <= 3;
}

const allEqual = (arr: number[]) => arr.every((val) => val === arr[0]);

const validateNeighborRowCells = (config: UserGameState, index: number) => {
    const row = Math.floor(index / 6);
    const column = index % 6;
    const grid = config.grid;
    const cellType = grid[index].type;
    let isCellValid = true;

    if (row >= 2) {
        isCellValid = !allEqual([grid[(row - 2) * 6 + column].type, grid[(row - 1) * 6 + column].type, cellType]);
    }

    if (isCellValid && row >= 1 && row <= 4) {
        isCellValid = !allEqual([grid[(row - 1) * 6 + column].type, cellType, grid[(row + 1) * 6 + column].type]);
    }

    if (isCellValid && row <= 3) {
        isCellValid = !allEqual([cellType, grid[(row + 1) * 6 + column].type, grid[(row + 2) * 6 + column].type]);
    }

    return isCellValid;
}

const validateNeighborColumnCells = (config: UserGameState, index: number) => {
    const row = Math.floor(index / config.nRows);
    const column = index % config.nCols;
    const grid = config.grid;
    const cellType = grid[index].type;
    let isCellValid = true;

    if (column >= 2) {
        isCellValid = !allEqual([grid[row * 6 + column - 2].type, grid[row * 6 + column - 1].type, cellType]);
    }

    if (isCellValid && column >= 1 && column <= 4) {
        isCellValid = !allEqual([grid[row * 6 + column - 1].type, cellType, grid[row * 6 + column + 1].type]);
    }

    if (isCellValid && column <= 3) {
        isCellValid = !allEqual([cellType, grid[row * 6 + column + 1].type, grid[row * 6 + column + 2].type]);
    }

    return isCellValid;
}

const validateRelation = (firstCellType: number, secondCellType: number, relation: number) => {
    if (firstCellType === CELL_TYPE.EMPTY || secondCellType === CELL_TYPE.EMPTY) {
        return true;
    } else if (relation === CELL_RELATION.EQUAL) {
        return firstCellType === secondCellType;
    } else if (relation === CELL_RELATION.NOT_EQUAL) {
        return firstCellType !== secondCellType;
    }
    return true;
}

const validateRelations = (config: UserGameState, index: number) => {
    const row = Math.floor(index / 6);
    const column = index % 6;
    const grid = config.grid;
    const cellType = grid[index].type;
    let isCellValid = true;

    if (column < 5) {
        const rightCellType = grid[row * 6 + column + 1].type;
        isCellValid = isCellValid && validateRelation(cellType, rightCellType, grid[index].rightRelation);
    }

    if (row < 5) {
        const bottomCellType = grid[(row + 1) * 6 + column].type;
        isCellValid = isCellValid && validateRelation(cellType, bottomCellType, grid[index].bottomRelation);
    }

    if (row > 0) {
        const topCellType = grid[(row - 1) * 6 + column].type;
        isCellValid = isCellValid && validateRelation(cellType, topCellType, grid[(row - 1) * 6 + column].bottomRelation);
    }

    if (column > 0) {
        const leftCellType = grid[row * 6 + column - 1].type;
        isCellValid = isCellValid && validateRelation(cellType, leftCellType, grid[row * 6 + column - 1].rightRelation);
    }

    return isCellValid;
}

const validateCellFunctions = [
    validateRowCount,
    validateColumnCount,
    validateNeighborColumnCells,
    validateNeighborRowCells,
    validateRelations,
];

const computeIsCellValid = (config: UserGameState, index: number) => {
    let isCellValid = true;

    if (config.grid[index].type === CELL_TYPE.EMPTY) {
        return true;
    }

    for (let i = 0; i < validateCellFunctions.length; i++) {
        const validateCellFunction = validateCellFunctions[i];
        isCellValid = isCellValid && validateCellFunction(config, index);
    }

    return isCellValid;
}

const prepareTime = (time: number) => {
    return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`
}

export { computeIsCellValid, prepareTime };