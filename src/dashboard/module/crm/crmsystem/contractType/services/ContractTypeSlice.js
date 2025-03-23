import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  contractTypes: [],
  selectedContractType: null,
};

const contractTypeSlice = createSlice({
  name: "contractType",
  initialState,
  reducers: {
    setContractTypes: (state, action) => {
      state.contractTypes = action.payload;
    },
    setSelectedContractType: (state, action) => {
      state.selectedContractType = action.payload;
    },
  },
});

export const { setContractTypes, setSelectedContractType } =
  contractTypeSlice.actions;
export const selectContractTypes = (state) => state.contractType.contractTypes;
export const selectSelectedContractType = (state) =>
  state.contractType.selectedContractType;

export default contractTypeSlice.reducer;
