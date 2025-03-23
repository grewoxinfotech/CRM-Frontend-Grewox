import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../store/baseQuery";

export const sourceApi = createApi({
  reducerPath: "sourceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Sources"],
  endpoints: (builder) => ({
    getSources: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        // Handle different response structures
        if (Array.isArray(response)) {
          return { data: response };
        }
        if (response?.data && Array.isArray(response.data)) {
          return response;
        }
        return { data: [] };
      },
      providesTags: ["Sources"],
    }),
    createSource: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: {
          ...data,
          lableType: "source",
        },
      }),
      transformResponse: (response) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to create source",
      }),
      invalidatesTags: ["Sources"],
    }),
    updateSource: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: {
          ...data,
          lableType: "source",
        },
      }),
      transformResponse: (response) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to update source",
      }),
      invalidatesTags: ["Sources"],
    }),
    deleteSource: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete source",
      }),
      invalidatesTags: ["Sources"],
    }),
  }),
});

export const {
  useGetSourcesQuery,
  useCreateSourceMutation,
  useUpdateSourceMutation,
  useDeleteSourceMutation,
} = sourceApi;
