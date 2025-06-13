import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../store/baseQuery';

export const forgotPasswordApi = createApi({
    reducerPath: 'forgotPasswordApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        sendResetEmail: builder.mutation({
            query: (data) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response) => {
                if (response.data?.sessionToken) {
                    const tokenWithBearer = `Bearer ${response.data.sessionToken}`;
                    localStorage.setItem('resetToken', tokenWithBearer);
                }   
                return {
                    success: true,
                    message: response.message || 'Reset instructions sent successfully',
                    sessionToken: response.data?.sessionToken
                };
            },
            transformErrorResponse: (response) => {
                const errorMessage = response.data?.message || response.error || response.data?.error;
                return {
                    success: false,
                    error: errorMessage || 'An error occurred while processing your request'
                };
            }
        }),

        verifyOtp: builder.mutation({
            query: (data) => {
                const resetToken = localStorage.getItem('resetToken');
                if (!resetToken) {
                    throw new Error('Session token not found. Please try again.');
                }
                return {
                    url: '/auth/verify-otp',
                    method: 'POST',
                    body: data,
                    headers: {  
                        'Authorization': resetToken
                    }
                };
            },
            transformResponse: (response) => {
                if (response.data?.token) {
                    const tokenWithBearer = `Bearer ${response.data.token}`;
                    localStorage.setItem('resetToken', tokenWithBearer);
                }
                return {
                    success: true,
                    message: response.message || 'OTP verified successfully',
                    sessionToken: response.data?.token
                };
            },
            transformErrorResponse: (response) => {
                if (response.status === 400 || response.status === 401) {
                    if (response.data?.message?.toLowerCase().includes('expired') ||
                        response.data?.message?.toLowerCase().includes('invalid token')) {
                        localStorage.removeItem('resetToken');
                    }

                    const errorMessage = response.data?.message || response.error;
                    if (errorMessage?.toLowerCase().includes('invalid otp') ||
                        errorMessage?.toLowerCase().includes('incorrect otp')) {
                        return {
                            success: false,
                            error: 'Invalid OTP. Please check and try again.',
                            isOtpError: true
                        };
                    } else if (errorMessage?.toLowerCase().includes('expired')) {
                        return {
                            success: false,
                            error: 'OTP has expired. Please request a new one.',
                            isOtpExpired: true
                        };
                    }
                }

                const errorMessage = response.data?.message || response.error || response.data?.error;
                return {
                    success: false,
                    error: errorMessage || 'Failed to verify OTP. Please try again.'
                };
            }
        }),

        resetPassword: builder.mutation({
            query: (data) => {
                const resetToken = localStorage.getItem('resetToken');
                if (!resetToken) {
                    throw new Error('Session token not found. Please verify OTP first.');
                }
                return {
                    url: '/auth/reset-password',
                    method: 'POST',
                    body: data,
                    headers: {
                        'Authorization': resetToken
                    }
                };
            },
            transformResponse: (response) => {
                localStorage.removeItem('resetToken');
                return {
                    success: true,
                    message: response.message || 'Password reset successfully'
                };
            },
            transformErrorResponse: (response) => {
                if (response.status === 401) {
                    localStorage.removeItem('resetToken');
                }
                const errorMessage = response.data?.message || response.error || response.data?.error;
                return {
                    success: false,
                    error: errorMessage || 'Failed to reset password'
                };
            }
        })
    })
});

export const {
    useSendResetEmailMutation,
    useVerifyOtpMutation,
    useResetPasswordMutation
} = forgotPasswordApi;
