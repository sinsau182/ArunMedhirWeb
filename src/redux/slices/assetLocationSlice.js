import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getItemFromSessionStorage } from './sessionStorageSlice';

const API_BASE = 'http://localhost:8080/api/asset-settings/locations';

// Fetch all locations
export const fetchAssetLocations = createAsyncThunk(
  'assetLocations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const response = await axios.get(API_BASE, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch locations');
    }
  }
);

// Add a new location
export const addAssetLocation = createAsyncThunk(
  'assetLocations/add',
  async (location, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const response = await axios.post(API_BASE, location, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add location');
    }
  }
);

// Delete a location
export const deleteAssetLocation = createAsyncThunk(
  'assetLocations/delete',
  async (locationId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      await axios.delete(`${API_BASE}/${locationId}`, { headers: { Authorization: `Bearer ${token}` } });
      return locationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete location');
    }
  }
);

// Batch update locations
export const batchUpdateAssetLocations = createAsyncThunk(
  'assetLocations/batchUpdate',
  async (locations, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const response = await axios.patch(`${API_BASE}/batch`, locations, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to batch update locations');
    }
  }
);

const assetLocationSlice = createSlice({
  name: 'assetLocations',
  initialState: {
    locations: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchAssetLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAssetLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAssetLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations.push(action.payload);
      })
      .addCase(addAssetLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAssetLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssetLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = state.locations.filter(loc => loc.locationId !== action.payload && loc.id !== action.payload);
      })
      .addCase(deleteAssetLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(batchUpdateAssetLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchUpdateAssetLocations.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.locations = action.payload;
        }
      })
      .addCase(batchUpdateAssetLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default assetLocationSlice.reducer; 