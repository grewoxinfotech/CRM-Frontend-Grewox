import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    filters: {
        status: null,
        search: '',
        date: null,
        interviewer: null,
        department: null
    },
    pagination: {
        current: 1,
        pageSize: 10,
        total: 0
    },
    sorting: {
        field: 'created_at',
        order: 'desc'
    },
    selectedInterview: null,
    interviewTypes: [
        { value: 'online', label: 'Online Interview' },
        { value: 'offline', label: 'Offline Interview' },
    ],
};

const interviewSlice = createSlice({
    name: 'interview',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
            // Reset pagination when filters change
            state.pagination.current = 1;
        },

        setPagination: (state, action) => {
            state.pagination = {
                ...state.pagination,
                ...action.payload
            };
        },

        setSorting: (state, action) => {
            state.sorting = {
                ...state.sorting,
                ...action.payload
            };
        },

        setSelectedInterview: (state, action) => {
            state.selectedInterview = action.payload;
        },

        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.current = 1;
        },

        // Additional reducers for interview-specific features
        updateInterviewStatus: (state, action) => {
            const { id, status } = action.payload;
            if (state.selectedInterview?.id === id) {
                state.selectedInterview.status = status;
            }
        },

        setInterviewFeedback: (state, action) => {
            const { id, feedback } = action.payload;
            if (state.selectedInterview?.id === id) {
                state.selectedInterview.feedback = feedback;
            }
        }
    }
});

export const {
    setFilters,
    setPagination,
    setSorting,
    setSelectedInterview,
    resetFilters,
    updateInterviewStatus,
    setInterviewFeedback
} = interviewSlice.actions;

// Selectors
export const selectInterviewFilters = (state) => state.interview.filters;
export const selectInterviewPagination = (state) => state.interview.pagination;
export const selectInterviewSorting = (state) => state.interview.sorting;
export const selectSelectedInterview = (state) => state.interview.selectedInterview;
export const selectInterviewTypes = (state) => state.interview.interviewTypes;
export const selectInterviewStatus = (state) => state.interview.interviewStatus;

export default interviewSlice.reducer; 