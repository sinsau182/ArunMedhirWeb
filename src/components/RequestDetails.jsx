import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Calendar,
  UserCog,
  DollarSign,
  Wallet,
  Eye,
  Loader2,
} from "lucide-react";
import PropTypes from "prop-types";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";

import {
  fetchPendingLeaveRequests,
  fetchProfileUpdates,
  updateLeaveStatus,
  updateProfileRequestStatus,
  clearErrors,
  fetchExpenseRequests,
  fetchIncomeRequests,
  updateExpenseRequestStatus,
  updateIncomeRequestStatus,
} from "@/redux/slices/requestDetailsSlice";
import { fetchEmployeeDetails } from "@/redux/slices/payslipSlice";

// --- Simple Modal Component --- (Can be replaced with shadcn Dialog if available)
const ChangesModal = ({ isOpen, onClose, changes }) => {
  if (!isOpen || !changes || changes.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Field Changes</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {changes.map((change, index) => (
            <div key={index} className="border rounded p-3 bg-gray-50 text-sm">
              <p className="font-medium text-gray-700 mb-1">
                {change.fieldName}
              </p>
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Old Value:</p>
                  {change.fieldName.toLowerCase().includes("image") ||
                  change.fieldName.toLowerCase().includes("aadhar") ? (
                    change.oldValue ? (
                      <div className="space-y-2">
                        <a
                          href={change.oldValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={change.oldValue}
                            alt={`Old ${change.fieldName}`}
                            className="w-full h-32 object-contain rounded border bg-white p-2"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-image.png";
                            }}
                          />
                        </a>
                        <a
                          href={change.oldValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View Full Image
                        </a>
                      </div>
                    ) : (
                      <span className="italic text-gray-400">(empty)</span>
                    )
                  ) : (
                    <p className="text-gray-800 break-words">
                      {change.oldValue || "(empty)"}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-center h-full">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">New Value:</p>
                  {change.fieldName.toLowerCase().includes("image") ||
                  change.fieldName.toLowerCase().includes("aadhar") ? (
                    change.newValue ? (
                      <div className="space-y-2">
                        <a
                          href={change.newValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={change.newValue}
                            alt={`New ${change.fieldName}`}
                            className="w-full h-32 object-contain rounded border bg-white p-2"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-image.png";
                            }}
                          />
                        </a>
                        <a
                          href={change.newValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View Full Image
                        </a>
                      </div>
                    ) : (
                      <span className="italic text-gray-400">(empty)</span>
                    )
                  ) : (
                    <p className="text-green-700 break-words">
                      {change.newValue || "(empty)"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 text-right">
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
ChangesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  changes: PropTypes.arrayOf(
    PropTypes.shape({
      fieldName: PropTypes.string,
      oldValue: PropTypes.string,
      newValue: PropTypes.string,
    })
  ),
};
// --- End Modal Component ---

const RequestDetails = ({ activeTab, onTabChange, onActionComplete }) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUpdateChanges, setSelectedUpdateChanges] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({});

  // Get state from Redux
  const {
    pendingLeaves,
    pendingCompOffs,
    profileUpdates,
    expensesRequests,
    incomeRequests,
    loading,
    error,
    profileLoading,
    profileError,
    approvingProfileUpdateId,
    approvingLeaveId,
    rejectingLeaveId,
  } = useSelector((state) => state.requestDetails);

  const { employeeData } = useSelector((state) => state.payslip);

  // Placeholder for expense and advance requests (not implemented in the slice)

  const [isLoadingExpense, setIsLoadingExpense] = useState(false);
  const [isLoadingIncome, setIsLoadingIncome] = useState(false);

  const [approvingExpenseId, setApprovingExpenseId] = useState(null);
  const [rejectingExpenseId, setRejectingExpenseId] = useState(null);
  const [approvingIncomeId, setApprovingIncomeId] = useState(null);
  const [rejectingIncomeId, setRejectingIncomeId] = useState(null);

  // Function to open the modal
  const handleViewDetails = (changes) => {
    if (changes && changes.length > 0) {
      setSelectedUpdateChanges(changes);
      setIsModalOpen(true);
    } else {
      toast.info("No specific field changes available for this request.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Parse the MongoDB date format and convert to local date
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchPendingLeaveRequests());
    dispatch(fetchProfileUpdates());

    // Cleanup function
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // Fetch expenses when the expense tab is active
  useEffect(() => {
    if (activeTab === "expenseRequests") {
      dispatch(fetchExpenseRequests());
    }
    if (activeTab === "incomeRequests") {
      dispatch(fetchIncomeRequests());
    }
  }, [activeTab, dispatch]);

  // Fetch employee details for expense and income requests
  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      if (activeTab === "expenseRequests" && expensesRequests.length > 0) {
        for (const request of expensesRequests) {
          if (!employeeDetails[request.submittedBy]) {
            try {
              await dispatch(fetchEmployeeDetails(request.submittedBy)).unwrap();
              setEmployeeDetails(prev => ({
                ...prev,
                [request.submittedBy]: employeeData
              }));
            } catch (error) {
              console.error("Failed to fetch employee details:", error);
            }
          }
        }
      }
      if (activeTab === "incomeRequests" && incomeRequests.length > 0) {
        for (const request of incomeRequests) {
          if (!employeeDetails[request.submittedBy]) {
            try {
              await dispatch(fetchEmployeeDetails(request.submittedBy)).unwrap();
              setEmployeeDetails(prev => ({
                ...prev,
                [request.submittedBy]: employeeData
              }));
            } catch (error) {
              console.error("Failed to fetch employee details:", error);
            }
          }
        }
      }
    };

    fetchEmployeeInfo();
  }, [activeTab, expensesRequests, incomeRequests, dispatch, employeeData]);

  // --- Approve/Reject Logic for Profile Updates ---
  const handleApproveProfileUpdate = async (employeeId) => {
    if (!employeeId) {
      toast.error("Employee ID missing.");
      return;
    }

    try {
      const resultAction = await dispatch(
        updateProfileRequestStatus({
          employeeId,
          status: "Approved",
        })
      );

      if (updateProfileRequestStatus.fulfilled.match(resultAction)) {
        toast.success(`Profile update for ${employeeId} approved.`);
        // Re-fetch the list to remove the approved item
        dispatch(fetchProfileUpdates());
      } else {
        throw new Error(
          resultAction.error.message || "Failed to approve profile update"
        );
      }
    } catch (error) {
      toast.error(error.message || "An unknown error occurred.");
    }
    if (onActionComplete) onActionComplete();
  };

  const handleRejectProfileUpdate = async (employeeId) => {
    if (!employeeId) {
      toast.error("Employee ID missing.");
      return;
    }

    try {
      const resultAction = await dispatch(
        updateProfileRequestStatus({
          employeeId,
          status: "Rejected",
        })
      );

      if (updateProfileRequestStatus.fulfilled.match(resultAction)) {
        toast.success(`Profile update for ${employeeId} rejected.`);
        // Re-fetch the list to remove the rejected item
        dispatch(fetchProfileUpdates());
      } else {
        throw new Error(
          resultAction.error.message || "Failed to reject profile update"
        );
      }
    } catch (error) {
      toast.error(error.message || "An unknown error occurred.");
    }
    if (onActionComplete) onActionComplete();
  };

  const handleApprove = async (leaveId) => {
    try {
      const resultAction = await dispatch(
        updateLeaveStatus({
          leaveId,
          status: "Approved",
          remarks: "approved successfully",
        })
      );

      if (updateLeaveStatus.fulfilled.match(resultAction)) {
        toast.success("Request approved successfully");
        // Refresh the list after successful approval
        dispatch(fetchPendingLeaveRequests());
      } else {
        throw new Error(
          resultAction.error.message || "Failed to approve request"
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to approve request");
    }
    if (onActionComplete) onActionComplete();
  };

  const handleReject = async (leaveId) => {
    try {
      const resultAction = await dispatch(
        updateLeaveStatus({
          leaveId,
          status: "Rejected",
          remarks: "Request rejected by HR",
        })
      );

      if (updateLeaveStatus.fulfilled.match(resultAction)) {
        toast.success("Request rejected successfully");
        // Refresh the list after successful rejection
        dispatch(fetchPendingLeaveRequests());
      } else {
        throw new Error(
          resultAction.error.message || "Failed to reject request"
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to reject request");
    }
    if (onActionComplete) onActionComplete();
  };

  // Handle expense approval
  const handleApproveExpense = async (expenseId) => {
    try {
      setApprovingExpenseId(expenseId);
      const resultAction = await dispatch(
        updateExpenseRequestStatus({
          expenseId,
          status: "Approved",
          remarks: "Approved by Authorized Person",
        })
      );

      if (updateExpenseRequestStatus.fulfilled.match(resultAction)) {
        toast.success("Expense approved successfully");
        // Refresh the expenses list
        dispatch(fetchExpenseRequests());
      } else {
        throw new Error(
          resultAction.error.message || "Failed to approve expense"
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to approve expense");
    } finally {
      setApprovingExpenseId(null);
    }
    if (onActionComplete) onActionComplete();
  };

  // Handle expense rejection
  const handleRejectExpense = async (expenseId) => {
    try {
      setRejectingExpenseId(expenseId);
      const resultAction = await dispatch(
        updateExpenseRequestStatus({
          expenseId,
          status: "Rejected",
          remarks: "Rejected by Authorized Person",
        })
      );

      if (updateExpenseRequestStatus.fulfilled.match(resultAction)) {
        toast.success("Expense rejected successfully");
        // Refresh the expenses list
        dispatch(fetchExpenseRequests());
      } else {
        throw new Error(
          resultAction.error.message || "Failed to reject expense"
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to reject expense");
    } finally {
      setRejectingExpenseId(null);
    }
    if (onActionComplete) onActionComplete();
  };

  // Handle income approval
  const handleApproveIncome = async (incomeId) => {
    try {
      setApprovingIncomeId(incomeId);
      const resultAction = await dispatch(
        updateIncomeRequestStatus({
          incomeId,
          status: "Approved",
          remarks: "Approved by Authorized Person",
        })
      );

      if (updateIncomeRequestStatus.fulfilled.match(resultAction)) {
        toast.success("Income approved successfully");
        // Refresh the income requests list
        dispatch(fetchIncomeRequests());
      } else {
        throw new Error(
          resultAction.error.message || "Failed to approve income"
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to approve income");
    } finally {
      setApprovingIncomeId(null);
    }
    if (onActionComplete) onActionComplete();
  };

  // Handle income rejection
  const handleRejectIncome = async (incomeId) => {
    try {
      setRejectingIncomeId(incomeId);
      const resultAction = await dispatch(
        updateIncomeRequestStatus({
          incomeId,
          status: "Rejected",
          remarks: "Rejected by Authorized Person",
        })
      );

      if (updateIncomeRequestStatus.fulfilled.match(resultAction)) {
        toast.success("Income rejected successfully");
        // Refresh the income requests list
        dispatch(fetchIncomeRequests());
      } else {
        throw new Error(
          resultAction.error.message || "Failed to reject income"
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to reject income");
    } finally {
      setRejectingIncomeId(null);
    }
    if (onActionComplete) onActionComplete();
  };

  // Updated combined loading state
  const isLoading =
    loading || profileLoading || isLoadingExpense || isLoadingIncome;

  return (
    <div className="bg-[#F7FBFE] p-6 rounded-xl shadow-md transition-all duration-200">
      <h2 className="text-xl font-semibold text-blue-800 mb-5 pl-2">
        Request Details
      </h2>
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid grid-cols-5 gap-3 mb-5 bg-transparent p-0">
          <TabsTrigger
            value="leaveRequests"
            className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            <span>Leave Requests</span>
          </TabsTrigger>
          <TabsTrigger
            value="compOffRequests"
            className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            <span>Comp Off</span>
          </TabsTrigger>
          <TabsTrigger
            value="profileUpdates"
            className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            <UserCog className="h-4 w-4 mr-2" />
            <span>Profile Updates</span>
          </TabsTrigger>
          <TabsTrigger
            value="expenseRequests"
            className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            <span>Expense Requests</span>
          </TabsTrigger>
          <TabsTrigger
            value="incomeRequests"
            className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            <Wallet className="h-4 w-4 mr-2" />
            <span>Income Requests</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaveRequests">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee ID
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee Name
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Department
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Type of Leave
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Start Date
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    End Date
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Shift Type
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Reason
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : !pendingLeaves || pendingLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-gray-500">
                      No pending leave requests.
                    </td>
                  </tr>
                ) : (
                  pendingLeaves.map((request, index) => (
                    <tr
                      key={`${request.leaveId}-${request.employeeId}-${index}`}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {request.employeeId}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {request.employeeName}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {request.department}
                      </td>
                      <td className="px-5 py-4 text-sm">{request.leaveType}</td>
                      <td className="px-5 py-4 text-sm">
                        {formatDate(request.startDate)}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {formatDate(request.endDate)}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {(() => {
                          switch (request.shiftType) {
                            case "FULL_DAY":
                              return "Full Day";
                            case "FIRST_HALF":
                              return "First Half (Morning)";
                            case "SECOND_HALF":
                              return "Second Half (Evening)";
                            default:
                              return request.shiftType || "-";
                          }
                        })()}
                      </td>
                      <td className="px-5 py-4 text-sm">{request.reason}</td>
                      <td className="px-5 py-4 text-sm font-medium space-x-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleApprove(request.leaveId)}
                          disabled={approvingLeaveId === request.leaveId}
                          title={request.remarks || "Approve request"}
                        >
                          {approvingLeaveId === request.leaveId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleReject(request.leaveId)}
                          disabled={rejectingLeaveId === request.leaveId}
                          title="Reject request"
                        >
                          {rejectingLeaveId === request.leaveId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="compOffRequests">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee ID
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee Name
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Department
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Date
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Shift Type
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Description
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : !pendingCompOffs || pendingCompOffs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-gray-500">
                      No pending comp-off requests.
                    </td>
                  </tr>
                ) : (
                  pendingCompOffs.map((request, index) => (
                    <tr
                      key={`${request.leaveId}-${request.employeeId}-${index}`}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {request.employeeId}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {request.employeeName}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {request.department}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {formatDate(request.startDate)}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {(() => {
                          switch (request.shiftType) {
                            case "FULL_DAY":
                              return "Full Day";
                            case "FIRST_HALF":
                              return "First Half (Morning)";
                            case "SECOND_HALF":
                              return "Second Half (Evening)";
                            default:
                              return request.shiftType || "-";
                          }
                        })()}
                      </td>
                      <td className="px-5 py-4 text-sm">{request.reason}</td>
                      <td className="px-5 py-4 text-sm font-medium space-x-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleApprove(request.leaveId)}
                          disabled={approvingLeaveId === request.leaveId}
                          title={request.remarks || "Approve request"}
                        >
                          {approvingLeaveId === request.leaveId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleReject(request.leaveId)}
                          disabled={rejectingLeaveId === request.leaveId}
                          title="Reject request"
                        >
                          {rejectingLeaveId === request.leaveId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="profileUpdates">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee ID
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee Name
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Updates
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {profileLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      Loading...
                    </td>
                  </tr>
                ) : profileError ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-red-500">
                      {profileError}
                    </td>
                  </tr>
                ) : profileUpdates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-gray-500">
                      No pending profile update requests.
                    </td>
                  </tr>
                ) : (
                  profileUpdates.map((update) => {
                    const isApproving =
                      approvingProfileUpdateId === update.employeeId;
                    return (
                      <tr
                        key={update.id || update.employeeId}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {update.employeeId}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {update.employeeName}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {update.changes && update.changes.length > 0 ? (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-blue-600 hover:underline"
                              onClick={() => handleViewDetails(update.changes)}
                              disabled={isApproving}
                            >
                              {`${update.changes.length} field(s) changed`}
                            </Button>
                          ) : (
                            <span className="text-gray-500 italic">
                              No specific changes listed
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() =>
                              handleApproveProfileUpdate(update.employeeId)
                            }
                            disabled={isApproving || !!approvingProfileUpdateId}
                          >
                            {isApproving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() =>
                              handleRejectProfileUpdate(update.employeeId)
                            }
                            disabled={isApproving || !!approvingProfileUpdateId}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="expenseRequests">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee ID
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee Name
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Department
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Amount
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Description
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Receipt
                  </th>
                  {/* <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {isLoadingExpense ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      Loading...
                    </td>
                  </tr>
                ) : expensesRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-gray-500">
                      No pending expense requests.
                    </td>
                  </tr>
                ) : (
                  expensesRequests.map((request) => (
                    <tr
                      key={request.expenseId}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {request.submittedBy}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {employeeDetails[request.submittedBy]?.name || "Loading..."}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {employeeDetails[request.submittedBy]?.department || "Loading..."}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {request.totalAmount}
                      </td>
                      <td className="px-5 py-4 text-sm">{request.comments}</td>
                      <td className="px-5 py-4 text-sm font-medium space-x-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleApproveExpense(request.expenseId)}
                          disabled={approvingExpenseId === request.expenseId}
                        >
                          {approvingExpenseId === request.expenseId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleRejectExpense(request.expenseId)}
                          disabled={rejectingExpenseId === request.expenseId}
                        >
                          {rejectingExpenseId === request.expenseId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="incomeRequests">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee ID
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee Name
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Department
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Amount
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Reason
                  </th>
                  {/* <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Repayment Plan
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {isLoadingIncome ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      Loading...
                    </td>
                  </tr>
                ) : incomeRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-gray-500">
                      No pending income requests.
                    </td>
                  </tr>
                ) : (
                  incomeRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {request.submittedBy}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {employeeDetails[request.submittedBy]?.name || "Loading..."}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {employeeDetails[request.submittedBy]?.department || "Loading..."}
                      </td>
                      <td className="px-5 py-4 text-sm">{request.amount}</td>
                      {/* <td className="px-5 py-4 text-sm">{request.reason}</td>
                      <td className="px-5 py-4 text-sm">
                        {request.repaymentPlan}
                      </td> */}
                      <td className="px-5 py-4 text-sm font-medium space-x-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleApproveIncome(request.incomeId)}
                          disabled={approvingIncomeId === request.incomeId}
                        >
                          {approvingIncomeId === request.incomeId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleRejectIncome(request.incomeId)}
                          disabled={rejectingIncomeId === request.incomeId}
                        >
                          {rejectingIncomeId === request.incomeId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal for showing changes */}
      <ChangesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        changes={selectedUpdateChanges}
      />
    </div>
  );
};

RequestDetails.propTypes = {
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  onActionComplete: PropTypes.func,
};

export default RequestDetails;
