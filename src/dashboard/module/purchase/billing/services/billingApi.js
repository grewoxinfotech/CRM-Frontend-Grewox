import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const billingApi = createApi({
  reducerPath: "billingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Billings", "Vendor"],
  endpoints: (builder) => ({
    // Get all bills for a company
    getBillings: builder.query({
      query: (params) => {
        const { page = 1, limit = 10, search = '', companyId, ...rest } = params || {};
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(companyId && { company_id: companyId }),
          ...rest
        }).toString();
        return `/bills?${queryParams}`;
      },
      providesTags: ["Billings"],
    }),

    // Create new bill
    createBilling: builder.mutation({
      query: (data) => ({
        url: '/bills',
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Billings"],
    }),

    // Get single bill by ID
    getBillById: builder.query({
      query: (id) => `/bills/${id}`,
      providesTags: ["Billings"],
    }),

    // Update bill
    updateBilling: builder.mutation({
      query: ({ id, data }) => ({
        url: `/bills/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Billings"],
    }),

    // Delete bill
    deleteBilling: builder.mutation({
      query: (id) => ({
        url: `/bills/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Billings"],
    }),

    // Download bill
    downloadBill: builder.query({
      query: (id) => `/bills/download/${id}`,
    }),

    // Get vendors
    getVendors: builder.query({
      query: () => '/vendors',
      providesTags: ["Vendor"],
    }),
  }),
});

export const {
  useGetBillingsQuery,
  useCreateBillingMutation,
  useUpdateBillingMutation,
  useDeleteBillingMutation,
  useGetBillByIdQuery,
  useDownloadBillQuery,
  useGetVendorsQuery,
} = billingApi;

export default billingApi;
