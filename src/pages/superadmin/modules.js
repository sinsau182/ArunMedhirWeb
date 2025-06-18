import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchModules,
  fetchEmployees,
  addModule,
  updateModule,
  deleteModule,
} from "@/redux/slices/modulesSlice";
import { fetchCompanies } from "@/redux/slices/companiesSlice";
import { createEmployee } from "@/redux/slices/employeeSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import { Search, UserPlus, Edit, Trash } from "lucide-react";
import SuperadminHeaders from "@/components/SuperadminHeaders";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";


function SuperadminModules() {
  const dispatch = useDispatch();

  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedModule, setSelectedModule] = useState(null);

  const [moduleName, setModuleName] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef(null);
  const [employeeError, setEmployeeError] = useState(null);

  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

  const {
    modules,
    employees,
    loading: modulesLoading,
    error: modulesError,
  } = useSelector((state) => state.modules);
  const {
    companies,
    loading: companiesLoading,
    error: companiesError,
  } = useSelector((state) => state.companies);

  // Add console logging
  useEffect(() => {
    console.log("Current employees:", employees);
  }, [employees]);

  useEffect(() => {
    if (modulesError) {
      setEmployeeError(modulesError);
    }
  }, [modulesError]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchModules()),
          dispatch(fetchCompanies()),
          dispatch(fetchEmployees()),
        ]);
      } catch (error) {
        toast.error("Error fetching data: " + error.message);
        setEmployeeError(error.message);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleOpenAddModule = () => {
    setIsEditMode(false);
    setSelectedModule(null);
    setSelectedCompany(null);
    setSelectedEmployees([]);
    setModuleName("");
    setModuleDescription("");
    setIsAddModuleOpen(true);
  };

  const handleEditModule = () => {
    if (!selectedModule) return;
    setIsEditMode(true);
    setModuleName(selectedModule.moduleName);
    setModuleDescription(selectedModule.description);
    setSelectedCompany(selectedModule.company.companyId);
    setSelectedEmployees(
      selectedModule.employees.map((emp) => ({
        name: emp.name,
        employeeId: emp.employeeId,
      }))
    );
    setIsAddModuleOpen(true);
  };

  const handleDeleteModule = async () => {
    if (
      !selectedModule ||
      !window.confirm("Are you sure you want to delete this module?")
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(deleteModule(selectedModule.moduleId)).unwrap();
      // Reset selection and close modal
      setSelectedModule(null);
      setIsAddModuleOpen(false);
    } catch (error) {
      toast.error("Error deleting module:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleAddOrUpdateModule
  const handleAddOrUpdateModule = async () => {
    if (!moduleName || !moduleDescription || !selectedCompany) {
      return;
    }

    setIsLoading(true);
    try {
      const moduleData = {
        moduleName: moduleName.trim(),
        description: moduleDescription.trim(),
        companyId: selectedCompany,
        employeeIds: selectedEmployees.map((employee) => employee.employeeId),
      };

      if (isEditMode) {
        // Update existing module
        await dispatch(
          updateModule({
            moduleId: selectedModule.moduleId,
            moduleData,
          })
        ).unwrap();
      } else {
        // Create new module
        await dispatch(addModule(moduleData)).unwrap();
      }

      // Reset form and close modal
      setModuleName("");
      setModuleDescription("");
      setSelectedCompany(null);
      setSelectedEmployees([]);
      setIsAddModuleOpen(false);
      setIsEditMode(false);
    } catch (error) {
      toast.error("Error saving module:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModules = (modules || []).filter((module) =>
    module?.moduleName?.toLowerCase().includes(searchInput?.toLowerCase() || "")
  );

  // Add new state for Add Admin modal
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
  });

  // Add handleAddAdmin function
  const handleAddAdmin = async () => {
    if (
      !newAdminData.name ||
      !newAdminData.email ||
      !newAdminData.phone ||
      !newAdminData.companyId
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newAdminData.phone.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData object
      const formData = new FormData();

      // Add employee data as a JSON string
      const employeeData = {
        name: newAdminData.name.trim(),
        emailPersonal: newAdminData.email.trim(),
        phone: newAdminData.phone.replace(/\D/g, ""),
        companyId: newAdminData.companyId,
      };

      formData.append("employee", JSON.stringify(employeeData));

      await dispatch(createEmployee(formData)).unwrap();

      // Refresh the employees list
      await dispatch(fetchEmployees());

      // Reset form and close modal
      setNewAdminData({
        name: "",
        email: "",
        phone: "",
        companyId: "",
      });
      setIsAddAdminModalOpen(false);

      toast.success("Admin added successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error || "Failed to add admin.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add click outside handler for employee dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setIsEmployeeDropdownOpen(false);
      }
    };

    if (isEmployeeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEmployeeDropdownOpen]);

  return (
    <div className="bg-white text-[#4a4a4a] max-h-screen">
      <SuperadminHeaders />
      <div className="p-5">
        <div className="mt-6 p-4 rounded-lg bg-white">
          <div className="mt-4 p-4 rounded-lg flex justify-between items-center">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-1.5 text-gray-800 border border-gray-500 rounded-lg bg-white"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              />
            </div>
            <div className="flex space-x-10 mr-16">
              <div className="flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105">
                <UserPlus
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={handleOpenAddModule}
                />
                <span className="text-xs text-[#4a4a4a]">Add</span>
              </div>
              <div
                className={`flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${
                  !selectedModule ? "opacity-20 pointer-events-none" : ""
                }`}
              >
                <Edit
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={handleEditModule}
                />
                <span className="text-xs text-[#4a4a4a]">Edit</span>
              </div>
              <div
                className={`flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${
                  !selectedModule ? "opacity-20 pointer-events-none" : ""
                }`}
              >
                <Trash
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={handleDeleteModule}
                />
                <span className="text-xs text-[#4a4a4a]">Delete</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2 rounded-lg">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <ClientOnlyTable>
                  <TableHeader className="shadow-md">
                    <TableRow className="bg-[#E2E8F0]">
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Name
                      </TableHead>
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Description
                      </TableHead>
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Company
                      </TableHead>
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Admins
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No modules found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredModules.map((module) => (
                        <TableRow
                          key={module.moduleId}
                          className={`cursor-pointer ${
                            selectedModule?.moduleId === module.moduleId
                              ? "bg-gray-100"
                              : ""
                          }`}
                          onClick={() => setSelectedModule(module)}
                        >
                          <TableCell className="px-6 py-4">
                            {module.moduleName}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {module.description}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {module.company.name}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {Array.isArray(module.employees) &&
                            module.employees.length > 0
                              ? module.employees
                                  .map((employee) => employee.name)
                                  .join(", ")
                              : "No admins assigned"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </ClientOnlyTable>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add/Edit Module Modal */}
      <Modal
        isOpen={isAddModuleOpen}
        onClose={() => {
          setIsAddModuleOpen(false);
          setIsEditMode(false);
          setModuleName("");
          setModuleDescription("");
          setSelectedCompany(null);
          setSelectedEmployees([]);
        }}
      >
        <div className="p-6 bg-gray-100 text-black rounded-lg">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditMode ? "Edit Module" : "Add Module"}
            </h2>
            {isEditMode && (
              <button
                onClick={handleDeleteModule}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            )}
          </div>

          {/* Company Name Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <Select
              onValueChange={(value) => {
                const company = companies.find((c) => c.name === value);
                setSelectedCompany(company?.companyId || null);
              }}
              value={
                companies.find((c) => c.companyId === selectedCompany)?.name ||
                ""
              }
            >
              <SelectTrigger className="bg-white text-gray-900 border border-gray-300 hover:border-blue-500 cursor-pointer rounded-md px-3 py-2">
                <span
                  className={`${
                    !selectedCompany ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {companies.find((c) => c.companyId === selectedCompany)
                    ?.name || "Select Company"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem
                    key={company.companyId}
                    value={company.name}
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 py-2 px-3"
                  >
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Module Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter module name"
              className="bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
            />
          </div>

          {/* Module Description Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter module description"
              className="bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2"
              value={moduleDescription}
              onChange={(e) => setModuleDescription(e.target.value)}
            />
          </div>

          {/* Admin Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Admins <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={employeeDropdownRef}>
              <button
                type="button"
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
                onClick={() =>
                  setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)
                }
              >
                <span>
                  {selectedEmployees.length > 0
                    ? `${selectedEmployees.length} admin(s) selected`
                    : "Select Admins"}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isEmployeeDropdownOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isEmployeeDropdownOpen && (
                <div
                  className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-[200px] overflow-hidden flex flex-col"
                  style={{ bottom: "auto" }}
                >
                  {/* Search Input */}
                  <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Employee List */}
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: "250px" }}
                  >
                    {/* Add Admin Button */}
                    <div className="sticky top-0 bg-white border-b border-gray-200">
                      <button
                        key="add-admin-button"
                        onClick={() => setIsAddAdminModalOpen(true)}
                        className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                      >
                        <UserPlus size={16} />
                        Add New Admin
                      </button>
                    </div>
                    {modulesLoading ? (
                      <div key="loading" className="px-3 py-2 text-gray-500">
                        Loading employees...
                      </div>
                    ) : employeeError ? (
                      <div key="error" className="px-3 py-2 text-red-500">
                        {employeeError}
                      </div>
                    ) : employees && employees.length > 0 ? (
                      employees
                        .filter(
                          (employee) =>
                            employee.name
                              .toLowerCase()
                              .includes(searchInput.toLowerCase()) ||
                            employee.employeeId
                              .toLowerCase()
                              .includes(searchInput.toLowerCase())
                        )
                        .map((employee) => (
                          <div
                            key={`employee-${employee.employeeId}`}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              id={`employee-${employee.employeeId}`}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              checked={selectedEmployees.some(
                                (e) => e.employeeId === employee.employeeId
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmployees((prev) => [
                                    ...prev,
                                    employee,
                                  ]);
                                } else {
                                  setSelectedEmployees((prev) =>
                                    prev.filter(
                                      (e) =>
                                        e.employeeId !== employee.employeeId
                                    )
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`employee-${employee.employeeId}`}
                              className="ml-2 text-sm text-gray-700 flex-grow cursor-pointer"
                            >
                              {employee.name}
                            </label>
                            <span className="text-xs text-gray-500">
                              {employee.employeeId}
                            </span>
                          </div>
                        ))
                    ) : (
                      <div
                        key="no-employees"
                        className="px-3 py-2 text-gray-500"
                      >
                        No employees found
                      </div>
                    )}
                  </div>

                  {/* Results count */}
                  <div className="sticky bottom-0 bg-white px-3 py-2 border-t border-gray-200 text-xs text-gray-500">
                    {employees &&
                      `Showing ${
                        employees.filter(
                          (employee) =>
                            employee.name
                              .toLowerCase()
                              .includes(searchInput.toLowerCase()) ||
                            employee.employeeId
                              .toLowerCase()
                              .includes(searchInput.toLowerCase())
                        ).length
                      } of ${employees.length} employees`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Employees Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedEmployees.map((employee) => (
              <div
                key={employee.employeeId}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
              >
                <span>{employee.name}</span>
                <button
                  onClick={() =>
                    setSelectedEmployees((prev) =>
                      prev.filter((e) => e.employeeId !== employee.employeeId)
                    )
                  }
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {employeeError && (
            <p className="mt-2 text-sm text-red-500">Error: {employeeError}</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setIsAddModuleOpen(false);
              setIsEditMode(false);
            }}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-200"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddOrUpdateModule}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isEditMode ? "Updating..." : "Adding..."}
              </span>
            ) : (
              <>{isEditMode ? "Update" : "Add"} Module</>
            )}
          </Button>
        </div>
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isAddAdminModalOpen}
        onClose={() => {
          setIsAddAdminModalOpen(false);
          setNewAdminData({
            name: "",
            email: "",
            phone: "",
            companyId: "",
          });
        }}
      >
        <div className="p-6 bg-gray-100 text-black rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Admin</h2>
          </div>

          {/* Company Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <Select
              onValueChange={(value) => {
                const company = companies.find((c) => c.name === value);
                setNewAdminData((prev) => ({
                  ...prev,
                  companyId: company?.companyId || "",
                }));
              }}
              value={
                companies.find((c) => c.companyId === newAdminData.companyId)
                  ?.name || ""
              }
            >
              <SelectTrigger className="bg-white text-gray-900 border border-gray-300 hover:border-blue-500 cursor-pointer rounded-md px-3 py-2">
                <span
                  className={
                    !newAdminData.companyId ? "text-gray-500" : "text-gray-900"
                  }
                >
                  {companies.find((c) => c.companyId === newAdminData.companyId)
                    ?.name || "Select Company"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem
                    key={company.companyId}
                    value={company.name}
                    className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 py-2 px-3"
                  >
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter admin name"
              value={newAdminData.name}
              onChange={(e) =>
                setNewAdminData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* Admin Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="Enter admin email"
              value={newAdminData.email}
              onChange={(e) =>
                setNewAdminData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* Admin Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              placeholder="Enter admin phone"
              value={newAdminData.phone}
              onChange={(e) =>
                setNewAdminData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* Modal Footer */}
          <div className="mt-6 flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddAdminModalOpen(false);
                setNewAdminData({
                  name: "",
                  email: "",
                  phone: "",
                  companyId: "",
                });
              }}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAdmin}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding Admin...
                </span>
              ) : (
                "Add Admin"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(SuperadminModules);
