import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
import axios from 'axios';
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

const getAuthHeaders = () => {
const token = getItemFromSessionStorage("token", null);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('http://localhost:8080/leads', {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchLeadById = createAsyncThunk(
    "leads/fetchLeadById",
    async (id, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);

            const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch lead by ID");
            }
            return await response.json();

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createLead = createAsyncThunk(
    "leads/createLead",
    async (leadData, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);

            const response = await fetch(`${API_BASE_URL}/leads`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(leadData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create lead");
            }
            return await response.json();

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateLead = createAsyncThunk(
    "leads/updateLead",
    async (leadData, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const leadId = leadData.leadId; // Handle both id and leadId
            console.log(leadData);

            if (!leadId) {
                throw new Error("Lead ID is required for update");
            }

            const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
                method: "PUT",  
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(leadData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update lead");
            }
            return await response.json();

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const moveLeadToPipeline = createAsyncThunk(
  'leads/moveToPipeline',
  async ({ leadId, newPipelineId }, { dispatch }) => {
    await axios.patch(`http://localhost:8080/leads/${leadId}/pipeline?newPipelineId=${newPipelineId}`, {}, {
      headers: getAuthHeaders(),
    });
    // Optionally, refetch all leads after move
    dispatch(fetchLeads());
    return { leadId, newPipelineId };
  }
);

const leadsSlice = createSlice({
    name: "leads",
    initialState: {
        leads: [],
        loading: false,
        error: null,
        status: 'idle',
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeads.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.status = 'loading';
            })
            .addCase(fetchLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.leads = action.payload;
                state.status = 'succeeded';
            })
            .addCase(fetchLeads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.status = 'failed';
            })

            .addCase(updateLead.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLead.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(updateLead.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(createLead.pending, (state) => {
                state.loading = true;
            })
            .addCase(createLead.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(createLead.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(fetchLeadById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLeadById.fulfilled, (state, action) => {
                state.loading = false;
                state.leads = action.payload;
            })
            .addCase(fetchLeadById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
});

export default leadsSlice.reducer;


