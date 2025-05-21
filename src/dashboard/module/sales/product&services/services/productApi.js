import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => {
        const { page = 1, pageSize = 10, search = '', id } = params;
        return {
          url: `/products/`,
          params: {
            page,
            pageSize,
            search,
            id
          }
        };
      },
      transformResponse: (response) => {
        // Handle the nested response structure
        const data = response?.message?.data || [];
        const pagination = response?.message?.pagination || {
          total: 0,
          current: 1,
          pageSize: 10,
          totalPages: 1
        };

        return {
          data: data.map(item => ({
            ...item,
            key: item.id
          })),
          pagination
        };
      },
      providesTags: ["Products"],
    }),

    createProduct: builder.mutation({
      query: ({ id, data }) => {
        const formData = data;
        return {
          url: `/products/${id}`,
          method: "POST",
          body: formData,
          formData: true,
          prepareHeaders: (headers) => {
            headers.set("Accept", "application/json");
            return headers;
          },
        };
      },
      invalidatesTags: ["Products"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, data }) => {
        const formData = data;
        return {
          url: `/products/${id}`,
          method: "PUT",
          body: formData,
          formData: true,
          prepareHeaders: (headers) => {
            headers.set("Accept", "application/json");
            return headers;
          },
        };
      },
      invalidatesTags: ["Products"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
