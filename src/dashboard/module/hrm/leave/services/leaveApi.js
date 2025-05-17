import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Leave"],
  endpoints: (builder) => ({
    getLeave: builder.query({
      query: (params = {}) => {
        const { page = 1, pageSize = 10, search = '', ...rest } = params;
        const queryParams = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(search && { search }),
          ...rest
        }).toString();
        return `/leaves?${queryParams}`;
      },
      transformResponse: (response) => {
        // Handle the new response structure where data is nested inside message
        const { message } = response;
        return {
          data: message.data.map(leave => ({
            ...leave,
            key: leave.id
          })),
          pagination: message.pagination
        };
      },
      providesTags: ["Leave"],
    }),
    createLeave: builder.mutation({
      query: (data) => ({
        url: "leaves",
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: ["Leave"],
    }),
    updateLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `leaves/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Leave"],
    }),
    deleteLeave: builder.mutation({
      query: (id) => ({
        url: `leaves/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Leave"],
    }),
    approveLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `/leaves/approve/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Leave'],
    }),
  }),
});

export const {
  useGetLeaveQuery,
  useCreateLeaveMutation,
  useUpdateLeaveMutation,
  useDeleteLeaveMutation,
  useApproveLeaveMutation,
} = leaveApi;
