importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js');

// Read config from URL query parameters passed during registration
const urlParams = new URLSearchParams(location.search);
const firebaseConfig = {
    apiKey: urlParams.get('apiKey'),
    authDomain: urlParams.get('authDomain'),
    projectId: urlParams.get('projectId'),
    storageBucket: urlParams.get('storageBucket'),
    messagingSenderId: urlParams.get('messagingSenderId'),
    appId: urlParams.get('appId')
};

// Initialize Firebase
if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        
        const notificationTitle = payload.notification?.title || 'New Message';
        const notificationOptions = {
            body: payload.notification?.body || 'You have a new notification.',
            icon: payload.notification?.icon || payload.data?.icon || '/logo.png',
            badge: payload.notification?.badge || payload.data?.badge || '/logo.png',
            image: payload.notification?.image || payload.data?.image || null,
            data: payload.data,
            tag: payload.data?.tag || 'default-tag', // Prevent multiple notifications overlapping
            renotify: true
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
}
