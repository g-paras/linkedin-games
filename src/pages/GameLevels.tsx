import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router';

import { getGameDetails, getGameLevels } from '@/firebase/utils';
import { GameInfo, GameLevel } from '@/types';
import NotFound from '@/pages/NotFound';

const GameLevels = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [gameDetails, setGameDetails] = useState<GameInfo>();
    const [gameLevels, setGameLevels] = useState<GameLevel[]>([]);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const gameDetails = await getGameDetails(gameId!);
            if (!gameDetails) {
                setNotFound(true);
                return;
            }
            setGameDetails(gameDetails);
            const levels: GameLevel[] = await getGameLevels<GameLevel>(gameId!);
            setGameLevels([...levels.sort((a, b) => a.gameNumber - b.gameNumber)]);
        }
        fetchData();
    }, [gameId]);

    return (
        <div>
            {
                notFound ? <NotFound /> : <div className="max-w-lg mx-auto pt-10 flex flex-col justify-center">
                    {gameDetails && <h1 className='text-xl font-bold text-center'>{gameDetails?.title} Levels </h1>}
                    <div className="mt-10 grid grid-cols-10 gap-2 p-4">
                        {
                            gameLevels.map((level, index) => (
                                level.isActive && <NavLink
                                    to={`/${gameId}/${level.documentId}`}
                                    key={`${gameId}-level-${index}`}
                                    className="w-10 h-10 flex justify-center items-center bg-blue-200 rounded" >
                                    {level.gameNumber}
                                </NavLink>
                            ))
                        }
                    </div>
                </div>
            }
        </div >
    )
};

export default GameLevels;