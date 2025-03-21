import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const employeeApi = createApi({
    reducerPath: 'employeeApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Employee'],
    endpoints: (builder) => ({
        // Get all employees with pagination, search, and filters
        getAllEmployees: builder.query({
            query: ({ 
                page = 1, 
                limit = 10, 
                search = '',
                branchId = '',
                department = '',
                designation = '',
                status = ''
            }) => ({
                url: '/employees',
                method: 'GET',
                params: {
                    page,
                    limit,
                    search,
                    branchId,
                    department,
                    designation,
                    status
                }
            }),
            providesTags: ['Employee'],
        }),

        // Get employee by ID
        getEmployeeById: builder.query({
            query: (id) => ({
                url: `/employees/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Employee', id }],
        }),

        // Create new employee
        createEmployee: builder.mutation({
            query: (data) => ({
                url: '/employees',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Employee'],
        }),

        // Update employee
        updateEmployee: builder.mutation({
            query: ({ id, data }) => ({
                url: `/employees/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Employee'],
        }),

        // Delete employee
        deleteEmployee: builder.mutation({
            query: (id) => ({
                url: `/employees/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Employee'],
        }),
    }),
});

export const {
    useGetAllEmployeesQuery,
    useGetEmployeeByIdQuery,
    useCreateEmployeeMutation,
    useUpdateEmployeeMutation,
    useDeleteEmployeeMutation,
} = employeeApi;

export default employeeApi; 