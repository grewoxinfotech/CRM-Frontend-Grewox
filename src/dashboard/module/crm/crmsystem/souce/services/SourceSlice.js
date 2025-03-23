import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pipelines: [],
  selectedPipeline: null,
  loading: false,
  error: null,
};

const pipelineSlice = createSlice({
  name: "pipeline",
  initialState,
  reducers: {
    setSelectedPipeline: (state, action) => {
      state.selectedPipeline = action.payload;
    },
    clearSelectedPipeline: (state) => {
      state.selectedPipeline = null;
    },
  },
});

export const { setSelectedPipeline, clearSelectedPipeline } =
  pipelineSlice.actions;
export default pipelineSlice.reducer;
