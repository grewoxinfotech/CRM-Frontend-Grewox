import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const announcementApi = createApi({
  reducerPath: "announcementApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Announcements"],
  endpoints: (builder) => ({
    getAnnouncements: builder.query({
      query: ({ page = 1, pageSize = 10, search = '' } = {}) => ({
        url: '/announcements',
        method: 'GET',
        params: {
          page,
          pageSize,
          search
        }
      }),
      transformResponse: (response) => {
        // Return the entire response as is, since we're handling the structure in the component
        return response;
      },
      providesTags: ["Announcements"]
    }),
    getAnnouncementById: builder.query({
      query: (id) => `/announcements/${id}`,
      providesTags: ["Announcements"]
    }),
    createAnnouncement: builder.mutation({
      query: (data) => ({
        url: '/announcements',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ["Announcements"]
    }),
    updateAnnouncement: builder.mutation({
      query: ({ id, data }) => ({
        url: `/announcements/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ["Announcements"]
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ["Announcements"]
    })
  })
});

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation
} = announcementApi;

export default announcementApi;
