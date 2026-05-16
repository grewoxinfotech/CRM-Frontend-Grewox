import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '../firebase';
import { notification } from 'antd';
import { BASE_URL } from '../config/config';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../auth/services/authSlice';
import React from 'react';
import logoUrl from '../assets/logo/Group 48096906.png';

export const useFirebaseNotifications = () => {
    const token = useSelector(selectCurrentToken);

    useEffect(() => {
        const initFirebase = async () => {
            try {
                if (Notification.permission === 'denied') {
                    notification.warning({
                        message: 'Notifications Blocked',
                        description: 'Please enable notifications in your browser settings to receive real-time updates and alerts.',
                        placement: 'topRight',
                        duration: 10,
                    });
                    return;
                }

                // Request Notification Permission and get Token
                const fcmToken = await requestForToken();
                if (fcmToken && token) {
                    // Send this token to backend to save in the user's fcm_tokens array
                    await fetch(`${BASE_URL}/auth/fcm-token`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ fcm_token: fcmToken }),
                        credentials: 'include'
                    });
                }
            } catch (err) {
                console.error('Failed to initialize Firebase Notifications', err);
            }
        };

        if (token) {
            initFirebase();
        }
    }, [token]);

    useEffect(() => {
        // Listen for foreground messages
        onMessageListener((payload) => {
            console.log('Received foreground message: ', payload);
            
            // Play notification sound
            try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.error("Audio play failed:", e));
            } catch (err) {
                console.error("Error playing sound", err);
            }

            // Show ANTD notification in browser
            notification.info({
                message: payload.notification?.title || 'New Message',
                description: payload.notification?.body || payload.data?.message || '',
                placement: 'topRight',
                duration: 5,
                icon: React.createElement('img', { src: '/logo.png', alt: 'Logo', style: { width: 32, height: 32, borderRadius: '50%', objectFit: 'contain' } })
            });

            // Also trigger the OS-level native notification so it's impossible to miss
            if (Notification.permission === 'granted') {
                new Notification(payload.notification?.title || 'New Message', {
                    body: payload.notification?.body || payload.data?.message || '',
                    icon: '/logo.png',
                    badge: '/logo.png'
                });
            }
        });
    }, []);
};
