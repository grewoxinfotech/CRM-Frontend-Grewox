import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const revenueApi = createApi({
  reducerPath: "revenueApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Revenue"],
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getRevenue: builder.query({
      query: (params = {}) => {
        const { page = 1, pageSize = 10, search = '' } = params;
        return {
          url: "/sales-revenue",
          params: {
            page,
            pageSize,
            search
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
            key: item.id,
            // Parse products if it's a string
            products: typeof item.products === 'string' ? JSON.parse(item.products) : item.products
          })),
          pagination
        };
      },
      providesTags: ["Revenue"],
    }),
    createRevenue: builder.mutation({
      query: (data) => ({
        url: "/sales-revenue",
        method: "POST",
        body: data,
        formData: true,
        prepareHeaders: (headers) => {
          headers.set("Accept", "application/json");
          return headers;
        },
      }),
      invalidatesTags: ["Revenue"],
    }),
    updateRevenue: builder.mutation({
      query: ({ id, data }) => ({
        url: `sales-revenue/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Revenue"],
    }),
    deleteRevenue: builder.mutation({
      query: (id) => ({
        url: `sales-revenue/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Revenue"],
    }),
  }),
});

export const {
  useGetRevenueQuery,
  useCreateRevenueMutation,
  useUpdateRevenueMutation,
  useDeleteRevenueMutation,
} = revenueApi;
