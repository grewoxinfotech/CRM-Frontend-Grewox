import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const taskCalendarApi = createApi({
    reducerPath: 'taskCalendarApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['TaskCalendar'],
    endpoints: (builder) => ({
        getAllTaskCalendarEvents: builder.query({
            query: () => 'task-calendars',
            providesTags: ['TaskCalendar'],
        }),

        createTaskCalendarEvent: builder.mutation({
            query: (data) => ({
                url: 'task-calendars',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TaskCalendar'],
        }),

        deleteTaskCalendarEvent: builder.mutation({
            query: (id) => ({
                url: `task-calendars/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TaskCalendar'],
        }),
    }),
});

export const {
    useGetAllTaskCalendarEventsQuery,
    useCreateTaskCalendarEventMutation,
    useDeleteTaskCalendarEventMutation,
} = taskCalendarApi;

export default taskCalendarApi;
