import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const jobApplicationApi = createApi({
    reducerPath: 'jobApplicationApi',
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
    tagTypes: ['JobApplications'],
    endpoints: (builder) => ({
        getAllJobApplications: builder.query({
            query: (params) => ({
                url: '/job-applications',
                method: 'GET',
                params: params,
            }),
            providesTags: ['JobApplications'],
        }),

        createJobApplication: builder.mutation({
            query: (data) => ({
                url: '/job-applications',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['JobApplications'],
        }),

        updateJobApplication: builder.mutation({
            query: ({ id, data }) => ({
                url: `/job-applications/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['JobApplications'],
        }),

        deleteJobApplication: builder.mutation({
            query: (id) => ({
                url: `/job-applications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['JobApplications'],
        }),

       
    }),
});

export const {
    useGetAllJobApplicationsQuery,
    useCreateJobApplicationMutation,
    useUpdateJobApplicationMutation,
    useDeleteJobApplicationMutation,
} = jobApplicationApi; 