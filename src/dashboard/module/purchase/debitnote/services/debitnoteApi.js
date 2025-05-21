import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const debitNoteApi = createApi({
    reducerPath: "debitNoteApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["DebitNotes"],
    endpoints: (builder) => ({
        // Get all debit notes for a company
        getDebitNotes: builder.query({
            query: (params = {}) => {
                const { page = 1, pageSize = 10, search = '' } = params;
                return {
                    url: "/bill-debits",
                    params: {
                        page,
                        pageSize,
                        search,
                        company_id: params.company_id
                    }
                };
            },
            transformResponse: (response) => {
                // Handle the nested response structure
                const data = response?.message?.data || [];
                const pagination = response?.message?.pagination || {
                    total: 0,
                    current: 1,
                    pageSize: 10,
                    totalPages: 1
                };

                return {
                    data: data.map(item => ({
                        ...item,
                        key: item.id || item._id
                    })),
                    pagination
                };
            },
            providesTags: ["DebitNotes"],
        }),

        // Create new debit note
        createDebitNote: builder.mutation({
            query: (data) => ({
                url: `/bill-debits`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["DebitNotes"],
        }),

        // Delete debit note
        deleteDebitNote: builder.mutation({
            query: (id) => ({
                url: `/bill-debits/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["DebitNotes"],
        }),

    }),
});

export const {
    useGetDebitNotesQuery,
    useCreateDebitNoteMutation,
    useDeleteDebitNoteMutation,
} = debitNoteApi;