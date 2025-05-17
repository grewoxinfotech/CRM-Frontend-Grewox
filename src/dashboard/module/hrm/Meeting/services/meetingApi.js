import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const meetingApi = createApi({
  reducerPath: "meetingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Meetings"],
  endpoints: (builder) => ({
    getMeetings: builder.query({
      query: (params = {}) => {
        const { page = 1, pageSize = 10, search = '' } = params;
        return {
          url: '/meetings',
          params: {
            page,
            pageSize,
            search
          }
        };
      },
      transformResponse: (response) => ({
        data: response.message.data.map(item => ({
          ...item,
          key: item.id
        })),
        pagination: response.message.pagination
      }),
      providesTags: ["Meetings"],
    }),
    createMeeting: builder.mutation({
      query: (data) => ({
        url: "/meetings",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Meetings"],
    }),
    updateMeeting: builder.mutation({
      query: ({ id, data }) => ({
        url: `meetings/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Meetings"],
    }),
    deleteMeeting: builder.mutation({
      query: (id) => ({
        url: `meetings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Meetings"],
    }),
    getMeetingById: builder.query({
      query: (id) => `meetings/${id}`,
    }),
  }),
});

export const {
  useGetMeetingsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
  useGetMeetingByIdQuery,
} = meetingApi;
