import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { logout } from '../auth/services/authSlice';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState, endpoint }) => {
        const token = getState().auth.token;

        // Don't add auth token for verify-signup and resend-otp
        if (endpoint !== 'verifySignup' && endpoint !== 'resendSignupOtp' && token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    // Don't handle 401 for verify-signup and resend-otp endpoints
    if (result.error && result.error.status === 401 &&
        !args.url.includes('verify-signup') &&
        !args.url.includes('resend-signup-otp')) {
        api.dispatch(logout());
    }

    return result;
}; 