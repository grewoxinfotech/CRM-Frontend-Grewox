import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lables: [],
  selectedLable: null,
};

const lableSlice = createSlice({
  name: "lable",
  initialState,
  reducers: {
    setLables: (state, action) => {
      state.lables = action.payload;
    },
    setSelectedLable: (state, action) => {
      state.selectedLable = action.payload;
    },
  },
});

export const { setLables, setSelectedLable } = lableSlice.actions;
export default lableSlice.reducer;
