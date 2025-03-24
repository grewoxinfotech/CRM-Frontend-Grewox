import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    filters: {
        status: 'all',
        job: null,
        searchTerm: '',
        dateRange: null,
        salary: 'all',
        jobType: 'all'
    },
    pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
    },
    sorting: {
        field: 'created_at',
        order: 'desc',
    },
    selectedOfferLetter: null,
};

const offerLetterSlice = createSlice({
    name: 'offerLetter',
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
        setSelectedOfferLetter: (state, action) => {
            state.selectedOfferLetter = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        updateOfferLetterStatus: (state, action) => {
            const { id, status } = action.payload;
            if (state.selectedOfferLetter?.id === id) {
                state.selectedOfferLetter.status = status;
            }
        }
    },
});

export const {
    setFilters,
    setPagination,
    setSorting,
    setSelectedOfferLetter,
    resetFilters,
    updateOfferLetterStatus,
} = offerLetterSlice.actions;

export default offerLetterSlice.reducer; 