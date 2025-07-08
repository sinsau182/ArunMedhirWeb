import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/attendance-summary";

export const fetchAllEmployeeAttendanceOneMonth = createAsyncThunk(
    "attendances/fetchAllEmployeeAttendanceOneMonth",
    async ({ month, year }, { rejectWithValue }) => {

        let url = "";
        const employeeId = sessionStorage.getItem("employeeId");
        const companyId = sessionStorage.getItem("currentCompanyId");
        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
        const numericMonth = monthIndex + 1;

        if(sessionStorage.getItem("currentRole") === "MANAGER"){
            url = `${API_BASE_URL}/manager/${employeeId}/${year}/${numericMonth}`;
        }else{
            url = `${API_BASE_URL}/hr/${companyId}/${year}/${numericMonth}`;
        }
        const token = getItemFromSessionStorage("token", null);
        
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch attendance by employee ID");
        }
        return await response.json();
    }
);

// Currently not used
const fetchOneEmployeeAttendanceAllMonth = createAsyncThunk(
    "attendances/fetchOneEmployeeAttendanceAllMonth",
    async ({ month, year }, { rejectWithValue }) => {
        const token = getItemFromSessionStorage("token", null);
        const employeeId = sessionStorage.getItem("employeeId");
        const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/month/${month}/year/${year}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch attendance by employee ID");
        }
        return await response.json();
    }
);

export const fetchOneEmployeeAttendanceOneMonth = createAsyncThunk(
    "attendances/fetchOneEmployeeAttendanceOneMonth",
    async ({ month, year }, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const employeeId = sessionStorage.getItem("employeeId");
            
            // Convert month name to numeric month (1-12)
            const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
            const numericMonth = monthIndex + 1; // getMonth() returns 0-11, so add 1
            
            const response = await fetch(`${API_BASE_URL}/${employeeId}/${year}/${numericMonth}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
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

export const attendancesSlice = createSlice({
    name: "attendances",
    initialState: {
        attendance: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAllEmployeeAttendanceOneMonth.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
            builder.addCase(fetchAllEmployeeAttendanceOneMonth.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload.teamAttendance) {
                state.attendance = action.payload.teamAttendance;
                console.log(state.attendance);
            } else if (action.payload.hrAttendance) {
                state.attendance = action.payload.hrAttendance;
                console.log(state.attendance);
            } else {
                state.attendance = action.payload;
                console.log(state.attendance);
            }
        });
        builder.addCase(fetchAllEmployeeAttendanceOneMonth.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        builder.addCase(fetchOneEmployeeAttendanceAllMonth.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchOneEmployeeAttendanceAllMonth.fulfilled, (state, action) => {
            state.loading = false;
            state.attendance = action.payload.attendance || action.payload;
        });
        builder.addCase(fetchOneEmployeeAttendanceAllMonth.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        builder.addCase(fetchOneEmployeeAttendanceOneMonth.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchOneEmployeeAttendanceOneMonth.fulfilled, (state, action) => {
            state.loading = false;
            state.attendance = action.payload;
        });
        builder.addCase(fetchOneEmployeeAttendanceOneMonth.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export default attendancesSlice.reducer;
