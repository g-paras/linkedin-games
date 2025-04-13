import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

let project: FirebaseApp;

const getOrCreateProject = () => {
    if (!project) {
        project = initializeApp(
            JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)
        );
    }
    return project;
};

const getFirestoreDB = () => getFirestore(getOrCreateProject());

export { getFirestoreDB };
