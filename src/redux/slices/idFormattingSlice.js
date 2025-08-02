//// id formatting  slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getItemFromSessionStorage } from './sessionStorageSlice';

const API_BASE = 'http://localhost:8080/api/asset-settings/id-formatting';

// Fetch ID formatting for all categories
export const fetchIdFormattings = createAsyncThunk(
  'idFormatting/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(API_BASE, { headers });

      console.log('Redux: Fetched ID formattings:', response.data);

      // Convert array to object with categoryId as key for easier access
      const formattingsByCategory = {};
      if (Array.isArray(response.data)) {
        response.data.forEach(format => {
          formattingsByCategory[format.categoryId] = format;
        });
      }

      return formattingsByCategory;
    } catch (error) {
      console.error('Redux: Error fetching ID formattings:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ID formattings');
    }
  }
);

// Add a new ID formatting
export const addIdFormatting = createAsyncThunk(
  'idFormatting/add',
  async (formattingData, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log('Redux: Adding ID formatting:', formattingData);

      const response = await axios.post(API_BASE, formattingData, { headers });

      console.log('Redux: Added ID formatting response:', response.data);

      return { categoryId: formattingData.categoryId, formatting: response.data };
    } catch (error) {
      console.error('Redux: Error adding ID formatting:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to add ID formatting');
    }
  }
);

// Update ID formatting for a category
export const updateIdFormatting = createAsyncThunk(
  'idFormatting/update',
  async ({ categoryId, formattingData }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log('Redux: Updating ID formatting for category:', categoryId, formattingData);

      const response = await axios.patch(`${API_BASE}/category/${categoryId}`, formattingData, { headers });

      console.log('Redux: Updated ID formatting response:', response.data);

      return { categoryId, formatting: response.data };
    } catch (error) {
      console.error('Redux: Error updating ID formatting:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update ID formatting');
    }
  }
);

const idFormattingSlice = createSlice({
  name: 'idFormatting',
  initialState: {
    formattingsByCategory: {}, // { categoryId: formatting }
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch ID formattings
      .addCase(fetchIdFormattings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIdFormattings.fulfilled, (state, action) => {
        state.loading = false;
        state.formattingsByCategory = action.payload;
      })
      .addCase(fetchIdFormattings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add ID formatting
      .addCase(addIdFormatting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addIdFormatting.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, formatting } = action.payload;
        state.formattingsByCategory[categoryId] = formatting;
      })
      .addCase(addIdFormatting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update ID formatting
      .addCase(updateIdFormatting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIdFormatting.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, formatting } = action.payload;
        state.formattingsByCategory[categoryId] = formatting;
      })
      .addCase(updateIdFormatting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = idFormattingSlice.actions;
export default idFormattingSlice.reducer; 