import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const salaryApi = createApi({
  reducerPath: "salaryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Salary"],
  endpoints: (builder) => ({
    getSalary: builder.query({
      query: () => "/salary",
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
    verifyUserOtp: builder.mutation({
      query: (data) => ({
        url: "auth/verify-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    resendOtp: builder.mutation({
      query: (userId) => ({
        url: `auth/resend-otp/${userId}`,
        method: "POST",
      }),
    }),
    verifySignup: builder.mutation({
      query: ({ otp, token }) => ({
        url: "auth/verify-signup",
        method: "POST",
        body: { otp },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["Users"],
    }),
    resendSignupOtp: builder.mutation({
      query: ({ token }) => ({
        url: "auth/resend-signup-otp",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const {
  useGetSalaryQuery,
  useCreateSalaryMutation,
  useUpdateSalaryMutation,
  useDeleteSalaryMutation,
  useVerifyUserOtpMutation,
  useResendOtpMutation,
  useVerifySignupMutation,
  useResendSignupOtpMutation,
} = salaryApi;
