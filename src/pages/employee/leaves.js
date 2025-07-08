import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  applyLeave,
  fetchLeaveHistory,
  clearErrors,
  applyCompOffLeave,
} from "@/redux/slices/leaveSlice";
import {
  fetchLeaveBalance,
  resetLeaveBalanceState,
} from "@/redux/slices/leaveBalanceSlice";
import { fetchPublicHolidays } from "@/redux/slices/publicHolidaySlice";
import { toast } from "sonner";
import CustomDatePicker from "@/components/CustomDatePicker";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import withAuth from "@/components/withAuth";
import MainLayout from "@/components/MainLayout";

// Mock data - In real app, this would come from API
const sampleLeaves = [
  {
    id: 1,
    employeeId: "EMP001",
    startDate: "2025-01-02", // Today's date or close to today
    endDate: "2025-01-02",
    leaveName: "Medical Leave",
    reason: "Doctor appointment in afternoon",
    status: "Approved",
    shiftType: "SECOND_HALF",
    approver: "Sarah Manager",
  },
  {
    id: 2,
    employeeId: "EMP001",
    startDate: "2025-01-10",
    endDate: "2025-01-10",
    leaveName: "Sick Leave",
    reason: "Medical appointment",
    status: "Approved",
    shiftType: "FIRST_HALF",
    approver: "John Manager",
  },
  {
    id: 3,
    employeeId: "EMP001",
    startDate: "2025-01-20",
    endDate: "2025-01-22",
    leaveName: "Annual Leave",
    reason: "Family vacation",
    status: "Pending",
    shiftType: "FULL_DAY",
    approver: "John Manager",
  },
  {
    id: 4,
    employeeId: "EMP001",
    startDate: "2025-01-08",
    endDate: "2025-01-08",
    leaveName: "Casual Leave",
    reason: "Personal work",
    status: "Approved",
    shiftType: "SECOND_HALF",
    approver: "John Manager",
  },
];

// Mock attendance data for half-day scenarios
const sampleAttendance = [
  {
    date: "2025-01-02", // Half-day demo date
    checkIn: "09:00 AM",
    checkOut: "01:00 PM",
    status: "PRESENT_HALF",
    hoursWorked: 4,
    shiftType: "FIRST_HALF", // Present in first half, leave in second half
  },
  {
    date: "2025-01-10",
    checkIn: "01:00 PM",
    checkOut: "06:00 PM",
    status: "PRESENT_HALF",
    hoursWorked: 5,
    shiftType: "SECOND_HALF", // Present in second half, leave in first half
  },
  {
    date: "2025-01-08",
    checkIn: "09:00 AM",
    checkOut: "01:00 PM",
    status: "PRESENT_HALF",
    hoursWorked: 4,
    shiftType: "FIRST_HALF", // Present in first half, leave in second half
  },
];

// Mock holidays
const sampleHolidays = [
  {
    date: "2025-01-26",
    holidayName: "Republic Day",
    description: "National Holiday",
  },
];

// Helper function to format numbers: show two decimals only if not whole
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return Number(num) % 1 === 0 ? Number(num) : Number(num).toFixed(2);
}

// Helper to calculate requested days based on shift type
function calculateRequestedDays(dates) {
  return dates.reduce((total, date) => {
    const shift = date.shiftType || date.timeSlot;
    const dayValue =
      shift === "FIRST_HALF" || shift === "SECOND_HALF" ? 0.5 : 1;
    return total + dayValue;
  }, 0);
}

