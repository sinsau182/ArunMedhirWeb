import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';
import axios from "axios";
import getConfig from "next/config";
const {publicRuntimeConfig} = getConfig();
const API_URL = publicRuntimeConfig.apiURL;

export const fetchPublicHolidays = createAsyncThunk(
  "publicHoliday/fetchPublicHolidays",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = sessionStorage.getItem("currentCompanyId");
      const response = await axios.get(`${API_URL}/public-holidays/company/${company}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch public holidays"
        );
      }
      return rejectWithValue("Network error: Unable to fetch public holidays");
    }
  }
);

export const createPublicHoliday = createAsyncThunk(
  "publicHoliday/createPublicHoliday",
  async (holidayData, { rejectWithValue, dispatch }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.post(
        `${API_URL}/public-holidays`,
        holidayData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh the holidays list after successful creation
      dispatch(fetchPublicHolidays());
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to create public holiday"
        );
      }
      return rejectWithValue("Network error: Unable to create public holiday");
    }
  }
);

export const updatePublicHoliday = createAsyncThunk(
  "publicHoliday/updatePublicHoliday",
  async ({ id, holidayData }, { rejectWithValue, dispatch }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.put(
        `${API_URL}/public-holidays/${id}`,
        holidayData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh the holidays list after successful update
      dispatch(fetchPublicHolidays());
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to update public holiday"
        );
      }
      return rejectWithValue("Network error: Unable to update public holiday");
    }
  }
);

export const deletePublicHoliday = createAsyncThunk(
  "publicHoliday/deletePublicHoliday",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      await axios.delete(`${API_URL}/public-holidays/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh the holidays list after successful deletion
      dispatch(fetchPublicHolidays());
      return id;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to delete public holiday"
        );
      }
      return rejectWithValue("Network error: Unable to delete public holiday");
    }
  }
);

const publicHolidaySlice = createSlice({
  name: "publicHoliday",
  initialState: {
    loading: false,
    error: null,
    holidays: [],
    lastUpdated: null,
    createSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,
  },
  reducers: {
    resetPublicHolidayState: (state) => {
      state.loading = false;
      state.error = null;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicHolidays.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.holidays = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPublicHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPublicHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createPublicHoliday.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.createSuccess = true;
      })
      .addCase(createPublicHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })
      .addCase(updatePublicHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updatePublicHoliday.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.updateSuccess = true;
      })
      .addCase(updatePublicHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      .addCase(deletePublicHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deletePublicHoliday.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.deleteSuccess = true;
      })
      .addCase(deletePublicHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deleteSuccess = false;
      });
  },
});

export const { resetPublicHolidayState } = publicHolidaySlice.actions;
export default publicHolidaySlice.reducer;
