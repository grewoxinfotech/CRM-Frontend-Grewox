import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Tasks"],
  endpoints: (builder) => ({
    getAllTasks: builder.query({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response?.data) {
          const transformedData = {
            ...response,
            data: response.data.map(task => {
              if (!task.taskName) {
              }
              return {
                ...task,
                taskName: task.taskName || task.task_name || 'Untitled Task'
              };
            })
          };
          return transformedData;
        }
        return response;
      },
      providesTags: ["Tasks"],
    }),
    createTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tasks"],
    }),


    updateTask: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/tasks/${id}`,
          method: "PUT",
          body: data,
        };
      },
      transformResponse: (response) => {
        if (!response?.taskName) {
        }
        return response;
      },
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetAllTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;

export default taskApi;
