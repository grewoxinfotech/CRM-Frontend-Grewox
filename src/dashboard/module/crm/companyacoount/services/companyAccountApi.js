import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const companyAccountApi = createApi({
  reducerPath: "companyAccountApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CompanyAccounts"],
  endpoints: (builder) => ({
    getCompanyAccounts: builder.query({
      query: (params) => {
        const { page = 1, pageSize = 10, search = '', ...rest } = params || {};
        const queryParams = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(search && { search }),
          ...rest
        }).toString();
        return `/company-accounts?${queryParams}`;
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
      providesTags: ["CompanyAccounts"],
    }),
    createCompanyAccount: builder.mutation({
      query: (data) => ({
        url: "company-accounts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CompanyAccounts"],
    }),
    updateCompanyAccount: builder.mutation({
      query: ({ id, data }) => ({
        url: `company-accounts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CompanyAccounts"],
    }),
    deleteCompanyAccount: builder.mutation({
      query: (id) => ({
        url: `company-accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CompanyAccounts"],
    }),
  }),
});

export const {
  useGetCompanyAccountsQuery,
  useCreateCompanyAccountMutation,
  useUpdateCompanyAccountMutation,
  useDeleteCompanyAccountMutation,
} = companyAccountApi;
