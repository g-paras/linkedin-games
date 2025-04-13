type GameCellConfig = {
    type: number,
    rightRelation: number,
    bottomRelation: number,
};

type GameLevelConfig = {
    title: string,
    description: string,
    grid: Record<number, GameCellConfig>,
    nRows: number,
    nCols: number,
};


type UserGameCellState = {
    type: number,
    canChange: boolean,
    isValid: boolean,
    rightRelation: number,
    bottomRelation: number,
}

type UserMoves = {
    index: number,
    prevType: number,
    newType: number,
}

type UserGameState = {
    nRows: number,
    nCols: number,
    grid: Record<number, UserGameCellState>,
};

export type { GameLevelConfig, UserGameState, GameCellConfig, UserGameCellState, UserMoves };
