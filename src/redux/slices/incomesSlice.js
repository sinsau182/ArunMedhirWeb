import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/income";

// Fetch income by employee ID
export const fetchIncomeByEmployeeId = createAsyncThunk(
    "incomes/fetchIncomeByEmployeeId",
    async (_, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const employee = sessionStorage.getItem("employeeId");
            const response = await fetch(`${API_BASE_URL}/employee/${employee}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || "Something went wrong");
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message || "Network Error");
        }
    }
);

// Create income
export const createIncome = createAsyncThunk(
    "incomes/createIncome",
    async (incomeData, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const response = await fetch(`${API_BASE_URL}/employee`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(incomeData)
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || "Something went wrong");
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message || "Network Error");
        }
    }
);

// Update income
export const updateIncome = createAsyncThunk(
    "incomes/updateIncome",
    async (incomeData, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const response = await fetch(`${API_BASE_URL}/employee/${incomeData.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(incomeData)
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || "Something went wrong");
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message || "Network Error");
        }
    }
);

export const incomesSlice = createSlice({
    name: "incomes",
    initialState: {
        incomes: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchIncomeByEmployeeId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIncomeByEmployeeId.fulfilled, (state, action) => {
                state.loading = false;
                state.incomes = action.payload;
            })
            .addCase(fetchIncomeByEmployeeId.rejected, (state, action) => { 
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(createIncome.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createIncome.fulfilled, (state, action) => {
                state.loading = false;
                state.incomes.push(action.payload);
            })
            .addCase(createIncome.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(updateIncome.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateIncome.fulfilled, (state, action) => {
                state.loading = false;
                state.incomes = state.incomes.map(income => income.incomeId === action.payload.incomeId ? action.payload : income);
            })
            .addCase(updateIncome.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default incomesSlice.reducer;

