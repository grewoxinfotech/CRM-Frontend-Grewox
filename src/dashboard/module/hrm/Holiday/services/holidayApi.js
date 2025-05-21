import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const holidayApi = createApi({
    reducerPath: 'holidayApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Holiday'],
    endpoints: (builder) => ({
        getAllHolidays: builder.query({
            query: (params = {}) => {
                const { page = 1, pageSize = 10, search = '', ...rest } = params;
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    pageSize: pageSize.toString(),
                    ...(search && { search }),
                    ...rest
                }).toString();
                return `/holidays?${queryParams}`;
            },
            transformResponse: (response) => {
                const data = response?.message?.data || [];
                const pagination = response?.message?.pagination || {};

                return {
                    data: data.map(holiday => ({
                        ...holiday,
                        key: holiday.id
                    })),
                    pagination
                };
            },
            providesTags: ['Holiday'],
        }),
        createHoliday: builder.mutation({
            query: (data) => ({
                url: '/holidays',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Holiday'],
        }),
        updateHoliday: builder.mutation({
            query: ({ id, data }) => ({
                url: `/holidays/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Holiday'],
        }),
        deleteHoliday: builder.mutation({
            query: (id) => ({
                url: `/holidays/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Holiday'],
        }),
    }),
});

export const {
    useGetAllHolidaysQuery,
    useCreateHolidayMutation,
    useUpdateHolidayMutation,
    useDeleteHolidayMutation,
} = holidayApi;

export default holidayApi;
