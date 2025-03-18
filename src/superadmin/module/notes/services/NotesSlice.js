import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notes: [],
  selectedNote: null,
  isModalOpen: false,
  isEditing: false,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    setSelectedNote: (state, action) => {
      state.selectedNote = action.payload;
    },
    setIsModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    setIsEditing: (state, action) => {
      state.isEditing = action.payload;
    },
    resetNoteState: (state) => {
      state.selectedNote = null;
      state.isModalOpen = false;
      state.isEditing = false;
    },
  },
});

export const {
  setNotes,
  setSelectedNote,
  setIsModalOpen,
  setIsEditing,
  resetNoteState,
} = notesSlice.actions;

export default notesSlice.reducer;
