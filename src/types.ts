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

type UserAuth = {
  isLoggedIn: boolean,
  userDetails?: {
    displayName: string,
    avatar?: string,
    uid: string
  }
}

export type { GameInfo, GameLevel, UserAuth };
