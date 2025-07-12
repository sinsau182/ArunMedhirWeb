import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { createEmployee, updateEmployee } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { motion } from "framer-motion";
import {
  FiUser,
  FiBook,
  FiCreditCard,
  FiUpload,
  FiCheck,
  FiX,
  FiLoader,
} from "react-icons/fi";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import getConfig from "next/config";
import axios from "axios";
import DepartmentFormModal from "@/components/Forms/DepartmentFormModal";
import DesignationFormModal from "@/components/Forms/DesignationFormModal";

// Add this CSS class to your global styles or component
const inputGroupClass =
  "relative border border-gray-200 rounded-lg focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 bg-gray-50 transition-all duration-200";
const inputClass =
  "w-full px-3 py-2 bg-transparent outline-none text-gray-700 text-sm";
const floatingLabelClass =
  "absolute -top-2.5 left-2 bg-white px-1 text-sm font-medium text-gray-700 transition-all duration-200";

const MultiSelect = ({ label, options, value }) => {
  return (
    <div className={inputGroupClass}>
      <label className={floatingLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-not-allowed min-h-[42px] bg-gray-100`}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {value.length > 0 ? (
              value.map((day) => (
                <span
                  key={day}
                  className="bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded"
                >
                  {day}
                </span>
              ))
            ) : (
              <span className="text-gray-500">No weekly offs</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DepartmentSelect = ({ label, options, value, onChange, onAddDepartment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={inputGroupClass} ref={dropdownRef}>
      <label className={floatingLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {value ? (
              <span className="text-gray-700">
                {typeof value === "object" ? value.name : value}
              </span>
            ) : (
              <span className="text-gray-500">Select department</span>
            )}
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {isOpen && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2.5 cursor-pointer hover:bg-blue-100 text-blue-600 border-b border-gray-100 font-semibold"
              onClick={() => {
                setIsOpen(false);
                if (onAddDepartment) onAddDepartment();
              }}
            >
              + Add Department
            </div>
            {options.map((department) => (
              <div
                key={department.departmentId}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                  value?.departmentId === department.departmentId ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  onChange(department);
                  setIsOpen(false);
                }}
              >
                <span className="text-gray-700">{department.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DesignationSelect = ({ label, options, value, onChange, onAddDesignation, disabled, placeholder, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if loading starts
  useEffect(() => {
    if (loading && isOpen) setIsOpen(false);
  }, [loading, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={inputGroupClass + (disabled || loading ? ' opacity-60 pointer-events-none' : '')} ref={dropdownRef}>
      <label className={floatingLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => {
            if (!disabled && !loading) setIsOpen(!isOpen);
          }}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {loading ? (
              <span className="flex items-center text-blue-500">
                <FiLoader className="animate-spin w-5 h-5 mr-2" />
                Loading...
              </span>
            ) : value ? (
              <span className="text-gray-700">
                {typeof value === "object" ? value.name : value}
              </span>
            ) : (
              <span className="text-gray-500">{placeholder || 'Select designation'}</span>
            )}
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {isOpen && !disabled && !loading && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2.5 cursor-pointer hover:bg-blue-100 text-blue-600 border-b border-gray-100 font-semibold"
              onClick={() => {
                setIsOpen(false);
                if (onAddDesignation) onAddDesignation();
              }}
            >
              + Add Designation
            </div>
            {options.map((designation) => (
              <div
                key={designation.designationId}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                  value?.designationId === designation.designationId ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  onChange({
                    designationId: designation.designationId,
                    name: designation.name,
                    manager: designation.manager,
                    overtimeEligible: designation.overtimeEligible,
                  });
                  setIsOpen(false);
                }}
              >
                <span className="text-gray-700">{designation.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const removeEmptyValues = (obj) => {
  const cleanObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (typeof value === "object" && !(value instanceof File)) {
        const nestedClean = removeEmptyValues(value);
        if (Object.keys(nestedClean).length > 0) {
          cleanObj[key] = nestedClean;
        }
      } else {
        cleanObj[key] = value;
      }
    }
  });
  return cleanObj;
};

const ReportingManagerSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={inputGroupClass} ref={dropdownRef}>
      <label className={floatingLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {value ? (
              <span className="text-gray-700">
                {typeof value === "object" ? value.name : value}
              </span>
            ) : (
              <span className="text-gray-500">Select manager</span>
            )}
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
            {options.map((manager) => (
              <div
                key={manager.employeeId}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                  value?.employeeId === manager.employeeId ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  onChange({
                    employeeId: manager.employeeId,
                    name: manager.name,
                  });
                  setIsOpen(false);
                }}
              >
                <span className="text-gray-700">{manager.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function EmployeeForm() {
  const company = sessionStorage.getItem("currentCompanyId");

  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, err } = useSelector((state) => state.employees);

  const {
    activeMainTab,
    employee,
    activeSection: activeSectionParam,
  } = router.query;

  const [activeMain, setActiveMain] = useState(activeMainTab || "Basic");
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [previewModal, setPreviewModal] = useState({ show: false });
  const [activeSection, setActiveSection] = useState("personal");
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);
  const { publicRuntimeConfig } = getConfig();
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [isDesignationLoading, setIsDesignationLoading] = useState(false);

  // Add department fetch on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = getItemFromSessionStorage("token", null);
        const companyId = sessionStorage.getItem("currentCompanyId");

        if (!companyId) {
          toast.error("Company ID not found");
          return;
        }

        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/departments/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setDepartments(response.data);
          if (response.data.length === 0) {
            toast.warning("No departments found for this company");
          }
        } else {
          toast.error("Invalid departments data received");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch departments"
        );
      }
    };

    fetchDepartments();
  }, [publicRuntimeConfig.apiURL]);

  const weekDayOptions = [
    { value: "SUNDAY", label: "Sunday" },
    { value: "MONDAY", label: "Monday" },
    { value: "TUESDAY", label: "Tuesday" },
    { value: "WEDNESDAY", label: "Wednesday" },
    { value: "THURSDAY", label: "Thursday" },
    { value: "FRIDAY", label: "Friday" },
    { value: "SATURDAY", label: "Saturday" },
  ];

  const [formData, setFormData] = useState({
    employee: {
      firstName: "",
      middleName: "",
      lastName: "",
      fathersName: "",
      gender: "",
      phone: "",
      alternatePhone: "",
      emailPersonal: "",
      emailOfficial: "",
      currentAddress: "",
      permanentAddress: "",
      department: "",
      designation: "",
      joiningDate: "",
      reportingManager: "",
      overtimeEligibile: false,
      weeklyOffs: [],
      employeeImgUrl: null,
      pfEnrolled: true,
      uanNumber: "",
      esicEnrolled: false,
      esicNumber: "",
    },
    companyId: company,
    idProofs: {
      aadharNo: "",
      aadharImgUrl: null,
      panNo: "",
      pancardImgUrl: null,
      passport: "",
      passportImgUrl: null,
      drivingLicense: "",
      drivingLicenseImgUrl: null,
      voterId: "",
      voterIdImgUrl: null,
    },
    bankDetails: {
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      upiId: "",
      upiPhoneNumber: "",
      passbookImgUrl: null,
    },
    salaryDetails: {
      annualCtc: "",
      monthlyCtc: "",
      basicSalary: "",
      hra: "",
      allowances: "",
      employerPfContribution: "",
      employeePfContribution: "",
    },
  });

  useEffect(() => {
    if (employee) {
      try {
        const parsedEmployee = JSON.parse(employee);
        setFormData((prevFormData) => ({
          ...prevFormData,
          employee: {
            ...prevFormData.employee,
            firstName: parsedEmployee.firstName || "",
            middleName: parsedEmployee.middleName || "",
            lastName: parsedEmployee.lastName || "",
            fathersName: parsedEmployee.fathersName || "",
            gender: parsedEmployee.gender || "",
            phone: parsedEmployee.phone || "",
            alternatePhone: parsedEmployee.alternatePhone || "",
            emailPersonal: parsedEmployee.emailPersonal || "",
            emailOfficial: parsedEmployee.emailOfficial || "",
            currentAddress: parsedEmployee.currentAddress || "",
            permanentAddress: parsedEmployee.permanentAddress || "",
            department: {
              departmentId: parsedEmployee.department,
              name: parsedEmployee.departmentName,
            },
            designation: {
              designationId: parsedEmployee.designation,
              name: parsedEmployee.designationName,
            },
            joiningDate: parsedEmployee.joiningDate || "",
            reportingManager: parsedEmployee.reportingManager
              ? {
                  employeeId: parsedEmployee.reportingManager,
                  name: parsedEmployee.reportingManagerName,
                }
              : "",
            overtimeEligibile: Boolean(parsedEmployee.overtimeEligibile),
            weeklyOffs: Array.isArray(parsedEmployee.weeklyOffs)
              ? parsedEmployee.weeklyOffs
              : [],
            employeeImgUrl: parsedEmployee.employeeImgUrl || "",
            pfEnrolled: Boolean(parsedEmployee.pfEnrolled),
            uanNumber: parsedEmployee.uanNumber || "",
            esicEnrolled: Boolean(parsedEmployee.esicEnrolled),
            esicNumber: parsedEmployee.esicNumber || "",
          },
          companyId: parsedEmployee.companyId || company,
          idProofs: {
            aadharNo: parsedEmployee.idProofs?.aadharNo || "",
            aadharImgUrl: parsedEmployee.idProofs?.aadharImgUrl || null,
            panNo: parsedEmployee.idProofs?.panNo || "",
            pancardImgUrl: parsedEmployee.idProofs?.pancardImgUrl || null,
            passport: parsedEmployee.idProofs?.passport || "",
            passportImgUrl: parsedEmployee.idProofs?.passportImgUrl || null,
            drivingLicense: parsedEmployee.idProofs?.drivingLicense || "",
            drivingLicenseImgUrl:
              parsedEmployee.idProofs?.drivingLicenseImgUrl || null,
            voterId: parsedEmployee.idProofs?.voterId || "",
            voterIdImgUrl: parsedEmployee.idProofs?.voterIdImgUrl || null,
          },
          bankDetails: {
            accountNumber: parsedEmployee.bankDetails?.accountNumber || "",
            accountHolderName:
              parsedEmployee.bankDetails?.accountHolderName || "",
            ifscCode: parsedEmployee.bankDetails?.ifscCode || "",
            bankName: parsedEmployee.bankDetails?.bankName || "",
            branchName: parsedEmployee.bankDetails?.branchName || "",
            upiId: parsedEmployee.bankDetails?.upiId || "",
            upiPhoneNumber: parsedEmployee.bankDetails?.upiPhoneNumber || "",
            passbookImgUrl: parsedEmployee.bankDetails?.passbookImgUrl || "",
          },
          salaryDetails: {
            annualCtc: parsedEmployee.salaryDetails?.annualCtc || "",
            monthlyCtc: parsedEmployee.salaryDetails?.monthlyCtc || "",
            basicSalary: parsedEmployee.salaryDetails?.basicSalary || "",
            hra: parsedEmployee.salaryDetails?.hra || "",
            allowances: parsedEmployee.salaryDetails?.allowances || "",
            employerPfContribution:
              parsedEmployee.salaryDetails?.employerPfContribution || "",
            employeePfContribution:
              parsedEmployee.salaryDetails?.employeePfContribution || "",
          },
        }));

        setEmployeeId(parsedEmployee.employeeId);
      } catch (error) {
        toast.error("Error loading employee data");
      }
    }
  }, [employee, company]);

  const calculatePFContributions = (basicSalary) => {
    const basic = parseFloat(basicSalary) || 0;
    return {
      employer: (basic * 0.12).toFixed(2), // 12% of basic salary
      employee: (basic * 0.12).toFixed(2), // 12% of basic salary
    };
  };

  const calculateSalaryDetails = (annualCtc, basicSalary) => {
    const annual = parseFloat(annualCtc) || 0;
    const basic = parseFloat(basicSalary) || 0;

    // Calculate monthly CTC
    const monthlyCtc = (annual / 12).toFixed(2);

    // Calculate HRA (40% of basic)
    const hra = (basic * 0.4).toFixed(2);

    // Calculate PF contributions if enrolled
    const pfContributions = formData.employee.pfEnrolled
      ? calculatePFContributions(basic)
      : { employer: 0, employee: 0 };

    // Calculate allowances
    const allowances = (
      parseFloat(monthlyCtc) -
      parseFloat(basic) -
      parseFloat(hra) -
      parseFloat(pfContributions.employee)
    ).toFixed(2);

    return {
      monthlyCtc,
      hra,
      allowances,
      employerPfContribution: pfContributions.employer,
      employeePfContribution: pfContributions.employee,
    };
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };

      // Calculate salary details when annual CTC or basic salary changes
      if (section === "salaryDetails") {
        if (field === "annualCtc" || field === "basicSalary") {
          const salaryDetails = calculateSalaryDetails(
            field === "annualCtc" ? value : updatedData.salaryDetails.annualCtc,
            field === "basicSalary"
              ? value
              : updatedData.salaryDetails.basicSalary
          );

          updatedData.salaryDetails = {
            ...updatedData.salaryDetails,
            ...salaryDetails,
          };
        }
      }

      return updatedData;
    });
  };

  const prepareFormData = (obj) => {
    const cleanObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof File)
        ) {
          // Handle nested objects (like idProofs, bankDetails, etc.)
          const nestedClean = prepareFormData(value);
          if (Object.keys(nestedClean).length > 0) {
            cleanObj[key] = nestedClean;
          }
        } else if (value instanceof File) {
          // Skip File objects as they'll be handled separately in FormData
          return;
        } else if (Array.isArray(value)) {
          // Handle arrays
          cleanObj[key] = value;
        } else {
          // Handle primitive values
          cleanObj[key] = value;
        }
      }
    });
    return cleanObj;
  };

  // Add validation patterns for ID proofs
  const idProofPatterns = {
    aadharNo: /^[0-9]{12}$/,
    panNo: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    passport: /^[A-Z]{1}[0-9]{7}$/,
    drivingLicense: /^[A-Z]{2}[0-9]{2}[0-9]{11}$/,
    voterId: /^[A-Z]{3}[0-9]{7}$/,
  };

  // Add validation function for ID proofs
  const validateIdProofs = (idProofs) => {
    const errors = {};
    Object.entries(idProofs).forEach(([key, value]) => {
      // Skip validation for image fields
      if (key.toLowerCase().includes("imgurl")) {
        return;
      }

      // Convert value to string and trim if it's not null/undefined
      const stringValue = value ? String(value).trim() : "";

      if (stringValue !== "") {
        const pattern = idProofPatterns[key];
        if (pattern && !pattern.test(stringValue)) {
          errors[key] = `Invalid ${key
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} format`;
        }
      }
    });
    return errors;
  };

  const handleSaveAndExit = async (e) => {
    e.preventDefault();

    // Only validate required fields for the current section
    const validateCurrentSection = () => {
      const errors = {};

      // Basic required fields that must always be present
      if (!formData.employee.firstName?.trim()) {
        errors.firstName = "First name is required";
      }
      if (!formData.employee.lastName?.trim()) {
        errors.lastName = "Last name is required";
      }
      if (!formData.employee.phone?.trim()) {
        errors.phone = "Phone number is required";
      }
      if (!formData.employee.joiningDate) {
        errors.joiningDate = "Date of joining is required";
      }
      if (!formData.employee.emailPersonal?.trim()) {
        errors.emailPersonal = "Personal email is required";
      }

      // Validate phone number format if provided
      if (
        formData.employee.phone &&
        !/^[0-9]{10}$/.test(formData.employee.phone)
      ) {
        errors.phone = "Invalid phone number format";
      }

      // Validate ID proofs only if they have values
      if (activeSection === "idProofs") {
        const idProofErrors = validateIdProofs(formData.idProofs);
        Object.assign(errors, idProofErrors);
      }

      // If there are errors, show them and return false
      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, message]) => {
          toast.error(message);
        });
        return false;
      }

      return true;
    };

    if (!validateCurrentSection()) return;

    setLoading(true);
    try {
      const submitFormData = new FormData();

      // Prepare form data with only filled fields
      const baseEmployeeData = {
        firstName: formData.employee.firstName?.trim(),
        middleName: formData.employee.middleName?.trim(),
        lastName: formData.employee.lastName?.trim(),
        phone: formData.employee.phone?.trim(),
        joiningDate: formData.employee.joiningDate,
        department: formData.employee.department?.departmentId,
        designation: formData.employee.designation?.designationId,
        // Include other fields only if they have values
        ...(formData.employee.fathersName && {
          fathersName: formData.employee.fathersName.trim(),
        }),
        ...(formData.employee.gender && {
          gender: formData.employee.gender.trim(),
        }),
        ...(formData.employee.alternatePhone && {
          alternatePhone: formData.employee.alternatePhone.trim(),
        }),
        ...(formData.employee.emailPersonal && {
          emailPersonal: formData.employee.emailPersonal.trim(),
        }),
        ...(formData.employee.emailOfficial && {
          emailOfficial: formData.employee.emailOfficial.trim(),
        }),
        ...(formData.employee.currentAddress && {
          currentAddress: formData.employee.currentAddress.trim(),
        }),
        ...(formData.employee.permanentAddress && {
          permanentAddress: formData.employee.permanentAddress.trim(),
        }),
        ...(formData.employee.reportingManager?.employeeId && {
          reportingManager: formData.employee.reportingManager.employeeId,
          reportingManagerName: formData.employee.reportingManager.name,
        }),
        overtimeEligibile: Boolean(formData.employee.overtimeEligibile),
        weeklyOffs: formData.employee.weeklyOffs?.length
          ? formData.employee.weeklyOffs
          : [],
        pfEnrolled: Boolean(formData.employee.pfEnrolled),
        ...(formData.employee.uanNumber && {
          uanNumber: formData.employee.uanNumber.trim(),
        }),
        esicEnrolled: Boolean(formData.employee.esicEnrolled),
        ...(formData.employee.esicNumber && {
          esicNumber: formData.employee.esicNumber.trim(),
        }),
        companyId: formData.companyId,
      };

      // Handle ID proofs separately to ensure proper format
      const idProofsData = {};
      Object.entries(formData.idProofs).forEach(([key, value]) => {
        if (value instanceof File) {
          // Skip File objects as they'll be handled separately
          return;
        }
        if (
          value &&
          typeof value === "string" &&
          !key.toLowerCase().includes("imgurl")
        ) {
          idProofsData[key] = value.trim();
        }
      });
      if (Object.keys(idProofsData).length > 0) {
        baseEmployeeData.idProofs = idProofsData;
      }

      // Handle bank details
      if (
        Object.keys(formData.bankDetails).some(
          (key) => formData.bankDetails[key]
        )
      ) {
        const bankDetailsData = {};
        Object.entries(formData.bankDetails).forEach(([key, value]) => {
          if (value instanceof File) {
            // Skip File objects as they'll be handled separately
            return;
          }
          if (
            value &&
            typeof value === "string" &&
            !key.toLowerCase().includes("imgurl")
          ) {
            bankDetailsData[key] = value.trim();
          }
        });
        if (Object.keys(bankDetailsData).length > 0) {
          baseEmployeeData.bankDetails = bankDetailsData;
        }
      }

      // Handle salary details
      if (
        Object.keys(formData.salaryDetails).some(
          (key) => formData.salaryDetails[key]
        )
      ) {
        baseEmployeeData.salaryDetails = prepareFormData(
          formData.salaryDetails
        );
      }

      const employeeData = prepareFormData(baseEmployeeData);
      submitFormData.append("employee", JSON.stringify(employeeData));

      // Handle file uploads only if they exist
      if (formData.employee.employeeImgUrl instanceof File) {
        submitFormData.append("profileImage", formData.employee.employeeImgUrl);
      }

      // Handle ID proof files
      const idProofMappings = {
        aadharImgUrl: "aadharImage",
        pancardImgUrl: "panImage",
        passportImgUrl: "passportImage",
        drivingLicenseImgUrl: "drivingLicenseImage",
        voterIdImgUrl: "voterIdImage",
      };

      Object.entries(idProofMappings).forEach(([formField, apiField]) => {
        const fileOrUrl = formData.idProofs[formField];
        if (fileOrUrl instanceof File) {
          submitFormData.append(apiField, fileOrUrl);
        }
      });

      if (formData.bankDetails.passbookImgUrl instanceof File) {
        submitFormData.append(
          "passbookImage",
          formData.bankDetails.passbookImgUrl
        );
      }

      if (employeeId) {
        const result = await dispatch(
          updateEmployee({
            id: employeeId,
            updatedData: submitFormData,
          })
        ).unwrap();

        if (result) {
          toast.success("Employee updated successfully");
          router.push("/hradmin/employees");
        }
      } else {
        const result = await dispatch(createEmployee(submitFormData)).unwrap();
        if (result) {
          toast.success("Employee created successfully");
          router.push("/hradmin/employees");
        }
      }
    } catch (err) {
      let errorMessage = "An error occurred";
      if (err?.validationErrors) {
        const validationMessages = Object.entries(err.validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n");
        errorMessage = validationMessages;
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeSection !== "salary") {
      const currentIndex = sections.findIndex(
        (section) => section.id === activeSection
      );
      if (currentIndex < sections.length - 1) {
        setActiveSection(sections[currentIndex + 1].id);
        return;
      }
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      // ... rest of the existing handleSubmit code ...
    } catch (err) {
      // ... existing error handling ...
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainTab) setActiveMain(activeMainTab);
    if (activeSectionParam) setActiveSection(activeSectionParam);
  }, [activeMainTab, activeSectionParam]);

  const handleFileUpload = (documentType, file) => {
    if (file) {
      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);

      // Map document type to the correct field names
      const fieldMappings = {
        aadharNo: { imgField: "aadharImgUrl" },
        panNo: { imgField: "pancardImgUrl" },
        passport: { imgField: "passportImgUrl" },
        drivingLicense: { imgField: "drivingLicenseImgUrl" },
        voterId: { imgField: "voterIdImgUrl" },
        passbookImgUrl: { imgField: "passbookImgUrl" },
      };

      const fields = fieldMappings[documentType];
      if (!fields) return;

      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [documentType === "passbookImgUrl" ? "bankDetails" : "idProofs"]: {
            ...(documentType === "passbookImgUrl"
              ? prev.bankDetails
              : prev.idProofs),
            [fields.imgField]: file, // Store the File object for upload
          },
        };

        return updatedData;
      });
    }
  };

  // Move these functions before the sections array definition
  const checkPersonalDetailsCompletion = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "joiningDate",
      "department",
      "designation",
      "currentAddress",
      "gender",
      "fathersName",
      "alternatePhone",
      "emailPersonal",
      "emailOfficial",
      "permanentAddress",
    ];
    return requiredFields.every((field) => {
      const value = formData.employee[field];
      return value && value.toString().trim() !== "";
    });
  };

  const checkIdProofsCompletion = () => {
    return Boolean(
      formData.idProofs.aadharNo?.trim() &&
        formData.idProofs.panNo?.trim() &&
        formData.idProofs.passport?.trim() &&
        formData.idProofs.drivingLicense?.trim() &&
        formData.idProofs.voterId?.trim()
    );
  };

  const checkBankDetailsCompletion = () => {
    const requiredFields = [
      "accountNumber",
      "accountHolderName",
      "ifscCode",
      "bankName",
      "branchName",
      "passbookImgUrl",
      "upiId",
      "upiPhoneNumber",
    ];
    return requiredFields.every((field) => {
      const value = formData.bankDetails[field];
      return value && value.toString().trim() !== "";
    });
  };

  const checkSalaryDetailsCompletion = () => {
    const requiredFields = ["annualCtc", "basicSalary"];
    return requiredFields.every((field) => {
      const value = formData.salaryDetails[field];
      return value && value.toString().trim() !== "";
    });
  };

  // Then define the sections array using these functions
  const sections = [
    {
      id: "personal",
      label: "Personal Details",
      icon: FiUser,
      checkCompletion: checkPersonalDetailsCompletion,
    },
    {
      id: "idProofs",
      label: "ID Proofs",
      icon: FiBook,
      checkCompletion: checkIdProofsCompletion,
    },
    {
      id: "bank",
      label: "Bank Details",
      icon: FiCreditCard,
      checkCompletion: checkBankDetailsCompletion,
    },
    {
      id: "salary",
      label: "Salary",
      icon: "₹",
      checkCompletion: checkSalaryDetailsCompletion,
    },
  ];

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Add useEffect for fetching designations when department changes
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        setIsDesignationLoading(true);
        // Get department ID from either object or string format
        const deptId =
          typeof formData.employee.department === "object"
            ? formData.employee.department.departmentId
            : formData.employee.department;

        if (!deptId) {
          setDesignations([]);
          setIsDesignationLoading(false);
          return;
        }

        const token = getItemFromSessionStorage("token", null);

        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/api/designations/department/${deptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setDesignations(response.data);
          if (response.data.length === 0) {
            toast.warning("No designations found for this department");
          }
        } else {
          toast.error("Invalid designations data received");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch designations"
        );
      } finally {
        setIsDesignationLoading(false);
      }
    };

    fetchDesignations();
  }, [formData.employee.department, publicRuntimeConfig.apiURL]);

  // Fetch managers when department changes
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const departmentId = formData.employee.department?.departmentId;
        if (!departmentId) {
          setManagers([]);
          return;
        }

        const token = getItemFromSessionStorage("token", null);

        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/departments/${departmentId}/managers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setManagers(response.data);
          if (response.data.length === 0) {
            toast.warning("No managers found for this department");
          }
        } else {
          toast.error("Invalid managers data received");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch managers"
        );
      }
    };

    fetchManagers();
  }, [formData.employee.department?.departmentId, publicRuntimeConfig.apiURL]);

  const handleDepartmentAdded = (newDepartment) => {
    // Refetch departments and select the new one
    const fetchDepartments = async () => {
      try {
        const token = getItemFromSessionStorage("token", null);
        const companyId = sessionStorage.getItem("currentCompanyId");
        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/departments/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data && Array.isArray(response.data)) {
          setDepartments(response.data);
          // Auto-select the new department
          const created = response.data.find(
            (d) => d.name === newDepartment.name
          );
          if (created) {
            handleInputChange("employee", "department", {
              departmentId: created.departmentId,
              name: created.name,
            });
            // Set weekly holidays as read-only weekly offs
            const weeklyHolidays = created.weeklyHolidays
              ? created.weeklyHolidays.split(",")
              : [];
            handleInputChange("employee", "weeklyOffs", weeklyHolidays);
            // Clear designation and manager when department changes
            handleInputChange("employee", "designation", null);
            handleInputChange("employee", "reportingManager", null);
          }
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch departments"
        );
      }
    };
    fetchDepartments();
  };

  const handleDesignationAdded = (newDesignation) => {
    // Refetch designations for the selected department and select the new one
    const fetchDesignationsForDepartment = async () => {
      try {
        setIsDesignationLoading(true);
        // Get department ID from either object or string format
        const deptId =
          typeof formData.employee.department === "object"
            ? formData.employee.department.departmentId
            : formData.employee.department;
        if (!deptId) {
          setDesignations([]);
          setIsDesignationLoading(false);
          return;
        }
        const token = getItemFromSessionStorage("token", null);
        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/api/designations/department/${deptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data && Array.isArray(response.data)) {
          setDesignations(response.data);
          // Auto-select the new designation (by id or name)
          let created = null;
          if (newDesignation.designationId) {
            created = response.data.find(
              (d) => d.designationId === newDesignation.designationId
            );
          }
          if (!created) {
            created = response.data.find(
              (d) => d.name === newDesignation.name
            );
          }
          if (created) {
            handleInputChange("employee", "designation", {
              designationId: created.designationId,
              name: created.name,
              manager: created.manager,
              overtimeEligible: created.overtimeEligible,
            });
          }
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch designations"
        );
      } finally {
        setIsDesignationLoading(false);
      }
    };
    fetchDesignationsForDepartment();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        }`}
      >
        <HradminNavbar />

        <div className="p-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-0">
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                {employee ? "Edit Employee" : "New Employee"}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col ">
              <div className="bg-white rounded-2xl shadow-sm p-4 relative overflow-hidden flex-1">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 z-0" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-50 rounded-full -ml-16 -mb-16 z-0" />

                {/* Section Tabs */}
                <div className="relative z-10 flex gap-4 mb-8 border-b border-gray-100 pb-2">
                  {sections.map((section) => (
                    <motion.button
                      key={section.id}
                      type="button"
                      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                        activeSection === section.id
                          ? "bg-blue-50 text-blue-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveSection(section.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {typeof section.icon === "string" ? (
                        <span className="text-lg">{section.icon}</span>
                      ) : (
                        <section.icon
                          className={`w-4 h-4 ${
                            activeSection === section.id
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                      )}
                      {section.label}
                      <div className="absolute -top-1.5 -right-1.5">
                        {section.checkCompletion() ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <FiCheck className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-lg shadow-red-200" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Form Content */}
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 pb-20"
                >
                  {/* Personal Details Section */}
                  {activeSection === "personal" && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Personal Information
                        </h3>

                        <div className="grid grid-cols-3 gap-4">
                          <div className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              First Name <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              className={inputClass}
                              value={formData.employee.firstName || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "firstName",
                                  e.target.value
                                )
                              }
                              placeholder="Enter first name"
                            />
                          </div>
                          <div className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              Middle Name
                            </label>
                            <input
                              type="text"
                              className={inputClass}
                              value={formData.employee.middleName || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "middleName",
                                  e.target.value
                                )
                              }
                              placeholder="Enter middle name (optional)"
                            />
                          </div>
                          <div className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              Last Name <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              className={inputClass}
                              value={formData.employee.lastName || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "lastName",
                                  e.target.value
                                )
                              }
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              Father&apos;s Name
                            </label>
                            <input
                              type="text"
                              className={inputClass}
                              value={formData.employee.fathersName || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "fathersName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={inputGroupClass}>
                            <label className={floatingLabelClass}>Gender</label>
                            <select
                              className={inputClass}
                              value={formData.employee.gender || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "gender",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Phone",
                              field: "phone",
                              required: true,
                              type: "tel",
                            },
                            {
                              label: "Alternate Phone",
                              field: "alternatePhone",
                              type: "tel",
                            },
                          ].map(({ label, field, required, type }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label}{" "}
                                {required && (
                                  <span className="text-red-400">*</span>
                                )}
                              </label>
                              <input
                                type={type || "text"}
                                required={required}
                                className={inputClass}
                                value={formData.employee[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "employee",
                                    field,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Personal Email",
                              field: "emailPersonal",
                              type: "email",
                              required: true,
                            },
                          ].map(({ label, field, type, required }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label} {required && <span className="text-red-400">*</span>}
                              </label>
                              <input
                                type={type}
                                className={inputClass}
                                value={formData.employee[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "employee",
                                    field,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>

                        {/* Addresses */}
                        <div className={inputGroupClass}>
                          <label className={floatingLabelClass}>
                            Current Address
                          </label>
                          <textarea
                            className={inputClass}
                            rows="2"
                            value={formData.employee.currentAddress || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "employee",
                                "currentAddress",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id="sameAsCurrent"
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={
                              formData.employee.permanentAddress ===
                              formData.employee.currentAddress
                            } // Sync checkbox state
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange(
                                  "employee",
                                  "permanentAddress",
                                  formData.employee.currentAddress
                                );
                              } else {
                                handleInputChange(
                                  "employee",
                                  "permanentAddress",
                                  ""
                                ); // Clear permanent address
                              }
                            }}
                          />
                          <label
                            htmlFor="sameAsCurrent"
                            className="ml-2 text-sm text-gray-700"
                          >
                            Same as current address
                          </label>
                        </div>

                        <div className={inputGroupClass}>
                          <label className={floatingLabelClass}>
                            Permanent Address
                          </label>
                          <textarea
                            className={inputClass}
                            rows="2"
                            value={formData.employee.permanentAddress || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "employee",
                                "permanentAddress",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Right Column - Professional Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Professional Information
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <DepartmentSelect
                            label="Department"
                            options={departments}
                            value={formData.employee.department}
                            onChange={(selectedDepartment) => {
                              handleInputChange("employee", "department", {
                                departmentId: selectedDepartment.departmentId,
                                name: selectedDepartment.name,
                              });
                              // Set weekly holidays as read-only weekly offs
                              const weeklyHolidays =
                                selectedDepartment.weeklyHolidays
                                  ? selectedDepartment.weeklyHolidays.split(",")
                                  : [];
                              handleInputChange("employee", "weeklyOffs", weeklyHolidays);
                              // Clear designation and manager when department changes
                              handleInputChange("employee", "designation", null);
                              handleInputChange("employee", "reportingManager", null);
                            }}
                            onAddDepartment={() => setShowDepartmentModal(true)}
                          />
                          <DesignationSelect
                            label="Designation"
                            options={formData.employee.department ? designations : []}
                            value={formData.employee.designation}
                            onChange={(selectedDesignation) =>
                              handleInputChange("employee", "designation", {
                                designationId: selectedDesignation.designationId,
                                name: selectedDesignation.name,
                                manager: selectedDesignation.manager,
                                overtimeEligible: selectedDesignation.overtimeEligible,
                              })
                            }
                            onAddDesignation={() => setShowDesignationModal(true)}
                            disabled={isDesignationLoading || !formData.employee.department}
                            placeholder={!formData.employee.department ? 'First Select Department' : 'Select designation'}
                            loading={isDesignationLoading}
                          />
                        </div>

                        <div className={inputGroupClass}>
                          <label className={floatingLabelClass}>Official Email</label>
                          <input
                            type="email"
                            className={inputClass}
                            value={formData.employee.emailOfficial || ""}
                            onChange={(e) =>
                              handleInputChange("employee", "emailOfficial", e.target.value)
                            }
                            placeholder="Enter official email"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Date of Joining",
                              field: "joiningDate",
                              required: true,
                              type: "date",
                            },
                          ].map(({ label, field, type, required }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label}{" "}
                                {required && (
                                  <span className="text-red-400">*</span>
                                )}
                              </label>
                              <input
                                type={type || "text"}
                                className={`${inputClass} ${type === "date" ? "py-[0.4rem] px-3" : ""
                                  }`}
                                value={formData.employee[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "employee",
                                    field,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}

                          <div className="grid grid-1 gap-4">
                            <ReportingManagerSelect
                              label="Reporting Manager"
                              options={managers}
                              value={formData.employee.reportingManager}
                              onChange={(selectedManager) =>
                                handleInputChange(
                                  "employee",
                                  "reportingManager",
                                  {
                                    employeeId: selectedManager.employeeId,
                                    name: selectedManager.name,
                                  }
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* Statutory Details */}
                        <div className="space-y-4 border-t pt-4 mt-4">
                          <h4 className="text-md font-medium text-gray-700">
                            Statutory Details
                          </h4>

                          <MultiSelect
                            label="Weekly Off"
                            options={weekDays}
                            value={formData.employee.weeklyOffs || []}
                            onChange={(selected) =>
                              handleInputChange(
                                "employee",
                                "weeklyOffs",
                                selected
                              )
                            }
                          />

                          <div className="flex flex-col space-y-4">
                            {/* PF Section */}
                            <div className="space-y-2">
                              <div className="flex items-center mb-3">
                                <input
                                  type="checkbox"
                                  id="pfEnrolled"
                                  checked={formData.employee.pfEnrolled}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "employee",
                                      "pfEnrolled",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label
                                  htmlFor="pfEnrolled"
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  PF Enrolled
                                </label>
                              </div>

                              {formData.employee.pfEnrolled && (
                                <div className={`${inputGroupClass} mt-2`}>
                                  <label className={floatingLabelClass}>
                                    UAN Number
                                  </label>
                                  <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.employee.uanNumber || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "employee",
                                        "uanNumber",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter UAN Number"
                                  />
                                </div>
                              )}
                            </div>

                            {/* ESIC Section */}
                            <div className="space-y-2">
                              <div className="flex items-center mb-3">
                                <input
                                  type="checkbox"
                                  id="esicEnrolled"
                                  checked={formData.employee.esicEnrolled}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "employee",
                                      "esicEnrolled",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label
                                  htmlFor="esicEnrolled"
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  ESIC Enrolled
                                </label>
                              </div>

                              {formData.employee.esicEnrolled && (
                                <div className={`${inputGroupClass} mt-2`}>
                                  <label className={floatingLabelClass}>
                                    ESIC Number
                                  </label>
                                  <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.employee.esicNumber || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "employee",
                                        "esicNumber",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter ESIC Number"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ID Proofs Section */}
                  {activeSection === "idProofs" && (
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Identity Documents
                      </h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {[
                          {
                            label: "Aadhar No.",
                            key: "aadharNo",
                            docType: "Aadhar Card",
                            imgField: "aadharImgUrl",
                          },
                          {
                            label: "PAN No.",
                            key: "panNo",
                            docType: "PAN Card",
                            imgField: "pancardImgUrl",
                          },
                          {
                            label: "Passport",
                            key: "passport",
                            docType: "Passport",
                            imgField: "passportImgUrl",
                          },
                          {
                            label: "Driving License",
                            key: "drivingLicense",
                            docType: "Driving License",
                            imgField: "drivingLicenseImgUrl",
                          },
                          {
                            label: "Voter ID",
                            key: "voterId",
                            docType: "Voter ID",
                            imgField: "voterIdImgUrl",
                          },
                        ].map(({ label, key, docType, imgField }) => (
                          <div key={key} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}
                            </label>
                            <div className="relative flex items-center">
                              <input
                                className={`${inputClass} pr-10`}
                                value={formData.idProofs[key] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "idProofs",
                                    key,
                                    e.target.value
                                  )
                                }
                              />
                              <div className="absolute right-3 group">
                                {formData.idProofs[imgField] ? (
                                  <div className="flex items-center gap-2">
                                    {/* Show preview for both new uploads and existing files */}
                                    {formData.idProofs[imgField] instanceof
                                    File ? (
                                      // For new uploads (File objects)
                                      <img
                                        src={URL.createObjectURL(
                                          formData.idProofs[imgField]
                                        )}
                                        alt={`${docType} preview`}
                                        className="w-8 h-8 object-cover rounded"
                                      />
                                    ) : (
                                      // For existing files (URLs)
                                      <img
                                        src={formData.idProofs[imgField]}
                                        alt={`${docType} preview`}
                                        className="w-8 h-8 object-cover rounded"
                                      />
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          idProofs: {
                                            ...prev.idProofs,
                                            [imgField]: null,
                                          },
                                        }));
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <label
                                    htmlFor={`upload-${key}`}
                                    className="cursor-pointer"
                                  >
                                    <FiUpload className="w-5 h-5 text-gray-500 hover:text-blue-600" />
                                    <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                      Upload {docType}
                                    </span>
                                  </label>
                                )}
                                <input
                                  type="file"
                                  id={`upload-${key}`}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      // Add file size validation (e.g., 5MB limit)
                                      const maxSize = 5 * 1024 * 1024; // 5MB
                                      if (file.size > maxSize) {
                                        toast.error(
                                          "File size should not exceed 5MB"
                                        );
                                        return;
                                      }
                                      // Add file type validation
                                      const allowedTypes = [
                                        "application/pdf",
                                        "image/jpeg",
                                        "image/jpg",
                                        "image/png",
                                      ];
                                      if (!allowedTypes.includes(file.type)) {
                                        toast.error(
                                          "Please upload a valid PDF or image file"
                                        );
                                        return;
                                      }
                                      handleFileUpload(key, file);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bank Details Section */}
                  {activeSection === "bank" && (
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Banking Information
                      </h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {[
                          { label: "Account Number", key: "accountNumber" },
                          {
                            label: "Account Holder Name",
                            key: "accountHolderName",
                          },
                          { label: "IFSC Code", key: "ifscCode" },
                          { label: "Bank Name", key: "bankName" },
                          { label: "Branch Name", key: "branchName" },
                          { label: "UPI ID", key: "upiId" },
                          { label: "UPI Phone Number", key: "upiPhoneNumber" },
                        ].map(({ label, key }) => (
                          <div key={key} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}
                            </label>
                            <input
                              className={inputClass}
                              value={formData.bankDetails[key] || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "bankDetails",
                                  key,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>

                      {/* Document Upload Section */}
                      <div className="mt-2 space-y-1">
                        <h4 className="text-sm font-medium text-gray-700">
                          Account Verification Document
                        </h4>
                        <div className="flex items-start space-x-6">
                          {/* Passbook Photo Upload */}
                          <div className="flex-1">
                            <div
                              className={`border-2 border-dashed rounded-lg p-2 transition-all duration-200 ${
                                formData.bankDetails.passbookImgUrl
                                  ? "border-green-200 bg-green-50"
                                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                              }`}
                            >
                              <div className="flex flex-col items-center justify-center">
                                <input
                                  type="file"
                                  id="passbook-upload"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      // Add file size validation (e.g., 5MB limit)
                                      const maxSize = 5 * 1024 * 1024; // 5MB
                                      if (file.size > maxSize) {
                                        toast.error(
                                          "File size should not exceed 5MB"
                                        );
                                        return;
                                      }
                                      // Add file type validation
                                      const allowedTypes = [
                                        "application/pdf",
                                        "image/jpeg",
                                        "image/jpg",
                                        "image/png",
                                      ];
                                      if (!allowedTypes.includes(file.type)) {
                                        toast.error(
                                          "Please upload a valid PDF or image file"
                                        );
                                        return;
                                      }
                                      handleFileUpload("passbookImgUrl", file);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="passbook-upload"
                                  className="cursor-pointer text-center group"
                                >
                                  <div className="flex flex-col items-center space-y-1">
                                    <div
                                      className={`p-1 rounded-full ${
                                        formData.bankDetails.passbookImgUrl
                                          ? "bg-green-100 text-green-600"
                                          : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                                      }`}
                                    >
                                      <FiUpload className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-xs font-medium text-gray-700">
                                        {formData.bankDetails.passbookImgUrl
                                          ? "Upload a different file"
                                          : "Upload Passbook/Cancelled Cheque"}
                                      </p>
                                      <p className="text-[10px] text-gray-500">
                                        PDF or Image file (max 5MB)
                                      </p>
                                    </div>
                                  </div>
                                </label>
                              </div>
                              {formData.bankDetails.passbookImgUrl && (
                                <div className="mt-1.5 flex items-center justify-between bg-white rounded-lg p-1.5 shadow-sm">
                                  <div className="flex items-center space-x-2">
                                    {formData.bankDetails
                                      .passbookImgUrl instanceof File ? (
                                      <img
                                        src={URL.createObjectURL(
                                          formData.bankDetails.passbookImgUrl
                                        )}
                                        alt="Passbook preview"
                                        className="w-8 h-8 object-cover rounded border border-gray-200"
                                      />
                                    ) : typeof formData.bankDetails
                                        .passbookImgUrl === "string" ? (
                                      <img
                                        src={
                                          formData.bankDetails.passbookImgUrl
                                        }
                                        alt="Passbook preview"
                                        className="w-8 h-8 object-cover rounded border border-gray-200"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src =
                                            "/placeholder-image.png";
                                        }}
                                      />
                                    ) : null}
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                                        {formData.bankDetails
                                          .passbookImgUrl instanceof File
                                          ? formData.bankDetails.passbookImgUrl
                                              .name
                                          : "Passbook Document"}
                                      </span>
                                      <span className="text-[10px] text-gray-500">
                                        {formData.bankDetails
                                          .passbookImgUrl instanceof File
                                          ? `${(
                                              formData.bankDetails
                                                .passbookImgUrl.size /
                                              1024 /
                                              1024
                                            ).toFixed(2)} MB`
                                          : "Uploaded Document"}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        bankDetails: {
                                          ...prev.bankDetails,
                                          passbookImgUrl: null,
                                        },
                                      }));
                                    }}
                                    className="p-0.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
                                    title="Remove file"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Salary Section */}
                  {activeSection === "salary" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Salary Details
                      </h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {[
                          { label: "Annual CTC", field: "annualCtc" },
                          { label: "Monthly CTC", field: "monthlyCtc" },
                          { label: "Basic Salary", field: "basicSalary" },
                          { label: "HRA", field: "hra" },
                          { label: "Allowances", field: "allowances" },
                        ].map(({ label, field }) => (
                          <div key={field} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                ₹
                              </span>
                              <input
                                type="number"
                                className={`${inputClass} pl-8 ${
                                  field === "monthlyCtc" ||
                                  field === "allowances" ||
                                  field === "hra"
                                    ? "bg-gray-50"
                                    : ""
                                }`}
                                value={formData.salaryDetails[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "salaryDetails",
                                    field,
                                    e.target.value
                                  )
                                }
                                readOnly={
                                  field === "monthlyCtc" ||
                                  field === "allowances" ||
                                  field === "hra"
                                }
                              />
                            </div>
                          </div>
                        ))}

                        {/* PF Contributions - Only shown if PF is enrolled */}
                        {formData.employee.pfEnrolled && (
                          <>
                            <div className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                Employer PF Contribution
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  className={`${inputClass} pl-8 bg-gray-50`}
                                  value={
                                    formData.salaryDetails
                                      .employerPfContribution ||
                                    calculatePFContributions(
                                      formData.salaryDetails.basicSalary
                                    ).employer
                                  }
                                  readOnly
                                />
                              </div>
                            </div>

                            <div className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                Employee PF Contribution
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  className={`${inputClass} pl-8 bg-gray-50`}
                                  value={
                                    formData.salaryDetails
                                      .employeePfContribution ||
                                    calculatePFContributions(
                                      formData.salaryDetails.basicSalary
                                    ).employee
                                  }
                                  readOnly
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Fixed Action Buttons */}
                <div className="fixed bottom-8 right-8 z-50 flex gap-4">
                  <motion.button
                    type="button"
                    className="px-6 py-3 rounded-xl bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all duration-200 shadow-lg"
                    onClick={() => router.push("/hradmin/employees")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    type="button"
                    className="px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                    onClick={handleSubmit}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Save and Continue</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    className="px-8 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                    onClick={handleSaveAndExit}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Save and Exit</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Preview Employee Details
              </h2>
              <button
                onClick={() => setPreviewModal({ show: false })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Modal */}
      <DepartmentFormModal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onSuccess={handleDepartmentAdded}
        companyId={company}
      />

      {/* Designation Modal */}
      <DesignationFormModal
        isOpen={showDesignationModal}
        onClose={() => setShowDesignationModal(false)}
        onSuccess={handleDesignationAdded}
        companyId={company}
        defaultDepartment={formData.employee.department}
      />
    </div>
  );
}

export default withAuth(EmployeeForm);
