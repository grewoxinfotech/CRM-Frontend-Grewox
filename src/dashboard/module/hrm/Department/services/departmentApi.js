import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const departmentApi = createApi({
    reducerPath: 'departmentApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Departments', 'DepartmentTypes'],
    endpoints: (builder) => ({
        // Get all departments
        getAllDepartments: builder.query({
            query: (params = {}) => {
                const { page = 1, pageSize = 10, search = '', ...rest } = params;
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    pageSize: pageSize.toString(),
                    ...(search && { search }),
                    ...rest
                }).toString();
                return `/departments?${queryParams}`;
            },
            transformResponse: (response) => {
                const data = response?.message?.data || [];
                const pagination = response?.message?.pagination || {};

                return {
                    data: data.map(department => ({
                        ...department,
                        key: department.id
                    })),
                    pagination
                };
            },
            providesTags: ['Departments'],
        }),

        // Create department
        createDepartment: builder.mutation({
            query: (data) => ({
                url: '/departments',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Departments'],
        }),

        // Update department
        updateDepartment: builder.mutation({
            query: ({ id, data }) => ({
                url: `/departments/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Departments'],
        }),

        // Delete department
        deleteDepartment: builder.mutation({
            query: (id) => ({
                url: `/departments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Departments'],
        }),

        // Get all department types
        getDepartmentTypes: builder.query({
            query: () => ({
                url: '/department-types',
                method: 'GET',
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to fetch department types');
            },
            providesTags: ['DepartmentTypes'],
        }),

        // Create department type
        createDepartmentType: builder.mutation({
            query: (data) => ({
                url: '/department-types',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to create department type');
            },
            invalidatesTags: ['DepartmentTypes'],
        }),

        // Update department type
        updateDepartmentType: builder.mutation({
            query: ({ id, data }) => ({
                url: `/department-types/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to update department type');
            },
            invalidatesTags: ['DepartmentTypes'],
        }),

        // Delete department type
        deleteDepartmentType: builder.mutation({
            query: (id) => ({
                url: `/department-types/${id}`,
                method: 'DELETE',
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to delete department type');
            },
            invalidatesTags: ['DepartmentTypes'],
        }),
    }),
});

export const {
    useGetAllDepartmentsQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
    useGetDepartmentTypesQuery,
    useCreateDepartmentTypeMutation,
    useUpdateDepartmentTypeMutation,
    useDeleteDepartmentTypeMutation,
} = departmentApi;
export default departmentApi;

