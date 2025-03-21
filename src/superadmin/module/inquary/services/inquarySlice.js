import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    inquiries: [],
    selectedInquiry: null,
    isModalOpen: false,
    isEditing: false,
    status: 'pending', // Add status filter
    searchQuery: '', // Add search query
    viewMode: 'table', // Add view mode preference
};

const inquirySlice = createSlice({
    name: 'inquiry',
    initialState,
    reducers: {
        setInquiries: (state, action) => {
            state.inquiries = action.payload;
        },
        setSelectedInquiry: (state, action) => {
            state.selectedInquiry = action.payload;
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
        resetInquiryState: (state) => {
            state.selectedInquiry = null;
            state.isModalOpen = false;
            state.isEditing = false;
            state.status = 'pending';
            state.searchQuery = '';
        },
        addInquiry: (state, action) => {
            state.inquiries.unshift(action.payload);
        },
        updateInquiry: (state, action) => {
            const { id, data } = action.payload;
            const index = state.inquiries.findIndex(inq => inq.id === id);
            if (index !== -1) {
                state.inquiries[index] = { ...state.inquiries[index], ...data };
            }
        },
        deleteInquiry: (state, action) => {
            state.inquiries = state.inquiries.filter(inq => inq.id !== action.payload);
        },
    },
});

export const {
    setInquiries,
    setSelectedInquiry,
    setIsModalOpen,
    setIsEditing,
    setStatus,
    setSearchQuery,
    setViewMode,
    resetInquiryState,
    addInquiry,
    updateInquiry,
    deleteInquiry,
} = inquirySlice.actions;

export default inquirySlice.reducer;
