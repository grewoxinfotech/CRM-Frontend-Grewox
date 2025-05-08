import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Customers"],
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: () => "/customers",
      providesTags: ["Customers"],
    }),
    createCustomer: builder.mutation({
      query: (data) => ({
        url: "customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, data }) => ({
        url: `customers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;
