import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setItem, getItem, removeItem } from "./sessionStorageSlice";
import getConfig from "next/config";
// Define the base URLs
const {publicRuntimeConfig} = getConfig();
const SUPERADMIN_BASE_URL = publicRuntimeConfig.apiURL + "/auth";
const EMPLOYEE_BASE_URL = publicRuntimeConfig.apiURL + "/api/auth";

// Helper function to determine which base URL to use
const getBaseUrl = (isSuperadmin) => {
  return isSuperadmin ? SUPERADMIN_BASE_URL : EMPLOYEE_BASE_URL;
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ userData, isSuperadmin }, { rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl(isSuperadmin);
      const response = await axios.post(`${baseUrl}/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ credentials, isSuperadmin }, { dispatch, rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl(isSuperadmin);
      const response = await axios.post(`${baseUrl}/login`, credentials);
      if (response.data.token) {
        // Store token in sessionStorage using sessionStorageSlice
        await dispatch(setItem({ key: 'token', value: response.data.token }));
        await sessionStorage.setItem('roles', JSON.stringify(response.data.roles));
        await sessionStorage.setItem('employeeId', response.data.employeeId);
        if (!response.data.passwordChanged) {
          await sessionStorage.setItem('passwordChanged', response.data.passwordChanged);
        }
        await sessionStorage.setItem('departmentName', response.data.departmentName);
        // Store the user type in sessionStorage
        await sessionStorage.setItem('isSuperadmin', isSuperadmin);
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    // Remove token from sessionStorage using sessionStorageSlice
    await dispatch(removeItem({ key: 'token' }));
    return null;
  }
);

export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Get token from sessionStorage using sessionStorageSlice
      const result = await dispatch(getItem({ key: 'token' })).unwrap();
      if (!result || !result.value) {
        throw new Error("No token found");
      }
      return { token: result.value };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      })
      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
