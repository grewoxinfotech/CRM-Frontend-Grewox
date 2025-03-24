import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const offerLetterApi = createApi({
    reducerPath: 'offerLetterApi',
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
    tagTypes: ['OfferLetter'],
    endpoints: (builder) => ({
        getAllOfferLetters: builder.query({
            query: (params) => ({
                url: '/offer-letters',
                method: 'GET',
                params: params,
            }),
            providesTags: ['OfferLetter'],
        }),

        createOfferLetter: builder.mutation({
            query: (data) => ({
                url: '/offer-letters',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['OfferLetter'],
        }),

        updateOfferLetter: builder.mutation({
            query: ({ id, data }) => ({
                url: `/offer-letters/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['OfferLetter'],
        }),

        deleteOfferLetter: builder.mutation({
            query: (id) => ({
                url: `/offer-letters/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['OfferLetter'],
        }),

        getOfferLetterById: builder.query({
            query: (id) => `/offer-letters/${id}`,
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