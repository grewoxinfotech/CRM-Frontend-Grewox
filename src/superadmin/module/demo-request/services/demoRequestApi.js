import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../store/baseQuery';

export const demoRequestApi = createApi({
    reducerPath: 'demoRequestApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['demo-request'],
    endpoints: (builder) => ({
        getAllDemoRequests: builder.query({
            query: (params) => ({
                url: '/demo-requests/admin',
                method: 'GET',
                params,
            }),
            providesTags: ['demo-request'],
        }),
        createDemoRequest: builder.mutation({
            query: (data) => ({
                url: '/demo-requests/admin',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['demo-request'],
        }),
        updateDemoRequest: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/demo-requests/admin/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['demo-request'],
        }),
        deleteDemoRequest: builder.mutation({
            query: (id) => ({
                url: `/demo-requests/admin/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['demo-request'],
        })
    }),
});

export const {
    useGetAllDemoRequestsQuery,
    useCreateDemoRequestMutation,
    useUpdateDemoRequestMutation,
    useDeleteDemoRequestMutation
} = demoRequestApi;
