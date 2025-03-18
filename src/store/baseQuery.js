import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../config/config';
import { logout } from '../auth/services/authSlice';

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState()?.auth?.token;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result?.error?.status === 401 ||
        (result?.error?.data?.message === "jwt expired" && !args.url.includes('refresh-token'))) {
        // Try to refresh token
        const refreshResult = await baseQuery(
            { url: '/auth/refresh-token', method: 'POST' },
            api,
            extraOptions
        );

        if (refreshResult?.data) {
            // Retry the original request
            result = await baseQuery(args, api, extraOptions);
        } else {
            // If refresh token fails, logout and redirect to login
            api.dispatch(logout());
            window.location.href = '/login';
        }
    }

    return result;
}; 