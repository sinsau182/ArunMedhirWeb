import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getItemFromSessionStorage } from './sessionStorageSlice';

const getAuthHeaders = () => {
  const token = getItemFromSessionStorage("token", null);

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchPipelines = createAsyncThunk('pipelines/fetch', async () => {
  const res = await axios.get('http://localhost:8080/pipelines', {
    headers: getAuthHeaders(),
  });
  return res.data;
});

export const createPipeline = createAsyncThunk(
  'pipelines/create',
  async (pipelineData, { rejectWithValue }) => {
    try {
      const res = await axios.post('http://localhost:8080/pipelines', pipelineData, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePipeline = createAsyncThunk(
  'pipelines/delete',
  async (pipelineId, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:8080/pipelines/${pipelineId}`, {
        headers: getAuthHeaders(),
      });
      return pipelineId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const pipelineSlice = createSlice({
  name: 'pipelines',
  initialState: { pipelines: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPipelines.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPipelines.fulfilled, (state, action) => {
        state.pipelines = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchPipelines.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createPipeline.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createPipeline.fulfilled, (state, action) => {
        state.pipelines.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(createPipeline.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deletePipeline.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deletePipeline.fulfilled, (state, action) => {
        state.pipelines = state.pipelines.filter(p => p.id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deletePipeline.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default pipelineSlice.reducer; 