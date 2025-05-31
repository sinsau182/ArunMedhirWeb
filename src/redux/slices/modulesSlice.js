import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = `${publicRuntimeConfig.apiURL}/superadmin/modules`;
const HR_EMPLOYEES_ENDPOINT = `${publicRuntimeConfig.apiURL}/employees/minimal`;

// Fetch modules
export const fetchModules = createAsyncThunk(
  "modules/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);

      // If no token, redirect to login
      if (!token) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return rejectWithValue("Token missing. Redirecting to login.");
      }

      const response = await fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If token is invalid or expired (typically 401 or 403)
      if (response.status === 401 || response.status === 403) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return rejectWithValue("Unauthorized. Redirecting to login.");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch employees
export const fetchEmployees = createAsyncThunk(
  "modules/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token");

      // If no token, redirect to login
      if (!token) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return rejectWithValue("Token missing. Redirecting to login.");
      }

      const response = await fetch(HR_EMPLOYEES_ENDPOINT, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // If token is invalid or expired (typically 401 or 403)
      if (response.status === 401 || response.status === 403) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return rejectWithValue("Unauthorized. Redirecting to login.");
      }

      const data = await response.json();
      const employees = Array.isArray(data) ? data : [data];
      return employees;
    } catch (error) {
      console.error("Error fetching employees:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employees"
      );
    }
  }
);


// Add module
export const addModule = createAsyncThunk(
  "modules/addModule",
  async (moduleData, { dispatch, rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        throw new Error("Failed to add module");
      }

      const data = await response.json();
      // Refresh modules list after adding
      await dispatch(fetchModules());
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update module
export const updateModule = createAsyncThunk(
  "modules/updateModule",
  async ({ moduleId, moduleData }, { dispatch, rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}/${moduleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        throw new Error("Failed to update module");
      }

      const data = await response.json();
      // Refresh modules list after updating
      await dispatch(fetchModules());
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete module
export const deleteModule = createAsyncThunk(
  "modules/deleteModule",
  async (moduleId, { dispatch, rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}/${moduleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete module");
      }

      // Refresh modules list after deleting
      await dispatch(fetchModules());
      return moduleId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const modulesSlice = createSlice({
  name: "modules",
  initialState: {
    modules: [],
    employees: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch modules cases
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add module cases
      .addCase(addModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addModule.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update module cases
      .addCase(updateModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete module cases
      .addCase(deleteModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch employees cases
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default modulesSlice.reducer;
