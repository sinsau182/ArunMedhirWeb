import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getItemFromSessionStorage } from './sessionStorageSlice';

const API_BASE = 'http://localhost:8080/api/asset-settings/custom-fields';

// Fetch custom fields for a category
export const fetchCustomFields = createAsyncThunk(
  'customFields/fetchByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = `${API_BASE}?categoryId=${categoryId}`;
      
      console.log('Redux: Fetching custom fields from API:', apiUrl);
      console.log('Redux: Category ID:', categoryId);
      
      const response = await axios.get(apiUrl, { headers });
      
      console.log('Redux: API Response for category', categoryId, ':', response.data);
      
      // Map _id to id for consistency
      const mappedFields = Array.isArray(response.data) 
        ? response.data.map(field => ({
            ...field,
            id: field.id || field._id
          }))
        : [];
      
      console.log('Redux: Mapped fields for category', categoryId, ':', mappedFields);
      
      return { categoryId, fields: mappedFields };
    } catch (error) {
      console.error('Redux: Error fetching custom fields for category', categoryId, ':', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch custom fields');
    }
  }
);

// Add a new custom field
export const addCustomField = createAsyncThunk(
  'customFields/add',
  async (fieldData, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(API_BASE, fieldData, { headers });
      
      // Map _id to id for consistency
      const mappedField = {
        ...response.data,
        id: response.data.id || response.data._id
      };
      
      return { categoryId: fieldData.categoryId, field: mappedField };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add custom field');
    }
  }
);

// Enable/Disable a custom field
export const toggleCustomFieldStatus = createAsyncThunk(
  'customFields/toggleStatus',
  async ({ id, enabled }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.patch(`${API_BASE}/${id}/enable`, { enabled }, { headers });
      
      // Map _id to id for consistency
      const mappedField = {
        ...response.data,
        id: response.data.id || response.data._id
      };
      
      return { id, enabled, field: mappedField };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle field status');
    }
  }
);

// Delete a custom field
export const deleteCustomField = createAsyncThunk(
  'customFields/delete',
  async (id, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE}/${id}`, { headers });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete custom field');
    }
  }
);

// Update custom fields for a category (batch update)
export const updateCustomFieldsForCategory = createAsyncThunk(
  'customFields/updateCategory',
  async ({ categoryId, fields }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.patch(`${API_BASE}/category/${categoryId}`, fields, { headers });
      
      // Map _id to id for consistency
      const mappedFields = Array.isArray(response.data) 
        ? response.data.map(field => ({
            ...field,
            id: field.id || field._id
          }))
        : [];
      
      return { categoryId, fields: mappedFields };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update custom fields');
    }
  }
);

const customFieldsSlice = createSlice({
  name: 'customFields',
  initialState: {
    fieldsByCategory: {}, // { categoryId: [fields] }
    loading: false,
    error: null,
  },
  reducers: {
    clearFieldsForCategory: (state, action) => {
      const categoryId = action.payload;
      if (state.fieldsByCategory[categoryId]) {
        delete state.fieldsByCategory[categoryId];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch custom fields
      .addCase(fetchCustomFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomFields.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, fields } = action.payload;
        state.fieldsByCategory[categoryId] = fields;
      })
      .addCase(fetchCustomFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add custom field
      .addCase(addCustomField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCustomField.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, field } = action.payload;
        if (!state.fieldsByCategory[categoryId]) {
          state.fieldsByCategory[categoryId] = [];
        }
        state.fieldsByCategory[categoryId].push(field);
      })
      .addCase(addCustomField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle field status
      .addCase(toggleCustomFieldStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleCustomFieldStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, enabled } = action.payload;
        // Update the field in all categories
        Object.keys(state.fieldsByCategory).forEach(categoryId => {
          const fieldIndex = state.fieldsByCategory[categoryId].findIndex(f => (f.id || f._id) === id);
          if (fieldIndex !== -1) {
            state.fieldsByCategory[categoryId][fieldIndex].enabled = enabled;
          }
        });
      })
      .addCase(toggleCustomFieldStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete custom field
      .addCase(deleteCustomField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomField.fulfilled, (state, action) => {
        state.loading = false;
        const fieldId = action.payload;
        // Remove field from all categories
        Object.keys(state.fieldsByCategory).forEach(categoryId => {
          state.fieldsByCategory[categoryId] = state.fieldsByCategory[categoryId].filter(f => (f.id || f._id) !== fieldId);
        });
      })
      .addCase(deleteCustomField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update category fields
      .addCase(updateCustomFieldsForCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomFieldsForCategory.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, fields } = action.payload;
        state.fieldsByCategory[categoryId] = fields;
      })
      .addCase(updateCustomFieldsForCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFieldsForCategory } = customFieldsSlice.actions;
export default customFieldsSlice.reducer; 