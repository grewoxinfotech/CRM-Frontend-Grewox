import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isModalOpen: false,
    selectedBranch: null,
    selectedCompanyType: null,
    selectedServices: [],
    filters: {
        search: '',
        page: 1,
        limit: 10,
        companyType: null,
    },
    sortConfig: {
        field: 'createdAt',
        direction: 'desc',
    },
};

const branchSlice = createSlice({
    name: 'branch',
    initialState,
    reducers: {
        setIsModalOpen: (state, action) => {
            state.isModalOpen = action.payload;
        },
        setSelectedBranch: (state, action) => {
            state.selectedBranch = action.payload;
        },
        setSelectedCompanyType: (state, action) => {
            state.selectedCompanyType = action.payload;
        },
        setSelectedServices: (state, action) => {
            state.selectedServices = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setSortConfig: (state, action) => {
            state.sortConfig = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        resetState: (state) => {
            return initialState;
        },
    },
});

export const {
    setIsModalOpen,
    setSelectedBranch,
    setSelectedCompanyType,
    setSelectedServices,
    setFilters,
    setSortConfig,
    resetFilters,
    resetState,
} = branchSlice.actions;

export default branchSlice.reducer;
