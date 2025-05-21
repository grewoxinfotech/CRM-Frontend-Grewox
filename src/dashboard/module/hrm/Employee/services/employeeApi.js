import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Employees"],
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: ({ page = 1, pageSize = -1, search = '' } = {}) => ({
        url: "/employees",
        method: "GET",
        params: {
          page,
          pageSize,
          search
        }
      }),
      transformResponse: (response) => {
        if (!response?.message?.data) return { data: [], total: 0 };

        const employees = response.message.data.map(employee => ({
          ...employee,
          id: employee.id,
          key: employee.id,
          employeeId: employee.employeeId,
          name: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'N/A',
          role_id: employee.role_id,
          branch: employee.branch,
          department: employee.department,
          designation: employee.designation,
          designation_name: employee.designation_name || 'N/A',
          designation_id: employee.designation,
          email: employee.email,
          phone: employee.phone,
          status: employee.status || 'active',
          salary: employee.salary || '0.00',
          profilePic: employee.profilePic
        }));

        return {
          data: employees,
          total: response.message.pagination.total || employees.length,
          pagination: response.message.pagination
        };
      }
    }),
    createEmployee: builder.mutation({
      query: (data) => ({
        url: "employees",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Employees"],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, data }) => ({
        url: `employees/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Employees"],
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employees"],
    }),
    verifySignup: builder.mutation({
      query: ({ otp }) => {
        const token = localStorage.getItem("verificationToken");
        return {
          url: "/auth/verify-signup",
          method: "POST",
          body: { otp },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
      invalidatesTags: ["Employees"],
    }),

    resendSignupOtp: builder.mutation({
      query: () => {
        const token = localStorage.getItem("verificationToken");
        return {
          url: "/auth/resend-signup-otp",
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useVerifySignupMutation,
  useResendSignupOtpMutation,
} = employeeApi;

export default employeeApi;
