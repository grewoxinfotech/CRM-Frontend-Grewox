import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const taskApi = createApi({
    reducerPath: 'taskApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Tasks'],
    endpoints: (builder) => ({
        getAllTasks: builder.query({
            query: (id) => ({
                url: `/tasks/${id}`,
                method: 'GET'
            }),
            providesTags: ['Tasks'],
        }),
        createTask: builder.mutation({
            query: ({ id, data }) => ({
                url: `/tasks/${id}`,
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Tasks'],
        }),
        updateTask: builder.mutation({
            query: ({ id, data }) => ({
                url: `/tasks/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Tasks'],
        }),
        deleteTask: builder.mutation({
            query: (id) => ({
                url: `/tasks/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Tasks'],
        }),
    }),
});

export const {
    useGetAllTasksQuery,
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
} = taskApi;

export default taskApi; 