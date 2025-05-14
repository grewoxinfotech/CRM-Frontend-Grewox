import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../store/baseQuery';

export const companyApi = createApi({
    reducerPath: 'companyApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Companies', 'Subscriptions'],
    endpoints: (builder) => ({
        getAllCompanies: builder.query({
            query: ({ page = 1, limit = 10, search = '', sort, order }) => {
                if (search?.trim()) {
                    return {
                        url: '/clients/all',
                        method: 'GET',
                        params: {
                            search: search.trim()
                        }
                    };
                }

                return {
                    url: '/clients',
                    method: 'GET',
                    params: {
                        page,
                        limit,
                        sort,
                        order
                    }
                };
            },
            transformResponse: (response) => {
                if (!response?.success) {
                    return {
                        data: [],
                        totalItems: 0,
                        currentPage: 1,
                        pageSize: 10,
                        totalPages: 1
                    };
                }

                if (Array.isArray(response.data)) {
                    return {
                        data: response.data,
                        totalItems: response.data.length,
                        currentPage: 1,
                        pageSize: response.data.length,
                        totalPages: 1
                    };
                }

                return {
                    data: response.data.data || [],
                    totalItems: response.data.totalItems || 0,
                    currentPage: response.data.currentPage || 1,
                    pageSize: response.data.pageSize || 10,
                    totalPages: response.data.totalPages || 1
                };
            },
            keepUnusedDataFor: 0,
            providesTags: ['Companies']
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
        getAllAssignedPlans: builder.query({
            query: () => ({
                url: '/subscriptions/assign',
                method: 'GET',
            }),
            providesTags: ['Subscriptions'],
        }),
        assignPlan: builder.mutation({
            query: (data) => ({
                url: '/subscriptions/assign',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Companies', 'Subscriptions'],
        }),
        removePlan: builder.mutation({
            query: (id) => ({
                url: `/subscriptions/remove/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Companies', 'Subscriptions'],
        }),
        verifySignup: builder.mutation({
            query: ({ otp }) => {
                const token = localStorage.getItem('verificationToken');
                return {
                    url: '/auth/verify-signup',
                    method: 'POST',
                    body: { otp },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
            },
            invalidatesTags: ['Companies']
        }),

        resendSignupOtp: builder.mutation({
            query: () => {
                const token = localStorage.getItem('verificationToken');
                return {
                    url: '/auth/resend-signup-otp',
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
            }
        }),
    }),
});

export const {
    useGetAllCompaniesQuery,
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
    useGetAllAssignedPlansQuery,
    useAssignPlanMutation,
    useRemovePlanMutation,
    useVerifySignupMutation,
    useResendSignupOtpMutation,
} = companyApi;