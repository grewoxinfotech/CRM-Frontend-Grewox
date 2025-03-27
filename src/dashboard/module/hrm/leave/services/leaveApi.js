import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Leave"],
  endpoints: (builder) => ({
    getLeave: builder.query({
      query: () => "/leaves",
      providesTags: ["Leave"],
    }),
    createLeave: builder.mutation({
      query: (data) => ({
        url: "leaves",
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: ["Leave"],
    }),
    updateLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `leaves/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Leave"],
    }),
    deleteLeave: builder.mutation({
      query: (id) => ({
        url: `leaves/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Leave"],
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
  useGetLeaveQuery,
  useCreateLeaveMutation,
  useUpdateLeaveMutation,
  useDeleteLeaveMutation,
  useVerifyUserOtpMutation,
  useResendOtpMutation,
  useVerifySignupMutation,
  useResendSignupOtpMutation,
} = leaveApi;
