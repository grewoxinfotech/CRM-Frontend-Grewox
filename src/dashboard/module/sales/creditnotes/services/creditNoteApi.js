import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const creditNoteApi = createApi({
  reducerPath: "creditNoteApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CreditNotes"],
  endpoints: (builder) => ({
    getCreditNotes: builder.query({
      query: () => "/sales-creditnote",
      providesTags: ["CreditNotes"],
    }),
    createCreditNote: builder.mutation({
      query: (data) => ({
        url: "sales-creditnote",
        method: "POST",
        body: data,
        formData: true,
      }),

      invalidatesTags: ["CreditNotes"],
    }),
    updateCreditNote: builder.mutation({
      query: ({ id, data }) => ({
        url: `sales-creditnote/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CreditNotes"],
    }),
    deleteCreditNote: builder.mutation({
      query: (id) => ({
        url: `sales-creditnote/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CreditNotes"],
    }),
  }),
});

export const {
  useGetCreditNotesQuery,
  useCreateCreditNoteMutation,
  useUpdateCreditNoteMutation,
  useDeleteCreditNoteMutation,
} = creditNoteApi;
