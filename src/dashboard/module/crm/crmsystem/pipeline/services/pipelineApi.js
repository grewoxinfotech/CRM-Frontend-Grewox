import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../store/baseQuery";

export const pipelineApi = createApi({
  reducerPath: "pipelineApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Pipeline"],
  endpoints: (builder) => ({
    getPipelines: builder.query({
      query: () => ({
        url: "/pipelines",
        method: "GET",
        params: {
          client_id: true
        }
      }),
      transformResponse: (response) => {
        try {
          if (Array.isArray(response)) {
            return response;
          }
          if (response?.pipelines && Array.isArray(response.pipelines)) {
            return response.pipelines;
          }
          if (response?.data && Array.isArray(response.data)) {
            return response.data;
          }
          console.warn('Unexpected pipeline response format:', response);
          return [];
        } catch (error) {
          console.error('Error transforming pipeline response:', error);
          return [];
        }
      },
      providesTags: ["Pipeline"],
    }),

    getPipelineById: builder.query({
      query: (id) => ({
        url: `/pipelines/${id}`,
        method: "GET",
        params: {
          client_id: true
        }
      }),
      providesTags: (result, error, id) => [{ type: "Pipeline", id }],
    }),

    addPipeline: builder.mutation({
      query: (data) => ({
        url: "/pipelines",
        method: "POST",
        body: {
          ...data,
          client_id: true
        }
      }),
      invalidatesTags: ["Pipeline"],
    }),

    updatePipeline: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/pipelines/${id}`,
        method: "PUT",
        body: {
          ...data,
          client_id: true
        }
      }),
      invalidatesTags: (result, error, { id }) => [
        "Pipeline",
        { type: "Pipeline", id }
      ],
    }),

    deletePipeline: builder.mutation({
      query: (id) => ({
        url: `/pipelines/${id}`,
        method: "DELETE",
        params: {
          client_id: true
        }
      }),
      invalidatesTags: ["Pipeline"],
    }),
  }),
});

export const {
  useGetPipelinesQuery,
  useGetPipelineByIdQuery,
  useAddPipelineMutation,
  useUpdatePipelineMutation,
  useDeletePipelineMutation,
} = pipelineApi;
