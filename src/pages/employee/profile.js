import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import withAuth from "@/components/withAuth";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import {
  FiUser,
  FiBook,
  FiDollarSign,
  FiCreditCard,
  FiShield,
  FiUpload,
  FiSettings,
  FiLogOut,
  FiEdit2,
  FiEye,
  FiLoader,
  FiCheck,
} from "react-icons/fi";
import { FaCalendarCheck } from "react-icons/fa";
import { X } from "lucide-react";
import getConfig from "next/config";
import { clearSession } from "@/utils/sessionManager";

function EmployeeProfilePage() {
  const router = useRouter();
  const { id } = router.query; // Get ID from URL query parameter

  const { publicRuntimeConfig } = getConfig();

  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [employeeById, setEmployeeById] = useState(null); // Holds the fetched employee data
  const [managerName, setManagerName] = useState(""); // Add state for manager name
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPageInEditMode, setIsPageInEditMode] = useState(false);
  const [isEditable, setIsEditable] = useState(true); // Controls if editing is allowed based on updateStatus
  const [showPendingChangesModal, setShowPendingChangesModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);

  // Main state for form data, used during editing
  const [formData, setFormData] = useState({
    employee: {
      fatherName: "",
      gender: "",
      phone1: "",
      phone2: "",
      email: { personal: "" },
      currentAddress: "",
      permanentAddress: "",
      profileImage: null, // Stores File object or null/URL string
    },
    idProofs: {
      aadharNo: "",
      panNo: "",
      passport: "",
      drivingLicense: "",
      voterId: "",
      // Potential state for file objects if needed, e.g., aadharFile: null
    },
    bank: {
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      upiId: "",
      upiPhone: "",
      passbookDoc: null, // Stores File object or null/URL string
    },
    // Add statutory, salary etc. if they become editable
  });

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // --- Data Fetching ---
  const fetchByEmployeeId = useCallback(async () => {
    const employeeIdToFetch = sessionStorage.getItem("employeeId");
    setLoading(true);
    try {
      const response = await fetch(
        `${publicRuntimeConfig.apiURL}/employee/id/${employeeIdToFetch}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmployeeById(data);

      // Fetch manager name if reporting manager exists
      if (data.reportingManager) {
        try {
          const managerResponse = await fetch(
            `${publicRuntimeConfig.apiURL}/employee/id/${data.reportingManager}`
          );
          if (managerResponse.ok) {
            const managerData = await managerResponse.json();
            setManagerName(managerData.name);
          }
        } catch (error) {
          setManagerName("-");
        }
      } else {
        setManagerName("-");
      }

      // Check update status to enable/disable editing
      if (data.updateStatus === "Pending") {
        setIsEditable(false);
        toast.info("An update request is pending. Editing is disabled.");
      } else {
        setIsEditable(true);
      }
    } catch (error) {
      toast.error(`Failed to fetch employee data: ${error.message}`);
      setEmployeeById(null); // Clear data on error
      setIsEditable(false); // Disable editing on fetch error
    } finally {
      setLoading(false);
    }
  }, [publicRuntimeConfig.apiURL]); // Add dependencies that the function uses

  const fetchPendingChanges = () => {
    if (!employeeById?.pendingUpdateRequest) {
      toast.error("No pending changes found");
      return;
    }

    const changes = {
      personalInfo: [],
      bankDetails: [],
      documents: [],
    };

    // Compare personal information
    if (
      employeeById.pendingUpdateRequest.emailPersonal &&
      employeeById.pendingUpdateRequest.emailPersonal !==
        employeeById.emailPersonal
    ) {
      changes.personalInfo.push({
        field: "Personal Email",
        oldValue: employeeById.emailPersonal,
        newValue: employeeById.pendingUpdateRequest.emailPersonal,
      });
    }
    if (
      employeeById.pendingUpdateRequest.phone &&
      employeeById.pendingUpdateRequest.phone !== employeeById.phone
    ) {
      changes.personalInfo.push({
        field: "Phone",
        oldValue: employeeById.phone,
        newValue: employeeById.pendingUpdateRequest.phone,
      });
    }
    if (
      employeeById.pendingUpdateRequest.alternatePhone &&
      employeeById.pendingUpdateRequest.alternatePhone !==
        employeeById.alternatePhone
    ) {
      changes.personalInfo.push({
        field: "Alternate Phone",
        oldValue: employeeById.alternatePhone,
        newValue: employeeById.pendingUpdateRequest.alternatePhone,
      });
    }
    if (
      employeeById.pendingUpdateRequest.currentAddress &&
      employeeById.pendingUpdateRequest.currentAddress !==
        employeeById.currentAddress
    ) {
      changes.personalInfo.push({
        field: "Current Address",
        oldValue: employeeById.currentAddress,
        newValue: employeeById.pendingUpdateRequest.currentAddress,
      });
    }
    if (
      employeeById.pendingUpdateRequest.permanentAddress &&
      employeeById.pendingUpdateRequest.permanentAddress !==
        employeeById.permanentAddress
    ) {
      changes.personalInfo.push({
        field: "Permanent Address",
        oldValue: employeeById.permanentAddress,
        newValue: employeeById.pendingUpdateRequest.permanentAddress,
      });
    }

    // Compare bank details
    if (
      employeeById.pendingUpdateRequest.accountNumber &&
      employeeById.pendingUpdateRequest.accountNumber !==
        employeeById.bankDetails?.accountNumber
    ) {
      changes.bankDetails.push({
        field: "Account Number",
        oldValue: employeeById.bankDetails?.accountNumber,
        newValue: employeeById.pendingUpdateRequest.accountNumber,
      });
    }
    if (
      employeeById.pendingUpdateRequest.bankName &&
      employeeById.pendingUpdateRequest.bankName !==
        employeeById.bankDetails?.bankName
    ) {
      changes.bankDetails.push({
        field: "Bank Name",
        oldValue: employeeById.bankDetails?.bankName,
        newValue: employeeById.pendingUpdateRequest.bankName,
      });
    }
    if (
      employeeById.pendingUpdateRequest.branchName &&
      employeeById.pendingUpdateRequest.branchName !==
        employeeById.bankDetails?.branchName
    ) {
      changes.bankDetails.push({
        field: "Branch Name",
        oldValue: employeeById.bankDetails?.branchName,
        newValue: employeeById.pendingUpdateRequest.branchName,
      });
    }
    if (
      employeeById.pendingUpdateRequest.ifscCode &&
      employeeById.pendingUpdateRequest.ifscCode !==
        employeeById.bankDetails?.ifscCode
    ) {
      changes.bankDetails.push({
        field: "IFSC Code",
        oldValue: employeeById.bankDetails?.ifscCode,
        newValue: employeeById.pendingUpdateRequest.ifscCode,
      });
    }
    if (
      employeeById.pendingUpdateRequest.upiPhoneNumber &&
      employeeById.pendingUpdateRequest.upiPhoneNumber !==
        employeeById.bankDetails?.upiPhoneNumber
    ) {
      changes.bankDetails.push({
        field: "UPI Phone",
        oldValue: employeeById.bankDetails?.upiPhoneNumber,
        newValue: employeeById.pendingUpdateRequest.upiPhoneNumber,
      });
    }

    // Check document changes
    if (
      employeeById.pendingUpdateRequest.profileImgUrl &&
      employeeById.pendingUpdateRequest.profileImgUrl !==
        employeeById.employeeImgUrl
    ) {
      changes.documents.push({
        field: "Profile Image",
        oldValue: employeeById.employeeImgUrl,
        newValue: employeeById.pendingUpdateRequest.profileImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.passbookImgUrl &&
      employeeById.pendingUpdateRequest.passbookImgUrl !==
        employeeById.bankDetails?.passbookImgUrl
    ) {
      changes.documents.push({
        field: "Bank Passbook",
        oldValue: employeeById.bankDetails?.passbookImgUrl,
        newValue: employeeById.pendingUpdateRequest.passbookImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.aadharImgUrl &&
      employeeById.pendingUpdateRequest.aadharImgUrl !==
        employeeById.idProofs?.aadharImgUrl
    ) {
      changes.documents.push({
        field: "Aadhar Card",
        oldValue: employeeById.idProofs?.aadharImgUrl,
        newValue: employeeById.pendingUpdateRequest.aadharImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.pancardImgUrl &&
      employeeById.pendingUpdateRequest.pancardImgUrl !==
        employeeById.idProofs?.pancardImgUrl
    ) {
      changes.documents.push({
        field: "PAN Card",
        oldValue: employeeById.idProofs?.pancardImgUrl,
        newValue: employeeById.pendingUpdateRequest.pancardImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.passportImgUrl &&
      employeeById.pendingUpdateRequest.passportImgUrl !==
        employeeById.idProofs?.passportImgUrl
    ) {
      changes.documents.push({
        field: "Passport",
        oldValue: employeeById.idProofs?.passportImgUrl,
        newValue: employeeById.pendingUpdateRequest.passportImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.drivingLicenseImgUrl &&
      employeeById.pendingUpdateRequest.drivingLicenseImgUrl !==
        employeeById.idProofs?.drivingLicenseImgUrl
    ) {
      changes.documents.push({
        field: "Driving License",
        oldValue: employeeById.idProofs?.drivingLicenseImgUrl,
        newValue: employeeById.pendingUpdateRequest.drivingLicenseImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.voterIdImgUrl &&
      employeeById.pendingUpdateRequest.voterIdImgUrl !==
        employeeById.idProofs?.voterIdImgUrl
    ) {
      changes.documents.push({
        field: "Voter ID",
        oldValue: employeeById.idProofs?.voterIdImgUrl,
        newValue: employeeById.pendingUpdateRequest.voterIdImgUrl,
        isImage: true,
      });
    }

    setPendingChanges(changes);
    setShowPendingChangesModal(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchByEmployeeId();
  }, [fetchByEmployeeId]);

  // --- Input Handling ---
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section, parentField, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...prev[section][parentField],
          [field]: value,
        },
      },
    }));
  };

  // --- Edit/Save Logic ---
  const handleEditProfileClick = () => {
    if (!isEditable) {
      toast.error("Editing is disabled while an update request is pending.");
      return;
    }
    if (!employeeById) {
      toast.error("Employee data not loaded yet.");
      return;
    }

    try {
      // Pre-fill all form data when entering edit mode
      if (!isPageInEditMode) {
        const currentData = employeeById;

        // Pre-fill all sections at once
        setFormData({
          employee: {
            ...formData.employee,
            fatherName: currentData?.fathersName || "",
            gender: currentData?.gender || "",
            phone1: currentData?.phone || "",
            phone2: currentData?.alternatePhone || "",
            email: { personal: currentData?.emailPersonal || "" },
            currentAddress: currentData?.currentAddress || "",
            permanentAddress: currentData?.permanentAddress || "",
            // Keep profileImage if it's a File, otherwise reset
            profileImage:
              formData.employee.profileImage instanceof File
                ? formData.employee.profileImage
                : null,
          },
          bank: {
            ...formData.bank,
            accountNumber: currentData?.bankDetails?.accountNumber || "",
            accountHolderName:
              currentData?.bankDetails?.accountHolderName || "",
            ifscCode: currentData?.bankDetails?.ifscCode || "",
            bankName: currentData?.bankDetails?.bankName || "",
            branchName: currentData?.bankDetails?.branchName || "",
            upiId: currentData?.bankDetails?.upiId || "",
            upiPhone: currentData?.bankDetails?.upiPhoneNumber || "",
            // Keep passbookDoc if it's a File, otherwise reset
            passbookDoc:
              formData.bank.passbookDoc instanceof File
                ? formData.bank.passbookDoc
                : null,
          },
          idProofs: {
            ...formData.idProofs,
            aadharNo: currentData?.idProofs?.aadharNo || "",
            panNo: currentData?.idProofs?.panNo || "",
            passport: currentData?.idProofs?.passport || "",
            drivingLicense: currentData?.idProofs?.drivingLicense || "",
            voterId: currentData?.idProofs?.voterId || "",
          },
        });
      }

      setIsPageInEditMode(!isPageInEditMode);
    } catch (error) {
      toast.error("Failed to toggle edit mode");
    }
  };

  // Add a function to handle canceling edits
  const handleCancelClick = () => {
    setIsPageInEditMode(false);
    // Optionally re-fetch data to reset form
    fetchByEmployeeId();
  };

  // Add a function to check if any changes have been made
  const hasChangesBeenMade = () => {
    if (!employeeById) return false;

    // Check personal info changes
    if (formData.employee.email.personal !== employeeById.emailPersonal) {
      return true;
    }
    if (formData.employee.phone1 !== employeeById.phone) {
      return true;
    }
    if (formData.employee.phone2 !== employeeById.alternatePhone) {
      return true;
    }
    if (formData.employee.currentAddress !== employeeById.currentAddress) {
      return true;
    }
    if (formData.employee.permanentAddress !== employeeById.permanentAddress) {
      return true;
    }

    // Check bank info changes
    if (
      formData.bank.accountHolderName !==
      employeeById.bankDetails?.accountHolderName
    ) {
      return true;
    }
    if (
      formData.bank.accountNumber !== employeeById.bankDetails?.accountNumber
    ) {
      return true;
    }
    if (formData.bank.bankName !== employeeById.bankDetails?.bankName) {
      return true;
    }
    if (formData.bank.branchName !== employeeById.bankDetails?.branchName) {
      return true;
    }
    if (formData.bank.ifscCode !== employeeById.bankDetails?.ifscCode) {
      return true;
    }
    if (formData.bank.upiPhone !== employeeById.bankDetails?.upiPhoneNumber) {
      return true;
    }

    // Check if any files have been uploaded
    if (formData.employee.profileImage instanceof File) {
      return true;
    }
    if (formData.bank.passbookDoc instanceof File) {
      return true;
    }
    if (formData.idProofs.aadharImage instanceof File) {
      return true;
    }
    if (formData.idProofs.panImage instanceof File) {
      return true;
    }
    if (formData.idProofs.passportImage instanceof File) {
      return true;
    }
    if (formData.idProofs.drivingLicenseImage instanceof File) {
      return true;
    }
    if (formData.idProofs.voterIdImage instanceof File) {
      return true;
    }

    // No changes detected
    return false;
  };

  // Update the handleSaveAllClick function to check for changes
  const handleSaveAllClick = async () => {
    if (!isEditable) {
      toast.error("Cannot save while an update request is pending.");
      return;
    }
    if (!employeeById?.employeeId) {
      toast.error("Cannot save: Employee ID is missing.");
      return;
    }

    // Check if any changes have been made
    if (!hasChangesBeenMade()) {
      toast.info("No changes have been made. Nothing to save.");
      setIsPageInEditMode(false);
      return;
    }

    setLoading(true);
    try {
      // Create a payload with only the changed fields
      const payload = {
        employeeId: employeeById.employeeId,
      };

      // Only include personal info fields that have changed
      if (formData.employee.email.personal !== employeeById.emailPersonal) {
        payload.emailPersonal = formData.employee.email.personal;
      }
      if (formData.employee.phone1 !== employeeById.phone) {
        payload.phone = formData.employee.phone1;
      }
      if (formData.employee.phone2 !== employeeById.alternatePhone) {
        payload.alternatePhone = formData.employee.phone2;
      }
      if (formData.employee.currentAddress !== employeeById.currentAddress) {
        payload.currentAddress = formData.employee.currentAddress;
      }
      if (
        formData.employee.permanentAddress !== employeeById.permanentAddress
      ) {
        payload.permanentAddress = formData.employee.permanentAddress;
      }

      // Include bank details that have changed (don't require both fields to be filled)
      if (
        formData.bank.accountNumber !== employeeById.bankDetails?.accountNumber
      ) {
        payload.accountNumber = formData.bank.accountNumber;
      }
      if (formData.bank.ifscCode !== employeeById.bankDetails?.ifscCode) {
        payload.ifscCode = formData.bank.ifscCode;
      }
      if (
        formData.bank.accountHolderName !==
        employeeById.bankDetails?.accountHolderName
      ) {
        payload.accountHolderName = formData.bank.accountHolderName;
      }
      if (formData.bank.bankName !== employeeById.bankDetails?.bankName) {
        payload.bankName = formData.bank.bankName;
      }
      if (formData.bank.branchName !== employeeById.bankDetails?.branchName) {
        payload.branchName = formData.bank.branchName;
      }
      if (formData.bank.upiPhone !== employeeById.bankDetails?.upiPhoneNumber) {
        payload.upiPhoneNumber = formData.bank.upiPhone;
      }

      // Create FormData for the request
      const formDataPayload = new FormData();
      formDataPayload.append("updateRequest", JSON.stringify(payload));

      // Add files if they exist
      if (formData.employee.profileImage instanceof File) {
        formDataPayload.append("profileImage", formData.employee.profileImage);
      }
      if (formData.bank.passbookDoc instanceof File) {
        formDataPayload.append("passbookImage", formData.bank.passbookDoc);
      }

      // Add document files if they exist
      if (formData.idProofs.aadharImage instanceof File) {
        formDataPayload.append("aadharImage", formData.idProofs.aadharImage);
      }
      if (formData.idProofs.panImage instanceof File) {
        formDataPayload.append("panImage", formData.idProofs.panImage);
      }
      if (formData.idProofs.passportImage instanceof File) {
        formDataPayload.append(
          "passportImage",
          formData.idProofs.passportImage
        );
      }
      if (formData.idProofs.drivingLicenseImage instanceof File) {
        formDataPayload.append(
          "drivingLicenseImage",
          formData.idProofs.drivingLicenseImage
        );
      }
      if (formData.idProofs.voterIdImage instanceof File) {
        formDataPayload.append("voterIdImage", formData.idProofs.voterIdImage);
      }

      const response = await fetch(
        `${publicRuntimeConfig.apiURL}/employee/update-request`,
        {
          method: "PUT",
          body: formDataPayload,
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        toast.error("Failed to parse response");
        result = { message: await response.text() };
      }

      if (response.ok) {
        toast.success(
          result.message || "Update request submitted successfully."
        );
        setIsPageInEditMode(false);
        fetchByEmployeeId();
      } else {
        toast.error(result.message || `Failed: ${response.statusText}`);
      }
    } catch (error) {
      toast.error("Failed to submit update request.");
    } finally {
      setLoading(false);
    }
  };

  // --- Logout ---
  const handleLogout = () => {
    clearSession();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  // --- Render ---
  if (loading && !employeeById) {
    // Show a loading indicator only on initial load
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Handle case where employee data failed to load
  if (!employeeById && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl text-red-600 mb-4">
          Failed to load employee data.
        </h2>
        <button
          onClick={fetchByEmployeeId}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-56"
        }`}
      >
        <HradminNavbar />

        <main className="p-6 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-64 bg-gradient-to-r bg-[#3B6FA0]">
                <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-repeat"></div>
                <div className="relative h-full px-8 py-6 flex flex-col justify-between">
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    {/* Status Badges */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-white text-sm">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            employeeById?.updateStatus === "Pending"
                              ? "bg-yellow-400"
                              : "bg-green-400"
                          }`}
                        ></div>
                        <span>
                          {employeeById?.updateStatus === "Pending"
                            ? "Update Pending"
                            : "Active Employee"}
                        </span>
                        {employeeById?.updateStatus === "Pending" && (
                          <button
                            onClick={fetchPendingChanges}
                            className="ml-2 px-2 py-0.5 bg-white/20 rounded-md text-xs hover:bg-white/30 transition-colors"
                          >
                            View Changes
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-white text-sm">
                        <FaCalendarCheck className="w-4 h-4" />
                        <span>
                          Joined on{" "}
                          {employeeById?.joiningDate
                            ? new Date(
                                employeeById.joiningDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    {/* Settings Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                      >
                        <FiSettings className="w-5 h-5" />
                      </button>
                      {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                            <FiSettings className="w-4 h-4 mr-2" /> Settings
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center"
                          >
                            <FiLogOut className="w-4 h-4 mr-2" /> Log out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Bottom Row */}
                  <div className="flex items-end space-x-6">
                    {/* Profile Picture */}
                    <div className="relative">
                      <div className="w-28 h-28 rounded-xl bg-white p-1 shadow-lg">
                        <div className="w-full h-full rounded-lg bg-gray-100 border border-white overflow-hidden flex items-center justify-center">
                          {formData.employee.profileImage instanceof File ? (
                            <img
                              src={URL.createObjectURL(
                                formData.employee.profileImage
                              )}
                              alt="Profile Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : employeeById?.employeeImgUrl ? (
                            <img
                              src={employeeById.employeeImgUrl}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-16 h-16 text-gray-300" />
                          )}
                        </div>
                      </div>
                      {/* Profile Image Upload Input - only visible/enabled when editing personal info */}
                      {isPageInEditMode && (
                        <>
                          <label
                            htmlFor="profile-upload"
                            className={`absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-lg shadow-lg transition-colors ${
                              isEditable
                                ? "cursor-pointer hover:bg-blue-600"
                                : "opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <FiUpload className="w-4 h-4" />
                          </label>
                          <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={!isEditable}
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleInputChange(
                                  "employee",
                                  "profileImage",
                                  file
                                );
                              }
                            }}
                          />
                        </>
                      )}
                    </div>
                    {/* Employee Info */}
                    <div className="flex-1 mb-2">
                      <h1 className="text-3xl font-bold text-white mb-1">
                        {employeeById?.name || "Employee Name"}
                      </h1>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm">
                          <span className="font-medium">
                            {employeeById?.employeeId || "-"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/80 text-sm">
                          <span>{employeeById?.designationName || "-"}</span>
                          <span className="text-white/40">•</span>
                          <span>{employeeById?.departmentName || "-"}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-white/80 text-sm">
                        <span>
                          {employeeById?.emailOfficial || "No official email"}
                        </span>
                      </div>
                    </div>
                    {/* Quick Info */}
                    <div className="flex space-x-3">
                      {/* Add Edit Profile button here, to the left of Reports to */}
                      {!isPageInEditMode ? (
                        <div className="relative group">
                          <button
                            onClick={handleEditProfileClick}
                            className={`flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white ${
                              !isEditable
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-white/20"
                            }`}
                            disabled={!isEditable || loading}
                          >
                            <FiEdit2 className="w-4 h-4 mb-1" />
                            <span className="text-xs">Edit Profile</span>
                          </button>
                          {!isEditable && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                              <div className="relative">
                                <p>
                                  Cannot edit while update request is pending
                                </p>
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={handleSaveAllClick}
                            className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white cursor-pointer"
                          >
                            <button
                              className="flex items-center justify-center text-green-400 hover:text-green-300 disabled:opacity-50"
                              disabled={loading || !isEditable}
                            >
                              {loading ? (
                                <FiLoader className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiCheck className="w-4 h-4" />
                              )}
                            </button>
                            <span className="text-xs mt-1">Save Changes</span>
                          </div>
                          <div
                            onClick={handleCancelClick}
                            className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white cursor-pointer"
                          >
                            <button
                              className="flex items-center justify-center text-red-400 hover:text-red-300 disabled:opacity-50"
                              disabled={loading}
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <span className="text-xs mt-1">Cancel</span>
                          </div>
                        </>
                      )}
                      <div className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white">
                        <span className="text-xs text-white/80">
                          Reports to
                        </span>
                        <span className="font-medium">{managerName}</span>
                      </div>
                      <div className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white">
                        <span className="text-xs text-white/80">PF Status</span>
                        <span className="font-medium">
                          {employeeById?.pfEnrolled
                            ? "Enrolled"
                            : "Not Enrolled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Profile Info Sections --- */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Personal Information Card */}
                      <div className="lg:col-span-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="flex justify-between items-center mb-3 pb-3 -mt-2 border-b border-gray-100">
                            <div className="flex items-center">
                              <FiUser className="w-5 h-5 text-blue-500 mr-2" />
                              <h3 className="text-lg font-semibold text-gray-800">
                                Personal Information
                              </h3>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Father's Name - Read Only */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Father&apos;s Name
                              </label>
                              <p className="text-base text-gray-900">
                                {employeeById?.fathersName || "-"}
                              </p>
                            </div>
                            {/* Gender - Read Only */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Gender
                              </label>
                              <p className="text-base text-gray-900">
                                {employeeById?.gender || "-"}
                              </p>
                            </div>
                            {/* Phone - Editable */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Phone
                              </label>
                              {isPageInEditMode ? (
                                <input
                                  type="tel"
                                  value={formData.employee.phone1}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "employee",
                                      "phone1",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                                  pattern="[0-9]{10}"
                                  disabled={!isEditable}
                                />
                              ) : (
                                <p className="text-base text-gray-900">
                                  {employeeById?.phone || "-"}
                                </p>
                              )}
                            </div>
                            {/* Alternate Phone - Editable */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Alternate Phone
                              </label>
                              {isPageInEditMode ? (
                                <input
                                  type="tel"
                                  value={formData.employee.phone2 || ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "employee",
                                      "phone2",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                                  pattern="[0-9]{10}"
                                  placeholder="10-digit number"
                                  disabled={!isEditable}
                                />
                              ) : (
                                <p className="text-base text-gray-900">
                                  {employeeById?.alternatePhone || "-"}
                                </p>
                              )}
                            </div>
                            {/* Personal Email - Editable */}
                            <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Personal Email
                              </label>
                              {isPageInEditMode ? (
                                <input
                                  type="email"
                                  value={formData.employee.email.personal}
                                  onChange={(e) =>
                                    handleNestedInputChange(
                                      "employee",
                                      "email",
                                      "personal",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                                  disabled={!isEditable}
                                />
                              ) : (
                                <p className="text-base text-gray-900">
                                  {employeeById?.emailPersonal || "-"}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Statutory Information Card */}
                      <div className="lg:col-span-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center mb-5 pb-3 border-b border-gray-100">
                            <FiShield className="w-5 h-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              Statutory Information
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                PF Status
                              </label>
                              <div className="flex items-center">
                                <div
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    employeeById?.pfEnrolled
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></div>
                                <p className="text-base text-gray-900">
                                  {employeeById?.pfEnrolled
                                    ? "Enrolled"
                                    : "Not Enrolled"}
                                </p>
                              </div>
                            </div>
                            {employeeById?.pfEnrolled && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                  UAN Number
                                </label>
                                <p className="text-base text-gray-900">
                                  {employeeById?.uanNumber || "-"}
                                </p>
                              </div>
                            )}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                ESIC Status
                              </label>
                              <div className="flex items-center">
                                <div
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    employeeById?.esicEnrolled
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></div>
                                <p className="text-base text-gray-900">
                                  {employeeById?.esicEnrolled
                                    ? "Enrolled"
                                    : "Not Enrolled"}
                                </p>
                              </div>
                            </div>
                            {employeeById?.esicEnrolled && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                  ESIC Number
                                </label>
                                <p className="text-base text-gray-900">
                                  {employeeById?.esicNumber || "-"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ID Proofs Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center mb-5 pb-2 -mt-2 border-b border-gray-100">
                        <div className="flex items-center">
                          <FiBook className="w-5 h-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">
                            Identity Documents
                          </h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          {
                            label: "Aadhar No.",
                            key: "aadharNo",
                            imgUrlKey: "aadharImgUrl",
                            fileKey: "aadharImage",
                          },
                          {
                            label: "PAN No.",
                            key: "panNo",
                            imgUrlKey: "pancardImgUrl",
                            fileKey: "panImage",
                          },
                          {
                            label: "Passport",
                            key: "passport",
                            imgUrlKey: "passportImgUrl",
                            fileKey: "passportImage",
                          },
                          {
                            label: "Driving License",
                            key: "drivingLicense",
                            imgUrlKey: "drivingLicenseImgUrl",
                            fileKey: "drivingLicenseImage",
                          },
                          {
                            label: "Voter ID",
                            key: "voterId",
                            imgUrlKey: "voterIdImgUrl",
                            fileKey: "voterIdImage",
                          },
                        ].map(({ label, key, imgUrlKey, fileKey }) => (
                          <div
                            key={key}
                            className="bg-gray-50 p-3 rounded-lg space-y-1"
                          >
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                              {label}
                            </label>
                            {/* Always show the number as read-only */}
                            <p className="text-base text-gray-900">
                              {employeeById?.idProofs?.[key] || "-"}
                            </p>
                            <div className="pt-2 border-t border-gray-200 mt-2">
                              {isPageInEditMode ? (
                                <div>
                                  {!formData.idProofs[fileKey] && (
                                    <label
                                      htmlFor={`upload-${key}`}
                                      className={`inline-flex items-center px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                                        isEditable
                                          ? "cursor-pointer"
                                          : "opacity-50 cursor-not-allowed"
                                      }`}
                                    >
                                      <FiUpload className="w-3 h-3 mr-1" />{" "}
                                      Upload
                                    </label>
                                  )}
                                  <input
                                    type="file"
                                    id={`upload-${key}`}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    disabled={!isEditable}
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        handleInputChange(
                                          "idProofs",
                                          fileKey,
                                          file
                                        );
                                      }
                                    }}
                                  />
                                  {formData.idProofs[fileKey] instanceof
                                    File && (
                                    <div className="mt-2 flex items-center text-sm">
                                      <span className="text-gray-600 mr-2 truncate">
                                        {formData.idProofs[fileKey].name}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleInputChange(
                                            "idProofs",
                                            fileKey,
                                            null
                                          )
                                        }
                                        className="text-red-500 hover:text-red-700"
                                        disabled={!isEditable}
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : employeeById?.idProofs?.[imgUrlKey] ? (
                                <a
                                  href={employeeById.idProofs[imgUrlKey]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                >
                                  <FiEye className="w-4 h-4 mr-1" /> View
                                  Document
                                </a>
                              ) : (
                                <p className="text-xs text-gray-500">
                                  No document
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Salary Information Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center mb-5 pb-3 -mt-2 border-b border-gray-100">
                        <FiDollarSign className="w-5 h-5 text-blue-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          Salary Information
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Annual CTC
                          </label>
                          <p className="text-base text-gray-900">
                            ₹
                            {employeeById?.salaryDetails?.annualCtc?.toLocaleString() ||
                              "-"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Monthly CTC
                          </label>
                          <p className="text-base text-gray-900">
                            ₹
                            {employeeById?.salaryDetails?.monthlyCtc?.toLocaleString() ||
                              "-"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Basic Salary
                          </label>
                          <p className="text-base text-gray-900">
                            ₹
                            {employeeById?.salaryDetails?.basicSalary?.toLocaleString() ||
                              "-"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            HRA
                          </label>
                          <p className="text-base text-gray-900">
                            ₹
                            {employeeById?.salaryDetails?.hra?.toLocaleString() ||
                              "-"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Allowances
                          </label>
                          <p className="text-base text-gray-900">
                            ₹
                            {employeeById?.salaryDetails?.allowances?.toLocaleString() ||
                              "-"}
                          </p>
                        </div>
                        {employeeById?.pfEnrolled && (
                          <>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Employer PF
                              </label>
                              <p className="text-base text-gray-900">
                                ₹
                                {employeeById?.salaryDetails?.employerPfContribution?.toLocaleString() ||
                                  "-"}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Employee PF
                              </label>
                              <p className="text-base text-gray-900">
                                ₹
                                {employeeById?.salaryDetails?.employeePfContribution?.toLocaleString() ||
                                  "-"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    {/* Bank Information Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-100">
                        <div className="flex items-center">
                          <FiCreditCard className="w-5 h-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">
                            Bank Information
                          </h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {/* Account Number - Editable */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Account Number
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              value={formData.bank.accountNumber}
                              onChange={(e) =>
                                handleInputChange(
                                  "bank",
                                  "accountNumber",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                              disabled={!isEditable}
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.accountNumber || "-"}
                            </p>
                          )}
                        </div>
                        {/* IFSC Code - Editable */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            IFSC Code
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              value={formData.bank.ifscCode}
                              onChange={(e) =>
                                handleInputChange(
                                  "bank",
                                  "ifscCode",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                              disabled={!isEditable}
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.ifscCode || "-"}
                            </p>
                          )}
                        </div>
                        {/* Bank Name - Editable */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Bank Name
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              value={formData.bank.bankName}
                              onChange={(e) =>
                                handleInputChange(
                                  "bank",
                                  "bankName",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                              disabled={!isEditable}
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.bankName || "-"}
                            </p>
                          )}
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Branch Name
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              value={formData.bank.branchName}
                              onChange={(e) =>
                                handleInputChange(
                                  "bank",
                                  "branchName",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                              disabled={!isEditable}
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.branchName || "-"}
                            </p>
                          )}
                        </div>
                        {/* UPI Phone - Editable */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            UPI Phone
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="tel"
                              value={formData.bank.upiPhone}
                              onChange={(e) =>
                                handleInputChange(
                                  "bank",
                                  "upiPhone",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                              pattern="[0-9]{10}"
                              placeholder="10-digit number"
                              disabled={!isEditable}
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.upiPhoneNumber || "-"}
                            </p>
                          )}
                        </div>
                        {/* UPI ID - Read Only */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            UPI ID
                          </label>
                          <p className="text-base text-gray-900">
                            {employeeById?.bankDetails?.upiId || "-"}
                          </p>
                        </div>
                        {/* Passbook Upload - Enabled in Edit Mode */}
                        <div className="border-t pt-4 mt-4">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Bank Passbook
                          </label>
                          {isPageInEditMode ? (
                            <div>
                              <label
                                htmlFor="passbook-upload"
                                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                                  isEditable
                                    ? "cursor-pointer"
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                              >
                                <FiUpload className="w-4 h-4 mr-2" />
                                {formData.bank.passbookDoc instanceof File
                                  ? "Change File"
                                  : "Upload File"}
                              </label>
                              <input
                                type="file"
                                id="passbook-upload"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                disabled={!isEditable}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleInputChange(
                                      "bank",
                                      "passbookDoc",
                                      file
                                    );
                                  }
                                }}
                              />
                              {formData.bank.passbookDoc instanceof File && (
                                <div className="mt-2 flex items-center text-sm">
                                  <span className="text-gray-600 mr-2 truncate">
                                    {formData.bank.passbookDoc.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleInputChange(
                                        "bank",
                                        "passbookDoc",
                                        null
                                      )
                                    }
                                    className="text-red-500 hover:text-red-700"
                                    disabled={!isEditable}
                                  >
                                    {" "}
                                    <X className="w-4 h-4" />{" "}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between mt-2 bg-gray-50 p-3 rounded-lg">
                              <p className="text-base text-gray-900 truncate">
                                {employeeById?.bankDetails?.passbookImgUrl
                                  ? employeeById.bankDetails.passbookImgUrl
                                      .split("/")
                                      .pop()
                                  : "Not uploaded"}
                              </p>
                              {employeeById?.bankDetails?.passbookImgUrl && (
                                <a
                                  href={employeeById.bankDetails.passbookImgUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                >
                                  <FiEye className="w-4 h-4 mr-1" /> View
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add the Pending Changes Modal */}
      {showPendingChangesModal && pendingChanges && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Field Changes
              </h3>
              <button
                onClick={() => setShowPendingChangesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {/* Personal Information Changes */}
              {pendingChanges.personalInfo.map((field, index) => (
                <div
                  key={field.field + index}
                  className="border rounded p-3 bg-gray-50 text-sm"
                >
                  <p className="font-medium text-gray-700 mb-1">
                    {field.field}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Old Value:</p>
                      <p className="text-gray-800 break-words">
                        {field.oldValue || "(empty)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Value:</p>
                      <p className="text-green-700 break-words">
                        {field.newValue || "(empty)"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Bank Details Changes */}
              {pendingChanges.bankDetails.map((field, index) => (
                <div
                  key={field.field + index}
                  className="border rounded p-3 bg-gray-50 text-sm"
                >
                  <p className="font-medium text-gray-700 mb-1">
                    {field.field}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Old Value:</p>
                      <p className="text-gray-800 break-words">
                        {field.oldValue || "(empty)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Value:</p>
                      <p className="text-green-700 break-words">
                        {field.newValue || "(empty)"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Document Updates */}
              {pendingChanges.documents.map((doc, index) => (
                <div
                  key={doc.field + index}
                  className="border rounded p-3 bg-gray-50 text-sm"
                >
                  <p className="font-medium text-gray-700 mb-1">{doc.field}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Old Value:</p>
                      {doc.isImage ? (
                        doc.oldValue ? (
                          <a
                            href={doc.oldValue}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={doc.oldValue}
                              alt={`Old ${doc.field}`}
                              className="h-16 rounded border"
                            />
                          </a>
                        ) : (
                          <span className="italic text-gray-400">(empty)</span>
                        )
                      ) : (
                        <p className="text-gray-800 break-words">
                          {doc.oldValue || "(empty)"}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Value:</p>
                      {doc.isImage ? (
                        doc.newValue ? (
                          <a
                            href={doc.newValue}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={doc.newValue}
                              alt={`New ${doc.field}`}
                              className="h-16 rounded border"
                            />
                          </a>
                        ) : (
                          <span className="italic text-gray-400">(empty)</span>
                        )
                      ) : (
                        <p className="text-green-700 break-words">
                          {doc.newValue || "(empty)"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setShowPendingChangesModal(false)}
                className="border border-gray-300 rounded px-4 py-1 text-sm hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(EmployeeProfilePage);
