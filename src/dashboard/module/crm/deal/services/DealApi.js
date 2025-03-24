import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../src/store/baseQuery";


export const dealApi = createApi({
  reducerPath: "dealApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Deal"],
  endpoints: (builder) => ({
    getDeals: builder.query({
      query: (params) => ({
        url: "/deals",
        method: "GET",
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (response?.deals && Array.isArray(response.deals)) {
          return response.deals;
        }
        return [];
      },
      providesTags: ["Deal"],
    }),
    getDeal: builder.query({
      query: (id) => ({
        url: `/deals/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [{ type: "Deal", id }],
    }),
    createDeal: builder.mutation({
      query: (deal) => ({
        url: "/deals",
        method: "POST",
        body: deal,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ["Deal"],
    }),
    updateDeal: builder.mutation({
      query: ({ id, ...deal }) => ({
        url: `/deals/${id}`,
        method: "PUT",
        body: deal,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (result, error, { id }) => [{ type: "Deal", id }],
    }),
    deleteDeal: builder.mutation({
      query: (id) => ({
        url: `/deals/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ["Deal"],
    }),
  }),
});

export const {
  useGetDealsQuery,
  useGetDealQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useDeleteDealMutation,
} = dealApi;
