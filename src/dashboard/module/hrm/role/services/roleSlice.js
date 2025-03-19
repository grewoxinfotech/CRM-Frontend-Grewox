import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    roles: [],
    selectedRole: null,
    isModalOpen: false,
    isEditing: false,
    loading: false,
    error: null,
    filters: {
        search: '',
        page: 1,
        limit: 10
    }
};

const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        setRoles: (state, action) => {
            state.roles = action.payload;
        },
        setSelectedRole: (state, action) => {
            state.selectedRole = action.payload;
        },
        setIsModalOpen: (state, action) => {
            state.isModalOpen = action.payload;
        },
        setIsEditing: (state, action) => {
            state.isEditing = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        resetRoleState: (state) => {
            state.selectedRole = null;
            state.isModalOpen = false;
            state.isEditing = false;
            state.error = null;
        }
    }
});

export const {
    setRoles,
    setSelectedRole,
    setIsModalOpen,
    setIsEditing,
    setLoading,
    setError,
    setFilters,
    resetFilters,
    resetRoleState
} = roleSlice.actions;

export default roleSlice.reducer; 