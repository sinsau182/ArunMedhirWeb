import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';
import getConfig from "next/config";
const {publicRuntimeConfig} = getConfig();
const API_URL = publicRuntimeConfig.apiURL;

// Fetch departments
export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = sessionStorage.getItem("currentCompanyId");
      const response = await axios.get(`${API_URL}/departments/company/${company}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch departments"
        );
      }
      return rejectWithValue("Network error: Unable to fetch departments");
    }
  }
);

// Create department
export const createDepartment = createAsyncThunk(
  "department/createDepartment",
  async (departmentData, { rejectWithValue, dispatch }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.post(
        `${API_URL}/departments`,
        departmentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Fetch updated departments after successful creation
      await dispatch(fetchDepartments());
      return response.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        if (error.response.status === 409) {
          return rejectWithValue("Department already exists");
        }
        return rejectWithValue(message || "Failed to create department");
      }
      return rejectWithValue("Network error: Unable to create department");
    }
  }
);

// Update department
export const updateDepartment = createAsyncThunk(
  "department/updateDepartment",
  async ({ id, departmentData }, { rejectWithValue, dispatch }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.put(
        `${API_URL}/departments/${id}`,
        departmentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // After successfully updating, fetch updated list
      await dispatch(fetchDepartments());
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        switch (error.response.status) {
          case 400:
            return rejectWithValue(
              "Invalid department data. Please check all fields."
            );
          case 401:
            return rejectWithValue("Session expired. Please login again.");
          case 404:
            return rejectWithValue("Department not found.");
          case 409:
            return rejectWithValue("Department with this name already exists.");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              errorData.message ||
                errorData.error ||
                "Failed to update department"
            );
        }
      }
      return rejectWithValue("Network error: Unable to update department");
    }
  }
);

// Delete department
export const deleteDepartment = createAsyncThunk(
  "department/deleteDepartment",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      await axios.delete(`${API_URL}/departments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // After successfully deleting, fetch updated list
      await dispatch(fetchDepartments());
      return id;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        switch (error.response.status) {
          case 401:
            return rejectWithValue("Session expired. Please login again.");
          case 404:
            return rejectWithValue("Department not found.");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              errorData.message ||
                errorData.error ||
                "Failed to delete department"
            );
        }
      }
      return rejectWithValue("Network error: Unable to delete department");
    }
  }
);

const departmentSlice = createSlice({
  name: "department",
  initialState: {
    loading: false,
    error: null,
    success: false,
    departments: [],
    lastUpdated: null,
    deleteSuccess: false,
    updateSuccess: false,
  },
  reducers: {
    resetDepartmentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.deleteSuccess = false;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.departments = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createDepartment.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateDepartment.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.updateSuccess = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      .addCase(deleteDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteDepartment.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.deleteSuccess = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deleteSuccess = false;
      });
  },
});

export const { resetDepartmentState } = departmentSlice.actions;
export default departmentSlice.reducer;
