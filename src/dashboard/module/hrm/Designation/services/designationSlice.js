import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    designations: [],
    selectedDesignation: null,
    branchTypes: [],
    selectedBranchType: null,
    loading: false,
    error: null,
};

const designationSlice = createSlice({
    name: 'designation',
    initialState,
    reducers: {
        setDesignations: (state, action) => {
            state.designations = action.payload;
        },
        setSelectedDesignation: (state, action) => {
            state.selectedDesignation = action.payload;
        },
        setBranchTypes: (state, action) => {
            state.branchTypes = action.payload;
        },
        setSelectedBranchType: (state, action) => {
            state.selectedBranchType = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetDesignation: (state) => {
            state.selectedDesignation = null;
        },
        resetBranchType: (state) => {
            state.selectedBranchType = null;
        },
        addDesignation: (state, action) => {
            state.designations.push(action.payload);
        },
        updateDesignationInList: (state, action) => {
            const index = state.designations.findIndex(d => d.id === action.payload.id);
            if (index !== -1) {
                state.designations[index] = action.payload;
            }
        },
        removeDesignation: (state, action) => {
            state.designations = state.designations.filter(d => d.id !== action.payload);
        },
        addBranchType: (state, action) => {
            state.branchTypes.push(action.payload);
        },
        updateBranchTypeInList: (state, action) => {
            const index = state.branchTypes.findIndex(bt => bt.id === action.payload.id);
            if (index !== -1) {
                state.branchTypes[index] = action.payload;
            }
        },
        removeBranchType: (state, action) => {
            state.branchTypes = state.branchTypes.filter(bt => bt.id !== action.payload);
        },
    },
});

export const {
    setDesignations,
    setSelectedDesignation,
    setBranchTypes,
    setSelectedBranchType,
    setLoading,
    setError,
    clearError,
    resetDesignation,
    resetBranchType,
    addDesignation,
    updateDesignationInList,
    removeDesignation,
    addBranchType,
    updateBranchTypeInList,
    removeBranchType,
} = designationSlice.actions;

export default designationSlice.reducer;
