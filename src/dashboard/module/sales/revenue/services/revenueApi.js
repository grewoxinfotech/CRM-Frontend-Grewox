import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const revenueApi = createApi({
  reducerPath: "revenueApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Revenue"],
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getRevenue: builder.query({
      query: () => "/sales-revenue",
      transformResponse: (response) => {
        // Ensure consistent data structure
        if (response?.data) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      providesTags: (result, error, arg) => [
        { type: "Revenue", id: "LIST" },
        ...(result?.map(({ id }) => ({ type: "Revenue", id })) ?? [])
      ],
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
