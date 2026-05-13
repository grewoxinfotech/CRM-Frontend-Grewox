import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const automationApi = createApi({
    reducerPath: 'automationApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Automation'],
    endpoints: (builder) => ({
        getAutomations: builder.query({
            query: () => '/automations/all',
            providesTags: ['Automation']
        }),
        createAutomation: builder.mutation({
            query: (data) => ({
                url: '/automations/create',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Automation']
        }),
        seedDefaults: builder.mutation({
            query: () => ({
                url: '/automations/seed-defaults',
                method: 'POST',
            }),
            invalidatesTags: ['Automation'],
        }),
        toggleAutomation: builder.mutation({
            query: (id) => ({
                url: `/automations/${id}/toggle`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Automation'],
        }),
        deleteAutomation: builder.mutation({
            query: (id) => ({
                url: `/automations/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Automation'],
        }),
        updateAutomation: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/automations/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['Automation'],
        }),
    })
});

export const { 
    useGetAutomationsQuery, 
    useCreateAutomationMutation, 
    useSeedDefaultsMutation, 
    useToggleAutomationMutation,
    useDeleteAutomationMutation,
    useUpdateAutomationMutation
} = automationApi;
