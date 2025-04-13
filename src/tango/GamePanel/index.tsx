import { useEffect, useState, useRef } from "react";
import debounce from "lodash.debounce";
import { useParams } from 'react-router';

import { CELL_TYPE } from "@/constants";
import NotFound from "@/pages/NotFound";
import { UNDO_STACK_SIZE } from "@/tango/GamePanel/constants";
import GridCell from "@/tango/GamePanel/GameCell";
import { getGameLevelConfig } from "@/firebase/utils";
import { computeIsCellValid, prepareTime } from "@/tango/GamePanel/utils";
import { GameLevelConfig, UserGameState, UserMoves } from "@/tango/GamePanel/types";


const prepareInitialGameState = (gameConfig: GameLevelConfig): UserGameState => {
    const userGameState: UserGameState = {
        nRows: gameConfig.nRows,
        nCols: gameConfig.nCols,
        grid: {},
    };
    for (let i = 0; i < gameConfig.nCols * gameConfig.nRows; i++) {
        const cellConfig = gameConfig.grid[i];
        userGameState.grid[i] = {
            type: cellConfig.type,
            canChange: cellConfig.type === CELL_TYPE.EMPTY,
            isValid: true,
            rightRelation: cellConfig.rightRelation,
            bottomRelation: cellConfig.bottomRelation,
        };
    }
    return userGameState;
}

async function prepareGameConfig(document_id: string) {
    const initialGameState = await getGameLevelConfig<GameLevelConfig>("linkedin-tango", document_id);
    if (!initialGameState) {
        console.error("No game config found");
        return;
    }
    return prepareInitialGameState(initialGameState)
}

const GamePanel = () => {
    const { gameLevelId } = useParams<{ gameLevelId: string }>();

    const [time, setTime] = useState(0);
    const [loading, setLoading] = useState(true);
    // TODO: decouple game state & cell config
    const [gameState, setGameState] = useState<UserGameState>();
    const [isGameComplete, setIsGameComplete] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const gameMoveStack = useRef<UserMoves[]>([]);

    // fetch game level
    useEffect(() => {
        const getInitialGameState = async () => {
            const initialGameState = await prepareGameConfig(gameLevelId!);
            if (!initialGameState) {
                setNotFound(true);
                setLoading(false);
                return;
            }
            setLoading(false);
            setGameState(await prepareGameConfig(gameLevelId!));
        }
        getInitialGameState();
    }, [gameLevelId]);

    // timer
    useEffect(() => {
        if (isGameComplete || notFound || loading) {
            return;
        }
        const interval = setInterval(() => {
            setTime((prevTime) => prevTime + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, [isGameComplete, notFound, loading]);

    const updateIsValid = () => {
        const config = { ...gameState } as UserGameState;
        let emptyCellCount = 0;
        let invalidCellCount = 0;

        for (let i = 0; i < config.nRows; i++) {
            for (let j = 0; j < config.nCols; j++) {
                let index = i * config.nCols + j;
                config.grid[index]['isValid'] = computeIsCellValid(config, index);
                if (config.grid[index]['type'] === CELL_TYPE.EMPTY) {
                    emptyCellCount++;
                }
                if (!config.grid[index]['isValid']) {
                    invalidCellCount++;
                }
            }
        }

        if (emptyCellCount === 0 && invalidCellCount === 0) {
            setIsGameComplete(true);
        }

        setGameState({ ...config });
    }
    const handleGameClick = (index: number, cellValue?: number, pushToStack: boolean = true) => {
        const config = { ...gameState } as UserGameState;
        const curCellState = config.grid[index];
        var newCellValue;
        if (!curCellState['canChange'] || isGameComplete) {
            return;
        }
        if (curCellState['type'] === CELL_TYPE.EMPTY) {
            newCellValue = CELL_TYPE.TYPE_A;
        } else if (curCellState['type'] === CELL_TYPE.TYPE_A) {
            newCellValue = CELL_TYPE.TYPE_B;
        } else {
            newCellValue = CELL_TYPE.EMPTY;
        }

        if (pushToStack) {
            gameMoveStack.current.push({
                index: index,
                prevType: curCellState['type'],
                newType: newCellValue,
            });
        }
        if (gameMoveStack.current.length > UNDO_STACK_SIZE) {
            gameMoveStack.current.shift();
        }
        curCellState['type'] = cellValue === undefined ? newCellValue : cellValue;
        setGameState({ ...config });
        debounce(updateIsValid, 500)();
    }

    const handleUndo = () => {
        if (gameMoveStack.current.length === 0) {
            return;
        }
        const lastMove = gameMoveStack.current.pop();
        if (!lastMove) {
            return;
        }
        handleGameClick(lastMove.index, lastMove?.prevType, false);
    }

    const handleClear = async () => {
        setGameState(await prepareGameConfig(gameLevelId!));
        gameMoveStack.current = [];
        if (isGameComplete) {
            setTime(0);
            setIsGameComplete(false);
        }
    }

    return (
        <>
            {
                notFound
                    ? <NotFound />
                    : loading
                        ? <div className="text-center w-full">Loading...</div>
                        : <div className="w-9/10 max-w-lg mx-auto pt-10">
                            <div className="flex justify-between mb-2">
                                <div className="bg-indigo-600 py-2 rounded-full text-white font-bold min-w-15 text-center px-5">
                                    {prepareTime(time)}
                                </div>
                                <button
                                    className="px-5 py-2 font-bold bg-indigo-600 rounded-full text-white cursor-pointer"
                                    onClick={handleClear}
                                >Clear</button>
                            </div>
                            <div className="relative">
                                {
                                    isGameComplete && (
                                        <div className="absolute inset-0 flex items-center justify-center z-11 bg-black/10">
                                            <div className="bg-white p-5 rounded-lg shadow-lg">
                                                <h2 className="text-xl font-bold mb-4">Congratulations!</h2>
                                                <p>You completed the game in {prepareTime(time)}.</p>
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    gameState && (
                                        <div className="grid grid-cols-6 gap-0 border">
                                            {Array.from({ length: 6 * 6 }).map((_, index) => (
                                                <GridCell
                                                    key={'cell-' + index}
                                                    val={gameState.grid[index]['type']}
                                                    onClick={() => handleGameClick(index)}
                                                    canChange={gameState.grid[index]['canChange']}
                                                    isValid={gameState.grid[index]['isValid']}
                                                    rightRelation={gameState.grid[index]['rightRelation']}
                                                    bottomRelation={gameState.grid[index]['bottomRelation']}
                                                />
                                            ))}
                                        </div>
                                    )
                                }
                            </div>
                            <div className="flex justify-between mt-2">
                                <button
                                    className="px-5 py-2 font-bold bg-indigo-600 rounded-full text-white cursor-pointer"
                                    onClick={handleUndo}
                                >
                                    Undo
                                </button>
                            </div>
                        </div>
            }</>
    )
}

export default GamePanel;
