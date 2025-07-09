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
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import { Search, UserPlus, Edit, Trash, Plus, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import SuperadminHeaders from "@/components/SuperadminHeaders";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";

function SuperadminModules() {
  const dispatch = useDispatch();

  // Move availableModules array here, right after state declarations
  const availableModules = [
    {
      id: 1,
      name: "HR Management",
      description: "Human Resource Management System",
      features: [
        "Employee Management",
        "Attendance Tracking",
        "Leave Management",
        "Performance Evaluation",
        "Recruitment",
        "Training Management"
      ]
    },
    {
      id: 2,
      name: "Accounting",
      description: "Financial Management and Accounting",
      features: [
        "Invoice Management",
        "Expense Tracking",
        "Financial Reporting",
        "Tax Management",
        "Budget Planning",
        "Audit Trail"
      ]
    },
    {
      id: 3,
      name: "Project Management",
      description: "Project Planning and Tracking",
      features: [
        "Task Management",
        "Timeline Tracking",
        "Resource Allocation",
        "Progress Monitoring",
        "Team Collaboration",
        "Milestone Management"
      ]
    },
    {
      id: 4,
      name: "Sales",
      description: "Sales Management and CRM",
      features: [
        "Lead Management",
        "Customer Database",
        "Sales Pipeline",
        "Quote Generation",
        "Order Processing",
        "Sales Analytics"
      ]
    },
    {
      id: 5,
      name: "Inventory",
      description: "Inventory and Stock Management",
      features: [
        "Stock Tracking",
        "Purchase Orders",
        "Supplier Management",
        "Warehouse Management",
        "Barcode Scanning",
        "Inventory Reports"
      ]
    },
    {
      id: 6,
      name: "Payroll",
      description: "Payroll Processing and Management",
      features: [
        "Salary Calculation",
        "Tax Deductions",
        "Benefits Management",
        "Payslip Generation",
        "Compliance Reporting",
        "Direct Deposit"
      ]
    }
  ];

  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- Stepper State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [featureSearch, setFeatureSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");

  const [selectedModule, setSelectedModule] = useState(null);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedModuleTypes, setSelectedModuleTypes] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef(null);
  const moduleDropdownRef = useRef(null);
  const [employeeError, setEmployeeError] = useState(null);

  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
  });

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
    setSelectedModuleTypes([]);
    setSelectedEmployees([]);
    setSelectedFeatures([]);
    setCurrentStep(1); // Reset to first step
    setIsAddModuleOpen(true);
  };

  const handleEditModule = (module) => {
    setIsEditMode(true);
    setSelectedModule(module);
    setSelectedCompany(module.company?.companyId);
    setSelectedModuleTypes([module.moduleName]);
    setSelectedEmployees(
      module.employees?.map((emp) => ({
        name: emp.name,
        employeeId: emp.employeeId,
      })) || []
    );
    setSelectedFeatures(module.features || []);
    setCurrentStep(1); // Reset to first step
    setIsAddModuleOpen(true);
  };

  const handleDeleteModule = async () => {
    if (!selectedModule) return;

    setIsLoading(true);
    try {
      await dispatch(deleteModule(selectedModule.moduleId)).unwrap();
      setSelectedModule(null);
      setIsAddModuleOpen(false);
      toast.success("Module deleted successfully!");
    } catch (error) {
      toast.error("Error deleting module");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!selectedCompany || selectedModuleTypes.length === 0)) {
      toast.error("Please select a company and at least one module.");
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleAssignModulesToCompany = async () => {
    if (!selectedCompany || selectedModuleTypes.length === 0) {
      toast.error("Please select company and at least one module");
      return;
    }

    setIsLoading(true);
    try {
      const modulePromises = selectedModuleTypes.map(moduleType => {
        const moduleData = {
          moduleName: moduleType,
          description: availableModules.find(m => m.name === moduleType)?.description || "",
          companyId: selectedCompany,
          employeeIds: selectedEmployees.map((employee) => employee.employeeId),
          features: selectedFeatures,
        };

        if (isEditMode && selectedModuleTypes.length === 1) {
          return dispatch(
            updateModule({
              moduleId: selectedModule.moduleId,
              moduleData,
            })
          ).unwrap();
        } else {
          return dispatch(addModule(moduleData)).unwrap();
        }
      });

      await Promise.all(modulePromises);
      
      if (isEditMode) {
        toast.success("Module updated successfully!");
      } else {
        toast.success(`${selectedModuleTypes.length} module(s) assigned to company successfully!`);
      }

      setSelectedCompany(null);
      setSelectedModuleTypes([]);
      setSelectedEmployees([]);
      setSelectedFeatures([]);
      setIsAddModuleOpen(false);
      setIsEditMode(false);
    } catch (error) {
      toast.error("Error saving module(s)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleEmployeeToggle = (employee) => {
    setSelectedEmployees((prev) => {
      const isSelected = prev.some((emp) => emp.employeeId === employee.employeeId);
      if (isSelected) {
        return prev.filter((emp) => emp.employeeId !== employee.employeeId);
      } else {
        return [...prev, employee];
      }
    });
  };

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

    setIsLoading(true);
    try {
      const formData = new FormData();
      const employeeData = {
        name: newAdminData.name.trim(),
        emailPersonal: newAdminData.email.trim(),
        phone: newAdminData.phone.replace(/\D/g, ""),
        companyId: newAdminData.companyId,
      };

      formData.append("employee", JSON.stringify(employeeData));
      await dispatch(createEmployee(formData)).unwrap();
      await dispatch(fetchEmployees());

      setNewAdminData({ name: "", email: "", phone: "", companyId: "" });
      setIsAddAdminModalOpen(false);
      toast.success("Admin created successfully!");
    } catch (error) {
      toast.error("Failed to create admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleToggle = (moduleType) => {
    setSelectedModuleTypes(prev => {
      const isSelected = prev.includes(moduleType);
      if (isSelected) {
        const newTypes = prev.filter(type => type !== moduleType);
        if (newTypes.length === 0) {
          setSelectedFeatures([]);
        }
        return newTypes;
      } else {
        return [...prev, moduleType];
      }
    });
  };

  const getSelectedModulesFeatures = () => {
    const allFeatures = selectedModuleTypes.reduce((acc, moduleType) => {
      const moduleData = availableModules.find(m => m.name === moduleType);
      if (moduleData) {
        acc.push(...moduleData.features);
      }
      return acc;
    }, []);
    
    return [...new Set(allFeatures)];
  };

  const filteredFeatures = getSelectedModulesFeatures().filter(feature =>
    feature.toLowerCase().includes(featureSearch.toLowerCase())
  );

  const filteredEmployees = (employees || []).filter(employee =>
    employee.name.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredModules = (modules || []).filter((module) =>
    module?.moduleName?.toLowerCase().includes(searchInput?.toLowerCase() || "")
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <SuperadminHeaders />
      
      <div className="flex-1 pt-16">
        <div className="p-6 mt-4">
          {/* Header with Search and Add button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Modules</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search modules..."
                  className="w-full md:w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <button
                onClick={handleOpenAddModule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Assign Module
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Features
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Admins
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredModules.map((module) => (
                    <tr
                      key={module.moduleId}
                      className={`hover:bg-gray-50 ${
                        selectedModule?.moduleId === module.moduleId ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="radio"
                          name="module"
                          checked={selectedModule?.moduleId === module.moduleId}
                          onChange={() => {
                            setSelectedModule(
                              selectedModule?.moduleId === module.moduleId ? null : module
                            );
                          }}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {module.moduleName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {module.company?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {(module.features || []).slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {feature}
                            </span>
                          ))}
                          {(module.features || []).length > 3 && (
                            <span className="text-xs text-gray-400">+{(module.features || []).length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center -space-x-2">
                          {Array.isArray(module.employees) && module.employees.length > 0 ? (
                            module.employees.slice(0, 3).map((emp) => (
                              <div key={emp.employeeId} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600" title={emp.name}>
                                {emp.name.charAt(0).toUpperCase()}
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No admins</span>
                          )}
                          {Array.isArray(module.employees) && module.employees.length > 3 && (
                            <div className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                              +{module.employees.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditModule(module)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Module"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedModule(module);
                              handleDeleteModule();
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Module"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Assign/Edit Module Modal with Stepper */}
      <Modal
        isOpen={isAddModuleOpen}
        onClose={() => {
          setIsAddModuleOpen(false);
        }}
        title={isEditMode ? "Edit Module Assignment" : "Assign Module to Company"}
      >
        <div className="space-y-6">
          {/* Stepper Header */}
          <div className="flex justify-between items-center border-b pb-3">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
              <span className="ml-2 font-medium">Selection</span>
            </div>
            <div className={`flex-1 h-px mx-4 ${currentStep > 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
              <span className="ml-2 font-medium">Features</span>
            </div>
            <div className={`flex-1 h-px mx-4 ${currentStep > 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
              <span className="ml-2 font-medium">Admins</span>
            </div>
          </div>

          {/* Step 1: Company and Module Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <Select
                  onValueChange={(value) => setSelectedCompany(value)}
                  value={selectedCompany || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((company) => (
                      <SelectItem key={company.companyId} value={company.companyId}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Multi-Module Selection Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modules *
                  <span className="text-xs text-gray-500 ml-2">
                    (Multiple modules can be selected)
                  </span>
                </label>
                <div className="relative" ref={moduleDropdownRef}>
                  <button
                    type="button"
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
                    onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
                  >
                    <span>
                      {selectedModuleTypes.length > 0
                        ? `${selectedModuleTypes.length} module(s) selected`
                        : "Select Modules"}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isModuleDropdownOpen ? "transform rotate-180" : ""
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
                  
                  {isModuleDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {/* Select All Option */}
                      <div className="flex items-center px-3 py-2 hover:bg-gray-50 border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedModuleTypes.length === availableModules.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModuleTypes(availableModules.map(m => m.name));
                            } else {
                              setSelectedModuleTypes([]);
                              setSelectedFeatures([]);
                            }
                          }}
                          className="mr-3 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Select All Modules</span>
                      </div>

                      {/* Module List */}
                      {availableModules.map((module) => (
                        <div
                          key={module.id}
                          className="flex items-start px-3 py-2 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedModuleTypes.includes(module.name)}
                            onChange={() => handleModuleToggle(module.name)}
                            className="mr-3 mt-1 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">{module.name}</div>
                            <div className="text-xs text-gray-500">{module.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Display Selected Modules */}
                {selectedModuleTypes.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {selectedModuleTypes.map((moduleType, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {moduleType}
                          <button
                            onClick={() => handleModuleToggle(moduleType)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Feature Selection */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-sm font-medium text-gray-700">
                Assign Features
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search features..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                {filteredFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`feature-${idx}`}
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor={`feature-${idx}`} className="text-sm text-gray-700">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Admin Assignment */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-sm font-medium text-gray-700">
                Assign Admins to Module
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search admins..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                {filteredEmployees.map((employee) => (
                  <div key={employee.employeeId} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.some(
                        (emp) => emp.employeeId === employee.employeeId
                      )}
                      onChange={() => handleEmployeeToggle(employee)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{employee.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Stepper Navigation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddModuleOpen(false)}
                className="px-4 py-2 text-gray-700"
              >
                Cancel
              </button>
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleAssignModulesToCompany}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : isEditMode ? "Update Assignment" : "Assign Modules"}
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        title="Add Admin"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              placeholder="Admin Name"
              value={newAdminData.name}
              onChange={(e) =>
                setNewAdminData({ ...newAdminData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              placeholder="Admin Email"
              value={newAdminData.email}
              onChange={(e) =>
                setNewAdminData({ ...newAdminData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              placeholder="Admin Phone"
              value={newAdminData.phone}
              onChange={(e) =>
                setNewAdminData({ ...newAdminData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company *
            </label>
            <Select
              onValueChange={(value) =>
                setNewAdminData({ ...newAdminData, companyId: value })
              }
              value={newAdminData.companyId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                {companies?.map((company) => (
                  <SelectItem key={company.companyId} value={company.companyId}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => setIsAddAdminModalOpen(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddAdmin}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Admin"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(SuperadminModules, ["Superadmin"]);
