import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const jobApi = createApi({
    reducerPath: 'jobApi',
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
    tagTypes: ['Jobs', 'JobTypes'],
    endpoints: (builder) => ({
        // Get all jobs
        getAllJobs: builder.query({
            query: () => ({
                url: '/jobs',
                method: 'GET',
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to fetch jobs');
            },
            providesTags: ['Jobs'],
        }),

        // Create job
        createJob: builder.mutation({
            query: (data) => ({
                url: '/jobs',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to create job');
            },
            invalidatesTags: ['Jobs'],
        }),

        // Update job
        updateJob: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/jobs/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to update job');
            },
            invalidatesTags: ['Jobs'],
        }),

        // Delete job
        deleteJob: builder.mutation({
            query: (id) => ({
                url: `/jobs/${id}`,
                method: 'DELETE',
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to delete job');
            },
            invalidatesTags: ['Jobs'],
        }),

    }),
});

export const {
    useGetAllJobsQuery,
    useCreateJobMutation,
    useUpdateJobMutation,
    useDeleteJobMutation,
    useGetJobTypesQuery,
    useCreateJobTypeMutation,
    useUpdateJobTypeMutation,
    useDeleteJobTypeMutation,
} = jobApi;

export default jobApi;
