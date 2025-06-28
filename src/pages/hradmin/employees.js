import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Search, UserPlus, Calendar } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { toast } from "react-hot-toast";

function Employees() {
  const [activeTab, setActiveTab] = useState("Basic");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredEmployeeId, setHoveredEmployeeId] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, loading, err } = useSelector((state) => state.employees);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchEmployees()).unwrap();
      } catch (error) {
        toast.error("Failed to fetch employees data");
      }
    };
    fetchData();
  }, [dispatch]);

  const handleRowClick = (employee) => {
    try {
      // Map the active tab to the corresponding section in the Add New Employee form
      let activeSection = "personal"; // Default to personal section

      switch (activeTab) {
        case "ID Proofs":
          activeSection = "idProofs";
          break;
        case "Salary Details":
          activeSection = "salary";
          break;
        case "Bank Details":
          activeSection = "bank";
          break;
        default:
          activeSection = "personal";
      }

      // Make a clean copy of the employee object to prevent object reference issues
      const cleanEmployee = JSON.parse(JSON.stringify(employee));

      router.push({
        pathname: "/hradmin/addNewEmployee",
        query: {
          employee: JSON.stringify(cleanEmployee),
          activeMainTab: activeTab,
          activeSection: activeSection,
        },
      });
    } catch (error) {
      toast.error("Failed to open employee details. Please try again.");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleViewDoc = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const filteredEmployees = (employees || []).filter((employee) =>
    employee?.name?.toLowerCase().includes(searchInput.toLowerCase())
  );

  const tabs = [
    "Basic",
    "ID Proofs",
    "Bank Details",
    "Salary Details",
    "Leaves Policy",
  ];

  const getTableHeaders = () => {
    switch (activeTab) {
      case "Basic":
        return [
          { key: "employeeId", label: "Employee ID" },
          { key: "name", label: "Name" },
          { key: "fathersName", label: "Father's Name" },
          { key: "phone", label: "Phone No." },
          { key: "emailOfficial", label: "Email(Off.)" },
          { key: "joiningDate", label: "DOJ" },
          { key: "designationName", label: "Designation" },
          { key: "assignTo", label: "Members" },
          { key: "currentAddress", label: "Current Address" },
        ];
      case "ID Proofs":
        return [
          { key: "employeeId", label: "Employee ID" },
          { key: "name", label: "Name" },
          { key: "aadharNo", label: "Aadhar no." },
          { key: "panNo", label: "PAN no." },
          { key: "voterId", label: "Voter ID" },
          { key: "passport", label: "Passport no." },
          { key: "drivingLicense", label: "Driving License" },
        ];
      case "Salary Details":
        return [
          { key: "employeeId", label: "Employee ID" },
          { key: "name", label: "Name" },
          { key: "annualCtc", label: "Annual CTC" },
          { key: "monthlyCtc", label: "Monthly CTC" },
          { key: "basicSalary", label: "Basic" },
          { key: "hra", label: "HRA" },
          { key: "allowances", label: "Allowance" },
          { key: "employerPfContribution", label: "Employer PF" },
          { key: "employeePfContribution", label: "Employee PF" },
        ];
      case "Bank Details":
        return [
          { key: "employeeId", label: "Employee ID" },
          { key: "name", label: "Name" },
          { key: "accountHolderName", label: "Account Holder Name" },
          { key: "accountNumber", label: "Account no." },
          { key: "bankName", label: "Bank Name" },
          { key: "branchName", label: "Branch Name" },
          { key: "upiId", label: "UPI ID" },
          { key: "upiPhoneNumber", label: "UPI Number" },
          { key: "passbookDoc", label: "Passbook Doc" },
        ];
      case "Leaves Policy":
        return [
          { key: "employeeId", label: "Employee ID" },
          { key: "name", label: "Name" },
          { key: "departmentName", label: "Department" },
          { key: "leavePolicy", label: "Leave Policy" },
          { key: "leaveType", label: "Leave Types" },
        ];
      default:
        return [];
    }
  };

  const getCellValue = (employee, key) => {
    if (!employee) return "";

    switch (activeTab) {
      case "Basic":
        if (key === "assignTo") {
          if (Array.isArray(employee[key])) {
            return employee[key].map((id) => id).join(", ");
          }
          return employee[key] || "";
        }
        return typeof employee[key] === "object"
          ? employee[key]
            ? JSON.stringify(employee[key])
            : ""
          : employee[key] || "";

      case "ID Proofs":
        if (key === "name" || key === "employeeId") return employee[key] || "";

        return employee.idProofs?.[key] || "";

      case "Salary Details":
        if (key === "name" || key === "employeeId") return employee[key] || "";

        return employee.salaryDetails?.[key] || "";

      case "Bank Details":
        if (key === "name" || key === "employeeId") return employee[key] || "";

        if (key === "passbookDoc") {
          return employee.bankDetails?.passbookImgUrl ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDoc(employee.bankDetails.passbookImgUrl);
              }}
              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
            >
              View Doc
            </button>
          ) : (
            "-"
          );
        }

        return employee.bankDetails?.[key] || "";

      case "Leaves Policy":
        if (key === "name" || key === "employeeId" || key === "departmentName")
          return employee[key] || "";

        if (key === "leavePolicy") return employee.leavePolicyName || "-";

        if (key === "leaveType") {
          if (Array.isArray(employee.leaveTypeNames)) {
            return employee.leaveTypeNames.filter(Boolean).join(", ") || "-";
          }
          return employee.leaveTypeNames || "-";
        }
        return "";

      default:
        return "";
    }
  };

  const headers = getTableHeaders();

  if (err) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
        <div
          className={`flex-1 ${
            isSidebarCollapsed ? "ml-16" : "ml-56"
          } transition-all duration-300`}
        >
          <HradminNavbar />
          <div className="p-6 mt-16">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Error: {err}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Header with Search and Title */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-800">
                Employee Management
              </h1>
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() =>
                  router.push({
                    pathname: "/hradmin/addNewEmployee",
                    query: { activeMainTab: activeTab },
                  })
                }
              >
                <UserPlus className="h-5 w-5" />
                Add Employee
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full md:w-72 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-50">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-8 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab
                      ? "text-blue-600 bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.1)] rounded-t-lg z-10"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="w-full">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      {headers.map((header) => (
                        <th
                          key={header.key}
                          className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>
              <div
                className="overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 280px)" }}
              >
                <table className="w-full table-fixed">
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={headers.length}
                          className="text-center py-3 text-sm text-gray-500"
                        >
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                            Loading...
                          </div>
                        </td>
                      </tr>
                    ) : filteredEmployees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={headers.length}
                          className="text-center py-3 text-sm text-gray-500"
                        >
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr
                          key={employee.employeeId}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleRowClick(employee)}
                          onMouseEnter={() =>
                            setHoveredEmployeeId(employee.employeeId)
                          }
                          onMouseLeave={() => setHoveredEmployeeId(null)}
                        >
                          {headers.map((header) => {
                            const cellValue = getCellValue(
                              employee,
                              header.key
                            );
                            return (
                              <td
                                key={`${employee.employeeId}-${header.key}`}
                                className="py-3 px-3 text-sm text-gray-800 relative max-w-xs"
                              >
                                {hoveredEmployeeId === employee.employeeId ? (
                                  <span className="block whitespace-normal break-words">
                                    {cellValue}
                                  </span>
                                ) : (
                                  <span
                                    className="block truncate"
                                    title={cellValue}
                                  >
                                    {cellValue}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal for Document View */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Passbook Document</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Passbook Document"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(Employees);