const Leaves = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = getItemFromSessionStorage("token");
    setToken(storedToken);
  }, []);

  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);

  const { leaves, loading, error } = useSelector((state) => state.leave);
  const { leaveHistory, historyLoading, historyError } = useSelector(
    (state) => state.leave
  );
  const {
    balance: leaveBalance,
    loading: isLoadingBalance,
    error: balanceError,
  } = useSelector((state) => state.leaveBalance);
  const {
    holidays,
    loading: holidayLoading,
    error: holidayError,
  } = useSelector((state) => state.publicHoliday);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [viewMode, setViewMode] = useState("month"); // month, week
  const [filterStatus, setFilterStatus] = useState("all"); // all, approved, pending, rejected
  const [searchTerm, setSearchTerm] = useState("");

  const calendarRef = useRef(null);
  const [showLOPWarning, setShowLOPWarning] = useState(false);
  const [requestedDays, setRequestedDays] = useState(0);

  const employeeId = sessionStorage.getItem("employeeId");

  // Simplified form states
  const [leaveForm, setLeaveForm] = useState({
    dates: [],
    reason: "",
    shiftType: "FULL_DAY",
  });

  const [compOffForm, setCompOffForm] = useState({
    dates: [],
    description: "",
    shiftType: "FULL_DAY",
  });

  // Add state for leave policy and weekly offs
  const [leavePolicy, setLeavePolicy] = useState(null);
  const [weeklyOffs, setWeeklyOffs] = useState([]);

  // Get calendar data for current month
  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Helper function to get leave status for a specific date
  const getLeaveStatusForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];

    // Check if it's a holiday
    const holiday = sampleHolidays.find((h) => h.date === dateStr);
    if (holiday) {
      return { type: "holiday", data: holiday };
    }

    // Check if there's a leave on this date
    const leave = sampleLeaves.find((leave) => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return date >= startDate && date <= endDate;
    });

    // Check if there's attendance on this date
    const attendance = sampleAttendance.find((att) => att.date === dateStr);

    // If both leave and attendance exist (half-day scenario)
    if (leave && attendance) {
      return {
        type: "half_day",
        data: {
          leave: leave,
          attendance: attendance,
        },
      };
    }

    // If only leave exists
    if (leave) {
      return { type: "leave", data: leave };
    }

    // If only attendance exists (could be marked for other purposes)
    if (attendance && attendance.status === "PRESENT_HALF") {
      return { type: "attendance", data: attendance };
    }

    return null;
  };

  // Helper function to get status color
  const getStatusColor = (type, status) => {
    if (type === "holiday") return "bg-orange-100 border-orange-300";
    if (type === "half_day")
      return "bg-gradient-to-r from-green-100 to-yellow-100 border-green-300";
    if (type === "attendance") return "bg-green-100 border-green-300";

    switch (status) {
      case "Approved":
        return "bg-green-100 border-green-300";
      case "Pending":
        return "bg-yellow-100 border-yellow-300";
      case "Rejected":
        return "bg-red-100 border-red-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return "✔️";
      case "Pending":
        return "⏳";
      case "Rejected":
        return "❌";
      default:
        return "📝";
    }
  };

  // Helper function to get icon for different types
  const getTypeIcon = (type, data) => {
    if (type === "holiday") return "🏖️";
    if (type === "half_day") return "🌓"; // Half moon for half-day
    if (type === "attendance") return "✔️";
    if (type === "leave") return getStatusIcon(data.status);
    return "📝";
  };

  // Navigation functions
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const status = getLeaveStatusForDate(date);
    setSelectedLeave(status);
  };

  // Extract all leave dates from leaveHistory to disable them in the calendar
  const getDisabledDates = () => {
    if (!leaveHistory || !Array.isArray(leaveHistory)) return [];

    const disabledDates = [];
    leaveHistory.forEach((leave) => {
      if (leave.leaveDates && Array.isArray(leave.leaveDates)) {
        leave.leaveDates.forEach((dateString) => {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            disabledDates.push(date);
          }
        });
      }
    });

    return disabledDates;
  };

  useEffect(() => {
    dispatch(fetchLeaveHistory());
    dispatch(fetchLeaveBalance(employeeId));
    dispatch(fetchPublicHolidays());

    return () => {
      dispatch(clearErrors());
      dispatch(resetLeaveBalanceState());
    };
  }, [dispatch, employeeId]);

  const openModal = async () => {
    await fetchLeavePolicy();
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setLeaveForm({ dates: [], reason: "", shiftType: "FULL_DAY" });
    setLeavePolicy(null);
    setWeeklyOffs([]);
  };

  const openCompOffModal = async () => {
    await fetchLeavePolicy();
    setIsCompOffModalOpen(true);
  };
  const closeCompOffModal = () => {
    setIsCompOffModalOpen(false);
    setCompOffForm({ dates: [], description: "", shiftType: "FULL_DAY" });
    setLeavePolicy(null);
    setWeeklyOffs([]);
  };

  const handleLeaveFormChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleShiftTypeChange = (e) => {
    setLeaveForm((prev) => ({ ...prev, shiftType: e.target.value }));
  };

  const handleLeaveDatesChange = (dates) => {
    const totalDays = calculateRequestedDays(dates);
    setRequestedDays(totalDays);

    if (leaveBalance && totalDays > leaveBalance.newLeaveBalance) {
      setShowLOPWarning(true);
    } else {
      setShowLOPWarning(false);
    }

    setLeaveForm((prev) => ({ ...prev, dates }));
  };

  const handleCompOffFormChange = (e) => {
    const { name, value } = e.target;
    setCompOffForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompOffSubmit = async (e) => {
    e.preventDefault();

    if (!compOffForm.dates.length || !compOffForm.description) {
      toast.error("Please select a date and provide a description");
      return;
    }

    try {
      const leaveDates = compOffForm.dates
        .map((date) => date.date.toISOString().split("T")[0])
        .sort();

      const formData = {
        leaveDates: leaveDates,
        shiftType:
          compOffForm.dates[0]?.timeSlot ||
          compOffForm.dates[0]?.shiftType ||
          "FULL_DAY",
        reason: compOffForm.description,
      };

      const resultAction = await dispatch(applyCompOffLeave(formData));
      if (applyCompOffLeave.fulfilled.match(resultAction)) {
        toast.success("Comp-off application submitted successfully");
        closeCompOffModal();
        dispatch(fetchLeaveHistory());
        dispatch(fetchLeaveBalance(employeeId));
      } else {
        throw new Error(
          resultAction.error.message || "Failed to apply for comp-off"
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit comp-off request");
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();

    const leaveDates = leaveForm.dates
      .map((date) => date.date.toISOString().split("T")[0])
      .sort();

    const formData = {
      leaveDates: leaveDates,
      shiftType:
        leaveForm.dates[0]?.timeSlot ||
        leaveForm.dates[0]?.shiftType ||
        "FULL_DAY",
      reason: leaveForm.reason,
    };

    if (!formData.leaveDates.length || !formData.reason) {
      toast.error("Please select at least one date and provide a reason");
      return;
    }

    if (showLOPWarning) {
      const confirmLOP = window.confirm(
        `Warning: You are requesting ${requestedDays} days of leave but only have ${leaveBalance.newLeaveBalance} days available. \n\nExcess days will be marked as Loss of Pay (LOP). \n\nDo you want to continue?`
      );
      if (!confirmLOP) {
        return;
      }
    }

    try {
      const resultAction = await dispatch(applyLeave(formData));
      if (applyLeave.fulfilled.match(resultAction)) {
        toast.success("Leave application submitted successfully");
        closeModal();
        dispatch(fetchLeaveHistory());
        dispatch(fetchLeaveBalance(employeeId));
      } else {
        throw new Error(
          resultAction.error.message || "Failed to apply for leave"
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to apply for leave");
    }
  };

  const fetchLeavePolicy = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.200:8080/employee/${employeeId}/leave-policy`
      );
      if (!response.ok) throw new Error("Failed to fetch leave policy");
      const data = await response.json();
      setLeavePolicy(data);
      setWeeklyOffs(Array.isArray(data.weeklyOffs) ? data.weeklyOffs : []);
    } catch (err) {
      setLeavePolicy(null);
      setWeeklyOffs([]);
      toast.error("Could not fetch leave policy");
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <MainLayout>
      <div className="flex-1 space-y-4">
        {/* Header with Calendar Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h1>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-2 py-1 text-xs ${
                    viewMode === "month"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-2 py-1 text-xs ${
                    viewMode === "week"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  Week
                </button>
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1 border rounded-md text-xs bg-white"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 pr-3 py-1 border rounded-md text-xs w-32"
                />
              </div>

              {/* Leave Summary */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-600">Balance:</span>
                <span className="font-semibold text-green-600">
                  {formatNumber(leaveBalance?.totalAvailableBalance || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Leave Balance and Action Buttons Row */}
          <div className="flex justify-between items-center mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <span className="text-gray-600">Leave Balance: </span>
              <span className="font-semibold text-lg text-blue-600">
                {formatNumber(leaveBalance?.totalAvailableBalance || 0)}
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={openModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Apply for Leave
              </button>
              <button
                onClick={openCompOffModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Comp-off
              </button>
            </div>
          </div>

          {/* Compact Calendar Grid */}
          <div className="border rounded-lg overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-medium text-gray-700 text-xs border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days - Much smaller cells */}
            <div className="grid grid-cols-7">
              {getCalendarData().map((date, index) => {
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const isSelected =
                  selectedDate &&
                  date.toDateString() === selectedDate.toDateString();
                const status = getLeaveStatusForDate(date);

                return (
                  <div
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    title={
                      status
                        ? status.type === "holiday"
                          ? `Holiday: ${status.data.holidayName}`
                          : status.type === "half_day"
                          ? `Half-Day: Present (${
                              status.data.attendance.shiftType === "FIRST_HALF"
                                ? "AM"
                                : "PM"
                            }), Leave (${
                              status.data.leave.shiftType === "FIRST_HALF"
                                ? "AM"
                                : "PM"
                            })`
                          : status.type === "leave"
                          ? `${status.data.leaveName}: ${status.data.status}`
                          : status.type === "attendance"
                          ? `Present (${
                              status.data.shiftType === "FIRST_HALF"
                                ? "AM"
                                : "PM"
                            })`
                          : ""
                        : ""
                    }
                    className={`
                      p-1 h-12 border-r border-b last:border-r-0 cursor-pointer transition-all relative
                      ${
                        !isCurrentMonth
                          ? "bg-gray-50 text-gray-400"
                          : "bg-white text-gray-900"
                      }
                      ${isToday ? "bg-blue-50 ring-1 ring-blue-200" : ""}
                      ${isSelected ? "bg-blue-100 ring-1 ring-blue-300" : ""}
                      hover:bg-gray-50
                    `}
                  >
                    <div className="flex justify-between items-start h-full">
                      <span
                        className={`text-xs font-medium ${
                          isToday ? "text-blue-600" : ""
                        }`}
                      >
                        {date.getDate()}
                      </span>

                      {status && (
                        <div
                          className={`
                          w-4 h-4 rounded-full flex items-center justify-center text-xs
                          ${getStatusColor(status.type, status.data.status)}
                          border
                        `}
                        >
                          {getTypeIcon(status.type, status.data)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend - More compact */}
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <span className="w-4 h-4 bg-green-100 border border-green-300 rounded-full flex items-center justify-center text-xs">
                  ✔️
                </span>
                <span>Approved</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded-full flex items-center justify-center text-xs">
                  ⏳
                </span>
                <span>Pending</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-4 h-4 bg-red-100 border border-red-300 rounded-full flex items-center justify-center text-xs">
                  ❌
                </span>
                <span>Rejected</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-4 h-4 bg-gradient-to-r from-green-100 to-yellow-100 border border-green-300 rounded-full flex items-center justify-center text-xs">
                  🌓
                </span>
                <span>Half-Day</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-4 h-4 bg-orange-100 border border-orange-300 rounded-full flex items-center justify-center text-xs">
                  🏖️
                </span>
                <span>Holiday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Details - Only show when date is selected */}
        {selectedDate && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-semibold mb-3">
              Selected Date:{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>

            {selectedLeave ? (
              <div className="space-y-3">
                {selectedLeave.type === "holiday" ? (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      🏖️
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {selectedLeave.data.holidayName}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {selectedLeave.data.description}
                      </p>
                      <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        Public Holiday
                      </span>
                    </div>
                  </div>
                ) : selectedLeave.type === "half_day" ? (
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-lg mb-3">
                        Attendance Status:
                      </h3>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-start">
                          <span className="text-gray-700 font-medium mr-2">
                            •
                          </span>
                          <div>
                            <span className="font-medium text-green-700">
                              Present:{" "}
                              {selectedLeave.data.attendance.shiftType ===
                              "FIRST_HALF"
                                ? "First Half"
                                : "Second Half"}
                            </span>
                            <span className="text-gray-600 ml-2">
                              (Check-in: {selectedLeave.data.attendance.checkIn}
                              , Check-out:{" "}
                              {selectedLeave.data.attendance.checkOut})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <span className="text-gray-700 font-medium mr-2">
                            •
                          </span>
                          <div>
                            <span className="font-medium text-orange-700">
                              On Leave:{" "}
                              {selectedLeave.data.leave.shiftType ===
                              "FIRST_HALF"
                                ? "First Half"
                                : "Second Half"}
                            </span>
                            <span className="text-gray-600 ml-2">
                              (Type: {selectedLeave.data.leave.leaveName},{" "}
                              {selectedLeave.data.leave.status})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div>
                          <span className="text-gray-700 font-medium">
                            • Total Hours Worked:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {selectedLeave.data.attendance.hoursWorked}h 0m
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">
                            • Leave Deducted:
                          </span>
                          <span className="ml-2 text-gray-900">0.5 day</span>
                        </div>
                      </div>

                      {selectedLeave.data.leave.reason && (
                        <div className="mt-3 text-sm">
                          <span className="text-gray-700 font-medium">
                            • Reason:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {selectedLeave.data.leave.reason}
                          </span>
                        </div>
                      )}

                      {selectedLeave.data.leave.approver && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-700 font-medium">
                            • Approver:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {selectedLeave.data.leave.approver}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedLeave.data.leave.status === "Pending" && (
                      <div className="flex space-x-2 pt-3 border-t">
                        <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors">
                          <Trash2 className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start space-x-3">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${getStatusColor("leave", selectedLeave.data.status)}
                    `}
                    >
                      {getTypeIcon("leave", selectedLeave.data)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">
                          Leave Type: {selectedLeave.data.leaveName || "Leave"}
                        </h3>
                        <span
                          className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${
                            selectedLeave.data.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : selectedLeave.data.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        `}
                        >
                          {selectedLeave.data.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                        <div>
                          <span className="text-gray-600">Shift:</span>
                          <span className="ml-1 font-medium">
                            {(() => {
                              switch (selectedLeave.data.shiftType) {
                                case "FULL_DAY":
                                  return "Full Day";
                                case "FIRST_HALF":
                                  return "First Half";
                                case "SECOND_HALF":
                                  return "Second Half";
                                default:
                                  return (
                                    selectedLeave.data.shiftType || "Full Day"
                                  );
                              }
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Balance After:</span>
                          <span className="ml-1 font-medium">
                            {formatNumber(
                              leaveBalance?.totalAvailableBalance || 0
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-600">Reason:</span>
                        <p className="mt-1">
                          {selectedLeave.data.reason || "No reason provided"}
                        </p>
                      </div>

                      {selectedLeave.data.status === "Pending" && (
                        <div className="flex space-x-2 mt-3">
                          <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors">
                            <Trash2 className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                          <button className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors">
                            <FileText className="w-3 h-3" />
                            <span>Upload</span>
                          </button>
                        </div>
                      )}

                      {selectedLeave.data.approver && (
                        <div className="mt-2 text-xs text-gray-600">
                          Approver:{" "}
                          <span className="font-medium">
                            {selectedLeave.data.approver}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No leave or holiday on this date</p>
                <div className="flex justify-center space-x-2 mt-3">
                  <button
                    onClick={openModal}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    Apply for Leave
                  </button>
                  <button
                    onClick={openCompOffModal}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                  >
                    Apply for Comp-off
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leave Modal - Keep existing modal code */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Apply for Leave
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitLeave} className="space-y-6">
                <div>
                  <CustomDatePicker
                    selectedDates={leaveForm.dates}
                    onChange={handleLeaveDatesChange}
                    maxDays={5}
                    shiftType={leaveForm.shiftType}
                    onShiftTypeChange={handleShiftTypeChange}
                    leavePolicy={leavePolicy}
                    weeklyOffs={weeklyOffs}
                    disabledDates={getDisabledDates()}
                  />
                  {getDisabledDates().length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <span className="mr-1">ℹ️</span>
                      Dates with existing leave requests are disabled
                    </div>
                  )}
                  {showLOPWarning && (
                    <div className="mt-2 text-red-500 text-sm flex items-center">
                      <span className="mr-1">⚠️</span>
                      Warning: {requestedDays -
                        leaveBalance.newLeaveBalance}{" "}
                      day(s) will be marked as Loss of Pay (LOP)
                    </div>
                  )}
                  {leaveForm.dates.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Requested:{" "}
                      {requestedDays % 1 === 0
                        ? requestedDays
                        : requestedDays.toFixed(1)}{" "}
                      day(s) | Available Balance:{" "}
                      {formatNumber(leaveBalance?.newLeaveBalance || 0)} day(s)
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Leave
                  </label>
                  <textarea
                    name="reason"
                    value={leaveForm.reason}
                    onChange={handleLeaveFormChange}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Please provide a reason for your leave request..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Comp-off Modal - Keep existing modal code */}
        {isCompOffModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Apply for Comp-off
                </h2>
                <button
                  onClick={closeCompOffModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCompOffSubmit} className="space-y-6">
                <div>
                  <CustomDatePicker
                    selectedDates={compOffForm.dates}
                    onChange={(dates) => {
                      setCompOffForm((prev) => ({
                        ...prev,
                        dates: dates.map((d) => ({
                          date:
                            d.date instanceof Date ? d.date : new Date(d.date),
                          shiftType: d.shiftType,
                          timeSlot: d.timeSlot,
                        })),
                      }));
                    }}
                    isCompOff={true}
                    maxDays={1}
                    shiftType={compOffForm.shiftType}
                    onShiftTypeChange={(e) => {
                      setCompOffForm((prev) => ({
                        ...prev,
                        shiftType: e.target.value,
                      }));
                    }}
                    disabledDates={getDisabledDates()}
                  />
                  {getDisabledDates().length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <span className="mr-1">ℹ️</span>
                      Dates with existing leave requests are disabled
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={compOffForm.description}
                    onChange={handleCompOffFormChange}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Please provide details about your comp-off request..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeCompOffModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default withAuth(Leaves);
