import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Contacts"],
  endpoints: (builder) => ({
    getContacts: builder.query({
      query: (params) => {
        const { page = 1, pageSize = 10, search = '', ...rest } = params || {};
        const queryParams = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(search && { search }),
          ...rest
        }).toString();
        return `/contacts?${queryParams}`;
      },
      transformResponse: (response) => ({
        data: response.message.data.map(item => ({ ...item, key: item.id })),
        pagination: {
          total: response.message.pagination.total,
          current: response.message.pagination.current,
          pageSize: response.message.pagination.pageSize,
          totalPages: response.message.pagination.totalPages
        }
      }),
      providesTags: ["Contacts"],
    }),
    createContact: builder.mutation({
      query: (data) => ({
        url: "contacts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Contacts"],
    }),
    updateContact: builder.mutation({
      query: ({ id, data }) => ({
        url: `contacts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Contacts"],
    }),
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `contacts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contacts"],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;
