import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const jobOnboardingApi = createApi({
    reducerPath: 'jobOnboardingApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['JobOnboarding'],
    endpoints: (builder) => ({
        getAllJobOnboarding: builder.query({
            query: (params) => ({
                url: '/job-onboarding',
                method: 'GET',
                params: params,
            }),
            providesTags: ['JobOnboarding'],
        }),

        createJobOnboarding: builder.mutation({
            query: (data) => ({
                url: '/job-onboarding',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['JobOnboarding'],
        }),

        updateJobOnboarding: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/job-onboarding/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['JobOnboarding'],
        }),

        deleteJobOnboarding: builder.mutation({
            query: (id) => ({
                url: `/job-onboarding/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['JobOnboarding'],
        }),

        getJobOnboardingById: builder.query({
            query: (id) => `/job-onboarding/${id}`,
            providesTags: (result, error, id) => [{ type: 'JobOnboarding', id }],
        }),
    }),
});

export const {
    useGetAllJobOnboardingQuery,
    useCreateJobOnboardingMutation,
    useUpdateJobOnboardingMutation,
    useDeleteJobOnboardingMutation,
    useGetJobOnboardingByIdQuery,
} = jobOnboardingApi; 