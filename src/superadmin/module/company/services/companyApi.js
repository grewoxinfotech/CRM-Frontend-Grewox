import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../store/baseQuery';

export const companyApi = createApi({
    reducerPath: 'companyApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Companies'],
    endpoints: (builder) => ({
        getAllCompanies: builder.query({
            query: () => ({
                url: '/clients',
                method: 'GET',
            }),
            providesTags: ['Companies'],
        }),
        createCompany: builder.mutation({
            query: (data) => ({
                url: '/clients',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Companies'],
        }),
        updateCompany: builder.mutation({
            query: ({ id, data }) => ({
                url: `/clients/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Companies'],
            
        }),
        deleteCompany: builder.mutation({
            query: (id) => ({
                url: `/clients/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Companies'],
        }),
        assignPlan: builder.mutation({
            query: (data) => ({
                url: `/subscriptions/assign`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Companies'],
        }),
        verifySignup: builder.mutation({
            query: ({ otp, token }) => ({
                url: '/auth/verify-signup',
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
                url: '/auth/resend-signup-otp',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        }),
    }),
});

export const {
    useGetAllCompaniesQuery,
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
    useAssignPlanMutation,
    useVerifySignupMutation,
    useResendSignupOtpMutation, 
} = companyApi;