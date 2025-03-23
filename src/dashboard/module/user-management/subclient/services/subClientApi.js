import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const subclientApi = createApi({
    reducerPath: 'subclientApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Subclient'],
    endpoints: (builder) => ({



        getAllSubclients: builder.query({
            query: () => ({
                url: '/sub-clients',
                method: 'GET'
            }),
            providesTags: ['Subclient'],
        }),


        getSubclientById: builder.query({
            query: (id) => ({
                url: `/sub-clients/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Subclient', id }],
        }),


        createSubclient: builder.mutation({
            query: (data) => ({
                url: '/sub-clients',
                method: 'POST',
                body: {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                    role: 'sub-client',
                    status: 'pending',
                    isEmailVerified: false,
                    createdAt: new Date().toISOString()
                }
            }),
            transformResponse: (response) => {
                console.log('Create Subclient Response:', response);
                // Check if the response has a token or sessionToken
                const token = response.token || response.sessionToken || response.data?.token || response.data?.sessionToken;

                if (!token) {
                    throw new Error('No session token received from server');
                }

                return {
                    ...response,
                    success: true,
                    sessionToken: token
                };
            },
            invalidatesTags: ['Subclient'],
        }),
        verifyOTP: builder.mutation({
            query: (data) => ({
                url: 'auth/verify-otp',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Subclient'],
        }),


        updateSubclient: builder.mutation({
            query: ({ id, data }) => ({
                url: `/sub-clients/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Subclient', id },
                'Subclient'
            ]
        }),


        deleteSubclient: builder.mutation({
            query: (id) => ({
                url: `/sub-clients/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Subclient']
        }),

        verifySignup: builder.mutation({
            query: ({ otp, token }) => ({
                url: 'auth/verify-signup',
                method: 'POST',
                body: { otp },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }),
            invalidatesTags: ['Subclient']
        }),

        resendSignupOtp: builder.mutation({
            query: ({ token }) => ({
                url: 'auth/resend-signup-otp',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        }),

        resendOtp: builder.mutation({
            query: (userId) => ({
                url: `auth/resend-otp/${userId}`,
                method: 'POST',
            }),
        })
    })
});

export const {
    useGetAllSubclientsQuery,
    useGetSubclientByIdQuery,
    useCreateSubclientMutation,
    useUpdateSubclientMutation,
    useDeleteSubclientMutation,
    useVerifySignupMutation,
    useResendSignupOtpMutation,
    useVerifyOTPMutation,
    useResendOtpMutation
} = subclientApi;
