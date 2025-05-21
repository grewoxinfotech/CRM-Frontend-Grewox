import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const designationApi = createApi({
    reducerPath: 'designationApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Designations', 'BranchTypes'],
    endpoints: (builder) => ({
        getAllDesignations: builder.query({
            query: (params) => ({
                url: '/designations',
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
                'Designations',
                ...(result?.data || []).map(({ id }) => ({ type: 'Designations', id }))
            ],
        }),


        createDesignation: builder.mutation({
            query: (data) => ({
                url: '/designations',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response) => {
                return response?.data || response;
            },
            transformErrorResponse: (response) => {
                return response?.data?.message || 'Failed to create designation';
            },
            invalidatesTags: ['Designations'],
        }),

        updateDesignation: builder.mutation({
            query: ({ id, data }) => ({
                url: `/designations/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response) => {
                return response?.data || response;
            },
            transformErrorResponse: (response) => {
                return response?.data?.message || 'Failed to update designation';
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Designations', id },
                'Designations'
            ],
        }),

        deleteDesignation: builder.mutation({
            query: (id) => ({
                url: `/designations/${id}`,
                method: 'DELETE',
            }),
            transformErrorResponse: (response) => {
                return response?.data?.message || 'Failed to delete designation';
            },
            invalidatesTags: (result, error, id) => [
                { type: 'Designations', id },
                'Designations'
            ],
        }),
    }),
});

export const {
    useGetAllDesignationsQuery,
    useCreateDesignationMutation,
    useUpdateDesignationMutation,
    useDeleteDesignationMutation,
} = designationApi;
