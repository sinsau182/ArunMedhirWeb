import { createSlice } from "@reduxjs/toolkit";

const pipelineSlice = createSlice({
  name: "pipeline",
  initialState: {
    stages: [
      "New",
      "Contacted", 
      "Qualified",
      "Quoted",
      "Converted",
      "Lost",
      "Junk"
    ],
    loading: false,
    error: null,
  },
  reducers: {
    addStage: (state, action) => {
      const newStage = action.payload;
      if (!state.stages.includes(newStage)) {
        state.stages.push(newStage);
      }
    },
    removeStage: (state, action) => {
      const stageToRemove = action.payload;
      state.stages = state.stages.filter(stage => stage !== stageToRemove);
    },
    reorderStages: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.stages.splice(sourceIndex, 1);
      state.stages.splice(destinationIndex, 0, removed);
    },
    setStages: (state, action) => {
      state.stages = action.payload;
    },
  },
});

export const { addStage, removeStage, reorderStages, setStages } = pipelineSlice.actions;
export default pipelineSlice.reducer; 