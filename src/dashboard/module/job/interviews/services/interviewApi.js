 import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const interviewApi = createApi({
    reducerPath: 'interviewApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Interview'],
    endpoints: (builder) => ({
        getAllInterviews: builder.query({
            query: (params) => ({
                url: '/interview-schedules',
                method: 'GET',
                params
            }),
            providesTags: ['Interview']
        }),

        createInterview: builder.mutation({
            query: (data) => ({
                url: '/interview-schedules',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Interview']
        }),


        deleteInterview: builder.mutation({
            query: (id) => ({
                url: `/interview-schedules/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Interview']
        }),

    })
});

export const {
    useGetAllInterviewsQuery,
    useCreateInterviewMutation,
    useDeleteInterviewMutation,
} = interviewApi; 