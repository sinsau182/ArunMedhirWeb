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
import MainLayout from "@/components/MainLayout";

import { useSelector, useDispatch } from "react-redux";
// import { fetchEmployees } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import { toast } from "sonner";
import getConfig from "next/config";
import {
  fetchExpenseRequests,
  fetchIncomeRequests,
} from "@/redux/slices/requestDetailsSlice";

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
  // const {
  //   expensesRequests,
  //   incomeRequests,
  // } = useSelector((state) => state.requestDetails);

  useEffect(() => {
    // dispatch(fetchExpenseRequests());
    // dispatch(fetchIncomeRequests());
  }, [dispatch]);

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
        pendingLeaves.length + pendingCompOffs.length + profileUpdates.length,
    },
  ];

  const refreshRequests = useCallback(async () => {
    await fetchPendingRequests();
    await fetchProfileUpdates();
  }, [fetchPendingRequests, fetchProfileUpdates]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Content */}

        <div className="pt-6 px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 text-left">
              Manager Dashboard
            </h1>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition-colors"
            >
              {showCharts ? "Hide Charts" : "Show Charts"}
            </button>
          </div>

          {/* Overview Cards */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {overviewData.map((item, index) => (
              <div
                key={index}
                onClick={
                  item.label === "Open Requests"
                    ? handleOpenRequestsClick
                    : null
                }
                className={`p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4 ${
                  item.label === "Open Requests" && "cursor-pointer"
                }`}
              >
                <div
                  className={`p-4 rounded-full ${
                    item.label === "Open Requests"
                      ? "bg-green-100"
                      : "bg-blue-100"
                  }`}
                >
                  {item.icon}
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {item.count}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {showRequestDetails && (
            <RequestDetails
              pendingLeaves={pendingLeaves}
              pendingCompOffs={pendingCompOffs}
              profileUpdates={profileUpdates}
              onClose={() => setShowRequestDetails(false)}
              onRefresh={refreshRequests}
            />
          )}

          {/* Charts Section */}

          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Attendance */}
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Weekly Attendance
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="absent" stackId="a" fill="#ff8042" />
                    <Bar dataKey="leave" stackId="a" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Department Distribution */}

              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Department Distribution
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default withAuth(Overview);
