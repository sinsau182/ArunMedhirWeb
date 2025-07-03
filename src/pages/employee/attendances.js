import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle2, Clock, CalendarIcon, Calendar, Play, ChevronDown } from "lucide-react";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { fetchOneEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/HradminNavbar";

const MonthYearSelector = ({ selectedMonth, selectedYear, onSelect }) => {
  const years = [new Date().getFullYear() - 1, new Date().getFullYear()];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg z-10 p-2">
      <div className="flex justify-around mb-2">
        {years.map(year => (
          <button
            key={year}
            onClick={() => onSelect(selectedMonth, year.toString())}
            className={`px-3 py-1 text-sm rounded ${selectedYear === year.toString() ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
          >
            {year}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {months.map(month => (
          <button
            key={month}
            onClick={() => onSelect(month, selectedYear)}
            className={`p-2 text-sm rounded ${selectedMonth === month ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
          >
            {month}
          </button>
        ))}
      </div>
    </div>
  );
};

const DailyDetails = ({ data }) => {
  if (!data) {
    return (
        <div className="text-center py-4">
            <p className="text-gray-500">Select a date to see the details.</p>
        </div>
    );
  }

  const { status, checkIn, checkOut, totalWorkingMinutes, leaveType } = data;
  
  const getStatusBadge = () => {
    switch(status) {
        case 'Present': return <Badge variant="success">Present</Badge>;
        case 'Absent': return <Badge variant="destructive">Absent</Badge>;
        case 'Half Day': return <Badge variant="warning">Half Day</Badge>;
        case 'On Leave': return <Badge variant="secondary">On Leave</Badge>;
        case 'Holiday': return <Badge variant="outline">Holiday</Badge>;
        default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium">Status</span>
        {getStatusBadge()}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Check In</span>
        <span className="text-sm font-semibold">{checkIn || 'N/A'}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Check Out</span>
        <span className="text-sm font-semibold">{checkOut || 'N/A'}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Working Hours</span>
        <span className="text-sm font-semibold">{totalWorkingMinutes ? `${(totalWorkingMinutes / 60).toFixed(1)}h` : 'N/A'}</span>
      </div>
       {leaveType && (
         <div className="flex justify-between items-center">
           <span className="text-sm text-gray-600">Leave Type</span>
           <span className="text-sm font-semibold">{leaveType}</span>
         </div>
       )}
    </div>
  );
};

const MonthlySummary = ({ summary }) => {
  const summaryItems = [
    { label: "Present", value: summary["Present"] || 0, color: "text-green-600" },
    { label: "Absent", value: summary["Absent"] || 0, color: "text-red-600" },
    { label: "Half Day", value: summary["Half Day"] || 0, color: "text-yellow-600" },
    { label: "On Leave", value: summary["On Leave"] || 0, color: "text-blue-600" },
    { label: "Holiday", value: summary["Holiday"] || 0, color: "text-gray-600" },
    { label: "Weekend", value: summary["Weekend"] || 0, color: "text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {summaryItems.map(item => (
        <div key={item.label} className="bg-gray-50 p-3 rounded-lg text-center">
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          <p className="text-sm text-gray-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

const EmployeeAttendance = () => {
  const dispatch = useDispatch();
  const { attendance, loading, error } = useSelector(
    (state) => state.attendances
  );

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [date, setDate] = useState(null); // State to manage selected date
  const [attendanceData, setAttendanceData] = useState([]); // State for attendance data for the calendar
  const [showReasonForm, setShowReasonForm] = useState(false); // State to control reason form visibility
  const [reason, setReason] = useState(""); // State to store the reason
  const [showToast, setShowToast] = useState(false); // State to control toast visibility
  const [reasonSubmitted, setReasonSubmitted] = useState(false); // State to track if reason was submitted
  const [monthlySummary, setMonthlySummary] = useState({}); // State to store monthly attendance summary counts
  const calendarRef = useRef(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // State for real-time updates
  const [dailyAttendanceData, setDailyAttendanceData] = useState(null); // State for daily attendance data

  // Get current date info
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "short" });
  const currentYear = today.getFullYear().toString();

  // Initialize with current month and year
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Add useEffect for calendar click outside handling
  useEffect(() => {
    const handleCalendarClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleCalendarClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleCalendarClickOutside);
    };
  }, []);

  // Update current time every second for real-time calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleCalendar = useCallback(
    () => setIsCalendarOpen(!isCalendarOpen),
    [isCalendarOpen]
  );

  const handleMonthSelection = useCallback(
    (month, year) => {
      setSelectedMonth(month);
      setSelectedYear(year);
      setIsCalendarOpen(false);

      // Get employee ID from session storage
      const employeeId = sessionStorage.getItem("employeeId");
      if (!employeeId) {
        toast.error("Employee ID not found in session storage.");
        return;
      }

      // Dispatch the action to fetch attendance data
      dispatch(
        fetchOneEmployeeAttendanceOneMonth({
          employeeId,
          month,
          year,
        })
      );
    },
    [dispatch]
  );

  // Initial data fetch when component mounts
  useEffect(() => {
    const employeeId = sessionStorage.getItem("employeeId");
    if (!employeeId) {
      toast.error("Employee ID not found in session storage.");
      return;
    }

    // Fetch data for current month and year
    dispatch(
      fetchOneEmployeeAttendanceOneMonth({
        employeeId,
        month: currentMonth,
        year: currentYear,
      })
    );
  }, [dispatch, currentMonth, currentYear]);

  // Update attendance data when Redux store changes
  useEffect(() => {
    if (attendance && !loading && !error) {
      const monthIndex = new Date(
        `${selectedMonth} 1, ${selectedYear}`
      ).getMonth();
      const daysInMonth = new Date(
        parseInt(selectedYear),
        monthIndex + 1,
        0
      ).getDate();

      const formattedData = [];
      const summaryCounts = {
        Present: 0,
        "Present with Leave": 0,
        "Present on Holiday": 0,
        "Half Day on Holiday": 0,
        "Half Day": 0,
        "On Leave": 0,
        Holiday: 0,
        Weekend: 0,
        "Loss of Pay": 0,
        Absent: 0,
        "No Data": 0,
      };

      // Helper function to determine attendance status for a given date
      const getAttendanceStatusForDate = (dateString) => {
        // Check present dates
        if (attendance.presentDates?.includes(dateString)) {
          return "P";
        }

        // Check full leave dates
        if (attendance.fullLeaveDates?.includes(dateString)) {
          return "PL";
        }

        // Check half day leave dates
        if (attendance.halfDayLeaveDates?.includes(dateString)) {
          return "P/A";
        }

        // Check full comp-off dates
        if (attendance.fullCompoffDates?.includes(dateString)) {
          return "P";
        }

        // Check half comp-off dates
        if (attendance.halfCompoffDates?.includes(dateString)) {
          return "P/A";
        }

        // Check weekly off dates
        if (attendance.weeklyOffDates?.includes(dateString)) {
          return "H";
        }

        // Check absent dates
        if (attendance.absentDates?.includes(dateString)) {
          return "A";
        }

        return null;
      };

      for (let day = 1; day <= daysInMonth; day++) {
        // Create date string in YYYY-MM-DD format
        const dateString = `${selectedYear}-${String(monthIndex + 1).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;
        const status = getAttendanceStatusForDate(dateString);

        let fullStatus = "No Data";
        let leaveType = null;

        switch (status) {
          case "P":
            fullStatus = "Present";
            break;
          case "PL":
            fullStatus = "Present with Leave";
            break;
          case "A":
            fullStatus = "Absent";
            break;
          // case "L":
          //   fullStatus = "On Leave";
          //   leaveType = "Full Day";
          //   break;
          case "H":
            fullStatus = "Holiday";
            break;
          case "W":
            fullStatus = "Weekend";
            break;
          case "PH":
            fullStatus = "Present on Holiday";
            leaveType = "On Holiday";
            break;
          case "PH/A":
            fullStatus = "Half Day on Holiday";
            leaveType = "Half Day on Holiday";
            break;
          case "P/A":
            fullStatus = "Half Day";
            leaveType = "Half Day";
            break;
          case "LOP":
            fullStatus = "Loss of Pay";
            leaveType = "Loss of Pay";
            break;
          default:
            fullStatus = "No Data";
        }

        formattedData.push({
          date: new Date(parseInt(selectedYear), monthIndex, day),
          status: fullStatus,
          isLate: false,
          checkIn: null,
          checkOut: null,
          leaveType: leaveType,
          checkinTimes: attendance?.checkinTimes || [],
          checkoutTimes: attendance?.checkoutTimes || [],
          totalWorkingMinutes: attendance?.totalWorkingMinutes || 0,
        });

        summaryCounts[fullStatus] = (summaryCounts[fullStatus] || 0) + 1;
      }
      setAttendanceData(formattedData);
      setMonthlySummary(summaryCounts);
      setDailyAttendanceData(null); // Reset daily data on month change
    } else if (error) {
      toast.error(`Failed to fetch attendance data: ${error}`);
      setAttendanceData([]);
      setMonthlySummary({});
    }
  }, [attendance, loading, error, selectedMonth, selectedYear]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

    const generateCalendarDays = () => {
    const monthIndex = new Date(`${selectedMonth} 1, ${selectedYear}`).getMonth();
    const year = parseInt(selectedYear);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    let daysArray = [];

    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, monthIndex, day));
    }

    return daysArray.map((day) => (
      <div
        key={day.toDateString()}
        className={`w-[14.2857%] text-center p-2 cursor-pointer rounded-md transition ${
          attendanceData.find((d) => d.date.toDateString() === day.toDateString())?.status
            ? attendanceData.find((d) => d.date.toDateString() === day.toDateString())?.status === "Present"
              ? "bg-green-100 hover:bg-green-200 text-green-800"
              : attendanceData.find((d) => d.date.toDateString() === day.toDateString())?.status === "Present with Leave"
              ? "bg-lime-100 hover:bg-lime-200 text-lime-800"
              : attendanceData.find((d) => d.date.toDateString() === day.toDateString())?.status === "Absent"
              ? "bg-red-200 hover:bg-red-300 text-red-900"
              : attendanceData.find((d) => d.date.toDateString() === day.toDateString())?.status === "Half Day"
              ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
              : attendanceData.find((d) => d.date.toDateString() === day.toDateString())?.status === "Holiday"
              ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
              : attendanceData.find((d) => d.date.toDateString() === day.toDateString())?.status === "Present on Holiday"
              ? "bg-blue-100 hover:bg-blue-200 text-blue-800"
              : attendanceData.find((d) => d.date.toDateString() === day.toDateString())?.status === "Half Day on Holiday"
              ? "bg-orange-200 hover:bg-orange-300 text-orange-800"
              : attendanceData.find((d) => d.date.toDateString() === day.toDateString())?.status === "Loss of Pay"
              ? "bg-purple-100 hover:bg-purple-200 text-purple-800"
              : "hover:bg-gray-200"
            : "hover:bg-gray-200"
        }`}
        onClick={() => setDate(day)}
      >
        {day.getDate()}
      </div>
    ));
  };

  const handleSubmitReason = (e) => {
    e.preventDefault();

    // Show toast notification
    setShowToast(true);

    // Mark reason as submitted
    setReasonSubmitted(true);

    // Close form and reset reason
    setShowReasonForm(false);
    setReason("");
  };

  // Function to fetch attendance data for a specific date
  const fetchAttendanceData = async (selectedDate) => {
    try {
      const employeeId = sessionStorage.getItem("employeeId");
      const token = getItemFromSessionStorage("token", null);

      if (!employeeId || !token) {
        toast.error("Employee ID or token not found in session storage.");
        return;
      }

      // Fix: Format date properly without timezone conversion
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      // Construct the URL in the new format: /employee/{employeeId}/month/{monthShortName}/year/{fullYear}
      const url = `http://192.168.0.200:8082/employee/daily/${employeeId}/${formattedDate}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      // Store the daily attendance data
      setDailyAttendanceData(data);

      // Update state with fetched data while preserving status and color information
      setAttendanceData((prevData) => {
        const updatedData = prevData.map((d) => {
          if (d.date.toDateString() === selectedDate.toDateString()) {
            return {
              ...d,
              // Store the new API response data
              dailyAttendanceData: data,
              // Preserve the status and other display properties
              status: d.status,
              isLate: d.isLate,
              leaveType: d.leaveType,
            };
          }
          return d;
        });
        return updatedData;
      });
    } catch (error) {
      toast.error(`Failed to fetch attendance data: ${error.message}`);
    }
  };

  // Update the onClick handler for each date
  const handleDateClick = (day) => {
    setDate(day);
    
    // Find attendance data for the selected date
    const selectedDayData = attendanceData.find(
      (d) => d.date.toDateString() === day.toDateString()
    );
    
    // Only fetch daily attendance data for present dates
    if (selectedDayData && selectedDayData.status === "Present") {
      fetchAttendanceData(day);
    } else {
      // Clear daily attendance data for non-present dates
      setDailyAttendanceData(null);
    }
  };

  const calendarDays = generateCalendarDays();

  // Helper function to format time in AM/PM
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDayName = (dateObj) => {
    return dateObj.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Helper function to parse time duration string (HH:MM:SS) to minutes
  const parseTimeDuration = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  };

  // Helper function to calculate additional time since latest checkin
  const calculateAdditionalTimeFromLatestCheckin = (latestCheckin) => {
    if (!latestCheckin) return 0;
    const latestCheckinTime = new Date(latestCheckin);
    const timeDiff = currentTime.getTime() - latestCheckinTime.getTime();
    return timeDiff / (1000 * 60); // Convert to minutes
  };

  // Helper function to format live working hours (using latestCheckin)
  const formatLiveWorkingHours = (workingHoursTillNow, latestCheckin) => {
    const baseMinutes = parseTimeDuration(workingHoursTillNow);
    const additionalMinutes = calculateAdditionalTimeFromLatestCheckin(latestCheckin);
    const totalMinutes = baseMinutes + additionalMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  // Helper function to format workingHoursTillNow string to xh ym format
  const formatWorkingHoursString = (workingHoursString) => {
    const [hours, minutes] = workingHoursString.split(":").map(Number);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        } transition-all duration-300`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">My Attendance</h1>
                <p className="text-gray-500">
                  View and manage your attendance record.
                </p>
              </div>
              <div className="relative" ref={calendarRef}>
                <button
                  onClick={toggleCalendar}
                  className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50"
                >
                  <CalendarIcon className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold">{`${selectedMonth}, ${selectedYear}`}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isCalendarOpen && (
                  <MonthYearSelector
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onSelect={handleMonthSelection}
                  />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div key={day}>{day}</div>
                        )
                      )}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {generateCalendarDays()}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Details</CardTitle>
                    <CardDescription>
                      {date
                        ? new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Select a date to see details"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dailyAttendanceData ? (
                      <DailyDetails data={dailyAttendanceData} />
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>No details to show for the selected date.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MonthlySummary summary={monthlySummary} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default withAuth(EmployeeAttendance);
