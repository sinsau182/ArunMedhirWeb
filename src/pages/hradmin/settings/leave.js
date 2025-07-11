import React, { useState, useEffect } from "react";
import { Plus, X, CheckCircle, AlertCircle, FileText } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { useDispatch, useSelector } from "react-redux";
import {
  createLeaveType,
  fetchLeaveTypes,
  deleteLeaveType,
  updateLeaveType,
} from "@/redux/slices/leaveTypeSlice";
import {
  createLeavePolicy,
  resetLeavePolicyState,
  fetchLeavePolicies,
  updateLeavePolicy,
  deleteLeavePolicy,
} from "@/redux/slices/leavePolicySlice";
import {
  fetchPublicHolidays,
  createPublicHoliday,
  updatePublicHoliday,
  deletePublicHoliday,
} from "@/redux/slices/publicHolidaySlice";
import { toast } from "react-toastify";
import withAuth from "@/components/withAuth";

const LeaveSettings = () => {
  const selectedCompanyId = sessionStorage.getItem("currentCompanyId");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Leave Types");
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [showLeaveTypeEditModal, setShowLeaveTypeEditModal] = useState(false);
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    name: "",
    accrual: "",
    description: "",
    allowedInProbation: false,
    allowedInNotice: false,
    canCarryForward: false,
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Add new state variables for Leave Policies
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showPolicyEditModal, setShowPolicyEditModal] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    name: "",
    leaveAllocations: [{ 
      leaveTypeId: "", 
      daysPerYear: "",
      specialCondition: false,
      allowedDays: [],
      maxConsecutiveDays: 1,
      allowConsecutiveLeaves: false,
      restrictions: null
    }],
  });

  // Add new state variables for Public Holidays
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showHolidayEditModal, setShowHolidayEditModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: "",
    description: "",
  });

  // Add state for tracking form changes
  const [isLeaveTypeFormChanged, setIsLeaveTypeFormChanged] = useState(false);
  const [isPolicyFormChanged, setIsPolicyFormChanged] = useState(false);
  const [isHolidayFormChanged, setIsHolidayFormChanged] = useState(false);

  // Add state for selected items
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const dispatch = useDispatch();
  const { loading, error, success, leaveTypes, lastUpdated } = useSelector(
    (state) => state.leaveType
  );
  const {
    loading: policyLoading,
    error: policyError,
    success: policySuccess,
    policies,
  } = useSelector((state) => state.leavePolicy);
  const {
    loading: holidayLoading,
    error: holidayError,
    holidays,
  } = useSelector((state) => state.publicHoliday);

  // Fetch leave types when component mounts
  useEffect(() => {
    dispatch(fetchLeaveTypes());
  }, [dispatch]);

  // Fetch leave policies when component mounts
  useEffect(() => {
    dispatch(fetchLeavePolicies());
  }, [dispatch]);

  // Reset policy state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetLeavePolicyState());
    };
  }, [dispatch]);

  // Add useEffect for fetching public holidays
  useEffect(() => {
    if (activeTab === "Public Holidays") {
      dispatch(fetchPublicHolidays());
    }
  }, [dispatch, activeTab]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Add handlers for form changes
  const handleLeaveTypeFormChange = (e) => {
    setIsLeaveTypeFormChanged(true);
    const { name, value, type, checked } = e.target;
    setLeaveTypeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear the specific error when the field is being edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePolicyFormChange = (e) => {
    setIsPolicyFormChanged(true);
    const { name, value } = e.target;
    setPolicyForm({
      ...policyForm,
      [name]: value,
    });
  };

  const handleHolidayFormChange = (e) => {
    setIsHolidayFormChanged(true);
    const { name, value } = e.target;
    setHolidayForm({
      ...holidayForm,
      [name]: value,
    });
  };

  const handleLeaveTypeSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!leaveTypeForm.name) {
      newErrors.name = "Leave type name is required";
    }
    if (!leaveTypeForm.accrual) {
      newErrors.accrual = "Accrual period is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification("error", "Please fill in all required fields");
      setTimeout(() => {
        setErrors({});
      }, 2000);
      return;
    }

    try {
      const leaveTypeData = {
        leaveTypeName: leaveTypeForm.name,
        accrualPeriod: leaveTypeForm.accrual,
        description: leaveTypeForm.description || "",
        allowedInProbationPeriod: leaveTypeForm.allowedInProbation || false,
        allowedInNoticePeriod: leaveTypeForm.allowedInNotice || false,
        canBeCarriedForward: leaveTypeForm.canCarryForward || false,
      };

      const result = await dispatch(
        createLeaveType({ ...leaveTypeData, companyId: selectedCompanyId })
      ).unwrap();
      showNotification("success", "Leave type added successfully!");

      setShowLeaveTypeModal(false);
      setLeaveTypeForm({
        name: "",
        accrual: "",
        description: "",
        allowedInProbation: false,
        allowedInNotice: false,
        canCarryForward: false,
      });
      setIsLeaveTypeFormChanged(false);
      setErrors({});

      // Refresh the leave types list
      dispatch(fetchLeaveTypes());
    } catch (error) {
      if (error.message?.toLowerCase().includes("already exists")) {
        showNotification("error", "Leave type already exists");
        setTimeout(() => {
          setShowLeaveTypeModal(false);
          dispatch(fetchLeaveTypes()); // Refresh the list
        }, 2000);
      } else {
        showNotification("error", error.message || "Failed to add leave type");
      }
    }
  };

  const handleLeaveTypeRowClick = (type) => {
    setSelectedLeaveType(type); // Store the entire leave type object
    setLeaveTypeForm({
      name: type.leaveTypeName || "",
      accrual: type.accrualPeriod || "",
      description: type.description || "",
      allowedInProbation: type.allowedInProbationPeriod || false,
      allowedInNotice: type.allowedInNoticePeriod || false,
      canCarryForward: type.canBeCarriedForward || false,
    });
    setShowLeaveTypeEditModal(true);
    setIsLeaveTypeFormChanged(false);
    setErrors({});
  };

  const handleLeaveTypeUpdate = async (e) => {
    e.preventDefault();
    try {
      const newErrors = {};

      if (!leaveTypeForm.name) {
        newErrors.name = "Leave type name is required";
      }
      if (!leaveTypeForm.accrual) {
        newErrors.accrual = "Accrual period is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        showNotification("error", "Please fill in all required fields");
        setTimeout(() => {
          setErrors({});
        }, 2000);
        return;
      }

      if (!selectedLeaveType?.leaveTypeId) {
        showNotification("error", "Invalid leave type selected");
        return;
      }

      const leaveTypeData = {
        // leaveTypeId: selectedLeaveType.leaveTypeId,
        leaveTypeName: leaveTypeForm.name,
        accrualPeriod: leaveTypeForm.accrual,
        description: leaveTypeForm.description || "",
        allowedInProbationPeriod: leaveTypeForm.allowedInProbation || false,
        allowedInNoticePeriod: leaveTypeForm.allowedInNotice || false,
        canBeCarriedForward: leaveTypeForm.canCarryForward || false,
        companyId: selectedCompanyId,
      };

      await dispatch(
        updateLeaveType({
          id: selectedLeaveType.leaveTypeId,
          leaveTypeData,
          companyId: selectedCompanyId,
        })
      ).unwrap();

      showNotification("success", "Leave type updated successfully!");

      setShowLeaveTypeEditModal(false);
      setSelectedLeaveType(null);
      setLeaveTypeForm({
        name: "",
        accrual: "",
        description: "",
        allowedInProbation: false,
        allowedInNotice: false,
        canCarryForward: false,
      });
      setIsLeaveTypeFormChanged(false);
      setErrors({});

      // Refresh data instead of page reload
      dispatch(fetchLeaveTypes());
    } catch (error) {
      if (error.message?.includes("already exists")) {
        showNotification("error", "Leave type already exists");
        setTimeout(() => {
          setShowLeaveTypeEditModal(false);
        }, 2000);
      } else {
        showNotification(
          "error",
          error.message || "Failed to update leave type"
        );
      }
    }
  };

  const handleAddLeaveAllocation = () => {
    setIsPolicyFormChanged(true);
    setPolicyForm((prev) => ({
      ...prev,
      leaveAllocations: [
        ...prev.leaveAllocations,
        { leaveTypeId: "", daysPerYear: "", specialCondition: false, allowedDays: [], maxConsecutiveDays: 1, allowConsecutiveLeaves: false, restrictions: null },
      ],
    }));
  };

  const handleRemoveLeaveAllocation = (index) => {
    setIsPolicyFormChanged(true);
    setPolicyForm((prev) => ({
      ...prev,
      leaveAllocations: prev.leaveAllocations.filter((_, i) => i !== index),
    }));
  };

  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!policyForm.name) {
      newErrors.policyName = "Policy name is required";
    }

    if (
      policyForm.leaveAllocations.some(
        (item) => !item.leaveTypeId || !item.daysPerYear
      )
    ) {
      newErrors.leaveAllocation = "All leave types and quotas must be filled";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification("error", "Please fill in all required fields");
      setTimeout(() => {
        setErrors({});
      }, 2000);
      return;
    }

    try {
      const policyData = {
        name: policyForm.name,
        leaveAllocations: policyForm.leaveAllocations.map((item) => ({
          leaveTypeId: item.leaveTypeId,
          daysPerYear: parseInt(item.daysPerYear),
          consecutiveAllowed: item.allowConsecutiveLeaves,
          restrictions: item.specialCondition ? [{
            restrictedDays: item.allowedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)),
            allowedValue: item.maxConsecutiveDays
          }] : null
        })),
      };

      await dispatch(
        createLeavePolicy({ ...policyData, companyId: selectedCompanyId })
      ).unwrap();
      showNotification("success", "Leave policy added successfully!");

      setShowPolicyModal(false);
      setPolicyForm({
        name: "",
        leaveAllocations: [{ 
          leaveTypeId: "", 
          daysPerYear: "",
          specialCondition: false,
          allowedDays: [],
          maxConsecutiveDays: 1,
          allowConsecutiveLeaves: false,
          restrictions: null
        }],
      });
      setIsPolicyFormChanged(false);
      setErrors({});

      // Refresh the policies list
      dispatch(fetchLeavePolicies());
    } catch (error) {
      showNotification("error", error.message || "Failed to add leave policy");
    }
  };

  const handlePolicyUpdate = async () => {
    try {
      const newErrors = {};

      if (!policyForm.name) {
        newErrors.policyName = "Policy name is required";
      }

      if (
        policyForm.leaveAllocations.some(
          (item) => !item.leaveTypeId || !item.daysPerYear
        )
      ) {
        newErrors.leaveAllocation = "All leave types and quotas must be filled";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        showNotification("error", "Please fill in all required fields");
        setTimeout(() => {
          setErrors({});
        }, 2000);
        return;
      }

      if (!selectedPolicy?.leavePolicyId) {
        showNotification("error", "Invalid policy selected");
        return;
      }

      const policyData = {
        name: policyForm.name,
        leaveAllocations: policyForm.leaveAllocations.map((item) => ({
          leaveTypeId: item.leaveTypeId,
          daysPerYear: parseInt(item.daysPerYear),
          consecutiveAllowed: item.allowConsecutiveLeaves,
          restrictions: item.specialCondition ? [{
            restrictedDays: item.allowedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)),
            allowedValue: item.maxConsecutiveDays
          }] : null
        })),
        companyId: selectedCompanyId,
      };

      await dispatch(
        updateLeavePolicy({
          id: selectedPolicy.leavePolicyId,
          policyData,
          companyId: selectedCompanyId,
        })
      ).unwrap();
      showNotification("success", "Leave policy updated successfully!");

      setShowPolicyEditModal(false);
      setSelectedPolicy(null);
      setPolicyForm({
        name: "",
        leaveAllocations: [{ 
          leaveTypeId: "", 
          daysPerYear: "",
          specialCondition: false,
          allowedDays: [],
          maxConsecutiveDays: 1,
          allowConsecutiveLeaves: false,
          restrictions: null
        }],
      });
      setIsPolicyFormChanged(false);
      setErrors({});

      // Refresh the policies list
      dispatch(fetchLeavePolicies());
    } catch (error) {
      showNotification(
        "error",
        error.message || "Failed to update leave policy"
      );
    }
  };

  const handlePolicyDelete = async () => {
    try {
      if (!selectedPolicy?.leavePolicyId) {
        showNotification("error", "Invalid policy selected");
        return;
      }

      await dispatch(deleteLeavePolicy(selectedPolicy.leavePolicyId)).unwrap();

      showNotification("success", "Leave policy deleted successfully!");

      setShowPolicyEditModal(false);
      setSelectedPolicy(null);
      setPolicyForm({
        name: "",
        leaveAllocations: [{ 
          leaveTypeId: "", 
          daysPerYear: "",
          specialCondition: false,
          allowedDays: [],
          maxConsecutiveDays: 1,
          allowConsecutiveLeaves: false,
          restrictions: null
        }],
      });

      // Refresh the policies list
      dispatch(fetchLeavePolicies());
    } catch (error) {
      showNotification(
        "error",
        error.message || "Failed to delete leave policy"
      );
    }
  };

  // Format date to display in table
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Add handlers for row clicks
  const handlePolicyRowClick = (policy) => {
    setSelectedPolicy({
      ...policy,
      leavePolicyId: policy.id || policy.leavePolicyId,
    });
    
    // Map the policy data to the form structure
    setPolicyForm({
      name: policy.name,
      leaveAllocations: policy.leaveAllocations.map((allocation) => {
        // Check if there are restrictions
        const hasRestrictions = allocation.restrictions && allocation.restrictions.length > 0;
        const restriction = hasRestrictions ? allocation.restrictions[0] : null;
        
        return {
          leaveTypeId: allocation.leaveTypeId,
          daysPerYear: allocation.daysPerYear,
          specialCondition: hasRestrictions,
          allowedDays: hasRestrictions ? restriction.restrictedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()) : [],
          maxConsecutiveDays: hasRestrictions ? restriction.allowedValue : 1,
          allowConsecutiveLeaves: allocation.consecutiveAllowed || false,
          restrictions: allocation.restrictions
        };
      }) || [{ 
        leaveTypeId: "", 
        daysPerYear: "", 
        specialCondition: false, 
        allowedDays: [], 
        maxConsecutiveDays: 1, 
        allowConsecutiveLeaves: false, 
        restrictions: null 
      }],
    });
    setShowPolicyEditModal(true);
    setIsPolicyFormChanged(false);
  };

  const handleHolidayRowClick = (holiday) => {
    setSelectedHoliday(holiday);
    setHolidayForm({
      name: holiday.holidayName,
      date: holiday.date,
      description: holiday.description || "",
    });
    setShowHolidayEditModal(true);
    setIsHolidayFormChanged(false);
  };

  // Add handler for leave type delete
  const handleLeaveTypeDelete = async () => {
    try {
      await dispatch(deleteLeaveType(selectedLeaveType.leaveTypeId)).unwrap();

      showNotification("error", "Leave type deleted successfully!");

      setShowLeaveTypeEditModal(false);
      setSelectedLeaveType(null);
      setLeaveTypeForm({
        name: "",
        accrual: "",
        description: "",
        allowedInProbation: false,
        allowedInNotice: false,
        canCarryForward: false,
      });

      // Refresh data instead of page reload
      dispatch(fetchLeaveTypes());
    } catch (error) {
      showNotification("error", error.message || "Failed to delete leave type");
    }
  };

  const handleHolidaySubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!holidayForm.name) {
      newErrors.holidayName = "Holiday name is required";
    }
    if (!holidayForm.date) {
      newErrors.holidayDate = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      setNotification({
        show: true,
        type: "error",
        message: "Please fill in all required fields",
      });

      // Auto-hide both error notification and validation errors after 2 seconds
      setTimeout(() => {
        setNotification({
          show: false,
          type: "",
          message: "",
        });
        setErrors({});
      }, 2000);

      return;
    }

    try {
      const holidayData = {
        holidayName: holidayForm.name,
        date: holidayForm.date,
        description: holidayForm.description,
      };

      await dispatch(
        createPublicHoliday({ ...holidayData, companyId: selectedCompanyId })
      ).unwrap();

      setNotification({
        show: true,
        type: "success",
        message: "Public holiday added successfully!",
      });

      setShowHolidayModal(false);
      setHolidayForm({
        name: "",
        date: "",
        description: "",
      });
      setIsHolidayFormChanged(false);

      setTimeout(() => {
        setNotification({
          show: false,
          type: "",
          message: "",
        });
      }, 2000);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error || "Failed to add public holiday. Please try again.",
      });

      setTimeout(() => {
        setNotification({
          show: false,
          type: "",
          message: "",
        });
      }, 2000);
    }
  };

  const handleHolidayUpdate = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!holidayForm.name) {
      newErrors.holidayName = "Holiday name is required";
    }
    if (!holidayForm.date) {
      newErrors.holidayDate = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      setNotification({
        show: true,
        type: "error",
        message: "Please fill in all required fields",
      });

      // Auto-hide both error notification and validation errors after 2 seconds
      setTimeout(() => {
        setNotification({
          show: false,
          type: "",
          message: "",
        });
        setErrors({});
      }, 2000);

      return;
    }

    try {
      const holidayData = {
        holidayName: holidayForm.name,
        date: holidayForm.date,
        description: holidayForm.description,
        companyId: selectedCompanyId,
      };

      await dispatch(
        updatePublicHoliday({
          id: selectedHoliday.holidayId,
          holidayData,
          companyId: selectedCompanyId,
        })
      ).unwrap();

      showNotification("success", "Public holiday updated successfully!");

      setShowHolidayEditModal(false);
      setSelectedHoliday(null);
      setHolidayForm({
        name: "",
        date: "",
        description: "",
      });
      setIsHolidayFormChanged(false);

      // Refresh data instead of page reload
      dispatch(fetchPublicHolidays());
    } catch (error) {
      showNotification(
        "error",
        error.message || "Failed to update public holiday"
      );
    }
  };

  const handleHolidayDelete = async () => {
    try {
      await dispatch(deletePublicHoliday(selectedHoliday.holidayId)).unwrap();

      showNotification("error", "Public holiday deleted successfully!");

      setShowHolidayEditModal(false);
      setSelectedHoliday(null);
      setHolidayForm({
        name: "",
        date: "",
        description: "",
      });

      // Refresh data instead of page reload
      dispatch(fetchPublicHolidays());
    } catch (error) {
      showNotification(
        "error",
        error.message || "Failed to delete public holiday"
      );
    }
  };

  const showNotification = (type, message) => {
    const options = {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        zIndex: 9999,
      },
    };

    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      default:
        toast.info(message, options);
    }
  };

  // Add at the top, after useState for policyForm
  const defaultDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Helper to initialize allocation with new fields
  function enrichAllocation(allocation) {
    return {
      ...allocation,
      specialCondition: allocation.specialCondition ?? false,
      allowedDays: allocation.allowedDays ?? [],
      maxConsecutiveDays: allocation.maxConsecutiveDays ?? 1,
      allowConsecutiveLeaves: allocation.allowConsecutiveLeaves ?? false,
    };
  }

  // Update leaveAllocations in state to always have new fields
  useEffect(() => {
    setPolicyForm((prev) => ({
      ...prev,
      leaveAllocations: prev.leaveAllocations.map(enrichAllocation),
    }));
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        <HradminNavbar />

        <div className="p-6 mt-16 relative">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Leave Settings
          </h1>

          {/* Tabs */}
          <div className="flex gap-6 mb-6">
            {["Leave Types", "Leave Policies", "Public Holidays"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Leave Types Content */}
          {activeTab === "Leave Types" && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 relative z-0">
              {/* Header with Add Button */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => {
                    setSelectedLeaveType(null);
                    setLeaveTypeForm({
                      name: "",
                      accrual: "",
                      description: "",
                      allowedInProbation: false,
                      allowedInNotice: false,
                      canCarryForward: false,
                    });
                    setShowLeaveTypeModal(true);
                    setIsLeaveTypeFormChanged(false);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Leave Type
                </button>
              </div>

              {/* Leave Types List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accrual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Settings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : leaveTypes.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <div className="rounded-full bg-gray-100 p-4 mb-4">
                              <FileText className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-xl font-semibold text-gray-800 mb-1">No Leave Types Found</p>
                            <p className="text-sm mb-4">You haven&apos;t added any leave types yet. Click the button below to add your first leave type.</p>
                            <button
                              onClick={() => {
                                setSelectedLeaveType(null);
                                setLeaveTypeForm({
                                  name: "",
                                  accrual: "",
                                  description: "",
                                  allowedInProbation: false,
                                  allowedInNotice: false,
                                  canCarryForward: false,
                                });
                                setShowLeaveTypeModal(true);
                                setIsLeaveTypeFormChanged(false);
                              }}
                              className="px-5 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Add Your First Leave Type
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      leaveTypes.map((type) => (
                        <tr
                          key={type.leaveTypeId}
                          onClick={() => handleLeaveTypeRowClick(type)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {type.leaveTypeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {type.accrualPeriod}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {type.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col gap-1">
                              <span>
                                Probation:{" "}
                                {type.allowedInProbationPeriod ? "Yes" : "No"}
                              </span>
                              <span>
                                Notice:{" "}
                                {type.allowedInNoticePeriod ? "Yes" : "No"}
                              </span>
                              <span>
                                Carry Forward:{" "}
                                {type.canBeCarriedForward ? "Yes" : "No"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Leave Policies Content */}
          {activeTab === "Leave Policies" && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => {
                    setSelectedPolicy(null);
                    setPolicyForm({
                      name: "",
                      leaveAllocations: [{ leaveTypeId: "", daysPerYear: "", specialCondition: false, allowedDays: [], maxConsecutiveDays: 1, allowConsecutiveLeaves: false, restrictions: null }],
                    });
                    setShowPolicyModal(true);
                    setIsPolicyFormChanged(false);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Leave Policy
                </button>
              </div>

              {/* Policies List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Policy Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Allocations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {policyLoading ? (
                      <tr>
                        <td colSpan="2" className="px-6 py-4 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : policyError ? (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-6 py-4 text-center text-red-500"
                        >
                          {policyError}
                        </td>
                      </tr>
                    ) : policies.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <div className="rounded-full bg-gray-100 p-4 mb-4">
                              <FileText className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-xl font-semibold text-gray-800 mb-1">No Leave Policies Found</p>
                            <p className="text-sm mb-4">You haven&apos;t added any leave policies yet. Click the button below to add your first leave policy.</p>
                            <button
                              onClick={() => {
                                setSelectedPolicy(null);
                                setPolicyForm({
                                  name: "",
                                  leaveAllocations: [{ leaveTypeId: "", daysPerYear: "", specialCondition: false, allowedDays: [], maxConsecutiveDays: 1, allowConsecutiveLeaves: false, restrictions: null }],
                                });
                                setShowPolicyModal(true);
                                setIsPolicyFormChanged(false);
                              }}
                              className="px-5 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Add Your First Leave Policy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      policies.map((policy) => (
                        <tr
                          key={policy.id || policy.leavePolicyId}
                          onClick={() => handlePolicyRowClick(policy)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {policy.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="space-y-1">
                              {policy.leaveAllocations.map(
                                (allocation, index) => (
                                  <div
                                    key={`${
                                      policy.id || policy.leavePolicyId
                                    }-${allocation.leaveTypeId || index}`}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="font-medium">
                                      {allocation.leaveTypeName}:
                                    </span>
                                    <span>
                                      {allocation.daysPerYear} days/year
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Leave Policy Modal */}
              {showPolicyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Add New Leave Policy
                      </h2>
                      <button
                        onClick={() => setShowPolicyModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    {/* Add scrollable content area */}
                    <div className="overflow-y-auto max-h-[80vh] pr-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handlePolicySubmit(e);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Policy Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={policyForm.name}
                          onChange={handlePolicyFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter policy name"
                        />
                        {errors.policyName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.policyName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-700">
                            Leave Allocations
                          </label>
                          <button
                            type="button"
                            onClick={handleAddLeaveAllocation}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Leave Type
                          </button>
                        </div>

                          {policyForm.leaveAllocations.map((allocation, index) => {
                            // Ensure allocation has all fields
                            allocation = enrichAllocation(allocation);
                            const handleToggle = (field) => {
                              setIsPolicyFormChanged(true);
                              const newAllocations = [...policyForm.leaveAllocations];
                              newAllocations[index][field] = !newAllocations[index][field];
                              // If turning off specialCondition, reset allowedDays and maxConsecutiveDays
                              if (field === "specialCondition" && newAllocations[index][field] === false) {
                                newAllocations[index].allowedDays = [];
                                newAllocations[index].maxConsecutiveDays = 1;
                              }
                              setPolicyForm({ ...policyForm, leaveAllocations: newAllocations });
                            };
                            const handleDayChange = (day) => {
                              setIsPolicyFormChanged(true);
                              const newAllocations = [...policyForm.leaveAllocations];
                              let days = newAllocations[index].allowedDays || [];
                              if (days.includes(day)) {
                                days = days.filter((d) => d !== day);
                              } else {
                                days = [...days, day];
                              }
                              newAllocations[index].allowedDays = days;
                              // Adjust maxConsecutiveDays if needed
                              if (days.length < newAllocations[index].maxConsecutiveDays) {
                                newAllocations[index].maxConsecutiveDays = days.length || 1;
                              }
                              setPolicyForm({ ...policyForm, leaveAllocations: newAllocations });
                            };
                            const handleMaxConsecutiveChange = (e) => {
                              setIsPolicyFormChanged(true);
                              const val = Math.max(1, Math.min(Number(e.target.value), allocation.allowedDays.length || 1));
                              const newAllocations = [...policyForm.leaveAllocations];
                              newAllocations[index].maxConsecutiveDays = val;
                              setPolicyForm({ ...policyForm, leaveAllocations: newAllocations });
                            };
                            return (
                              <div key={index} className="flex flex-col gap-2 border p-3 rounded-md mb-2 bg-gray-50">
                                {/* Add Leave Type label */}
                                <div className="mb-2 text-base font-semibold text-gray-700">Leave Type {index + 1}</div>
                                <div className="flex gap-4 items-start">
                              <div className="flex-1">
                                <select
                                  value={allocation.leaveTypeId || ""}
                                  onChange={(e) => {
                                    setIsPolicyFormChanged(true);
                                        const newAllocations = [...policyForm.leaveAllocations];
                                    newAllocations[index] = {
                                      ...newAllocations[index],
                                      leaveTypeId: e.target.value,
                                    };
                                    setPolicyForm({
                                      ...policyForm,
                                      leaveAllocations: newAllocations,
                                    });
                                  }}
                                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm truncate"
                                >
                                      <option value="" className="text-xs text-gray-400 truncate">Select Leave Type</option>
                                  {leaveTypes.map((type) => (
                                        <option key={type.leaveTypeId} value={type.leaveTypeId} className="truncate text-sm">
                                      {type.leaveTypeName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1">
                                <input
                                  type="number"
                                  value={allocation.daysPerYear || ""}
                                  onChange={(e) => {
                                    setIsPolicyFormChanged(true);
                                        const newAllocations = [...policyForm.leaveAllocations];
                                    newAllocations[index] = {
                                      ...newAllocations[index],
                                      daysPerYear: e.target.value,
                                    };
                                    setPolicyForm({
                                      ...policyForm,
                                      leaveAllocations: newAllocations,
                                    });
                                  }}
                                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Days/year"
                                />
                              </div>
                              {index > 0 && (
                                <button
                                  type="button"
                                      onClick={() => handleRemoveLeaveAllocation(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                                {/* --- Functional Special Condition and Consecutive Leaves --- */}

                                
                                <div className="p-4 bg-gray-100 rounded-md shadow-sm">
  <div className="flex items-center gap-2">
    <span className="font-medium text-gray-700">Allow Consecutive Leaves</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={allocation.allowConsecutiveLeaves}
        onChange={() => handleToggle("allowConsecutiveLeaves")}
        className="sr-only peer"
      />
      <div
        className={`w-10 h-6 rounded-full transition-all ${
          allocation.allowConsecutiveLeaves ? "bg-blue-600" : "bg-gray-300"
        }`}
      ></div>
      <div
        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-all ${
          allocation.allowConsecutiveLeaves ? "translate-x-4" : ""
        }`}
      ></div>
    </label>
  </div>
</div>

                                 
                                <div className="mt-4 p-4 rounded-lg bg-gray-100 border border-gray-200 w-full max-w-2xl mx-auto">
                                  <div className="flex flex-row items-center gap-12 mb-4 flex-nowrap">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700">Special Condition</span>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={allocation.specialCondition} onChange={() => handleToggle("specialCondition")} className="sr-only peer" />
                                        <div className={`w-10 h-6 rounded-full transition-all ${allocation.specialCondition ? "bg-blue-600" : "bg-gray-300"}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-all ${allocation.specialCondition ? "translate-x-4" : ""}`}></div>
                                      </label>
                                    </div>
                                    
                                  </div>
                                  {/* Divider */}
                                  <div className="w-full flex items-center mb-6">
                                    <div className="flex-grow border-t border-gray-300"></div>
                                  </div>
                                  {allocation.specialCondition && (
                                    <div className="rounded-lg bg-white border border-gray-200 p-4 flex flex-col items-center w-full mb-4">
                                      <div className="font-semibold text-gray-700 mb-3 text-base w-full text-center">Allowed Days</div>
                                      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 w-full mb-4">
                                        {defaultDays.map((day) => (
                                          <label key={day} className="flex items-center gap-2 text-gray-600 text-base cursor-pointer select-none whitespace-nowrap">
                                            <input
                                              type="checkbox"
                                              checked={allocation.allowedDays.includes(day)}
                                              onChange={() => handleDayChange(day)}
                                              className="accent-blue-600 w-5 h-5 rounded focus:ring-2 focus:ring-blue-400"
                                            />
                                            <span>{day}</span>
                                          </label>
                                        ))}
                                      </div>
                                      <div className="w-full flex flex-col items-center mt-2">
                                        <label className="block text-base font-semibold text-gray-700 mb-2 text-center w-full">Maximum Consecutive Days Allowed</label>
                                        <input
                                          type="number"
                                          min="1"
                                          max={allocation.allowedDays.length || 1}
                                          value={allocation.maxConsecutiveDays}
                                          onChange={handleMaxConsecutiveChange}
                                          className="w-28 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 text-lg shadow-sm text-center"
                                        />
                                        <div className="text-xs text-gray-500 mt-2 text-center w-full">
                                          Max is the number of selected days ({allocation.allowedDays.length || 1})
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        {errors.leaveAllocation && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.leaveAllocation}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowPolicyModal(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Leave Policy Edit Modal */}
              {showPolicyEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Edit Leave Policy
                      </h2>
                      <button
                        onClick={() => setShowPolicyEditModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Add scrollable content area */}
                    <div className="overflow-y-auto max-h-[80vh] pr-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handlePolicyUpdate();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Policy Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={policyForm.name}
                          onChange={handlePolicyFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter policy name"
                        />
                        {errors.policyName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.policyName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-700">
                            Leave Allocations
                          </label>
                          <button
                            type="button"
                            onClick={handleAddLeaveAllocation}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Leave Type
                          </button>
                        </div>

                        {policyForm.leaveAllocations.map((allocation, index) => {
                          // Ensure allocation has all fields
                          allocation = enrichAllocation(allocation);
                          const handleToggle = (field) => {
                            setIsPolicyFormChanged(true);
                            const newAllocations = [...policyForm.leaveAllocations];
                            newAllocations[index][field] = !newAllocations[index][field];
                            // If turning off specialCondition, reset allowedDays and maxConsecutiveDays
                            if (field === "specialCondition" && newAllocations[index][field] === false) {
                              newAllocations[index].allowedDays = [];
                              newAllocations[index].maxConsecutiveDays = 1;
                            }
                            setPolicyForm({ ...policyForm, leaveAllocations: newAllocations });
                          };
                          const handleDayChange = (day) => {
                            setIsPolicyFormChanged(true);
                            const newAllocations = [...policyForm.leaveAllocations];
                            let days = newAllocations[index].allowedDays || [];
                            if (days.includes(day)) {
                              days = days.filter((d) => d !== day);
                            } else {
                              days = [...days, day];
                            }
                            newAllocations[index].allowedDays = days;
                            // Adjust maxConsecutiveDays if needed
                            if (days.length < newAllocations[index].maxConsecutiveDays) {
                              newAllocations[index].maxConsecutiveDays = days.length || 1;
                            }
                            setPolicyForm({ ...policyForm, leaveAllocations: newAllocations });
                          };
                          const handleMaxConsecutiveChange = (e) => {
                            setIsPolicyFormChanged(true);
                            const val = Math.max(1, Math.min(Number(e.target.value), allocation.allowedDays.length || 1));
                            const newAllocations = [...policyForm.leaveAllocations];
                            newAllocations[index].maxConsecutiveDays = val;
                            setPolicyForm({ ...policyForm, leaveAllocations: newAllocations });
                          };
                          return (
                            <div key={index} className="flex flex-col gap-2 border p-3 rounded-md mb-2 bg-gray-50">
                              {/* Add Leave Type label */}
                              <div className="mb-2 text-base font-semibold text-gray-700">Leave Type {index + 1}</div>
                              <div className="flex gap-4 items-start">
                              <div className="flex-1">
                                <select
                                  value={allocation.leaveTypeId || ""}
                                  onChange={(e) => {
                                    setIsPolicyFormChanged(true);
                                      const newAllocations = [...policyForm.leaveAllocations];
                                    newAllocations[index] = {
                                      ...newAllocations[index],
                                      leaveTypeId: e.target.value,
                                    };
                                    setPolicyForm({
                                      ...policyForm,
                                      leaveAllocations: newAllocations,
                                    });
                                  }}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm truncate"
                                >
                                    <option value="" className="text-xs text-gray-400 truncate">Select Leave Type</option>
                                  {leaveTypes.map((type) => (
                                      <option key={type.leaveTypeId} value={type.leaveTypeId} className="truncate text-sm">
                                      {type.leaveTypeName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1">
                                <input
                                  type="number"
                                  value={allocation.daysPerYear || ""}
                                  onChange={(e) => {
                                    setIsPolicyFormChanged(true);
                                      const newAllocations = [...policyForm.leaveAllocations];
                                    newAllocations[index] = {
                                      ...newAllocations[index],
                                      daysPerYear: e.target.value,
                                    };
                                    setPolicyForm({
                                      ...policyForm,
                                      leaveAllocations: newAllocations,
                                    });
                                  }}
                                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Days/year"
                                />
                              </div>
                              {index > 0 && (
                                <button
                                  type="button"
                                    onClick={() => handleRemoveLeaveAllocation(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                              {/* --- Functional Special Condition and Consecutive Leaves --- */}
                              <div className="mt-4 p-4 rounded-lg bg-gray-100 border border-gray-200 w-full max-w-2xl mx-auto">
                                <div className="flex flex-row items-center gap-12 mb-4 flex-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700">Special Condition</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" checked={allocation.specialCondition} onChange={() => handleToggle("specialCondition")} className="sr-only peer" />
                                      <div className={`w-10 h-6 rounded-full transition-all ${allocation.specialCondition ? "bg-blue-600" : "bg-gray-300"}`}></div>
                                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-all ${allocation.specialCondition ? "translate-x-4" : ""}`}></div>
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700">Allow Consecutive Leaves</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" checked={allocation.allowConsecutiveLeaves} onChange={() => handleToggle("allowConsecutiveLeaves")} className="sr-only peer" />
                                      <div className={`w-10 h-6 rounded-full transition-all ${allocation.allowConsecutiveLeaves ? "bg-blue-600" : "bg-gray-300"}`}></div>
                                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-all ${allocation.allowConsecutiveLeaves ? "translate-x-4" : ""}`}></div>
                                    </label>
                                  </div>
                                </div>
                                {/* Divider */}
                                <div className="w-full flex items-center mb-6">
                                  <div className="flex-grow border-t border-gray-300"></div>
                                </div>
                                {allocation.specialCondition && (
                                  <div className="rounded-lg bg-white border border-gray-200 p-4 flex flex-col items-center w-full mb-4">
                                    <div className="font-semibold text-gray-700 mb-3 text-base w-full text-center">Allowed Days</div>
                                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 w-full mb-4">
                                      {defaultDays.map((day) => (
                                        <label key={day} className="flex items-center gap-2 text-gray-600 text-base cursor-pointer select-none whitespace-nowrap">
                                          <input
                                            type="checkbox"
                                            checked={allocation.allowedDays.includes(day)}
                                            onChange={() => handleDayChange(day)}
                                            className="accent-blue-600 w-5 h-5 rounded focus:ring-2 focus:ring-blue-400"
                                          />
                                          <span>{day}</span>
                                        </label>
                                      ))}
                                    </div>
                                    <div className="w-full flex flex-col items-center mt-2">
                                      <label className="block text-base font-semibold text-gray-700 mb-2 text-center w-full">Maximum Consecutive Days Allowed</label>
                                      <input
                                        type="number"
                                        min="1"
                                        max={allocation.allowedDays.length || 1}
                                        value={allocation.maxConsecutiveDays}
                                        onChange={handleMaxConsecutiveChange}
                                        className="w-28 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 text-lg shadow-sm text-center"
                                      />
                                      <div className="text-xs text-gray-500 mt-2 text-center w-full">
                                        Max is the number of selected days ({allocation.allowedDays.length || 1})
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {errors.leaveAllocation && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.leaveAllocation}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowPolicyEditModal(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {isPolicyFormChanged ? "Update" : "Save"}
                        </button>
                      </div>
                    </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Public Holidays Content */}
          {activeTab === "Public Holidays" && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {/* Header with Add Button */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => {
                    setSelectedHoliday(null);
                    setHolidayForm({
                      name: "",
                      date: "",
                      description: "",
                    });
                    setShowHolidayModal(true);
                    setIsHolidayFormChanged(false);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Public Holiday
                </button>
              </div>

              {/* Public Holidays List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Holiday Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {holidayLoading ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : holidayError ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-center text-red-500"
                        >
                          {holidayError}
                        </td>
                      </tr>
                    ) : holidays.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <div className="rounded-full bg-gray-100 p-4 mb-4">
                              <FileText className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-xl font-semibold text-gray-800 mb-1">No Public Holidays Found</p>
                            <p className="text-sm mb-4">You haven&apos;t added any public holidays yet. Click the button below to add your first public holiday.</p>
                            <button
                              onClick={() => {
                                setSelectedHoliday(null);
                                setHolidayForm({
                                  name: "",
                                  date: "",
                                  description: "",
                                });
                                setShowHolidayModal(true);
                                setIsHolidayFormChanged(false);
                              }}
                              className="px-5 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Add Your First Public Holiday
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      holidays.map((holiday) => (
                        <tr
                          key={holiday.holidayId}
                          onClick={() => handleHolidayRowClick(holiday)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {holiday.holidayName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(holiday.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {holiday.description || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Public Holiday Modal */}
              {showHolidayModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Add New Public Holiday
                      </h2>
                      <button
                        onClick={() => setShowHolidayModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleHolidaySubmit(e);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Holiday Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={holidayForm.name}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter holiday name"
                        />
                        {errors.holidayName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.holidayName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={holidayForm.date}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.holidayDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.holidayDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={holidayForm.description}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Enter description"
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowHolidayModal(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Public Holiday Edit Modal */}
              {showHolidayEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Edit Public Holiday
                      </h2>
                      <button
                        onClick={() => setShowHolidayEditModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <form onSubmit={handleHolidayUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Holiday Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={holidayForm.name}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter holiday name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={holidayForm.date}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={holidayForm.description}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Enter description"
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowHolidayEditModal(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {isHolidayFormChanged ? "Update" : "Save"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leave Type Modal */}
          {showLeaveTypeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Add New Leave Type
                  </h2>
                  <button
                    onClick={() => setShowLeaveTypeModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLeaveTypeSubmit(e);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leave Type Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={leaveTypeForm.name}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter leave type name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accrual Period
                    </label>
                    <select
                      name="accrual"
                      value={leaveTypeForm.accrual}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select accrual period</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                      <option value="On Request">On Request</option>
                    </select>
                    {errors.accrual && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.accrual}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={leaveTypeForm.description}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowedInProbation"
                        name="allowedInProbation"
                        checked={leaveTypeForm.allowedInProbation}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="allowedInProbation"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Allowed in Probation Period
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowedInNotice"
                        name="allowedInNotice"
                        checked={leaveTypeForm.allowedInNotice}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="allowedInNotice"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Allowed in Notice Period
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="canCarryForward"
                        name="canCarryForward"
                        checked={leaveTypeForm.canCarryForward}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="canCarryForward"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Can be Carried Forward
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowLeaveTypeModal(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Leave Type Edit Modal */}
          {showLeaveTypeEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Edit Leave Type
                  </h2>
                  <button
                    onClick={() => setShowLeaveTypeEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleLeaveTypeUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leave Type Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={leaveTypeForm.name}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter leave type name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accrual Period
                    </label>
                    <select
                      name="accrual"
                      value={leaveTypeForm.accrual}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select accrual period</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                      <option value="On Request">On Request</option>
                    </select>
                    {errors.accrual && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.accrual}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={leaveTypeForm.description}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowedInProbation"
                        name="allowedInProbation"
                        checked={leaveTypeForm.allowedInProbation}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="allowedInProbation"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Allowed in Probation Period
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowedInNotice"
                        name="allowedInNotice"
                        checked={leaveTypeForm.allowedInNotice}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="allowedInNotice"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Allowed in Notice Period
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="canCarryForward"
                        name="canCarryForward"
                        checked={leaveTypeForm.canCarryForward}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="canCarryForward"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Can be Carried Forward
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowLeaveTypeEditModal(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {isLeaveTypeFormChanged ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notification */}
          {notification.show && (
            <div className="fixed bottom-4 right-4 z-50">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{notification.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(LeaveSettings);
