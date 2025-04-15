import admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.cert('./firebase-creds.json')
});

const updateDailyChallenge = async (gameId, dailyChallengeId, dailyChallengeTitle) => {
    const db = admin.firestore();
    const docRef = db.collection('games').doc(gameId);
    docRef.update({
        dailyChallenge: {
            documentId: dailyChallengeId,
            title: dailyChallengeTitle
        }
    })
}

const getOrCreateGameLevelConfig = async (collectionId, documentId, content, updateDC = true) => {
    const db = admin.firestore();
    const docRef = db.collection(collectionId).doc(documentId);
    await docRef.set({
        ...content,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    if (updateDC)
        await updateDailyChallenge(collectionId, documentId, content.gameNumber);
}

export { getOrCreateGameLevelConfig };
