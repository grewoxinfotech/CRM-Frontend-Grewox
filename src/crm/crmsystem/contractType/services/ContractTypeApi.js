import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../store/baseQuery";

export const contractTypeApi = createApi({
  reducerPath: "contractTypeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ContractType"],
  endpoints: (builder) => ({
    getContractTypes: builder.query({
      query: (userId) => ({
        url: `/labels/${userId}`,
        method: "GET",
      }),
      providesTags: ["ContractType"],
    }),
    addContractType: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ContractType"],
    }),
    updateContractType: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ContractType"],
    }),
    deleteContractType: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ContractType"],
    }),
  }),
});

export const {
  useGetContractTypesQuery,
  useAddContractTypeMutation,
  useUpdateContractTypeMutation,
  useDeleteContractTypeMutation,
} = contractTypeApi;
