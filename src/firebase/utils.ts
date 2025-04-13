import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

import { getFirestoreDB } from "@/firebase/index";
import { GAME_COLLECTION_ID } from '@/constants';
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

export { getGameDetails, getGameLevelConfig, getAllGameDetails, getOrCreateGameLevelConfig, getGameLevels };
