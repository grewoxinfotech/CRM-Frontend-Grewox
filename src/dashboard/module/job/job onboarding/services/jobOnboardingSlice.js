import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    filters: {
        status: 'all',
        interviewer: null,
        searchTerm: '',
        dateRange: null,
        salaryType: 'all',
        jobType: 'all'
    },
    pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
    },
    sorting: {
        field: 'joining_date',
        order: 'desc',
    },
    selectedOnboarding: null,
};

const jobOnboardingSlice = createSlice({
    name: 'jobOnboarding',
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
        setSelectedOnboarding: (state, action) => {
            state.selectedOnboarding = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        updateOnboardingStatus: (state, action) => {
            const { id, status } = action.payload;
            if (state.selectedOnboarding?.id === id) {
                state.selectedOnboarding.status = status;
            }
        },
        updateOnboardingProgress: (state, action) => {
            const { id, tasksCompleted, documentsSubmitted } = action.payload;
            if (state.selectedOnboarding?.id === id) {
                state.selectedOnboarding.tasks_completed = tasksCompleted;
                state.selectedOnboarding.documents_submitted = documentsSubmitted;
            }
        }
    },
});

export const {
    setFilters,
    setPagination,
    setSorting,
    setSelectedOnboarding,
    resetFilters,
    updateOnboardingStatus,
    updateOnboardingProgress,
} = jobOnboardingSlice.actions;

export default jobOnboardingSlice.reducer; 