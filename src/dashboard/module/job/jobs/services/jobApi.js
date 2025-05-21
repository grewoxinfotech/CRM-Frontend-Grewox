import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const jobApi = createApi({
    reducerPath: 'jobApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Jobs'],
    endpoints: (builder) => ({
        getAllJobs: builder.query({
            query: (params) => {
                const { page = 1, limit = 10, search = '', companyId, ...rest } = params || {};
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    ...(search && { search }),
                    ...(companyId && { company_id: companyId }),
                    ...rest
                }).toString();
                return `/jobs?${queryParams}`;
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
            providesTags: ['Jobs'],
        }),
        createJob: builder.mutation({
            query: (data) => ({
                url: 'jobs',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Jobs'],
        }),
        updateJob: builder.mutation({
            query: ({ id, data }) => ({
                url: `jobs/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Jobs'],
        }),
        deleteJob: builder.mutation({
            query: (id) => ({
                url: `jobs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Jobs'],
        }),
    }),
});

export const {
    useGetAllJobsQuery,
    useCreateJobMutation,
    useUpdateJobMutation,
    useDeleteJobMutation,
} = jobApi;

export default jobApi;
