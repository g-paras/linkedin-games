import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

let project: FirebaseApp;
let authProvider: GoogleAuthProvider;

const getOrCreateProject = () => {
    if (!project) {
        project = initializeApp(
            JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)
        );
    }
    return project;
};

const getOrCreateAuthProvider = () => {
    if (!authProvider) {
        authProvider = new GoogleAuthProvider();
        authProvider.setCustomParameters({
            prompt: "select_account"
        })
    }
    return authProvider;
}

const signInWithGooglePopup = () => signInWithPopup(getAuth(), getOrCreateAuthProvider());

const getFirestoreDB = () => getFirestore(getOrCreateProject());

export { getFirestoreDB, getOrCreateAuthProvider, signInWithGooglePopup };
