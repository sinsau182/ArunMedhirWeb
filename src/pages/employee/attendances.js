import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle2, Clock, CalendarIcon } from "lucide-react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';

const EmployeeAttendance = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [date, setDate] = useState(null); // State to manage selected date
  const [attendanceData, setAttendanceData] = useState([]); // State for attendance data for the calendar
  const [showReasonForm, setShowReasonForm] = useState(false); // State to control reason form visibility
  const [reason, setReason] = useState(""); // State to store the reason
  const [showToast, setShowToast] = useState(false); // State to control toast visibility
  const [reasonSubmitted, setReasonSubmitted] = useState(false); // State to track if reason was submitted
  const [monthlySummary, setMonthlySummary] = useState({}); // State to store monthly attendance summary counts

  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      const employeeId = sessionStorage.getItem("employeeId");
      const token = getItemFromSessionStorage("token", null);

      if (!employeeId || !token) {
        toast.error("Employee ID or token not found in session storage.");
        return;
      }

      const today = new Date();
      const year = today.getFullYear();
      const monthDate = new Date(year, today.getMonth(), 1);
      const monthShortName = monthDate.toLocaleDateString('en-US', { month: 'short' });

      const url = `http://localhost:8083/api/attendance/employee/${employeeId}/month/${monthShortName}/year/${year}`;

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const data = result.dailyAttendance;

        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const formattedData = [];
        const summaryCounts = {
          'Present': 0,
          'Present on Holiday': 0,
          'Half Day on Holiday': 0,
          'Half Day': 0,
          'On Leave': 0,
          'Holiday': 0,
          'Weekend': 0,
          'Loss of Pay': 0,
          'Absent': 0,
          'No Data': 0,
        };

        for (let day = 1; day <= daysInMonth; day++) {
          const status = data[day.toString()] || null;
          let fullStatus = 'No Data';
          let leaveType = null;

          switch (status) {
            case 'P':
              fullStatus = 'Present';
              break;
            case 'A':
              fullStatus = 'Absent';
              break;
            case 'L':
              fullStatus = 'On Leave';
              leaveType = 'Full Day';
              break;
            case 'H':
              fullStatus = 'Holiday';
              break;
            case 'W':
              fullStatus = 'Weekend';
              break;
            case 'PH':
              fullStatus = 'Present on Holiday';
              leaveType = 'On Holiday';
              break;
            case 'PH/A':
              fullStatus = 'Half Day on Holiday';
              leaveType = 'Half Day on Holiday';
              break;
            case 'P/A':
              fullStatus = 'Half Day';
              leaveType = 'Half Day';
              break;
            case 'LOP':
              fullStatus = 'Loss of Pay';
              leaveType = 'Loss of Pay';
              break;
            default:
              fullStatus = 'No Data';
          }

          formattedData.push({
            date: new Date(year, month, day),
            status: fullStatus,
            isLate: false,
            checkIn: null,
            checkOut: null,
            leaveType: leaveType,
            checkinTimes: [],
            checkoutTimes: [],
            totalWorkingMinutes: 0,
          });

          summaryCounts[fullStatus] = (summaryCounts[fullStatus] || 0) + 1;
        }
        setAttendanceData(formattedData);
        setMonthlySummary(summaryCounts);
      } catch (error) {
        toast.error(`Failed to fetch monthly attendance data: ${error.message}`);
        setAttendanceData([]);
        setMonthlySummary({});
      }
    };

    fetchMonthlyAttendance();
    // Auto-hide toast after 3 seconds
  }, []);

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
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let daysArray = [];

    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, month, day));
    }

    return daysArray;
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

      const year = selectedDate.getFullYear();
      const day = selectedDate.getDate();
      // Get the short month name (e.g., "Apr")
      const monthShortName = selectedDate.toLocaleDateString('en-US', { month: 'short' });

      // Construct the URL in the new format: /employee/{employeeId}/month/{monthShortName}/year/{fullYear}
      const url = `http://localhost:8083/api/attendance/employee/${employeeId}/month/${monthShortName}/year/${year}`;

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
      
      // Update state with fetched data while preserving status and color information
      setAttendanceData((prevData) => {
        const updatedData = prevData.map((d) => {
          if (d.date.toDateString() === selectedDate.toDateString()) {
            return {
              ...d,
              checkinTimes: data.checkinTimes || d.checkinTimes,
              checkoutTimes: data.checkoutTimes || d.checkoutTimes,
              totalWorkingMinutes: data.totalWorkingMinutes || d.totalWorkingMinutes,
              // Preserve the status and other display properties
              status: d.status,
              isLate: d.isLate,
              leaveType: d.leaveType
            };
          }
          return d;
        });
        return updatedData;
      });
    } catch (error) {
      toast.error(
        `Failed to fetch attendance data: ${error.message}`
      );
    }
  };

  // Update the onClick handler for each date
  const handleDateClick = (day) => {
    setDate(day);
    fetchAttendanceData(day);
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
    return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        {/* Navbar */}
        <HradminNavbar />

        {/* Content */}
        <div className="p-6 space-y-6 mt-16">
          {" "}
          {/* Increased mt-16 for more spacing */}
          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Monthly Summary</CardTitle>
              <CardDescription>
                Your attendance statistics for this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {/* Present */}
                  <div className="flex flex-col bg-green-100 p-3 rounded-lg">
                    <span className="font-medium text-green-800">Present (P)</span>
                    <span className="text-2xl font-bold">{monthlySummary['Present'] || 0}</span>
                  </div>
                  {/* Half Day */}
                  <div className="flex flex-col bg-yellow-100 p-3 rounded-lg">
                    <span className="font-medium text-yellow-800">Half Day (P/A)</span>
                    <span className="text-2xl font-bold">{monthlySummary['Half Day'] || 0}</span>
                  </div>
                  {/* Absent */}
                  <div className="flex flex-col bg-red-200 p-3 rounded-lg">
                    <span className="font-medium text-red-900">Absent (A)</span>
                    <span className="text-2xl font-bold">{monthlySummary['Absent'] || 0}</span>
                  </div>
                  {/* Holiday */}
                  <div className="flex flex-col bg-gray-200 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Holiday (H)</span>
                    <span className="text-2xl font-bold">{monthlySummary['Holiday'] || 0}</span>
                  </div>
                  {/* Present on Holiday */}
                  <div className="flex flex-col bg-blue-100 p-3 rounded-lg">
                    <span className="font-medium text-blue-800">Present on Holiday (PH)</span>
                    <span className="text-2xl font-bold">{monthlySummary['Present on Holiday'] || 0}</span>
                  </div>
                  {/* Half Day on Holiday */}
                  <div className="flex flex-col bg-orange-200 p-3 rounded-lg">
                    <span className="font-medium text-orange-800">Half Day on Holiday (PH/A)</span>
                    <span className="text-2xl font-bold">{monthlySummary['Half Day on Holiday'] || 0}</span>
                  </div>
                  {/* Loss of Pay */}
                  <div className="flex flex-col bg-purple-100 p-3 rounded-lg">
                    <span className="font-medium text-purple-800">Loss of Pay (LOP)</span>
                    <span className="text-2xl font-bold">{monthlySummary['Loss of Pay'] || 0}</span>
                  </div>
                  {/* No Data removed */}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Attendance Calendar */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Attendance Calendar</CardTitle>
                <CardDescription>
                  View and track your attendance history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Calendar Days */}
                <div className="flex flex-wrap gap-1 border rounded-md p-2">
                  {calendarDays.map((day, index) => {
                    // Find attendance status for the current day
                    const dayData = attendanceData.find(
                      (d) => d.date.toDateString() === day.toDateString()
                    );
                    const status = dayData?.status;
                    const dayNumber = day.getDate();

                    // Determine background color based on status
                    let bgColorClass = "hover:bg-gray-200";
                    if (dayData) {
                      switch (status) {
                        case 'Present':
                          bgColorClass = "bg-green-100 hover:bg-green-200 text-green-800";
                          break;
                        case 'Absent':
                          bgColorClass = "bg-red-200 hover:bg-red-300 text-red-900";
                          break;
                        case 'Half Day':
                          bgColorClass = "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
                          break;
                        case 'Holiday':
                          bgColorClass = "bg-gray-200 hover:bg-gray-300 text-gray-700";
                          break;
                        case 'Present on Holiday':
                          bgColorClass = "bg-blue-100 hover:bg-blue-200 text-blue-800";
                          break;
                        case 'Half Day on Holiday':
                          bgColorClass = "bg-orange-200 hover:bg-orange-300 text-orange-800";
                          break;
                        case 'Loss of Pay':
                          bgColorClass = "bg-purple-100 hover:bg-purple-200 text-purple-800";
                          break;
                        default:
                          bgColorClass = "hover:bg-gray-200";
                      }
                    }

                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`w-[6.5%] text-center p-2 cursor-pointer rounded-md transition ${bgColorClass}`}
                      >
                        {dayNumber}
                      </div>
                    );
                  })}
                </div>
                {/* Legend Table removed */}
              </CardContent>
            </Card>

            {/* Attendance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {date
                    ? (
                        <>
                          {date.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                          <div className="text-base font-semibold text-gray-800 mt-1">
                            {getDayName(date)}
                          </div>
                        </>
                      )
                    : "Select a date"}
                </CardTitle>
                <CardDescription>Attendance details</CardDescription>
              </CardHeader>
              <CardContent>
                {date ? (
                  (() => {
                    // Find attendance details for the selected date
                    const selectedDayData = attendanceData.find(
                      (d) => d.date.toDateString() === date.toDateString()
                    );

                    if (!selectedDayData) {
                      return (
                        <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                          <p>No attendance data for this date.</p>
                        </div>
                      );
                    }

                    const {
                      status,
                      checkinTimes,
                      checkoutTimes,
                      totalWorkingMinutes,
                    } = selectedDayData;

                    // Calculate total working hours
                    const totalWorkingHours = (
                      totalWorkingMinutes / 60
                    ).toFixed(1);

                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Status:</span>
                          <span
                            className={`${
                              status === 'Present'
                                ? 'bg-green-100 text-green-800'
                                : status === 'Absent'
                                ? 'bg-red-200 text-red-900'
                                : status === 'Half Day'
                                ? 'bg-yellow-100 text-yellow-800'
                                : status === 'Holiday'
                                ? 'bg-gray-200 text-gray-700'
                                : status === 'Present on Holiday'
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'Half Day on Holiday'
                                ? 'bg-orange-200 text-orange-800'
                                : status === 'Loss of Pay'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-700'
                            } text-xs font-semibold px-2 py-1 rounded-full`}
                          >
                            {status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" /> Check In
                          </span>
                          <span>
                            {checkinTimes?.[0]
                              ? formatTime(checkinTimes[0])
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" /> Check
                            Out
                          </span>
                          <span>
                            {checkoutTimes?.[0]
                              ? formatTime(checkoutTimes[0])
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Total Working Hours:
                          </span>
                          <span>{totalWorkingHours} hours</span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mb-2 text-muted-foreground/60" />
                    <p>Select a date to view attendance details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reason Form Modal */}
      {showReasonForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Submit Reason for Unapproved Absence
            </h3>
            <form onSubmit={handleSubmitReason}>
              <div className="mb-4">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium mb-2"
                >
                  Reason for unapproved absence
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows="4"
                  placeholder="Please provide a reason for your unapproved absence..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReasonForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-400 text-white rounded-md hover:bg-teal-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          <span>Reason saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default withAuth(EmployeeAttendance);
