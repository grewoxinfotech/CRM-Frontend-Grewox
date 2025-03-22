import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isModalOpen: false,
    selectedTask: null,
    filters: {
        search: '',
        page: 1,
        limit: 10,
        status: null,
        priority: null,
    },
    sortConfig: {
        field: 'createdAt',
        direction: 'desc',
    },
};

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        setIsModalOpen: (state, action) => {
            state.isModalOpen = action.payload;
        },
        setSelectedTask: (state, action) => {
            state.selectedTask = action.payload;
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
    setSelectedTask,
    setFilters,
    setSortConfig,
    resetFilters,
    resetState,
} = taskSlice.actions;

export default taskSlice.reducer; 