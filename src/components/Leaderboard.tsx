const Leaderboard = ({ entries }: { entries: Record<string, any>[] }) => {

    return (
        <div className="p-4 max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🏆 Leaderboard</h2>
                <div className="flex gap-2">
                    {/* <Button
            variant={sortStrategy === 'best' ? 'default' : 'outline'}
            onClick={() => setSortStrategy('best')}
          >
            Best Attempt
          </Button>
          <Button
            variant={sortStrategy === 'first' ? 'default' : 'outline'}
            onClick={() => setSortStrategy('first')}
          >
            First Attempt
          </Button> */}
                </div>
            </div>

            <ul className="space-y-2">
                {entries.map((entry, index) => (
                    <li
                        key={entry.id}
                        className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                    >
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            <img
                                src={entry.avatarUrl}
                                alt={entry.displayName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{entry.displayName}</p>
                            <p className="text-sm text-gray-500">
                                {entry.bestAttempt.score}
                            </p>
                        </div>
                        <div className="text-gray-400 font-bold">#{index + 1}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;
