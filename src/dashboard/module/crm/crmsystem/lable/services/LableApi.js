import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../store/baseQuery";

export const lableApi = createApi({
  reducerPath: "lableApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Lable"],
  endpoints: (builder) => ({
    getLables: builder.query({
      query: (id) => `/labels/${id}`,
      providesTags: ["Lable"],
    }),
    createLable: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Lable"],
    }),
    updateLable: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Lable"],
    }),
    deleteLable: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Lable"],
    }),
  }),
});

export const {
  useGetLablesQuery,
  useCreateLableMutation,
  useUpdateLableMutation,
  useDeleteLableMutation,
} = lableApi;
