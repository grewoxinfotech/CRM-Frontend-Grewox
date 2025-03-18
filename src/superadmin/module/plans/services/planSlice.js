import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedPlan: null,
    filters: {
        search: '',
        page: 1,
        limit: 10
    },
    viewMode: 'card'
};

const planSlice = createSlice({
    name: 'plan',
    initialState,
    reducers: {
        setSelectedPlan: (state, action) => {
            state.selectedPlan = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        }
    }
});

export const {
    setSelectedPlan,
    setFilters,
    setViewMode,
    resetFilters
} = planSlice.actions;

export default planSlice.reducer; 