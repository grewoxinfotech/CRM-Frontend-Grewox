import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../store/baseQuery";

export const systemLogApi = createApi({
  reducerPath: "systemLogApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SystemLog", "SystemLogStats"],
  endpoints: (builder) => ({
    getLogs: builder.query({
      query: (params) => ({
        url: `/system-logs`,
        params,
      }),
      providesTags: ["SystemLog"],
    }),
    getLogStats: builder.query({
      query: () => `/system-logs/stats`,
      providesTags: ["SystemLogStats", "SystemLog"],
    }),
    resolveLogs: builder.mutation({
      query: (data) => ({
        url: `/system-logs/resolve`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SystemLog", "SystemLogStats"],
    }),
    clearLogs: builder.mutation({
      query: (data) => ({
        url: `/system-logs/clear`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SystemLog", "SystemLogStats"],
    }),
    simulateError: builder.mutation({
      query: (data) => ({
        url: `/system-logs/mock`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SystemLog", "SystemLogStats"],
    }),
  }),
});

export const {
  useGetLogsQuery,
  useGetLogStatsQuery,
  useResolveLogsMutation,
  useClearLogsMutation,
  useSimulateErrorMutation,
} = systemLogApi;
