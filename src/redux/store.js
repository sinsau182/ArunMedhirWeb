import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "./slices/companiesSlice";
import employeesReducer from "./slices/employeeSlice"; // Import employee slice
import modulesReducer from "./slices/modulesSlice"; // Import module slice
import authReducer from "./slices/authSlice"; // Import auth slice
import expensesReducer from "./slices/expensesSlice"; // Import expense slice
import leaveReducer from "./slices/leaveSlice"; // Manages leave-related state
import leaveTypeReducer from "./slices/leaveTypeSlice";
import leavePolicyReducer from "./slices/leavePolicySlice";
import publicHolidayReducer from "./slices/publicHolidaySlice";
import departmentReducer from "./slices/departmentSlice";
import designationReducer from "./slices/designationSlice";
import sessionStorageReducer from './slices/sessionStorageSlice';
import leaveBalanceReducer from "./slices/leaveBalanceSlice";
import requestDetailsReducer from './slices/requestDetailsSlice';
import payrollSettingsReducer from "./slices/payrollSettingsSlice";
import payslipReducer from "./slices/payslipSlice";
import allEmployeesSlice from "./slices/allEmployeesSlice";
import managerEmployeeSlice from "./slices/managerEmployeeSlice";
import leadsReducer from "./slices/leadsSlice";
import pipelineReducer from "./slices/pipelineSlice";
import incomesReducer from "./slices/incomesSlice";
import attendancesReducer from "./slices/attendancesSlice";


export const store = configureStore({
  reducer: {
    companies: companiesReducer, // Manages company-related state
    employees: employeesReducer, // Manages employee-related state
    modules: modulesReducer, // Manages module-related state
    auth: authReducer, // Manages authentication state
    expenses: expensesReducer, // Manages expense-related state
    leave: leaveReducer, // Manages leave-related state
    leaveType: leaveTypeReducer,
    leavePolicy: leavePolicyReducer,
    publicHoliday: publicHolidayReducer,
    department: departmentReducer,
    designation: designationReducer,
    sessionStorage: sessionStorageReducer,
    leaveBalance: leaveBalanceReducer,
    requestDetails: requestDetailsReducer,
    payrollSettings: payrollSettingsReducer,
    payslip: payslipReducer,
    allEmployees: allEmployeesSlice,
    managerEmployee: managerEmployeeSlice,
    leads: leadsReducer,
    pipeline: pipelineReducer,
    incomes: incomesReducer,
    attendances: attendancesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents serialization errors with async actions
    }),
  devTools: process.env.NODE_ENV !== "production", // Enables Redux DevTools in development mode
});

export default store;
