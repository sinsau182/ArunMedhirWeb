import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import getConfig from 'next/config';
import { getItemFromSessionStorage } from './sessionStorageSlice';
const { publicRuntimeConfig } = getConfig();

const API_BASE = 'http://localhost:8080/api/asset-settings/categories';

// Fetch all categories
export const fetchAssetCategories = createAsyncThunk(
  'assetCategories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      console.log('fetchAssetCategories: token:', getItemFromSessionStorage('token', null));
      const response = await axios.get(API_BASE, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Add a new category
export const addAssetCategory = createAsyncThunk(
  'assetCategories/add',
  async (category, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(API_BASE, category, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add category');
    }
  }
);

// Update a category (edit)
export const updateAssetCategory = createAsyncThunk(
  'assetCategories/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.patch(`${API_BASE}/${id}`, data, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

// Batch update categories
export const batchUpdateAssetCategories = createAsyncThunk(
  'assetCategories/batchUpdate',
  async (categories, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.patch(
        'http://localhost:8080/api/asset-settings/categories/batch',
        categories,
        { headers }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to batch update categories');
    }
  }
);

// Delete a category
export const deleteAssetCategory = createAsyncThunk(
  'assetCategories/delete',
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`http://localhost:8080/api/asset-settings/categories/${categoryId}`, { headers });
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

const assetCategorySlice = createSlice({
  name: 'assetCategories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAssetCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAssetCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAssetCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(addAssetCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAssetCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssetCategory.fulfilled, (state, action) => {
        state.loading = false;
        // Update the category in the array
        const idx = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (idx !== -1) {
          state.categories[idx] = action.payload;
        }
      })
      .addCase(updateAssetCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(batchUpdateAssetCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchUpdateAssetCategories.fulfilled, (state, action) => {
        state.loading = false;
        // Replace categories with updated ones from response if provided
        if (Array.isArray(action.payload)) {
          state.categories = action.payload;
        }
      })
      .addCase(batchUpdateAssetCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAssetCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssetCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(cat => cat.categoryId !== action.payload && cat.id !== action.payload);
      })
      .addCase(deleteAssetCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default assetCategorySlice.reducer; 