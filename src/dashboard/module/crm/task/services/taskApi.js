import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Tasks"],
  endpoints: (builder) => ({
    getAllTasks: builder.query({
      query: ({ id, page = 1, pageSize = 10, search = '', ...rest }) => {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(search && { search }),
          ...rest
        }).toString();
        return {
          url: `/tasks/${id}?${queryParams}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        if (response?.message?.data) {
          const transformedData = {
            data: response.message.data.map(task => ({
              ...task,
              taskName: task.taskName || task.task_name || 'Untitled Task',
              key: task.id
            })),
            pagination: {
              total: response.message.pagination.total,
              current: response.message.pagination.current,
              pageSize: response.message.pagination.pageSize,
              totalPages: response.message.pagination.totalPages
            }
          };
          return transformedData;
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
          return {
            ...response,
            taskName: response.task_name || 'Untitled Task'
          };
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
