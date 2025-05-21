import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";


export const dealApi = createApi({
  reducerPath: "dealApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Deal"],
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({


    getDeals: builder.query({
      query: ({ page = 1, pageSize = 10, search = '', ...rest }) => {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(search && { search }),
          ...rest
        }).toString();
        return {
          url: `/deals?${queryParams}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        if (response?.message) {
          return {
            data: response.message.data.map(deal => ({
              ...deal,
              key: deal.id
            })),
            pagination: response.message.pagination
          };
        }
        return {
          data: [],
          pagination: {
            total: 0,
            current: 1,
            pageSize: 10,
            totalPages: 0
          }
        };
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
        formData: true,
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

    uploadDealFiles: builder.mutation({
      query: ({ id, data }) => ({
        url: `/deals/files/${id}`,
        method: "POST",
        body: data,
        formData: true, // This tells RTK Query that we're sending FormData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Deal", id },
        "Deal",
      ],
    }),

    deleteDealFile: builder.mutation({
      query: ({ id, filename }) => ({
        url: `/deals/files/${id}`,
        method: "DELETE",
        body: { filename }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Deal", id },
        "Deal"
      ],
    }),

    updateDealStage: builder.mutation({
      query: ({ id, stage }) => ({
        url: `/deals/${id}`,
        method: "PUT",
        body: { stage }
      }),
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
  useUpdateDealStageMutation,
  useUploadDealFilesMutation,
  useDeleteDealFileMutation,
} = dealApi;
