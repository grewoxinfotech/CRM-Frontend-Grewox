import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../store/baseQuery";

export const maintenanceApi = createApi({
  reducerPath: "maintenanceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Maintenance"],
  endpoints: (builder) => ({
    getMaintenance: builder.query({
      query: () => `/maintenance`,
      providesTags: ["Maintenance"],
    }),
    getMaintenanceHistory: builder.query({
      query: () => `/maintenance/history`,
      providesTags: ["Maintenance"],
    }),
    saveMaintenance: builder.mutation({
      query: (data) => ({
        url: `/maintenance`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Maintenance"],
    }),
  }),
});

export const {
  useGetMaintenanceQuery,
  useGetMaintenanceHistoryQuery,
  useSaveMaintenanceMutation,
} = maintenanceApi;
