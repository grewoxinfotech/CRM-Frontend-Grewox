import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    departments: [],
    departmentTypes: [],
    selectedDepartment: null,
    isModalOpen: false,
    filters: {
        search: '',
        type: '',
        status: '',
        dateRange: [],
    },
    pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
    },
    sorting: {
        field: 'createdAt',
        order: 'desc',
    },
};

const departmentSlice = createSlice({
    name: 'department',
    initialState,
    reducers: {
        setDepartments: (state, action) => {
            state.departments = action.payload;
        },
        setDepartmentTypes: (state, action) => {
            state.departmentTypes = action.payload;
        },
        setSelectedDepartment: (state, action) => {
            state.selectedDepartment = action.payload;
        },
        setIsModalOpen: (state, action) => {
            state.isModalOpen = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setPagination: (state, action) => {
            state.pagination = {
                ...state.pagination,
                ...action.payload,
            };
        },
        setSorting: (state, action) => {
            state.sorting = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        resetPagination: (state) => {
            state.pagination = initialState.pagination;
        },
        resetState: () => initialState,
    },
});

export const {
    setDepartments,
    setDepartmentTypes,
    setSelectedDepartment,
    setIsModalOpen,
    setFilters,
    setPagination,
    setSorting,
    resetFilters,
    resetPagination,
    resetState,
} = departmentSlice.actions;

export default departmentSlice.reducer;