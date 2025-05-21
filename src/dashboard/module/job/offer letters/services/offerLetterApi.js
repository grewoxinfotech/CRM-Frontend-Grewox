import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const offerLetterApi = createApi({
    reducerPath: 'offerLetterApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['OfferLetter'],
    endpoints: (builder) => ({
        getAllOfferLetters: builder.query({
            query: (params) => {
                const { page = 1, pageSize = 10, search = '', ...rest } = params || {};
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    pageSize: pageSize.toString(),
                    ...(search && { search }),
                    ...rest
                }).toString();
                return `offer-letters?${queryParams}`;
            },
            transformResponse: (response) => ({
                data: response.message.data.map(item => ({ ...item, key: item.id })),
                pagination: {
                    total: response.message.pagination.total,
                    current: response.message.pagination.current,
                    pageSize: response.message.pagination.pageSize,
                    totalPages: response.message.pagination.totalPages
                }
            }),
            providesTags: ['OfferLetter'],
        }),

        createOfferLetter: builder.mutation({
            query: (data) => ({
                url: 'offer-letters',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['OfferLetter'],
        }),

        updateOfferLetter: builder.mutation({
            query: ({ id, data }) => ({
                url: `offer-letters/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['OfferLetter'],
        }),

        deleteOfferLetter: builder.mutation({
            query: (id) => ({
                url: `offer-letters/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['OfferLetter'],
        }),

        getOfferLetterById: builder.query({
            query: (id) => `offer-letters/${id}`,
            providesTags: (result, error, id) => [{ type: 'OfferLetter', id }],
        }),
    }),
});

export const {
    useGetAllOfferLettersQuery,
    useCreateOfferLetterMutation,
    useUpdateOfferLetterMutation,
    useDeleteOfferLetterMutation,
    useGetOfferLetterByIdQuery,
} = offerLetterApi;

export default offerLetterApi; 