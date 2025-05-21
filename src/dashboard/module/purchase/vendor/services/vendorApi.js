import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Vendors"],
  endpoints: (builder) => ({
    getVendors: builder.query({
      query: (params = {}) => {
        const { page = 1, pageSize = 10, search = '', status, country } = params;
        return {
          url: "/vendors",
          params: {
            page,
            pageSize,
            search,
            status,
            country
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
            key: item.id
          })),
          pagination
        };
      },
      providesTags: ["Vendors"],
    }),
    createVendor: builder.mutation({
      query: (data) => ({
        url: "vendors",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Vendors"],
    }),
    updateVendor: builder.mutation({
      query: ({ id, data }) => ({
        url: `vendors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Vendors"],
    }),
    deleteVendor: builder.mutation({
      query: (id) => ({
        url: `vendors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vendors"],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = vendorApi;
