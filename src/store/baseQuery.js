import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState, endpoint }) => {
        // For verification endpoints, use verification token from localStorage
        if (endpoint === 'verifySignup' || endpoint === 'resendSignupOtp') {
            const verificationToken = localStorage.getItem('verificationToken');
            if (verificationToken && verificationToken !== 'null' && verificationToken !== 'undefined') {
                headers.set('authorization', `Bearer ${verificationToken}`);
                return headers;
            }
        }
        
        // For reset password flow endpoints, use resetToken from localStorage
        if (endpoint === 'verifyOtp' || endpoint === 'resetPassword') {
            const resetToken = localStorage.getItem('resetToken');
            if (resetToken) {
                headers.set('authorization', resetToken); // resetToken already has 'Bearer ' prefix
                return headers;
            }
        }

        // For all other endpoints, use auth token from Redux state
        const token = getState()?.auth?.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    // Skip reauth for verification and reset password endpoints
    if (api.endpoint === 'verifySignup' || api.endpoint === 'resendSignupOtp' || 
        api.endpoint === 'verifyOtp' || api.endpoint === 'resetPassword') {
        return await baseQuery(args, api, extraOptions);
    }

    let result = await baseQuery(args, api, extraOptions);

    // Handle 401 errors and token refresh if needed
    if (result.error && result.error.status === 401) {
        // Try to refresh token
        const refreshResult = await baseQuery(
            { url: '/auth/refresh-token', method: 'POST' },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            // Store the new token
            api.dispatch({ type: 'auth/setToken', payload: refreshResult.data.token });

            // Retry the original request
            result = await baseQuery(args, api, extraOptions);
        } else {
            // If refresh fails, logout user
            api.dispatch({ type: 'auth/logout' });
            localStorage.clear();
            window.location.href = '/login';
        }
    }

    // Handle cases where the active user was deleted from the database
    if (result.error) {
        const errMsg = result.error.data?.message;
        if (
            errMsg === 'User not found' ||
            errMsg === 'Super admin not found' ||
            errMsg === 'Logged in user not found' ||
            errMsg === 'Invalid role'
        ) {
            api.dispatch({ type: 'auth/logout' });
            localStorage.clear();
            window.location.href = '/login';
        }
    }

    return result;
};
