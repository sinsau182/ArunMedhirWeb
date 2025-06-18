import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import axios from "axios";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;


// Fetch Leaves
export const fetchLeaves = createAsyncThunk(
  "leaves/fetchLeaves",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const employeeId = sessionStorage.getItem("employeeId");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(
        `${API_BASE_URL}/leave/employee/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        return rejectWithValue({
          message:
            error.response.data.message ||
            "Invalid request. Please check your employee ID.",
          status: 400,
        });
      }

      if (error.response?.status === 401) {
        return rejectWithValue({
          message: "Authentication failed. Please login again.",
          status: 401,
        });
      }

      return rejectWithValue({
        message: error.message || "Failed to fetch leaves",
        status: error.response?.status,
      });
    }
  }
);

// Create Leave
export const createLeave = createAsyncThunk(
  "leaves/createLeave",
  async (leaveData, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(leaveData),
      });

      // Read the response body only once
      const responseText = await response.text();

      if (!response.ok) {
        // Try to parse as JSON if it looks like JSON
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || "Failed to create leave");
        } catch (jsonError) {
          // If not JSON, use the text response
          throw new Error(responseText || "Failed to create leave");
        }
      }

      // Try to parse as JSON if it looks like JSON
      try {
        return JSON.parse(responseText);
      } catch (jsonError) {
        // If not JSON, return the text response
        return { message: responseText };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update Leave
export const updateLeave = createAsyncThunk(
  "leaves/updateLeave",
  async ({ id, leaveData }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `http://sessionhost:8080/api/v1/leaves/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(leaveData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update leave");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete Leave
export const deleteLeave = createAsyncThunk(
  "leaves/deleteLeave",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `http://sessionhost:8080/api/v1/leaves/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete leave");
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add applyLeave thunk
export const applyLeave = createAsyncThunk(
  "leave/applyLeave",
  async (leaveData, { dispatch, rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Enhanced validation with detailed error messages for new structure
      const missingFields = [];
      if (!leaveData.leaveDates || !Array.isArray(leaveData.leaveDates) || leaveData.leaveDates.length === 0) {
        missingFields.push('leaveDates');
      }
      if (!leaveData.shiftType) missingFields.push('shiftType');
      if (!leaveData.reason) missingFields.push('reason');

      if (missingFields.length > 0) {
        console.log('[LeaveSlice] applyLeave validation failed:', {
          missingFields,
          providedData: leaveData,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode the JWT token
      const companyId = decodedToken.companyId; // Extract companyId from token
      const employeeId = sessionStorage.getItem("employeeId"); // Get employeeId from session storage

      const response = await axios.post(
        `${API_BASE_URL}/leave/apply`,
        {
          employeeId: employeeId,
          companyId: companyId,
          leaveName: "Leave",
          leaveDates: leaveData.leaveDates,
          shiftType: leaveData.shiftType,
          reason: leaveData.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Fetch updated leave data after successful submission
      await dispatch(fetchLeaves());
      await dispatch(fetchLeaveHistory());

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add fetchLeaveHistory thunk
export const fetchLeaveHistory = createAsyncThunk(
  "leaves/fetchLeaveHistory",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const employeeId = sessionStorage.getItem("employeeId");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(
        `${API_BASE_URL}/leave/employee/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        return rejectWithValue({
          message:
            error.response.data.message ||
            "Invalid request. Please check your employee ID.",
          status: 400,
        });
      }

      if (error.response?.status === 401) {
        return rejectWithValue({
          message: "Authentication failed. Please login again.",
          status: 401,
        });
      }

      return rejectWithValue({
        message: error.message || "Failed to fetch leave history",
        status: error.response?.status,
      });
    }
  }
);

