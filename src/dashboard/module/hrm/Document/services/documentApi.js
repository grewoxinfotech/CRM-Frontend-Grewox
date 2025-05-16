import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const documentApi = createApi({
  reducerPath: "documentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Documents"],
  endpoints: (builder) => ({
    getDocuments: builder.query({
      query: ({ page = 1, pageSize = 10, search = '' } = {}) => ({
        url: '/documents',
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
      providesTags: ["Documents"]
    }),
    getDocumentById: builder.query({
      query: (id) => `/documents/${id}`,
      providesTags: ["Documents"]
    }),
    createDocument: builder.mutation({
      query: (data) => {
        const formData = new FormData();

        // Append all form fields
        Object.keys(data).forEach((key) => {
          if (key === "file") {
            // Handle file upload
            if (data[key]) {
              formData.append("file", data[key]);
            }
          } else {
            // Handle other fields
            formData.append(key, data[key]);
          }
        });

        return {
          url: "/documents",
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary
        };
      },
      invalidatesTags: ["Documents"]
    }),
    updateDocument: builder.mutation({
      query: ({ id, data }) => {
        const formData = new FormData();

        // Append all form fields
        Object.keys(data).forEach((key) => {
          if (key === "file") {
            // Handle file upload
            if (data[key]) {
              formData.append("file", data[key]);
            }
          } else {
            // Handle other fields
            formData.append(key, data[key]);
          }
        });

        return {
          url: `/documents/${id}`,
          method: "PUT",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary
        };
      },
      invalidatesTags: ["Documents"]
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/documents/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Documents"]
    })
  })
});

export const {
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation
} = documentApi;
