import { collection, doc, getDoc, getDocs, setDoc, Timestamp, updateDoc, addDoc, query, where } from "firebase/firestore";

import { getFirestoreDB } from "@/firebase/index";
import { GAME_COLLECTION_ID, USER_COLLECTION_ID, LEADERBOARD_SUB_COLLECTION_ID } from '@/constants';
import { GameInfo } from "@/types";

const getAllGameDetails = async () => {
    const db = getFirestoreDB();
    const snapshot = await getDocs(collection(db, GAME_COLLECTION_ID));
    return snapshot.docs.map(doc => doc.data() as GameInfo);
}

const getGameDetails = async (documentId: string): Promise<GameInfo | undefined> => {
    const firestore = getFirestoreDB();
    const docRef = doc(firestore, GAME_COLLECTION_ID, documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return data as GameInfo;
    }
}

const getGameLevels = async <T>(collectionId: string): Promise<T[]> => {
    const db = getFirestoreDB();
    const snapshot = await getDocs(collection(db, collectionId));
    return snapshot.docs.map(doc => {
        return {
            ...doc.data(),
            documentId: doc.id,
        } as T;
    });
}

const getGameLevelConfig = async <T>(collectionId: string, documentId: string): Promise<T | undefined> => {
    const firestore = getFirestoreDB();
    const docRef = doc(firestore, collectionId, documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        const gameConfig = data as T;
        return gameConfig;
    }
}

const getOrCreateGameLevelConfig = async (collectionId: string, documentId: string, content: object) => {
    const firestore = getFirestoreDB();
    const docRef = doc(firestore, collectionId, documentId);
    await setDoc(docRef, content);
}

const getOrCreateUser = async (userData: Record<string, any>) => {
    const firestore = getFirestoreDB();
    const usersRef = collection(firestore, USER_COLLECTION_ID);
    const q = query(usersRef, where('email', '==', userData.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    const newDocRef = await addDoc(usersRef, {...userData, createdAt: Timestamp.now()});
    return { id: newDocRef.id, ...userData };
}

const addUserScore = async (gameCollection: string, gameDocId: string, userDocId: string, score: number, userDetails: any) => {
    const firestore = getFirestoreDB();
    const docRef = doc(firestore, gameCollection, gameDocId, LEADERBOARD_SUB_COLLECTION_ID, userDocId);
    const docSnap = await getDoc(docRef);
    const curAttempt = {
        score: score,
        completedAt: Timestamp.now(),
    };
    if (docSnap.exists()) {
        const allAttempts = [...docSnap.data().allAttempts, curAttempt];
        const bestAttempt = docSnap.data().bestAttempt.score <= score ? docSnap.data().bestAttemp : curAttempt;
        await updateDoc(docRef, {
            allAttempts: allAttempts,
            bestAttempt: bestAttempt,
            updatedAt: Timestamp.now(),
        });
    } else {
        await setDoc(docRef, {
            gameCollection: gameCollection,
            userId: userDocId,
            gameId: gameDocId,
            userDetails: userDetails,
            allAttempts: [curAttempt],
            bestAttempt: curAttempt,
            firstAttempt: curAttempt,
        });
    }
}

const getLeaderboard = async (gameCollection: string, gameDocId: string) => {
    const db = getFirestoreDB();
    const snapshot = await getDocs(collection(db, gameCollection, gameDocId, LEADERBOARD_SUB_COLLECTION_ID));
    return snapshot.docs.map(doc => doc.data() as any);
}

export { getGameDetails, getGameLevelConfig, getAllGameDetails, getOrCreateGameLevelConfig, getGameLevels, addUserScore, getOrCreateUser, getLeaderboard };
