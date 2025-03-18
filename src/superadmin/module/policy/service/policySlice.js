import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    policies: [],
    selectedPolicy: null,
    loading: false,
    error: null
};

const policySlice = createSlice({
    name: 'policy',
    initialState,
    reducers: {
        setPolicies: (state, action) => {
            state.policies = action.payload;
        },
        setSelectedPolicy: (state, action) => {
            state.selectedPolicy = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    }
});

export const {
    setPolicies,
    setSelectedPolicy,
    setLoading,
    setError,
    clearError
} = policySlice.actions;

export default policySlice.reducer; 