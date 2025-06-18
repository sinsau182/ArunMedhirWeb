/* eslint-disable react/jsx-key */
import React, { useCallback, useState, useEffect } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

import {
  FaUser,
  FaClock,
  FaCreditCard,
  FaUsers,
} from "react-icons/fa";


import RequestDetails from "@/components/RequestDetails";

import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import getConfig from "next/config";

// Import necessary hooks and actions
import { useRouter } from "next/router";
import { fetchAllEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";
import { fetchExpenseRequests, fetchIncomeRequests } from "@/redux/slices/requestDetailsSlice";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28BFE",
  "#82CA9D",
];

const Overview = () => {

  // Get router instance
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [showCharts, setShowCharts] = useState(false);

  const [activeIndex, setActiveIndex] = useState(null);

  const [showRequestDetails, setShowRequestDetails] = useState(false); // New state

  const [activeTab, setActiveTab] = useState("leaveRequests");

  const [profileUpdates, setProfileUpdates] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingCompOffs, setPendingCompOffs] = useState([]);

  // Add state for current day attendance summary
  const [currentDayAttendanceSummary, setCurrentDayAttendanceSummary] = useState({
    totalPresent: 0,
    totalAbsent: 0,
  });

    // Animation state for Total Employees card
    const [loadingNumbers, setLoadingNumbers] = useState(true);
    const [displayedTotal, setDisplayedTotal] = useState(0);
    const [displayedPresent, setDisplayedPresent] = useState(0);
    const [displayedAbsent, setDisplayedAbsent] = useState(0);

  const dispatch = useDispatch();
  // Update the useSelector hook
  const { employees, loading: employeesLoading } = useSelector(
    (state) => state.employees || {}
  );
  const { attendance, loading: attendanceLoading, err: attendanceErr } = useSelector((state) => state.attendances || {}); // Add attendance state
  // Get state from Redux
  const {
    expensesRequests,
    incomeRequests,
  } = useSelector((state) => state.requestDetails);
  console.log(expensesRequests);

  const {publicRuntimeConfig} = getConfig();
  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchExpenseRequests());
    dispatch(fetchIncomeRequests());
  }, [dispatch, sessionStorage.getItem("currentCompanyId")]);

  // Add useEffect to fetch current day's attendance and calculate summary
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.toLocaleString("default", { month: "short" });
    const currentYear = today.getFullYear().toString();

    // Fetch attendance data for the current day
    dispatch(
      fetchAllEmployeeAttendanceOneMonth({
        month: currentMonth,
        year: currentYear,
        date: currentDay, // Fetch only for the current day
      })
    );
  }, [dispatch, sessionStorage.getItem("currentCompanyId")]); // Dependency on dispatch

  // Calculate current day summary whenever attendance data changes
  useEffect(() => {
    if (attendance && attendance.length > 0) {
      let presentCount = 0;
      let absentCount = 0;
      const today = new Date();
      const currentDay = today.getDate().toString(); // Need day as string key

      attendance.forEach(employeeRecord => {
        const status = employeeRecord.dailyAttendance?.[currentDay];
        if (status === 'P') {
          presentCount++;
        } else if (status === 'A' || status === 'LOP') { // Consider LOP as Absent for this summary? Adjust if needed.
          absentCount++;
        }
      });

      setCurrentDayAttendanceSummary({
        totalPresent: presentCount,
        totalAbsent: absentCount,
      });
    } else {
       // If no attendance data fetched (e.g. empty response), reset summary
      setCurrentDayAttendanceSummary({
        totalPresent: 0,
        totalAbsent: 0,
      });
    }
  }, [attendance]); // Dependency on attendance state

  useEffect(() => {
    setLoadingNumbers(true);
    const timer = setTimeout(() => {
      setLoadingNumbers(false);
    }, 1000); // 1 second loading
    return () => clearTimeout(timer);
  }, [employees, currentDayAttendanceSummary]);

  // Count up animation for numbers
  useEffect(() => {
    if (!loadingNumbers) {
      let total = employees?.length ?? 0;
      let present = currentDayAttendanceSummary.totalPresent;
      let absent = currentDayAttendanceSummary.totalAbsent;
      let duration = 500; // ms
      let steps = 20;
      let stepTime = duration / steps;
      let i = 0;
      let totalStep = total / steps;
      let presentStep = present / steps;
      let absentStep = absent / steps;
      const interval = setInterval(() => {
        i++;
        setDisplayedTotal(Math.round(Math.min(total, i * totalStep)));
        setDisplayedPresent(Math.round(Math.min(present, i * presentStep)));
        setDisplayedAbsent(Math.round(Math.min(absent, i * absentStep)));
        if (i >= steps) {
          setDisplayedTotal(total);
          setDisplayedPresent(present);
          setDisplayedAbsent(absent);
          clearInterval(interval);
        }
      }, stepTime);
      return () => clearInterval(interval);
    } else {
      setDisplayedTotal(0);
      setDisplayedPresent(0);
      setDisplayedAbsent(0);
    }
  }, [loadingNumbers, employees, currentDayAttendanceSummary]);


  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleOpenRequestsClick = () => {
    setShowRequestDetails((prevShowRequestDetails) => !prevShowRequestDetails); // Toggle Request Details

    setShowCharts(false); // Ensure Charts are hidden
  };

  // Handler for clicking the attendance summary counts
  const handleAttendanceCountClick = useCallback((status) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.toLocaleString("default", { month: "long" }); // Use long month for consistency with attendance page state
    const currentYear = today.getFullYear().toString();

    // Navigate to attendance page with selected date and status filter
    router.push({
      pathname: '/hradmin/attendance',
      query: {
        selectedDate: currentDay,
        selectedMonth: currentMonth,
        selectedYear: currentYear,
        selectedStatuses: status, // 'P' or 'A'
      },
    });
  }, [router]);

  const fetchProfileUpdates = useCallback(async () => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = sessionStorage.getItem("currentCompanyId");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const response = await fetch(
        `${publicRuntimeConfig.apiURL}/hradmin/company/${company}/update-requests`,
        { headers }
      );
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      setProfileUpdates(data);
    } catch (error) {
      toast.error(`Failed to fetch profile updates: ${error.message}`);
      setProfileUpdates([]);
    }
  }, [publicRuntimeConfig.apiURL]); // No dependencies; update if needed
  
  const fetchPendingRequests = useCallback(async () => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = sessionStorage.getItem("currentCompanyId");
      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/leave/status/${company}/Pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
  
      if (response.data && Array.isArray(response.data.leaves)) {
        const regularLeaves = response.data.leaves.filter(
          (leave) => leave.leaveName !== "Comp-Off"
        );
        const compOffLeaves = response.data.leaves.filter(
          (leave) => leave.leaveName === "Comp-Off"
        );
  
        setPendingLeaves(regularLeaves);
        setPendingCompOffs(compOffLeaves);
      } else {
        setPendingLeaves([]);
        setPendingCompOffs([]);
      }
    } catch (error) {
      setPendingLeaves([]);
      setPendingCompOffs([]);
    }
  }, [publicRuntimeConfig.apiURL]); // No dependencies; update if needed
  
  useEffect(() => {
    fetchPendingRequests();
    fetchProfileUpdates();
  }, [fetchPendingRequests, fetchProfileUpdates, sessionStorage.getItem("currentCompanyId")]);

  const data = [
    { name: "Mon", present: 80, absent: 10, leave: 5 },

    { name: "Tue", present: 85, absent: 8, leave: 4 },

    { name: "Wed", present: 82, absent: 12, leave: 3 },

    { name: "Thu", present: 84, absent: 9, leave: 5 },

    { name: "Fri", present: 78, absent: 15, leave: 6 },
  ];

  const departmentData = [
    { name: "Engineering", value: 25 },

    { name: "Sales", value: 18 },

    { name: "Marketing", value: 12 },

    { name: "HR", value: 8 },

    { name: "Finance", value: 10 },

    { name: "Product", value: 15 },
  ];

  const overviewData = [
    {
      icon: <FaUser className="h-6 w-6 text-blue-500" />,
      label: "Total Employees",
      count: employees?.length ?? 0,
      onClick: null,
    },
    {
      icon: <FaClock className="h-6 w-6 text-yellow-500" />,
      label: "Pending Tasks",
      count:
        (profileUpdates?.length || 0) + 
        (pendingLeaves?.length || 0) + 
        (pendingCompOffs?.length || 0) + 
        (expensesRequests?.length || 0) +
        (incomeRequests?.length || 0),
      onClick: handleOpenRequestsClick,
    },
    // Payroll Status card removed
  ];

  // Decide which items to display in the overview section
  // Only Total Employees and Pending Tasks for a 2-column layout
  const itemsToDisplayInOverview = overviewData.filter(item =>
    item.label === "Total Employees" ||
    item.label === "Pending Tasks"
  );

  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  const onPieLeave = useCallback(
    (_, index) => {
      setActiveIndex(null);
    },
    [setActiveIndex]
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentRole={"hr"}
      />

      {/* Main Content */}

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        {/* Navbar */}

        <HradminNavbar />

        {/* Page Content */}

        <div className="pt-24 px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 text-left">
              Company Overview Dashboard
            </h1>
          </div>

          {/* Overview Cards */}

          <div className="flex justify-center">
            {/* Updated grid layout and data source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12 mb-3"> {/* Changed to lg:grid-cols-2 */}
              {itemsToDisplayInOverview.map((item, index) => (
                item.label === "Total Employees" ? (
                  <div
                    key={index}
                    className="relative bg-white/90 shadow-xl rounded-2xl flex flex-col items-center justify-between border border-gray-100 p-8 w-full max-w-xl mx-auto transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                    style={{ minHeight: "220px" }}
                  >
                    <div className="flex justify-between items-center w-full mb-6">
                      <h2 className="text-lg font-bold text-gray-800">Today's Attendance</h2>
                      <div className="p-2 bg-blue-50 rounded-full">
                        <FaUsers className="text-blue-600 text-xl" />
                      </div>
                    </div>
                    <div className="flex w-full justify-center items-end gap-0 text-center mt-2">
                      {/* Total Employees */}
                      <div className="flex flex-col items-center justify-center flex-1">
                        <span className="text-7xl font-extrabold text-gray-800 leading-tight">{displayedTotal}</span>
                        <span className="text-sm text-gray-400 mt-2 tracking-wide">Total</span>
                      </div>
                      {/* Divider */}
                      <div className="h-16 border-l border-gray-200 mx-4"></div>
                      {/* Present */}
                      <div className="flex flex-col items-center justify-center flex-1">
                        <span
                          className="text-7xl font-extrabold text-green-700 leading-tight cursor-pointer hover:underline transition"
                          onClick={() => handleAttendanceCountClick('P')}
                        >
                          {displayedPresent}
                        </span>
                        <span className="text-sm text-gray-400 mt-2 tracking-wide">Present</span>
                      </div>
                      {/* Divider */}
                      <div className="h-16 border-l border-gray-200 mx-4"></div>
                      {/* Absent */}
                      <div className="flex flex-col items-center justify-center flex-1">
                        <span
                          className="text-7xl font-extrabold text-red-400 leading-tight cursor-pointer hover:underline transition"
                          onClick={() => handleAttendanceCountClick('A')}
                        >
                          {displayedAbsent}
                        </span>
                        <span className="text-sm text-gray-400 mt-2 tracking-wide">Absent</span>
                      </div>
                    </div>
                  </div>
                ) : (
                   // Rendering for other cards (Pending Tasks, Payroll Status)
                   <div
                    key={index}
                    className="p-8 bg-white shadow-lg rounded-xl flex flex-col justify-between items-start hover:shadow-2xl hover:scale-105 transform transition-all duration-300 cursor-pointer border border-gray-100"
                    style={{ height: "250px", width: "350px" }} // Adjust width if needed
                    onClick={item.onClick} // Apply click handler
                  >
                    <div className="flex justify-between items-center w-full mb-8">
                      <p className="text-xl font-semibold text-gray-800">
                        {item.label}
                      </p>
                      <div className={`p-3 rounded-full ${ // Dynamic background color based on label
                         item.label === "Total Employees" ? "bg-gradient-to-r from-blue-50 to-blue-100" :
                         item.label === "Pending Tasks" ? "bg-gradient-to-r from-yellow-50 to-yellow-100" :
                         item.label === "Present Today" ? "bg-gradient-to-r from-green-50 to-green-100" :
                         item.label === "Absent Today" ? "bg-gradient-to-r from-red-50 to-red-100" : ""
                      }`}>
                        {/* Dynamic icon based on label */}
                         {item.label === "Total Employees" && <FaUsers className="text-blue-600 text-2xl" />}
                         {item.label === "Pending Tasks" && <FaClock className="text-yellow-600 text-2xl" />}
                         {(item.label === "Present Today" || item.label === "Absent Today") && (
                            <FaUser className={`text-2xl ${item.label === "Present Today" ? "text-green-600" : "text-red-600"}`} />
                         )}
                         {item.label === "Payroll Status" && <FaCreditCard className="text-purple-600 text-2xl" />}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-5xl font-bold text-gray-900">
                        {item.count}
                      </p>
                       {/* Add descriptive text below the count */}
                      <div className="flex items-center text-gray-600">
                         {item.label === "Total Employees" && <p className="text-sm">Active employees</p>}
                         {item.label === "Pending Tasks" && <p className="text-sm">Tasks pending</p>}
                         {item.label === "Present Today" && <p className="text-sm">Employees present</p>}
                         {item.label === "Absent Today" && <p className="text-sm">Employees absent</p>}
                         {item.label === "Payroll Status" && <p className="text-sm">Current status</p>}
                      </div>
                      {/* Optional: add more detail/badge like last month comparison or priority */}
                       {(item.label === "Total Employees" || item.label === "Pending Tasks" || item.label === "Payroll Status") && (
                          <div className={`ml-2 px-2 py-1 rounded-full ${
                             item.label === "Total Employees" ? "bg-blue-50" :
                             item.label === "Pending Tasks" ? "bg-yellow-50" :
                             item.label === "Payroll Status" ? "bg-purple-50" : ""
                          }`}>
                             <span className={`text-xs font-medium ${
                                item.label === "Total Employees" ? "text-blue-600" :
                                item.label === "Pending Tasks" ? "text-yellow-600" :
                                item.label === "Payroll Status" ? "text-purple-600" : ""
                             }`}>
                                {item.label === "Total Employees" ? "+12 from last month" :
                                 item.label === "Pending Tasks" ? "High priority" :
                                 item.label === "Payroll Status" ? "March 2024" : ""}
                             </span>
                          </div>
                       )}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 shadow-md rounded-lg hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Weekly Attendance
                </h2>

                <ResponsiveContainer width="100" height={300}>
                  <BarChart data={data}>
                    <XAxis
                      dataKey="name"
                      stroke="#6b7280"
                      tick={{
                        fontSize: 14,
                        fill: "#374151",
                        fontWeight: "bold",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      stroke="#d1d5db"
                      tick={{
                        fontSize: 14,
                        fill: "#374151",
                        fontWeight: "bold",
                      }}
                      tickFormatter={(value) => `${value}%`}
                      tickLine={false}
                      axisLine={false}
                    />

                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",

                        border: "1px solid #e5e7eb",

                        borderRadius: "8px",

                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",

                        width: "200px",

                        padding: "10px",
                      }}
                      labelStyle={{
                        color: "#000000",

                        fontSize: "14px",

                        fontWeight: "bold",

                        marginBottom: "8px",
                      }}
                      itemStyle={{
                        color: "#374151",

                        fontSize: "12px",

                        display: "flex",

                        alignItems: "center",

                        gap: "8px",
                      }}
                      formatter={(value, name) => {
                        if (value !== undefined) {
                          return [
                            <span className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    name === "present"
                                      ? "rgb(74, 222, 128)"
                                      : name === "absent"
                                      ? "rgb(248, 113, 113)"
                                      : "#FFBB28",
                                }}
                              ></span>

                              <span className="text-gray-600">
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                              </span>
                            </span>,

                            <span className="font-bold">{value}%</span>,
                          ];
                        }

                        return null;
                      }}
                    />

                    <Bar
                      dataKey="present"
                      fill="rgb(74, 222, 128)"
                      barSize={40}
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="absent"
                      fill="rgb(248, 113, 113)"
                      barSize={40}
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="leave"
                      fill="#FFBB28"
                      barSize={40}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 shadow-md rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Department Distribution
                </h2>

                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="35%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      // onMouseEnter={(data, index) => setActiveIndex(index)}

                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>

                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      wrapperStyle={{ paddingLeft: "20px" }}
                      content={() => (
                        <div>
                          {departmentData.map((entry, index) => (
                            <div key={index} className="flex items-center mb-3">
                              <span
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              ></span>
                            </div>
                          ))}
                        </div>
                      )}
                    />

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {showRequestDetails && ( // Replace requestToggle with showRequestDetails
            <RequestDetails
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(Overview);
