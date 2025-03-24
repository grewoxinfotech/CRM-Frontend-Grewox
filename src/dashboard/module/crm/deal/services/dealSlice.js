import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  deals: [],
  selectedDeal: null,
  filters: {
    search: "",
    status: "all",
    sortBy: "newest",
  },
};

const dealSlice = createSlice({
  name: "deal",
  initialState,
  reducers: {
    setDeals: (state, action) => {
      state.deals = action.payload;
    },
    setSelectedDeal: (state, action) => {
      state.selectedDeal = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setDeals, setSelectedDeal, setFilters } = dealSlice.actions;
export default dealSlice.reducer;
