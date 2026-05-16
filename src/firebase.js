import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let messaging;

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "") {
        app = initializeApp(firebaseConfig);
        messaging = getMessaging(app);
    } else {
        console.warn("Firebase config is missing API key. Notifications will not work.");
    }
} catch (error) {
    console.error("Firebase initialization error", error);
}

export const requestForToken = async () => {
    try {
        if (!messaging) return null;
        
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const swUrl = `/firebase-messaging-sw.js?` + new URLSearchParams(firebaseConfig).toString();
            const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' });
            
            // Wait for the service worker to be fully ready and active
            await navigator.serviceWorker.ready;

            const currentToken = await getToken(messaging, { 
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration
            });
            
            if (currentToken) {
                return currentToken;
            } else {
                console.log('No registration token available. Request permission to generate one.');
                return null;
            }
        } else {
            console.log('Permission not granted for Notification');
            return null;
        }
    } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
        return null;
    }
};

export const onMessageListener = (callback) => {
    if (messaging) {
        onMessage(messaging, (payload) => {
            callback(payload);
        });
    }
};

export { messaging };
