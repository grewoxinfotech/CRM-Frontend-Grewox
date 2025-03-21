import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isModalOpen: false,
    selectedEmployee: null,
    filters: {
        search: '',
        branchId: '',
        department: '',
        designation: '',
        status: '',
        page: 1,
        limit: 10
    },
    sort: {
        field: 'createdAt',
        order: 'desc'
    }
};

const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
        setIsModalOpen: (state, action) => {
            state.isModalOpen = action.payload;
        },
        setSelectedEmployee: (state, action) => {
            state.selectedEmployee = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        },
        setSort: (state, action) => {
            state.sort = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        resetState: (state) => {
            return initialState;
        }
    }
});

export const {
    setIsModalOpen,
    setSelectedEmployee,
    setFilters,
    setSort,
    resetFilters,
    resetState
} = employeeSlice.actions;

export default employeeSlice.reducer; 