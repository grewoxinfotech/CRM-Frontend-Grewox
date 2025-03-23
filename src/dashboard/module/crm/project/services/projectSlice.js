import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isModalOpen: false,
    selectedProject: null,
    filters: {
        search: '',
        page: 1,
        limit: 10,
        status: null,
        category: null,
    },
    sortConfig: {
        field: 'createdAt',
        direction: 'desc',
    },
};

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setIsModalOpen: (state, action) => {
            state.isModalOpen = action.payload;
        },
        setSelectedProject: (state, action) => {
            state.selectedProject = action.payload;
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
        resetState: () => initialState,
    },
});

export const {
    setIsModalOpen,
    setSelectedProject,
    setFilters,
    setSortConfig,
    resetFilters,
    resetState,
} = projectSlice.actions;

export default projectSlice.reducer; 