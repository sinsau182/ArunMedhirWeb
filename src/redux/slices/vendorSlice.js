import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/vendors";

// Fetch vendors
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Something went wrong"); // backend error
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network Error");
    }
  }
);

// Add vendor
export const addVendor = createAsyncThunk(
  "vendors/addVendor",
  async (vendor, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vendor),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Something went wrong"); // backend error
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network Error");
    }
  }
);

export const vendorSlice = createSlice({
  name: "vendor",
  initialState: {
    vendors: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchVendors.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchVendors.fulfilled, (state, action) => {
      state.loading = false;
      state.vendors = action.payload;
    });
    builder.addCase(fetchVendors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(addVendor.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addVendor.fulfilled, (state, action) => {
      state.loading = false;
      state.vendors.push(action.payload);
    });
    builder.addCase(addVendor.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default vendorSlice.reducer;
