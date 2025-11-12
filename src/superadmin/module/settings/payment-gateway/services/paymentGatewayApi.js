import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const paymentGatewayApi = createApi({
  reducerPath: "paymentGatewayApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["PaymentGateway"],
  endpoints: (builder) => ({
    getPaymentGatewaySettings: builder.query({
      query: () => ({
        url: "/payment-gateway",
        method: "GET",
      }),
      providesTags: ["PaymentGateway"],
    }),
    updatePaymentGatewaySettings: builder.mutation({
      query: (data) => ({
        url: "/payment-gateway",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["PaymentGateway"],
    }),
  }),
});

export const {
  useGetPaymentGatewaySettingsQuery,
  useUpdatePaymentGatewaySettingsMutation,
} = paymentGatewayApi;
