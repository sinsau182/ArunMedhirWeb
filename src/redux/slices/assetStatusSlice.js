
//export default assetStatusSlice.reducer; //
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getItemFromSessionStorage } from './sessionStorageSlice';

const API_BASE = 'http://localhost:8080/api/asset-settings/status-labels';

// Fetch all status labels
export const fetchAssetStatuses = createAsyncThunk(
  'assetStatuses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(API_BASE, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch status labels');
    }
  }
);

// Add a new status label
export const addAssetStatus = createAsyncThunk(
  'assetStatuses/add',
  async (status, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(API_BASE, status, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add status label');
    }
  }
);

// Delete a status label
export const deleteAssetStatus = createAsyncThunk(
  'assetStatuses/delete',
  async (statusId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE}/${statusId}`, { headers });
      return statusId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete status label');
    }
  }
);

// Batch update status labels
export const batchUpdateAssetStatuses = createAsyncThunk(
  'assetStatuses/batchUpdate',
  async (statuses, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.patch(`${API_BASE}/batch`, statuses, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to batch update status labels');
    }
  }
);

const assetStatusSlice = createSlice({
  name: 'assetStatuses',
  initialState: {
    statuses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.statuses = action.payload;
      })
      .addCase(fetchAssetStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAssetStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAssetStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.statuses.push(action.payload);
      })
      .addCase(addAssetStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAssetStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssetStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.statuses = state.statuses.filter(st => st.statusId !== action.payload && st.id !== action.payload);
      })
      .addCase(deleteAssetStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(batchUpdateAssetStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchUpdateAssetStatuses.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.statuses = action.payload;
        }
      })
      .addCase(batchUpdateAssetStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default assetStatusSlice.reducer; 