export const applyCompOffLeave = createAsyncThunk(
  "leave/applyCompOff",
  async (formData, { dispatch, getState }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Enhanced validation with detailed error messages for new structure
      const missingFields = [];
      if (!formData.leaveDates || !Array.isArray(formData.leaveDates) || formData.leaveDates.length === 0) {
        missingFields.push('leaveDates');
      }
      if (!formData.shiftType) missingFields.push('shiftType');
      if (!formData.reason) missingFields.push('reason');

      if (missingFields.length > 0) {
        console.log('[LeaveSlice] applyCompOffLeave validation failed:', {
          missingFields,
          providedData: formData,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode the JWT token
      const companyId = decodedToken.companyId; // Extract companyId from token
      const employeeId = sessionStorage.getItem("employeeId"); // Get employeeId from session storage

      const response = await axios.post(
        `${API_BASE_URL}/leave/apply`,
        {
          employeeId: employeeId,
          companyId: companyId,
          leaveName: "Comp-Off",
          leaveDates: formData.leaveDates,
          shiftType: formData.shiftType,
          reason: formData.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Fetch updated leave data after successful submission
      await dispatch(fetchLeaves());
      await dispatch(fetchLeaveHistory());

      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to apply for comp-off"
      );
    }
  }
);

const initialState = {
  leaves: [],
  leaveHistory: [],
  loading: false,
  error: null,
  status: "idle",
};

// Leave Slice
const leaveSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leaves
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload || [];
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        console.log('[LeaveSlice] fetchLeaves rejected:', {
          error: action.payload,
          errorMessage: action.error?.message,
          meta: action.meta,
          requestId: action.meta?.requestId,
          timestamp: new Date().toISOString()
        });
        state.loading = false;
        state.error = action.payload || "Failed to fetch leaves";
        state.status = "failed";
        state.leaves = []; // Clear leaves on error
      })
      // Create Leave
      .addCase(createLeave.pending, (state) => {
        state.loading = true;
        state.submissionStatus = null;
        state.submissionError = null;
      })
      .addCase(createLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.submissionStatus = "success";
        state.leaves.push(action.payload);
      })
      .addCase(createLeave.rejected, (state, action) => {
        console.log('[LeaveSlice] createLeave rejected:', {
          error: action.payload,
          errorMessage: action.error?.message,
          meta: action.meta,
          requestId: action.meta?.requestId,
          timestamp: new Date().toISOString(),
          fullAction: action
        });
        state.loading = false;
        state.submissionStatus = "error";
        state.submissionError = action.payload;
      })
      .addCase(updateLeave.fulfilled, (state, action) => {
        const index = state.leaves.findIndex(
          (leave) => leave.id === action.payload.id
        );
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.leaves = state.leaves.filter(
          (leave) => leave.id !== action.payload
        );
      })
      .addCase(applyLeave.pending, (state) => {
        state.applyLeaveStatus = "loading";
        state.applyLeaveError = null;
      })
      .addCase(applyLeave.fulfilled, (state) => {
        state.applyLeaveStatus = "succeeded";
      })
      .addCase(applyLeave.rejected, (state, action) => {
        console.log('[LeaveSlice] applyLeave rejected:', {
          error: action.payload,
          errorMessage: action.error?.message,
          meta: action.meta,
          requestId: action.meta?.requestId,
          timestamp: new Date().toISOString(),
          fullAction: action,
          leaveData: action.meta?.arg
        });
        state.applyLeaveStatus = "failed";
        state.applyLeaveError = action.payload;
      })

      .addCase(fetchLeaveHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(fetchLeaveHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveHistory = action.payload || [];
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(fetchLeaveHistory.rejected, (state, action) => {
        console.log('[LeaveSlice] fetchLeaveHistory rejected:', {
          error: action.payload,
          errorMessage: action.error?.message,
          meta: action.meta,
          requestId: action.meta?.requestId,
          timestamp: new Date().toISOString(),
          fullAction: action
        });
        state.loading = false;
        state.error = action.payload || "Failed to fetch leave history";
        state.status = "failed";
        state.leaveHistory = []; // Clear history on error
      })
      .addCase(applyCompOffLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCompOffLeave.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(applyCompOffLeave.rejected, (state, action) => {
        console.log('[LeaveSlice] applyCompOffLeave rejected:', {
          error: action.error?.message,
          errorPayload: action.payload,
          meta: action.meta,
          requestId: action.meta?.requestId,
          timestamp: new Date().toISOString(),
          fullAction: action
        });
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearErrors } = leaveSlice.actions;
export default leaveSlice.reducer;
