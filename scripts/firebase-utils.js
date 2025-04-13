import admin from 'firebase-admin';

// TODO: read from env
admin.initializeApp({
    credential: admin.credential.cert(import.meta.env.VITE_FIREBASE_SERVICE_ACCOUNT_CREDS)
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

const getOrCreateGameLevelConfig = async (collectionId, documentId, content) => {
    const db = admin.firestore();
    const docRef = db.collection(collectionId).doc(documentId);
    await docRef.set({
        ...content,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await updateDailyChallenge(collectionId, documentId, content.gameNumber);
}

export { getOrCreateGameLevelConfig };
