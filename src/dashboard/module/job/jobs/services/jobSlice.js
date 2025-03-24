import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    jobs: [],
    selectedJob: null,
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

const jobSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {
        setJobs: (state, action) => {
            state.jobs = action.payload;
        },
        setJobTypes: (state, action) => {
            state.jobTypes = action.payload;
        },
        setSelectedJob: (state, action) => {
            state.selectedJob = action.payload;
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
    setJobs,
    setJobTypes,
    setSelectedJob,
    setIsModalOpen,
    setFilters,
    setPagination,
    setSorting,
    resetFilters,
    resetPagination,
    resetState,
} = jobSlice.actions;

export default jobSlice.reducer;
