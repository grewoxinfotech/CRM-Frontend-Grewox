import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const jobApplicationApi = createApi({
    reducerPath: 'jobApplicationApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['JobApplications'],
    endpoints: (builder) => ({
        getAllJobApplications: builder.query({
            query: (params) => {
                const { page = 1, limit = 10, search = '', ...rest } = params || {};
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    ...(search && { search }),
                    ...rest
                }).toString();
                return `/job-applications?${queryParams}`;
            },
            transformResponse: (response) => {
                // Handle the nested response structure
                const data = response?.message?.data || [];
                const pagination = response?.message?.pagination || {
                    total: 0,
                    current: 1,
                    pageSize: 10,
                    totalPages: 1
                };

                return {
                    data: data.map(item => ({
                        ...item,
                        key: item.id || item._id
                    })),
                    total: pagination.total,
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    totalPages: pagination.totalPages
                };
            },
            providesTags: ['JobApplications'],
        }),

        createJobApplication: builder.mutation({
            query: (data) => ({
                url: 'job-applications',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['JobApplications'],
        }),

        updateJobApplication: builder.mutation({
            query: ({ id, data }) => ({
                url: `job-applications/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['JobApplications'],
        }),

        deleteJobApplication: builder.mutation({
            query: (id) => ({
                url: `job-applications/${id}`,
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

export default jobApplicationApi; 