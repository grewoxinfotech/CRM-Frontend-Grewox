import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    subclients: [],
    selectedSubclient: null,
    isModalOpen: false,
    isEditing: false,
    status: 'active', // Default status filter
    searchQuery: '', // Search query
    viewMode: 'table', // View mode preference (table/card)
    filters: {
        status: 'all',
        dateRange: null,
        type: 'all'
    }
};

const subclientSlice = createSlice({
    name: 'subclient',
    initialState,
    reducers: {
        setSubclients: (state, action) => {
            state.subclients = action.payload;
        },
        setSelectedSubclient: (state, action) => {
            state.selectedSubclient = action.payload;
        },
        setIsModalOpen: (state, action) => {
            state.isModalOpen = action.payload;
        },
        setIsEditing: (state, action) => {
            state.isEditing = action.payload;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetSubclientState: (state) => {
            state.selectedSubclient = null;
            state.isModalOpen = false;
            state.isEditing = false;
            state.status = 'active';
            state.searchQuery = '';
            state.filters = {
                status: 'all',
                dateRange: null,
                type: 'all'
            };
        },
        addSubclient: (state, action) => {
            state.subclients.unshift(action.payload);
        },
        updateSubclient: (state, action) => {
            const { id, data } = action.payload;
            const index = state.subclients.findIndex(sub => sub.id === id);
            if (index !== -1) {
                state.subclients[index] = { ...state.subclients[index], ...data };
            }
        },
        deleteSubclient: (state, action) => {
            state.subclients = state.subclients.filter(sub => sub.id !== action.payload);
        },
        updateSubclientStatus: (state, action) => {
            const { id, status } = action.payload;
            const subclient = state.subclients.find(sub => sub.id === id);
            if (subclient) {
                subclient.status = status;
            }
        },
        setSortConfig: (state, action) => {
            state.sortConfig = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {
                status: 'all',
                dateRange: null,
                type: 'all'
            };
        }
    },
});

export const {
    setSubclients,
    setSelectedSubclient,
    setIsModalOpen,
    setIsEditing,
    setStatus,
    setSearchQuery,
    setViewMode,
    setFilters,
    resetSubclientState,
    addSubclient,
    updateSubclient,
    deleteSubclient,
    updateSubclientStatus,
    setSortConfig,
    clearFilters
} = subclientSlice.actions;

export default subclientSlice.reducer;
