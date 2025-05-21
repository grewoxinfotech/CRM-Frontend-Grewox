import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const jobOnboardingApi = createApi({
    reducerPath: 'jobOnboardingApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['JobOnboarding'],
    endpoints: (builder) => ({
        getAllJobOnboarding: builder.query({
            query: (params) => {
                const { page = 1, limit = 10, search = '', companyId, ...rest } = params || {};
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    ...(search && { search }),
                    ...(companyId && { company_id: companyId }),
                    ...rest
                }).toString();
                return `/job-onboarding?${queryParams}`;
            },
            transformResponse: (response) => {
                if (!response) return { data: [], pagination: { total: 0, current: 1, pageSize: 10 } };

                // Extract data and pagination from response
                const data = response?.message?.data || [];
                const pagination = response?.message?.pagination || {};

                // Transform data to include keys
                const transformedData = data.map(item => ({
                    ...item,
                    key: item.id || item._id
                }));

                // Return structured response
                return {
                    data: transformedData,
                    pagination: {
                        total: pagination.total || 0,
                        current: parseInt(pagination.current || 1),
                        pageSize: parseInt(pagination.pageSize || 10)
                    }
                };
            },
            providesTags: ['JobOnboarding'],
        }),
        createJobOnboarding: builder.mutation({
            query: (data) => ({
                url: 'job-onboarding',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['JobOnboarding'],
        }),
        updateJobOnboarding: builder.mutation({
            query: ({ id, data }) => ({
                url: `job-onboarding/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['JobOnboarding'],
        }),
        deleteJobOnboarding: builder.mutation({
            query: (id) => ({
                url: `job-onboarding/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['JobOnboarding'],
        }),
        getJobOnboardingById: builder.query({
            query: (id) => `job-onboarding/${id}`,
            providesTags: ['JobOnboarding'],
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

export default jobOnboardingApi; 