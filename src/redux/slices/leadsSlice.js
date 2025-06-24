import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (_, { rejectWithValue }) => {
    try {
        const token = getItemFromSessionStorage("token", null);

        const response = await fetch(`${API_BASE_URL}/leads`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch leads");
        }

        const data = await response.json();
        console.log('Fetched leads:', data);
        return data;

    } catch (error) {
        return rejectWithValue(error.message);
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

export const leadsSlice = createSlice({
    name: "leads",
    initialState: {
        leads: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeads.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.leads = action.payload;
            })
            .addCase(fetchLeads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(updateLead.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLead.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.leads.findIndex(lead => lead.leadId === action.payload.leadId);
                if (index !== -1) {
                    state.leads[index] = action.payload;
                } else {
                    state.leads.push(action.payload);
                }
            })
            .addCase(updateLead.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(createLead.pending, (state) => {
                state.loading = true;
            })
            .addCase(createLead.fulfilled, (state, action) => {
                state.leads.push(action.payload);
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

