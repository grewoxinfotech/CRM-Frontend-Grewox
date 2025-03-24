import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  leads: [],
  selectedLead: null,
  filters: {
    search: "",
    status: "all",
    sortBy: "newest",
  },
};

const leadSlice = createSlice({
  name: "lead",
  initialState,
  reducers: {
    setLeads: (state, action) => {
      state.leads = action.payload;
    },
    setSelectedLead: (state, action) => {
      state.selectedLead = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setLeads, setSelectedLead, setFilters } = leadSlice.actions;

export const selectLeads = (state) => state.lead.leads;
export const selectSelectedLead = (state) => state.lead.selectedLead;
export const selectLeadFilters = (state) => state.lead.filters;

export default leadSlice.reducer;
