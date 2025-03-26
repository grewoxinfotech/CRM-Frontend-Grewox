import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../store/baseQuery";

export const sourceApi = createApi({
  reducerPath: "sourceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Sources", "Statuses", "Tags"],
  endpoints: (builder) => ({
    // Sources
    getSources: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { data: response.filter(item => item.lableType === "source") };
        }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data.filter(item => item.lableType === "source") };
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
      transformResponse: (response) => response?.data || response,
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
      transformResponse: (response) => response?.data || response,
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
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete source",
      }),
      invalidatesTags: ["Sources"],
    }),

    // Statuses
    getStatuses: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { data: response.filter(item => item.lableType === "status") };
        }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data.filter(item => item.lableType === "status") };
        }
        return { data: [] };
      },
      providesTags: ["Statuses"],
    }),
    createStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: {
          ...data,
          lableType: "status",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to create status",
      }),
      invalidatesTags: ["Statuses"],
    }),
    updateStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: {
          ...data,
          lableType: "status",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to update status",
      }),
      invalidatesTags: ["Statuses"],
    }),
    deleteStatus: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete status",
      }),
      invalidatesTags: ["Statuses"],
    }),

    // Tags
    getTags: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { data: response.filter(item => item.lableType === "tag") };
        }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data.filter(item => item.lableType === "tag") };
        }
        return { data: [] };
      },
      providesTags: ["Tags"],
    }),
    createTag: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: {
          ...data,
          lableType: "tag",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to create tag",
      }),
      invalidatesTags: ["Tags"],
    }),
    updateTag: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: {
          ...data,
          lableType: "tag",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to update tag",
      }),
      invalidatesTags: ["Tags"],
    }),
    deleteTag: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete tag",
      }),
      invalidatesTags: ["Tags"],
    }),
  }),
});

export const {
  // Sources
  useGetSourcesQuery,
  useCreateSourceMutation,
  useUpdateSourceMutation,
  useDeleteSourceMutation,
  // Statuses
  useGetStatusesQuery,
  useCreateStatusMutation,
  useUpdateStatusMutation,
  useDeleteStatusMutation,
  // Tags
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = sourceApi;
