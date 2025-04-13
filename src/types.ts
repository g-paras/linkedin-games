type GameLevel = {
    documentId: string,
    gameNumber: number,
    isActive: boolean,
}

type GameInfo = {
    title: string,
    description: string,
    collectionId: string,
    imgSrc: string,
    dailyChallenge: GameLevel,
    // levels: GameLevel[],
}

export type { GameInfo, GameLevel };
