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

import { FaUser, FaCalendar, FaUsers } from "react-icons/fa";

import RequestDetails from "@/components/RequestDetails";

import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

import { useSelector, useDispatch } from "react-redux";
// import { fetchEmployees } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import { toast } from "sonner";
import getConfig from "next/config";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  // const [requestToggle, setRequestToggle] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false); // New state
  const [activeTab, setActiveTab] = useState("leaveRequests");

  const [profileUpdates, setProfileUpdates] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingCompOffs, setPendingCompOffs] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);

  const dispatch = useDispatch();
  const { employees, loading } = useSelector((state) => state.employees);
  const {
    expensesRequests,
    incomeRequests,
  } = useSelector((state) => state.requestDetails);

  useEffect(() => {
    dispatch(fetchExpenseRequests());
    dispatch(fetchIncomeRequests());
  }, [dispatch]);

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

  const publicRuntimeConfig = getConfig().publicRuntimeConfig;

  const fetchProfileUpdates = useCallback(async () => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const employeeId = sessionStorage.getItem("employeeId");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const response = await fetch(
        `${publicRuntimeConfig.apiURL}/manager/${employeeId}/members/update-requests`,
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
      toast.error("Error fetching profile updates:", error);
      setProfileUpdates([]);
    }
  }, [publicRuntimeConfig.apiURL]);

  const fetchPendingRequests = useCallback(async () => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const employeeId = sessionStorage.getItem("employeeId");
      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/manager/leave/status/Pending/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
  }, [publicRuntimeConfig.apiURL]);

  useEffect(() => {
    fetchPendingRequests();
    fetchProfileUpdates();
  }, [fetchPendingRequests, fetchProfileUpdates]);

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

  useEffect(() => {
    const fetchEmployeeCount = async () => {
      try {
        const token = getItemFromSessionStorage("token", null); // Retrieve the token from sessionStorage
        const employeeId = sessionStorage.getItem("employeeId");
        if (!token) {
          throw new Error("Authentication token is missing");
        }

        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/employees/manager/${employeeId}`, // Replace with your actual API endpoint
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setEmployeeCount(response.data.length); // Set the total number of employees
        } else {
          setEmployeeCount(0);
        }
      } catch (error) {
        toast.error("Error fetching employee count:", error);
        setEmployeeCount(0);
      }
    };

    fetchEmployeeCount();
  }, [publicRuntimeConfig.apiURL]);

  const overviewData = [
    {
      icon: <FaUser className="h-6 w-6 text-blue-500" />,
      label: "Team Members",
      count: employeeCount,
    },

    {
      icon: <FaCalendar className="h-6 w-6 text-green-500" />,
      label: "Open Requests",
      count:
        pendingLeaves.length + pendingCompOffs.length + profileUpdates.length + expensesRequests.length + incomeRequests.length,
    },
  ];

  const refreshRequests = useCallback(async () => {
    await fetchPendingRequests();
    await fetchProfileUpdates();
  }, [fetchPendingRequests, fetchProfileUpdates]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentRole={"manager"}
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
              Manager Dashboard
            </h1>
          </div>

          {/* Overview Cards */}

          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
              {overviewData

                .filter((item) => item.label !== "Payroll Status")

                .map((item, index) =>
                  item.label === "Team Members" ? (
                    <div
                      key={index}
                      className="p-8 bg-white shadow-lg rounded-xl flex flex-col justify-between items-start hover:shadow-2xl hover:scale-105 transform transition-all duration-300 cursor-pointer border border-gray-100"
                      style={{ height: "250px", width: "350px" }}
                      onClick={() => (window.location.href = "/manager/team")}
                    >
                      <div className="flex justify-between items-center w-full mb-8">
                        <p className="text-xl font-semibold text-gray-800">
                          {item.label}
                        </p>
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full">
                          <FaUsers className="text-blue-600 text-2xl" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-5xl font-bold text-gray-900">
                          {item.count}
                        </p>
                        <div className="flex items-center text-gray-600">
                          <p className="text-sm">People in your department</p>
                          <div className="ml-2 px-2 py-1 bg-blue-50 rounded-full">
                            <span className="text-xs text-blue-600 font-medium">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : item.label === "Open Requests" ? (
                    <div
                      key={index}
                      className="p-8 bg-white shadow-lg rounded-xl flex flex-col justify-between items-start hover:shadow-2xl hover:scale-105 transform transition-all duration-300 cursor-pointer border border-gray-100"
                      style={{ height: "250px", width: "350px" }}
                      onClick={handleOpenRequestsClick}
                    >
                      <div className="flex justify-between items-center w-full mb-8">
                        <p className="text-xl font-semibold text-gray-800">
                          {item.label}
                        </p>
                        <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-full">
                          <FaCalendar className="text-green-600 text-2xl" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-5xl font-bold text-gray-900">
                          {item.count}
                        </p>
                        <div className="flex items-center text-gray-600">
                          <p className="text-sm">Pending requests</p>
                          <div className="ml-2 px-2 py-1 bg-green-50 rounded-full">
                            <span className="text-xs text-green-600 font-medium">
                              Last 7 days
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={index}
                      className="p-6 bg-white shadow-md rounded-lg flex flex-col justify-between items-center hover:shadow-xl hover:scale-105 transition-transform duration-300"
                      style={{ height: "250px", width: "400px" }}
                    >
                      <div className="flex flex-col justify-center items-center">
                        <p className="text-gray-600 text-lg">{item.label}</p>

                        <p className="text-3xl font-bold text-gray-800">
                          {item.count}
                        </p>
                      </div>

                      <div
                        className="p-4 rounded-full shadow-lg"
                        style={{
                          backgroundColor: item.icon.props.className.includes(
                            "text-blue-500"
                          )
                            ? "#0088FE33"
                            : item.icon.props.className.includes(
                                "text-green-500"
                              )
                            ? "#00C49F33"
                            : item.icon.props.className.includes(
                                "text-yellow-500"
                              )
                            ? "#FFBB2833"
                            : "#A28BFE33",
                        }}
                      >
                        <div className="text-4xl">{item.icon}</div>
                      </div>
                    </div>
                  )
                )}
            </div>
          </div>

          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 shadow-md rounded-lg hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Weekly Attendance
                </h2>

                <ResponsiveContainer width="100%" height={300}>
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

          {showRequestDetails && (
            <RequestDetails
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onActionComplete={refreshRequests}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(Overview);
