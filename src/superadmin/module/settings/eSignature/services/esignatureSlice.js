import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  signatures: [],
  loading: false,
  error: null,
  selectedSignature: null
};

const esignatureSlice = createSlice({
  name: 'esignature',
  initialState,
  reducers: {
    setSignatures: (state, action) => {
      state.signatures = action.payload;
      state.loading = false;
      state.error = null;
    },
    addSignature: (state, action) => {
      state.signatures.push(action.payload);
    },
    updateSignature: (state, action) => {
      const index = state.signatures.findIndex(sig => sig.id === action.payload.id);
      if (index !== -1) {
        state.signatures[index] = action.payload;
      }
    },
    removeSignature: (state, action) => {
      state.signatures = state.signatures.filter(sig => sig.id !== action.payload);
    },
    setSelectedSignature: (state, action) => {
      state.selectedSignature = action.payload;
    },
    clearSelectedSignature: (state) => {
      state.selectedSignature = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setSignatures,
  addSignature,
  updateSignature,
  removeSignature,
  setSelectedSignature,
  clearSelectedSignature,
  setLoading,
  setError
} = esignatureSlice.actions;

export default esignatureSlice.reducer;
