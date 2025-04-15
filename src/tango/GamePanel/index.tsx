import { useEffect, useState, useRef, useContext } from "react";
import debounce from "lodash.debounce";
import { useParams } from 'react-router';
import Confetti from 'react-confetti'

import { CELL_TYPE } from "@/constants";
import NotFound from "@/pages/NotFound";
import { UNDO_STACK_SIZE } from "@/tango/GamePanel/constants";
import GridCell from "@/tango/GamePanel/GameCell";
import { addUserScore, getGameLevelConfig, getLeaderboard } from "@/firebase/utils";
import { computeIsCellValid, prepareTime } from "@/tango/GamePanel/utils";
import { GameLevelConfig, UserGameState, UserMoves } from "@/tango/GamePanel/types";
import { AuthContext } from "@/contexts/AuthContext";


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
    const { isLoggedIn, userDetails } = useContext(AuthContext);

    const [time, setTime] = useState(0);
    const [loading, setLoading] = useState(true);
    // TODO: decouple game state & cell config
    const [gameState, setGameState] = useState<UserGameState>();
    const [isGameComplete, setIsGameComplete] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const gameMoveStack = useRef<UserMoves[]>([]);
    const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (isLeaderboardOpen) {
                const data = await getLeaderboard('linkedin-tango', gameLevelId!);
                setLeaderboard(data);
            }
        }
        fetchData();
    }, [isLeaderboardOpen])

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

    const updateIsValid = async () => {
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
            if (isLoggedIn && userDetails?.uid) {
                await addUserScore('linkedin-tango', gameLevelId!, userDetails?.uid!, time, userDetails);
            }
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
                        ? <></>
                        : <div>
                            <div className="w-9/10 max-w-sm mx-auto pt-10">
                                <div className="flex justify-between mb-2">
                                    {isGameComplete && <Confetti gravity={.5} />}
                                    <div className="bg-indigo-600/80 px-3 py-1 rounded-full text-white min-w-15 text-center">
                                        {prepareTime(time)}
                                    </div>
                                    <button
                                        className="px-3 py-1 bg-indigo-600/80 rounded-full text-white cursor-pointer"
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
                                            <div className="grid grid-cols-6 gap-0 border border-black/20">
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
                                        className="px-3 py-1 bg-indigo-600/80 rounded-full text-white cursor-pointer hover:bg-indigo-500"
                                        onClick={handleUndo}
                                    >
                                        Undo
                                    </button>
                                </div>
                                <div className="mt-2">
                                    <button className="w-full px-3 py-1 rounded-full border border-indigo-600 text-indigo-600 cursor-pointer" onClick={() => setLeaderboardOpen(true)}>Leaderboard</button>
                                </div>
                            </div>

                            {/* Leaderboard  */}
                            {isLeaderboardOpen && (
                                <div
                                    className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${isLeaderboardOpen ? "bg-black/20" : "bg-black/0 pointer-events-none"
                                        }`}
                                    onClick={() => { setLeaderboardOpen(false) }}
                                />
                            )}

                            {/* Sidebar */}
                            <div
                                className={`fixed top-0 right-0 h-full w-108 max-w-9/10 bg-white shadow-lg z-50 transform transition-transform duration-300 ${isLeaderboardOpen ? "translate-x-0" : "translate-x-full"
                                    }`}
                            >
                                <div className="flex justify-between items-center p-4 py-6">
                                    <h2 className="text-lg font-semibold text-center w-full">Leaderboard</h2>
                                    <button onClick={() => { setLeaderboardOpen(false) }}>
                                        {/* <X className="w-5 h-5" /> */}
                                        x
                                    </button>
                                </div>
                                <div className="p-4">
                                    {
                                        leaderboard.sort((a, b)=>a.bestAttempt.score-b.bestAttempt.score).map((row, index) => (
                                            <div key={`tango-leaderboard-${index}`} className="w-full rounded-xl border shadow-md p-3 flex items-center gap-4 transition hover:shadow-lg mb-3">
                                                {/* Avatar */}
                                                <img
                                                    src={row.userDetails.avatar}
                                                    alt={row.userDetails.displayName}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                                                />

                                                {/* Info */}
                                                <div className="flex-1">
                                                    <h3 className="text-md font-semibold text-gray-800">{row.userDetails.displayName}</h3>
                                                    <div className="flex flex-row justify-between">
                                                        <div className="text-sm text-gray-600">Rank: <span className="font-medium text-green-600">#{index + 1}</span></div>
                                                        <div className="text-sm text-gray-600">Score: <span className="font-medium text-blue-600">{prepareTime(row.bestAttempt.score)}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                // </div >
            }</>
    )
}

export default GamePanel;
