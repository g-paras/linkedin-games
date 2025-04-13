import { NavLink } from 'react-router';
import { useState, useEffect } from 'react';

import { getAllGameDetails } from '@/firebase/utils';
import { GameInfo } from '@/types';

const Home = () => {
    const [gameDetails, setGameDetails] = useState<GameInfo[]>([]);

    useEffect(() => {
        const fetchGameDetails = async () => {
            setGameDetails(await getAllGameDetails());
        }
        fetchGameDetails();
    }, []);


    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            {
                gameDetails.map((game, index) => (
                    <div key={`gameCard-${index}`} className="flex bg-white rounded-2xl shadow-lg overflow-hidden max-w-3xl w-full">

                        <div className="w-48 h-48 flex-shrink-0">
                            <img className="w-full h-full object-cover" src={game.imgSrc} alt="Game Image" />
                        </div>

                        <div className="p-6 flex flex-col justify-between flex-grow">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{game.title}</h2>
                                <p className="text-gray-600 text-sm mb-4">
                                    {game.description}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <NavLink to={`/${game.collectionId}/${game.dailyChallenge.documentId}`} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg w-full sm:w-auto">
                                    Today's Challenge
                                </NavLink>
                                <NavLink to={`/${game.collectionId}`} className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 px-4 rounded-lg w-full sm:w-auto">
                                    All Levels
                                </NavLink>
                            </div>
                        </div>

                    </div>
                ))
            }
        </div>
    );
}
export default Home;