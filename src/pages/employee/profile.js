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
  FiBriefcase,
  FiFileText,
  FiMapPin,
} from "react-icons/fi";
import { FaCalendarCheck } from "react-icons/fa";
import { X } from "lucide-react";
import getConfig from "next/config";
import { clearSession } from "@/utils/sessionManager";

// Helper function to generate initials from a name
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

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
  const [activeTab, setActiveTab] = useState("overview"); // State for the new tab system

  // Main state for form data, used during editing
  const [formData, setFormData] = useState({
    employee: {
      name: "",
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
      aadharDoc: null,
      panDoc: null,
      passportDoc: null,
      drivingLicenseDoc: null,
      voterIdDoc: null,
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
      employeeById.pendingUpdateRequest.aadharNumber &&
      employeeById.pendingUpdateRequest.aadharNumber !==
        employeeById.idProofs?.aadharNumber
    ) {
      changes.documents.push({
        field: "Aadhar Number",
        oldValue: employeeById.idProofs?.aadharNumber,
        newValue: employeeById.pendingUpdateRequest.aadharNumber,
      });
    }
    if (
      employeeById.pendingUpdateRequest.panNumber &&
      employeeById.pendingUpdateRequest.panNumber !==
        employeeById.idProofs?.panNumber
    ) {
      changes.documents.push({
        field: "PAN Number",
        oldValue: employeeById.idProofs?.panNumber,
        newValue: employeeById.pendingUpdateRequest.panNumber,
      });
    }
    // ... continue for other documents

    setPendingChanges(changes);
    setShowPendingChangesModal(true);
  };

  useEffect(() => {
    if (sessionStorage.getItem("employeeId")) {
    fetchByEmployeeId();
    } else {
      toast.error("No employee ID found in session.");
      // Redirect to login or another appropriate page
    }
  }, [fetchByEmployeeId]);

  // --- Form Handling ---
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleNestedInputChange = (section, parentField, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: { ...prev[section][parentField], [field]: value },
      },
    }));
  };

  const handleFileChange = (section, field, file) => {
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("File size cannot exceed 2MB");
      return;
    }
    handleInputChange(section, field, file);
  };

  const handleEditProfileClick = () => {
    if (!employeeById) return;

    // Pre-fill the form data with current employee data
        setFormData({
          employee: {
        name: employeeById.name || "",
        fatherName: employeeById.fatherName || "",
        gender: employeeById.gender || "",
        phone1: employeeById.phone || "",
        phone2: employeeById.alternatePhone || "",
        email: { personal: employeeById.emailPersonal || "" },
        currentAddress: employeeById.currentAddress || "",
        permanentAddress: employeeById.permanentAddress || "",
        profileImage: employeeById.profileImage || null,
          },
          idProofs: {
        aadharNo: employeeById.idProofs?.aadharNumber || "",
        panNo: employeeById.idProofs?.panNumber || "",
        passport: employeeById.idProofs?.passportNumber || "",
        drivingLicense: employeeById.idProofs?.drivingLicenseNumber || "",
        voterId: employeeById.idProofs?.voterIdNumber || "",
        aadharDoc: null,
        panDoc: null,
        passportDoc: null,
        drivingLicenseDoc: null,
        voterIdDoc: null,
      },
      bank: {
        accountNumber: employeeById.bankDetails?.accountNumber || "",
        accountHolderName: employeeById.bankDetails?.accountHolderName || "",
        ifscCode: employeeById.bankDetails?.ifscCode || "",
        bankName: employeeById.bankDetails?.bankName || "",
        branchName: employeeById.bankDetails?.branchName || "",
        upiId: employeeById.bankDetails?.upiId || "",
        upiPhone: employeeById.bankDetails?.upiPhoneNumber || "",
        passbookDoc: employeeById.bankDetails?.passbookDoc || null,
          },
        });

    setIsPageInEditMode(true);
  };

  const handleCancelClick = () => {
    setIsPageInEditMode(false);
    // Optionally reset formData state here if needed
  };

  const hasChangesBeenMade = () => {
    if (!employeeById) return false;

    // Check personal info
    if (
      formData.employee.name !== (employeeById.name || "") ||
      formData.employee.fatherName !== (employeeById.fatherName || "") ||
      formData.employee.gender !== (employeeById.gender || "") ||
      formData.employee.phone1 !== (employeeById.phone || "") ||
      formData.employee.phone2 !== (employeeById.alternatePhone || "") ||
      formData.employee.email.personal !== (employeeById.emailPersonal || "") ||
      formData.employee.currentAddress !== (employeeById.currentAddress || "") ||
      formData.employee.permanentAddress !== (employeeById.permanentAddress || "") ||
      formData.employee.profileImage !== (employeeById.profileImage || null)
    ) {
      return true;
    }

    // Check ID proofs
    if (
      formData.idProofs.aadharNo !==
        (employeeById.idProofs?.aadharNumber || "") ||
      formData.idProofs.panNo !== (employeeById.idProofs?.panNumber || "") ||
      formData.idProofs.passport !==
        (employeeById.idProofs?.passportNumber || "") ||
      formData.idProofs.drivingLicense !==
        (employeeById.idProofs?.drivingLicenseNumber || "") ||
      formData.idProofs.voterId !==
        (employeeById.idProofs?.voterIdNumber || "")
    ) {
      return true;
    }

    // Check bank details
    if (
      formData.bank.accountNumber !==
        (employeeById.bankDetails?.accountNumber || "") ||
      formData.bank.accountHolderName !==
        (employeeById.bankDetails?.accountHolderName || "") ||
      formData.bank.ifscCode !== (employeeById.bankDetails?.ifscCode || "") ||
      formData.bank.bankName !== (employeeById.bankDetails?.bankName || "") ||
      formData.bank.branchName !== (employeeById.bankDetails?.branchName || "") ||
      formData.bank.upiId !== (employeeById.bankDetails?.upiId || "") ||
      formData.bank.upiPhone !==
        (employeeById.bankDetails?.upiPhoneNumber || "") ||
      formData.bank.passbookDoc !==
        (employeeById.bankDetails?.passbookDoc || null)
    ) {
      return true;
    }

    return false;
  };

  const handleSaveAllClick = async () => {
    if (!hasChangesBeenMade()) {
      toast.info("No changes were made.");
      setIsPageInEditMode(false);
      return;
    }

    setLoading(true);

    const apiFormData = new FormData();
    apiFormData.append("employeeId", employeeById.id);

    // Append changed employee data
    if (formData.employee.phone1 !== (employeeById.phone || ""))
      apiFormData.append("phone", formData.employee.phone1);
    if (formData.employee.phone2 !== (employeeById.alternatePhone || ""))
      apiFormData.append("alternatePhone", formData.employee.phone2);
    if (formData.employee.email.personal !== (employeeById.emailPersonal || ""))
      apiFormData.append("emailPersonal", formData.employee.email.personal);
    if (formData.employee.currentAddress !== (employeeById.currentAddress || ""))
      apiFormData.append("currentAddress", formData.employee.currentAddress);
      if (
      formData.employee.permanentAddress !== (employeeById.permanentAddress || "")
    )
      apiFormData.append("permanentAddress", formData.employee.permanentAddress);
    if (
      formData.employee.profileImage &&
      typeof formData.employee.profileImage === "object"
    )
      apiFormData.append("profileImage", formData.employee.profileImage);

    // Append changed bank data
      if (
      formData.bank.accountNumber !==
      (employeeById.bankDetails?.accountNumber || "")
    )
      apiFormData.append("accountNumber", formData.bank.accountNumber);
    if (
      formData.bank.bankName !== (employeeById.bankDetails?.bankName || "")
    )
      apiFormData.append("bankName", formData.bank.bankName);
    if (
      formData.bank.branchName !== (employeeById.bankDetails?.branchName || "")
    )
      apiFormData.append("branchName", formData.bank.branchName);
    if (
      formData.bank.ifscCode !== (employeeById.bankDetails?.ifscCode || "")
    )
      apiFormData.append("ifscCode", formData.bank.ifscCode);
    if (
      formData.bank.upiPhone !== (employeeById.bankDetails?.upiPhoneNumber || "")
    )
      apiFormData.append("upiPhoneNumber", formData.bank.upiPhone);
    if (
      formData.bank.passbookDoc &&
      typeof formData.bank.passbookDoc === "object"
    )
      apiFormData.append("passbookDoc", formData.bank.passbookDoc);

    // Append changed ID proofs
    if (formData.idProofs.panNo !== (employeeById.idProofs?.panNumber || ""))
      apiFormData.append("panNumber", formData.idProofs.panNo);
    if (
      formData.idProofs.aadharNo !== (employeeById.idProofs?.aadharNumber || "")
    )
      apiFormData.append("aadharNumber", formData.idProofs.aadharNo);
    if (
      formData.idProofs.passport !==
      (employeeById.idProofs?.passportNumber || "")
    )
      apiFormData.append("passportNumber", formData.idProofs.passport);


    try {
      const response = await fetch(`${publicRuntimeConfig.apiURL}/employee/request-update`, {
          method: "PUT",
        body: apiFormData, // Sending as multipart/form-data
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to submit for approval.");
      }

      toast.success("Profile update submitted for approval!");
        setIsPageInEditMode(false);
      fetchByEmployeeId(); // Re-fetch to show updated status
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  // --- Render Functions for Profile Cards ---

  const renderProfileHeader = () => (
    <div className="bg-blue-600 p-6 rounded-lg shadow-md mb-8">
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
            {employeeById?.profileImage ? (
              <img
                src={employeeById.profileImage}
                alt="Profile"
                className="rounded-full w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-blue-600">
                {getInitials(employeeById?.name)}
                        </span>
                        )}
                      </div>
                      </div>
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-white">{employeeById?.name}</h1>
          <div className="text-blue-100 text-sm mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">
            <span>{employeeById?.id}</span>
            <span className="opacity-50">•</span>
            <span>{employeeById?.designation}</span>
            <span className="opacity-50">•</span>
            <span>{employeeById?.department}</span>
                    </div>
          <div className="text-blue-100 text-sm mt-2">
            <span className="font-semibold">Reports to:</span> {managerName}
          </div>
        </div>
        <div className="flex-shrink-0 self-start">
          {isPageInEditMode ? (
            <div className="flex gap-2">
                      <button
                onClick={handleCancelClick}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
                          </button>
                          <button
                onClick={handleSaveAllClick}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                disabled={loading}
                          >
                {loading ? <FiLoader className="animate-spin" /> : <FiCheck />}
                Save Changes
                          </button>
                        </div>
          ) : (
            isEditable && (
              <button
                onClick={handleEditProfileClick}
                className="px-4 py-2 text-sm bg-white text-blue-600 font-semibold rounded-md shadow hover:bg-gray-100 flex items-center gap-2"
              >
                <FiEdit2 />
                Edit Profile
              </button>
            )
                      )}
                    </div>
                        </div>
                        </div>
  );

  const renderTabNavigation = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-6">
                          <button
          onClick={() => setActiveTab("overview")}
          className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
            activeTab === "overview"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
          <FiUser className="inline-block mr-2" /> Overview
                          </button>
                            <button
          onClick={() => setActiveTab("employment")}
          className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
            activeTab === "employment"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
                            >
          <FiBriefcase className="inline-block mr-2" /> Employment
                            </button>
                            <button
          onClick={() => setActiveTab("documents")}
          className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
            activeTab === "documents"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
                            >
          <FiFileText className="inline-block mr-2" /> Documents
                            </button>
      </nav>
                          </div>
  );

  const renderInfoField = (label, value) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "-"}</p>
                            </div>
  );
  
  const renderTextInput = (section, field, label, placeholder) => (
    <div>
      <label className="text-sm text-gray-500 block mb-1">{label}</label>
                                <input
        type="text"
        value={formData[section]?.[field] || ""}
        onChange={(e) => handleInputChange(section, field, e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
        placeholder={placeholder}
      />
                            </div>
  );

  const renderFileInput = (section, docField, label) => (
    <div>
      <label className="text-sm text-gray-500 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="file" onChange={(e) => handleFileChange(section, docField, e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            </div>
  );

  const renderDocInfoField = (label, value, docUrl) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-800">{value || "-"}</p>
        {docUrl && <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1"><FiEye /> View</a>}
                          </div>
                              </div>
  );

  const renderProfileCard = (title, icon, children) => (
     <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          {icon}
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        </div>
        {children}
                      </div>
  );

  const renderPersonalInformationCard = () => (
    renderProfileCard("Personal Information", <FiUser className="text-blue-600"/>, 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {isPageInEditMode ? (
          <>
            {renderTextInput("employee", "name", "Full Name", "Enter employee's name")}
            {renderTextInput("employee", "fatherName", "Father's Name", "Enter father's name")}
            {/* Gender Dropdown for editing */}
                                <div>
              <label className="text-sm text-gray-500 block mb-1">Gender</label>
              <select 
                value={formData.employee.gender}
                onChange={(e) => handleInputChange("employee", "gender", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {renderTextInput("employee", "phone1", "Phone", "Enter phone number")}
            {renderTextInput("employee", "phone2", "Alternate Phone", "Enter alternate number")}
            {/* Nested input for email */}
             <div>
              <label className="text-sm text-gray-500 block mb-1">Personal Email</label>
                                  <input
                type="email"
                value={formData.employee.email.personal || ""}
                onChange={(e) => handleNestedInputChange("employee", "email", "personal", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Enter personal email"
              />
                                    </div>
          </>
        ) : (
          <>
            {renderInfoField("Full Name", employeeById?.name)}
            {renderInfoField("Father's Name", employeeById?.fatherName)}
            {renderInfoField("Gender", employeeById?.gender)}
            {renderInfoField("Phone", employeeById?.phone)}
            {renderInfoField("Alternate Phone", employeeById?.alternatePhone)}
            {renderInfoField("Personal Email", employeeById?.emailPersonal)}
                          </>
                              )}
                            </div>
    )
  );

  const renderIdentityDocumentsCard = () => (
    renderProfileCard("Identity Documents", <FiFileText className="text-blue-600" />,
      <div className="space-y-4">
        {isPageInEditMode ? (
          <>
            <div className="grid grid-cols-2 gap-2 items-end"><div className="col-span-1">{renderTextInput("idProofs", "panNo", "PAN Card", "PAN Number")}</div><div className="col-span-1">{renderFileInput("idProofs", "panDoc", "Upload PAN")}</div></div>
            <div className="grid grid-cols-2 gap-2 items-end"><div className="col-span-1">{renderTextInput("idProofs", "aadharNo", "Aadhar Card", "Aadhar Number")}</div><div className="col-span-1">{renderFileInput("idProofs", "aadharDoc", "Upload Aadhar")}</div></div>
            <div className="grid grid-cols-2 gap-2 items-end"><div className="col-span-1">{renderTextInput("idProofs", "passport", "Passport", "Passport Number")}</div><div className="col-span-1">{renderFileInput("idProofs", "passportDoc", "Upload Passport")}</div></div>
            <div className="grid grid-cols-2 gap-2 items-end"><div className="col-span-1">{renderTextInput("idProofs", "drivingLicense", "Driving License", "License Number")}</div><div className="col-span-1">{renderFileInput("idProofs", "drivingLicenseDoc", "Upload License")}</div></div>
            <div className="grid grid-cols-2 gap-2 items-end"><div className="col-span-1">{renderTextInput("idProofs", "voterId", "Voter ID", "Voter ID Number")}</div><div className="col-span-1">{renderFileInput("idProofs", "voterIdDoc", "Upload Voter ID")}</div></div>
          </>
        ) : (
          <>
            {renderDocInfoField("PAN Card", employeeById?.idProofs?.panNumber, employeeById?.idProofs?.panDoc)}
            {renderDocInfoField("Aadhar Card", employeeById?.idProofs?.aadharNumber, employeeById?.idProofs?.aadharDoc)}
            {renderDocInfoField("Passport", employeeById?.idProofs?.passportNumber, employeeById?.idProofs?.passportDoc)}
            {renderDocInfoField("Driving License", employeeById?.idProofs?.drivingLicenseNumber, employeeById?.idProofs?.drivingLicenseDoc)}
            {renderDocInfoField("Voter ID", employeeById?.idProofs?.voterIdNumber, employeeById?.idProofs?.voterIdDoc)}
                          </>
                        )}
                      </div>
    )
  );

  const renderStatutoryCard = () => (
    renderProfileCard("Statutory Information", <FiShield className="text-blue-600" />,
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderInfoField("PF Status", employeeById?.pfStatus || "Not Enrolled")}
          {renderInfoField("ESIC Status", employeeById?.esicStatus || "Not Enrolled")}
          {renderInfoField("UAN Number", employeeById?.uanNumber)}
          {renderInfoField("PF Number", employeeById?.pfNumber)}
          {renderInfoField("ESIC Number", employeeById?.esicNumber)}
                        </div>
    )
  );

  const renderBankDetailsCard = () => (
    renderProfileCard("Bank Information", <FiCreditCard className="text-blue-600" />,
      !isPageInEditMode && !employeeById?.bankDetails ? (
        <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No bank details have been added yet.</p>
            <button onClick={handleEditProfileClick} className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700">
                + Add Bank Details
            </button>
                        </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {isPageInEditMode ? (
              <>
                {renderTextInput("bank", "accountHolderName", "Account Holder Name", "Enter name as per bank")}
                {renderTextInput("bank", "accountNumber", "Account Number", "Enter account number")}
                {renderTextInput("bank", "ifscCode", "IFSC Code", "Enter IFSC code")}
                {renderTextInput("bank", "bankName", "Bank Name", "Enter bank name")}
                {renderTextInput("bank", "branchName", "Branch Name", "Enter branch name")}
                {renderFileInput("bank", "passbookDoc", "Upload Passbook/Cheque")}
              </>
            ) : (
              <>
                {renderInfoField("Account Holder Name", employeeById?.bankDetails?.accountHolderName)}
                {renderInfoField("Account Number", employeeById?.bankDetails?.accountNumber)}
                {renderInfoField("IFSC Code", employeeById?.bankDetails?.ifscCode)}
                {renderInfoField("Bank Name", employeeById?.bankDetails?.bankName)}
                {renderInfoField("Branch Name", employeeById?.bankDetails?.branchName)}
                {renderDocInfoField("Passbook/Cheque", "", employeeById?.bankDetails?.passbookDoc)}
              </>
                          )}
                        </div>
      )
    )
  );
  
  const renderEmploymentCard = () => (
    renderProfileCard("Employment Details", <FiBriefcase className="text-blue-600"/>,
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInfoField("Designation", employeeById?.designation)}
        {renderInfoField("Department", employeeById?.department)}
        {renderInfoField("Date of Joining", new Date(employeeById?.dateOfJoining).toLocaleDateString())}
        {renderInfoField("Work Location", employeeById?.workLocation)}
        {renderInfoField("Employee Type", employeeById?.employeeType)}
        {renderInfoField("Status", employeeById?.status)}
        {renderInfoField("Reports To", managerName)}
                        </div>
    )
  );
  
  const renderAddressCard = () => (
    renderProfileCard("Address", <FiMapPin className="text-blue-600"/>,
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {isPageInEditMode ? (
          <>
            {renderTextInput("employee", "currentAddress", "Current Address", "Enter current address")}
            {renderTextInput("employee", "permanentAddress", "Permanent Address", "Enter permanent address")}
          </>
                          ) : (
          <>
            {renderInfoField("Current Address", employeeById?.currentAddress)}
            {renderInfoField("Permanent Address", employeeById?.permanentAddress)}
          </>
                          )}
                        </div>
    )
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <HradminNavbar
          // ... props
        />

        <main className="p-6">
          {loading && <div className="text-center p-12">Loading profile...</div>}

          {!loading && employeeById && (
            <>
              {renderProfileHeader()}
              {renderTabNavigation()}
              
              <div className="space-y-8">
                 {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {renderPersonalInformationCard()}
                      {renderIdentityDocumentsCard()}
                                </div>
                              )}

                 {activeTab === 'employment' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {renderEmploymentCard()}
                      {renderAddressCard()}
                            </div>
                 )}

                 {activeTab === 'documents' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {renderStatutoryCard()}
                      {renderBankDetailsCard()}
            </div>
                      )}
                    </div>
            </>
          )}

          {!loading && !employeeById && (
            <div className="text-center p-12 text-red-500">
              Failed to load employee profile. Please try again.
        </div>
      )}
        </main>
      </div>
    </div>
  );
}

export default withAuth(EmployeeProfilePage, ["hradmin", "employee"]);
