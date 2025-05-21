import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const branchApi = createApi({
    reducerPath: 'branchApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Branches'],
    endpoints: (builder) => ({
        getAllBranches: builder.query({
            query: (params) => ({
                url: '/branches',
                method: 'GET',
                params: {
                    page: params?.page || 1,
                    pageSize: params?.pageSize || 10,
                    search: params?.search || '',
                    ...params
                },
            }),
            transformResponse: (response) => {
                // Handle the nested message structure
                const data = response?.message?.data || [];
                const pagination = response?.message?.pagination || {
                    total: 0,
                    current: 1,
                    pageSize: 10,
                    totalPages: 0
                };

                return {
                    data,
                    pagination
                };
            },
            providesTags: (result = []) => [
                'Branches',
                ...(result?.data || []).map(({ id }) => ({ type: 'Branches', id }))
            ],
        }),
        getBranchById: builder.query({
            query: (id) => `/branches/${id}`,
            providesTags: ['Branches'],
        }),
        createBranch: builder.mutation({
            query: (data) => ({
                url: '/branches',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Branches'],
        }),
        updateBranch: builder.mutation({
            query: ({ id, data }) => ({
                url: `/branches/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Branches'],
        }),
        deleteBranch: builder.mutation({
            query: (id) => ({
                url: `/branches/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Branches'],
        }),
    }),
});

export const {
    useGetAllBranchesQuery,
    useGetBranchByIdQuery,
    useCreateBranchMutation,
    useUpdateBranchMutation,
    useDeleteBranchMutation,
} = branchApi;

export default branchApi;
