import React, { useState, useEffect } from "react";
import { Plus, X, CheckCircle, AlertCircle, FileText } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { toast } from "sonner";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import {
  createDepartment,
  fetchDepartments,
  updateDepartment,
  deleteDepartment,
} from "@/redux/slices/departmentSlice";
import { fetchLeavePolicies } from "@/redux/slices/leavePolicySlice";
import {
  createDesignation,
  fetchDepartmentsForDropdown,
  fetchDesignations,
  updateDesignation,
  deleteDesignation,
} from "@/redux/slices/designationSlice";
import withAuth from "@/components/withAuth";

const OrganizationSettings = () => {
  const selectedCompanyId = sessionStorage.getItem("currentCompanyId");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("departments");
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
    head: "",
    leavePolicy: "",
    weeklyHolidays: [],
  });
  const [designationForm, setDesignationForm] = useState({
    name: "",
    description: "",
    department: "",
    manager: false,
    overtimeEligible: false,
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showDepartmentEditModal, setShowDepartmentEditModal] = useState(false);
  const [showDesignationEditModal, setShowDesignationEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  const dispatch = useDispatch();
  const {
    loading,
    error,
    success,
    departments: reduxDepartments,
  } = useSelector((state) => state.department);
  const { policies } = useSelector((state) => state.leavePolicy);
  const { designations: fetchedDesignations, loading: designationLoading } =
    useSelector((state) => state.designation);

  // Fetch departments, leave policies, and designations when component mounts
  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchLeavePolicies());
    dispatch(fetchDepartmentsForDropdown());
    dispatch(fetchDesignations());
  }, [dispatch]);

  // Sample data for dropdowns
  const leavePolicyOptions = policies.map((policy) => ({
    value: policy.leavePolicyId,
    label: policy.name,
  }));

  const weekDays = [
    { value: "Sunday", label: "Sunday" },
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleDepartmentUpdate = async (id) => {
    try {
      const newErrors = {};

      if (!departmentForm.name) {
        newErrors.name = "Department name is required";
      }
      // if (!departmentForm.leavePolicy) {
      //   newErrors.leavePolicy = "Leave policy is required";
      // }
      // if (!departmentForm.head) {
      //   newErrors.head = "Department head is required";
      // }
      if (
        !departmentForm.weeklyHolidays ||
        departmentForm.weeklyHolidays.length === 0
      ) {
        newErrors.weeklyHolidays = "Weekly holidays are required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setNotification({
          show: true,
          type: "error",
          message: "Please fill in all required fields",
        });
        setTimeout(() => {
          setNotification({ show: false, type: "", message: "" });
          setErrors({});
        }, 2000);
        return;
      }

      const departmentData = {
        name: departmentForm.name,
        description: departmentForm.description || "",
        departmentHead: departmentForm.head,
        leavePolicy: departmentForm.leavePolicy.value,
        weeklyHolidays: departmentForm.weeklyHolidays
          .map((day) => day.value)
          .join(","),
        companyId: selectedCompanyId,
      };

      await dispatch(
        updateDepartment({
          id: selectedDepartment.departmentId,
          departmentData,
        })
      ).unwrap();

      setNotification({
        show: true,
        type: "success",
        message: "Department updated successfully!",
      });

      setShowDepartmentEditModal(false);
      setSelectedDepartment(null);
      setDepartmentForm({
        name: "",
        description: "",
        head: "",
        leavePolicy: "",
        weeklyHolidays: [],
      });
      setIsFormChanged(false);

      // Refresh departments list
      dispatch(fetchDepartments());

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 2000);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error || "Failed to update department. Please try again.",
      });
      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 2000);
    }
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!departmentForm.name) {
      newErrors.name = "Department name is required";
    }
    // if (!departmentForm.leavePolicy) {
    //   newErrors.leavePolicy = "Leave policy is required";
    // }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      setNotification({
        show: true,
        type: "error",
        message: "Please fill in all required fields",
      });

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
      const departmentData = {
        name: departmentForm.name,
        description: departmentForm.description || "",
        departmentHead: departmentForm.head,
        leavePolicy: departmentForm.leavePolicy.value,
        weeklyHolidays: departmentForm.weeklyHolidays
          .map((day) => day.value)
          .join(","),
      };

      await dispatch(
        createDepartment({ ...departmentData, companyId: selectedCompanyId })
      ).unwrap();

      setNotification({
        show: true,
        type: "success",
        message: "Department added successfully!",
      });

      setShowDepartmentModal(false);
      setDepartmentForm({
        name: "",
        description: "",
        head: "",
        leavePolicy: "",
        weeklyHolidays: [],
      });
      setIsFormChanged(false);

      // Refresh departments list without page reload
      dispatch(fetchDepartments());

      setTimeout(() => {
        setNotification({
          show: false,
          type: "",
          message: "",
        });
      }, 2000);
    } catch (error) {
      // Check if the error is due to department already existing
      if (error.includes("already exists") || error.includes("duplicate")) {
        setNotification({
          show: true,
          type: "error",
          message:
            "A department with this name already exists. Please use a different name.",
        });
        setErrors({
          name: "Department name already exists",
        });
      } else {
        setNotification({
          show: true,
          type: "error",
          message: error || "Failed to add department. Please try again.",
        });
        setErrors({});
      }

      setTimeout(() => {
        setNotification({
          show: false,
          type: "",
          message: "",
        });
        setErrors({});
      }, 2000);
    }
  };

  const handleDesignationUpdate = async () => {
    try {
      const newErrors = {};

      if (!designationForm.name) {
        newErrors.name = "Designation name is required";
      }
      if (!designationForm.department) {
        newErrors.department = "Department is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setNotification({
          show: true,
          type: "error",
          message: "Please fill in all required fields",
        });
        setTimeout(() => {
          setNotification({ show: false, type: "", message: "" });
          setErrors({});
        }, 2000);
        return;
      }

      const designationDepartmentId = reduxDepartments.find(
        (dept) => dept.name === designationForm.department.value
      )?.departmentId;

      const designationData = {
        name: designationForm.name,
        description: designationForm.description || "",
        department: designationDepartmentId,
        manager: designationForm.manager,
        overtimeEligible: designationForm.overtimeEligible,
        companyId: selectedCompanyId,
      };

      await dispatch(
        updateDesignation({
          id: selectedDesignation.designationId,
          designationData,
        })
      ).unwrap();

      setNotification({
        show: true,
        type: "success",
        message: "Designation updated successfully!",
      });

      setShowDesignationModal(false);
      setSelectedDesignation(null);
      setDesignationForm({
        name: "",
        description: "",
        department: "",
        manager: false,
        overtimeEligible: false,
      });
      setIsFormChanged(false);

      // Refresh designations list
      dispatch(fetchDesignations());

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 2000);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error.message || "Failed to update designation. Please try again.",
      });
      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 2000);
    }
  };

  const handleDesignationSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!designationForm.name) {
      newErrors.name = "Designation name is required";
    }
    if (!designationForm.department) {
      newErrors.department = "Department is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification("error", "Please fill in all required fields");
      return;
    }

    try {
      const designationData = {
        name: designationForm.name,
        description: designationForm.description || "",
        department: designationForm.department.value,
        manager: designationForm.manager,
        overtimeEligible: designationForm.overtimeEligible,
      };

      await dispatch(createDesignation(designationData)).unwrap();
      showNotification("success", "Designation added successfully!");

      setShowDesignationModal(false);
      setDesignationForm({
        name: "",
        description: "",
        department: "",
        manager: false,
        overtimeEligible: false,
      });
      setIsFormChanged(false);
      setErrors({});

      dispatch(fetchDesignations());
    } catch (error) {
      showNotification("error", error.message || "Failed to add designation");
      if (error.message?.includes("already exists")) {
        setErrors({
          name: "Designation already exists",
        });
      }
    }
  };

  const handleDepartmentFormChange = (e) => {
    setIsFormChanged(true);
    const { name, value } = e.target;
    setDepartmentForm({
      ...departmentForm,
      [name]: value,
    });

    // Clear any existing errors for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDesignationFormChange = (e) => {
    setIsFormChanged(true);
    const { name, value, type, checked } = e.target;
    setDesignationForm({
      ...designationForm,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear any existing errors for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    setIsFormChanged(true);
    const { name } = actionMeta;
    if (name === "leavePolicy") {
      setDepartmentForm({
        ...departmentForm,
        leavePolicy: selectedOption,
      });
    } else if (name === "weeklyHolidays") {
      setDepartmentForm({
        ...departmentForm,
        weeklyHolidays: selectedOption,
      });
    } else if (name === "department") {
      setDesignationForm({
        ...designationForm,
        department: selectedOption,
      });
    }
  };

  const handleModalClose = () => {
    // Reset all form and state values
    setShowDepartmentModal(false);
    setShowDepartmentEditModal(false);
    setShowDesignationEditModal(false);
    setShowDesignationModal(false);
    setSelectedItem(null);
    setSelectedDepartment(null);
    setSelectedDesignation(null);
    setIsEditing(false);
    setIsFormChanged(false);
    setDepartmentForm({
      name: "",
      description: "",
      head: "",
      leavePolicy: "",
      weeklyHolidays: [],
    });
    setDesignationForm({
      name: "",
      description: "",
      department: "",
      manager: false,
      overtimeEligible: false,
    });
    setErrors({});
  };

  const handleDesignationRowClick = (designation) => {
    // Reset form changed state when opening new designation
    setIsFormChanged(false);
    setSelectedDesignation(designation);

    // Find the department name using the department ID
    const departmentName =
      reduxDepartments.find(
        (dept) => dept.departmentId === designation.department
      )?.name || designation.department;

    setDesignationForm({
      name: designation.name,
      department: {
        value: designation.department,
        label: departmentName, // Use the department name instead of the ID
      },
      description: designation.description || "",
      manager: designation.manager || false,
      overtimeEligible: designation.overtimeEligible || false,
    });
    setShowDesignationModal(true);
  };

  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setNotification({
        show: false,
        type: "",
        message: "",
      });
    }, 2000); // Exactly 2 seconds
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        <HradminNavbar />

        <div className="p-6 mt-16">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Organization Settings
            </h1>
            <button
              onClick={() => {
                if (activeTab === "departments") {
                  setSelectedDepartment(null);
                  setShowDepartmentModal(true);
                } else {
                  setSelectedDesignation(null);
                  setShowDesignationModal(true);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add {activeTab === "departments" ? "Department" : "Designation"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            {["Departments", "Designations"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab.toLowerCase()
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab(tab.toLowerCase())}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tables Container with Dynamic Height */}
          <div
            className={`overflow-hidden ${
              activeTab === "departments"
                ? reduxDepartments.length <= 8
                  ? "h-auto"
                  : "h-[calc(100vh-280px)]"
                : fetchedDesignations.length <= 8
                ? "h-auto"
                : "h-[calc(100vh-280px)]"
            }`}
          >
            {/* Departments Table */}
            {activeTab === "departments" && (
              <div className="bg-white rounded-lg shadow h-full">
                <div className="overflow-auto h-full">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Description
                        </th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Department Head
                        </th> */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Leave Policy
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Weekly Holidays
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reduxDepartments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <div className="rounded-full bg-gray-100 p-4 mb-4">
                                <FileText className="h-10 w-10 text-gray-400" />
                              </div>
                              <p className="text-xl font-semibold text-gray-800 mb-1">No Departments Found</p>
                              <p className="text-sm mb-4">You haven&apos;t added any departments yet. Click the button below to add your first department.</p>
                              <button
                                onClick={() => {
                                  setSelectedDepartment(null);
                                  setShowDepartmentModal(true);
                                }}
                                className="px-5 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
                              >
                                Add Your First Department
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        reduxDepartments.map((department) => (
                          <tr
                            key={department.id}
                            onClick={() => {
                              // Reset form changed state when opening new item
                              setIsFormChanged(false);
                              setSelectedDepartment(department);

                              // Find the leave policy object from the policies array
                              const selectedPolicy = policies.find(
                                (p) => p.leavePolicyId === department.leavePolicy
                              );

                              // Format weekly holidays into array of objects
                              const weeklyHolidaysArray =
                                department.weeklyHolidays
                                  ?.split(",")
                                  .map((day) => ({
                                    value: day.trim(),
                                    label: day.trim(),
                                  })) || [];

                              setDepartmentForm({
                                name: department.name,
                                description: department.description || "",
                                head: department.departmentHead,
                                leavePolicy: {
                                  value: department.leavePolicy,
                                  label:
                                    selectedPolicy?.name ||
                                    department.leavePolicy,
                                },
                                weeklyHolidays: weeklyHolidaysArray,
                              });
                              setShowDepartmentEditModal(true);
                            }}
                            className="hover:bg-gray-50 cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {department.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {department.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {department.departmentHead}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {policies.find(
                                (policy) =>
                                  policy.leavePolicyId === department.leavePolicy
                              )?.name || department.leavePolicy}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {department.weeklyHolidays}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Designations Table */}
            {activeTab === "designations" && (
              <div className="bg-white rounded-lg shadow h-full">
                <div className="overflow-auto h-full">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Is Manager
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Overtime Eligible
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {designationLoading ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center">
                            Loading...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 text-center text-red-500"
                          >
                            {error}
                          </td>
                        </tr>
                      ) : fetchedDesignations.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <div className="rounded-full bg-gray-100 p-4 mb-4">
                                <FileText className="h-10 w-10 text-gray-400" />
                              </div>
                              <p className="text-xl font-semibold text-gray-800 mb-1">No Designations Found</p>
                              <p className="text-sm mb-4">You haven&apos;t added any designations yet. Click the button below to add your first designation.</p>
                              <button
                                onClick={() => {
                                  setSelectedDesignation(null);
                                  setShowDesignationModal(true);
                                }}
                                className="px-5 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
                              >
                                Add Your First Designation
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        fetchedDesignations.map((designation) => (
                          <tr
                            key={designation.id}
                            onClick={() =>
                              handleDesignationRowClick(designation)
                            }
                            className="hover:bg-gray-50 cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {designation.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {reduxDepartments.find(
                                (dept) =>
                                  dept.departmentId === designation.department
                              )?.name || designation.department}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {designation.description || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {designation.manager ? "Yes" : "No"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {designation.overtimeEligible ? "Yes" : "No"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Add Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px]">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Department
                </h3>
                <button
                  onClick={() => {
                    handleModalClose();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDepartmentSubmit(e);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department name"
                    onChange={handleDepartmentFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department description"
                    rows={3}
                    onChange={handleDepartmentFormChange}
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="head"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department head name"
                    onChange={handleDepartmentFormChange}
                    required
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Policy 
                  </label>
                  <Select
                    name="leavePolicy"
                    options={leavePolicyOptions}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select leave policy"
                    onChange={handleSelectChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weekly Holidays <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="weeklyHolidays"
                    isMulti
                    options={weekDays}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select weekly holidays"
                    onChange={handleSelectChange}
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDepartmentModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleDepartmentSubmit(e);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Edit Modal */}
      {showDepartmentEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px]">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Department
                </h3>
                <button
                  onClick={() => {
                    handleModalClose();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDepartmentUpdate(selectedDepartment.id);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department name"
                    value={departmentForm.name}
                    onChange={handleDepartmentFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department description"
                    rows={3}
                    value={departmentForm.description}
                    onChange={handleDepartmentFormChange}
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="head"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department head name"
                    value={departmentForm.head}
                    onChange={handleDepartmentFormChange}
                    required
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Policy <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="leavePolicy"
                    options={leavePolicyOptions}
                    value={departmentForm.leavePolicy}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select leave policy"
                    onChange={handleSelectChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weekly Holidays <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="weeklyHolidays"
                    isMulti
                    options={weekDays}
                    value={departmentForm.weeklyHolidays}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select weekly holidays"
                    onChange={handleSelectChange}
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  handleModalClose();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleDepartmentUpdate(selectedDepartment.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isFormChanged ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {showDesignationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedDesignation ? "Edit Designation" : "Add Designation"}
              </h2>
              <button
                onClick={() => {
                  handleModalClose();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedDesignation) {
                  handleDesignationUpdate();
                } else {
                  handleDesignationSubmit(e);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter designation name"
                  value={designationForm.name}
                  onChange={handleDesignationFormChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter designation description"
                  rows={3}
                  value={designationForm.description}
                  onChange={handleDesignationFormChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <Select
                  name="department"
                  options={reduxDepartments.map((dept) => ({
                    value: dept.departmentId,
                    label: dept.name,
                  }))}
                  className="react-select"
                  classNamePrefix="select"
                  placeholder="Select department"
                  value={designationForm.department}
                  onChange={(selectedOption) => {
                    setDesignationForm({
                      ...designationForm,
                      department: selectedOption,
                    });
                  }}
                />
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="manager"
                    name="manager"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={designationForm.manager}
                    onChange={(e) => {
                      setDesignationForm({
                        ...designationForm,
                        manager: e.target.checked,
                      });
                    }}
                  />
                  <label
                    htmlFor="manager"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Is Manager
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="overtimeEligible"
                    name="overtimeEligible"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={designationForm.overtimeEligible}
                    onChange={(e) => {
                      setDesignationForm({
                        ...designationForm,
                        overtimeEligible: e.target.checked,
                      });
                    }}
                  />
                  <label
                    htmlFor="overtimeEligible"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Overtime Eligible
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    handleModalClose();
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedDesignation
                    ? isFormChanged
                      ? "Update"
                      : "Save"
                    : "Add"}
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
  );
};

export default withAuth(OrganizationSettings);
