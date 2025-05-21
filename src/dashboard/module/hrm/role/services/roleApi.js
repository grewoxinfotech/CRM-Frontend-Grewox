import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const roleApi = createApi({
    reducerPath: 'roleApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Roles'],
    endpoints: (builder) => ({
        getRoles: builder.query({
            query: (params) => ({
                url: '/roles',
                method: 'GET',
                params: {
                    page: params?.page || 1,
                    pageSize: params?.pageSize || 10,
                    search: params?.search || '',
                    ...params
                },
            }),
            transformResponse: (response) => {
                return {
                    message: {
                        data: response?.message?.data || [],
                        pagination: response?.message?.pagination || {
                            total: 0,
                            current: 1,
                            pageSize: 10,
                            totalPages: 0
                        }
                    }
                };
            },
            providesTags: (result = []) => [
                'Roles',
                ...(result?.message?.data || []).map(({ id }) => ({ type: 'Roles', id }))
            ],
        }),

        getAllRoles: builder.query({
            query: (params) => ({
                url: '/roles',
                method: 'GET',
                params: {
                    page: params?.page || 1,
                    pageSize: params?.pageSize || 10,
                    search: params?.search || '',
                    ...params
                },
            }),
            transformResponse: (response) => {
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
                'Roles',
                ...(result?.data || []).map(({ id }) => ({ type: 'Roles', id }))
            ],
        }),

        getRole: builder.query({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Roles', id }]
        }),

        createRole: builder.mutation({
            query: (data) => ({
                url: '/roles',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Roles']
        }),

        updateRole: builder.mutation({
            query: ({ id, data }) => ({
                url: `/roles/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Roles', id },
                'Roles'
            ]
        }),

        deleteRole: builder.mutation({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Roles']
        })
    })
});

export const {
    useGetRolesQuery,
    useGetAllRolesQuery,
    useGetRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation
} = roleApi; 