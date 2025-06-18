import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa"; // Removed FaUser since we won't need it
import Link from "next/link";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import withAuth from "@/components/withAuth";
import { fetchLeaveBalance, resetLeaveBalanceState } from "@/redux/slices/leaveBalanceSlice";

const Overview = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dispatch = useDispatch();
  const employeeId = sessionStorage.getItem("employeeId"); // Retrieve the employee ID from sessionStorage
  const { balance, loading, error } = useSelector((state) => state.leaveBalance);
  

  // Fetch leave balance when component mounts
  useEffect(() => {
    dispatch(fetchLeaveBalance(employeeId)); // Pass employeeId to fetchLeaveBalance action
    
    // Clean up function to reset leave balance state when component unmounts
    return () => {
      dispatch(resetLeaveBalanceState());
    };
  }, [dispatch, employeeId]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentRole={"employee"}
      />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        {/* Navbar */}
        <HradminNavbar />

        {/* Main Content Area */}
        <div className="p-5 bg-gray-100 h-full">
          {/* Page Heading */}
          <div className="mb-10 pt-16">
            <h1 className="text-2xl font-bold text-gray-800 text-left">
              Employee Dashboard
            </h1>
          </div>

          {/* Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-start ml-2">
            {/* Leave Balance Card */}
            <Link href="/employee/leaves">
              <div
                className="p-8 bg-white shadow-lg rounded-xl flex flex-col justify-between items-start hover:shadow-2xl hover:scale-105 transform transition-all duration-300 cursor-pointer border border-gray-100"
                style={{ height: "250px", width: "350px" }}
              >
                <div className="flex justify-between items-center w-full mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Leave Balance
                  </h2>
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full">
                    <FaCalendarAlt className="text-blue-600 text-2xl" />
                  </div>
                </div>
                {loading ? (
                  <div className="text-center py-4">Loading leave balance...</div>
                ) : error ? (
                  (typeof error === "string" && error.includes("400")) ||
                  (typeof error === "object" && error?.status === 400) ? (
                    <div className="text-center py-4 text-gray-500">
                      Please add department to view Leave Balance
                    </div>
                  ) : (
                    <div className="text-center py-4 text-red-500">
                      {typeof error === "string"
                        ? error
                        : error?.message || "Failed to load leave balance"}
                    </div>
                  )
                ) : balance ? (
                  <div className="flex flex-col items-center justify-center w-full mt-4">
                    <span className="text-5xl font-extrabold text-gray-900">
                      {Number(balance.totalAvailableBalance).toFixed(2)}
                    </span>
                    <span className="text-base text-gray-500 mt-2">Leave Balance</span>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    No leave balance data available
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Overview);