import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../store/baseQuery";

export const dealStageApi = createApi({
  reducerPath: "dealStageApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["DealStage"],
  endpoints: (builder) => ({
    getDealStages: builder.query({
      query: () => ({
        url: "stages",
        method: "GET",
        params: {
          stageType: "deal",
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
          console.warn('Unexpected deal stage response format:', response);
          return [];
        } catch (error) {
          console.error('Error transforming deal stage response:', error);
          return [];
        }
      },
      providesTags: ["DealStage"],
    }),

    getDealStagesByPipeline: builder.query({
      query: (pipelineId) => ({
        url: `stages/pipeline/${pipelineId}`,
        method: "GET",
        params: {
          stageType: "deal",
          client_id: true
        }
      }),
      transformResponse: (response) => {
        try {
          const stages = Array.isArray(response) ? response :
            response?.stages || response?.data || [];
          return stages.filter(stage => stage.stageType === 'deal');
        } catch (error) {
          console.error('Error transforming pipeline stages:', error);
          return [];
        }
      },
      providesTags: (result, error, pipelineId) => [
        "DealStage",
        { type: "DealStage", id: `pipeline-${pipelineId}` }
      ],
    }),

    addDealStage: builder.mutation({
      query: (body) => ({
        url: "stages",
        method: "POST",
        body: {
          ...body,
          stageType: "deal",
          client_id: true
        }
      }),
      invalidatesTags: ["DealStage"],
    }),

    updateDealStage: builder.mutation({
      query: (data) => ({
        url: `stages/${data.id}`,
        method: "PUT",
        body: {
          stageName: data.stageName,
          pipeline: data.pipeline,
          stageType: "deal",
          isDefault: data.isDefault,
          client_id: true
        }
      }),
      invalidatesTags: ["DealStage"]
    }),

    deleteDealStage: builder.mutation({
      query: ({ id, newDefaultId }) => ({
        url: `stages/${id}`,
        method: "DELETE",
        body: {
          newDefaultId,
          client_id: true
        }
      }),
      invalidatesTags: ["DealStage"]
    }),
  }),
});

export const {
  useGetDealStagesQuery,
  useGetDealStagesByPipelineQuery,
  useAddDealStageMutation,
  useUpdateDealStageMutation,
  useDeleteDealStageMutation,
} = dealStageApi;
