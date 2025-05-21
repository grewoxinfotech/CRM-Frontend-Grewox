import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const salaryApi = createApi({
  reducerPath: "salaryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Salary"],
  endpoints: (builder) => ({
    getSalary: builder.query({
      query: (params = {}) => {
        const { page = 1, pageSize = 10, search = '' } = params;
        const queryParams = new URLSearchParams();

        queryParams.append('page', page);
        queryParams.append('pageSize', pageSize);
        if (search) {
          queryParams.append('search', search);
        }

        return {
          url: `/salary?${queryParams.toString()}`,
        };
      },
      transformResponse: (response) => ({
        data: response.message.data.map(item => ({
          ...item,
          key: item.id,
          amount: item.salary,
          employeeId: item.employeeId,
          employee_id: item.employeeId,
          status: item.status || 'unpaid',
          payment_date: item.paymentDate
        })),
        pagination: response.message.pagination
      }),
      providesTags: ["Salary"],
    }),
    createSalary: builder.mutation({
      query: (data) => ({
        url: "salary",
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: ["Salary"],
    }),
    updateSalary: builder.mutation({
      query: ({ id, data }) => ({
        url: `salary/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Salary"],
    }),
    deleteSalary: builder.mutation({
      query: (id) => ({
        url: `salary/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Salary"],
    }),
  }),
});

export const {
  useGetSalaryQuery,
  useCreateSalaryMutation,
  useUpdateSalaryMutation,
  useDeleteSalaryMutation,
} = salaryApi;
