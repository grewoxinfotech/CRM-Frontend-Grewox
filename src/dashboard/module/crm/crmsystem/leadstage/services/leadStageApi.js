import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../store/baseQuery";

export const leadStageApi = createApi({
  reducerPath: "leadStageApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LeadStage"],
  endpoints: (builder) => ({
    getLeadStages: builder.query({
      query: () => ({
        url: "stages",
        method: "GET",
        params: {
          stageType: "lead",
          client_id: true
        }
      }),
      transformResponse: (response) => {
        try {
          if (Array.isArray(response)) {
            return response;
          }
          if (response?.stages && Array.isArray(response.stages)) {
            return response.stages;
          }
          if (response?.data && Array.isArray(response.data)) {
            return response.data;
          }
          console.warn('Unexpected lead stage response format:', response);
          return [];
        } catch (error) {
          console.error('Error transforming lead stage response:', error);
          return [];
        }
      },
      providesTags: ["LeadStage"],
    }),

    getLeadStagesByPipeline: builder.query({
      query: (pipelineId) => ({
        url: `stages/pipeline/${pipelineId}`,
        method: "GET",
        params: {
          stageType: "lead",
          client_id: true
        }
      }),
      transformResponse: (response) => {
        try {
          const stages = Array.isArray(response) ? response :
            response?.stages || response?.data || [];
          return stages.filter(stage => stage.stageType === 'lead');
        } catch (error) {
          console.error('Error transforming pipeline stages:', error);
          return [];
        }
      },
      providesTags: (result, error, pipelineId) => [
        "LeadStage",
        { type: "LeadStage", id: `pipeline-${pipelineId}` }
      ],
    }),

    addLeadStage: builder.mutation({
      query: (body) => ({
        url: "stages",
        method: "POST",
        body: {
          ...body,
          stageType: "lead",
          client_id: true
        }
      }),
      invalidatesTags: ["LeadStage"],
    }),

    updateLeadStage: builder.mutation({
      query: (data) => ({
        url: `stages/${data.id}`,
        method: "PUT",
        body: {
          stageName: data.stageName,
          pipeline: data.pipeline,
          stageType: "lead",
          isDefault: data.isDefault,
          client_id: true
        }
      }),
      invalidatesTags: ["LeadStage"]
    }),

    deleteLeadStage: builder.mutation({
      query: ({ id, newDefaultId }) => ({
        url: `stages/${id}`,
        method: "DELETE",
        body: {
          newDefaultId,
          client_id: true
        }
      }),
      invalidatesTags: ["LeadStage"]
    }),
  }),
});

export const {
  useGetLeadStagesQuery,
  useGetLeadStagesByPipelineQuery,
  useAddLeadStageMutation,
  useUpdateLeadStageMutation,
  useDeleteLeadStageMutation,
} = leadStageApi;
