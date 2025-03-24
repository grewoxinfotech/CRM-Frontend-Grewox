import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    filters: {
        status: 'all',
        jobId: null,
        searchTerm: '',
        dateRange: null,
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
    selectedApplication: null,
};

const jobApplicationSlice = createSlice({
    name: 'jobApplication',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        setSorting: (state, action) => {
            state.sorting = action.payload;
        },
        setSelectedApplication: (state, action) => {
            state.selectedApplication = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
    },
});

export const {
    setFilters,
    setPagination,
    setSorting,
    setSelectedApplication,
    resetFilters,
} = jobApplicationSlice.actions;

export default jobApplicationSlice.reducer; 