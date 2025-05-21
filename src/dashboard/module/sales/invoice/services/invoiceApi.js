import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const invoiceApi = createApi({
  reducerPath: "invoiceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Invoices"],
  endpoints: (builder) => ({
    getInvoices: builder.query({
      query: (params = {}) => {
        const { page = 1, pageSize = 10, search = '', related_id = '' } = params;
        return {
          url: "/sales-invoices",
          params: {
            page,
            pageSize,
            search,
            related_id
          }
        };
      },
      transformResponse: (response) => {
        if (!response?.success) {
          return {
            message: {
              data: [],
              pagination: {
                total: 0,
                current: 1,
                pageSize: 10,
                totalPages: 1
              }
            }
          };
        }
        return response;
      },
      providesTags: ["Invoices"],
    }),
    createInvoice: builder.mutation({
      query: ({ id, data }) => ({
        url: `sales-invoices/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Invoices"],
    }),
    updateInvoice: builder.mutation({
      query: ({ id, data }) => ({
        url: `sales-invoices/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Invoices"],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `sales-invoices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Invoices"],
    }),
    sendInvoiceEmail: builder.mutation({
      query: ({ id, data }) => ({
        url: `sales-invoices/send-mail/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Invoices"],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useSendInvoiceEmailMutation,
} = invoiceApi;

