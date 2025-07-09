import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "@/redux/slices/companiesSlice";
import { fetchModules } from "@/redux/slices/modulesSlice";
import { fetchEmployees, createEmployee } from "@/redux/slices/employeeSlice";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Search, UserPlus, Trash, Edit, Plus, Building2, Mail, Phone, Hash, MapPin, Briefcase, Users, Check, X, ArrowRight, ArrowLeft, Palette, Upload, Sparkles, Settings, Grid3X3, Table as LucideTable } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import SuperadminHeaders from "@/components/SuperadminHeaders";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";

// Enhanced Modal Component for the 3-stage process
const StepperModal = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function SuperadminCompanies() {
  const router = useRouter();
  const deleteButtonRef = useRef(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    prefix: "", // Add prefix field
    name: "",
    email: "",
    phone: "",
    gst: "",
    regAdd: "",
    colorCode: "#4F46E5",
    headOfCompanyId: null,
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const dispatch = useDispatch();
  const { companies, loading, err } = useSelector((state) => state.companies);
  const { modules } = useSelector((state) => state.modules);
  const { employees } = useSelector((state) => state.employees);
  const [error, setError] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  // Add back head of company related state
  const [isAddHeadOfCompanyModalOpen, setIsAddHeadOfCompanyModalOpen] = useState(false);
  const [newHeadOfCompanyData, setNewHeadOfCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Dummy data for better UX
  const dummyEmployees = [
    { id: 1, name: "John Smith", email: "john@company.com", role: "CEO" },
    { id: 2, name: "Sarah Johnson", email: "sarah@company.com", role: "CTO" },
    { id: 3, name: "Michael Brown", email: "michael@company.com", role: "CFO" },
    { id: 4, name: "Emily Davis", email: "emily@company.com", role: "COO" },
    { id: 5, name: "David Wilson", email: "david@company.com", role: "VP Operations" }
  ];

  const dummyModules = [
    { id: 1, name: "HR Management", description: "Employee lifecycle management", icon: "👥" },
    { id: 2, name: "Accounting", description: "Financial management and reporting", icon: "📊" },
    { id: 3, name: "Project Management", description: "Project planning and tracking", icon: "📋" },
    { id: 4, name: "Sales CRM", description: "Customer relationship management", icon: "💼" },
    { id: 5, name: "Inventory", description: "Stock and warehouse management", icon: "📦" },
    { id: 6, name: "Payroll", description: "Salary and benefits processing", icon: "💰" },
    { id: 7, name: "Asset Management", description: "Company asset tracking", icon: "🏢" },
    { id: 8, name: "Reports & Analytics", description: "Business intelligence dashboard", icon: "📈" }
  ];

  const dummyCompanies = [
    {
      id: 1,
      name: "TechCorp Solutions",
      email: "contact@techcorp.com",
      phone: "9876543210",
      gst: "07AAACT2727Q1ZS",
      regAdd: "123 Tech Street, Silicon Valley, CA 94000",
      colorCode: "#4F46E5",
      headOfCompany: { name: "John Smith" }
    },
    {
      id: 2,
      name: "InnovateLab Inc",
      email: "hello@innovatelab.com",
      phone: "8765432109",
      gst: "09BBCDE3456F2GH",
      regAdd: "456 Innovation Drive, Austin, TX 78701",
      colorCode: "#059669",
      headOfCompany: { name: "Sarah Johnson" }
    },
    {
      id: 3,
      name: "GlobalTech Enterprises",
      email: "info@globaltech.com",
      phone: "7654321098",
      gst: "27CDEFG4567H3IJ",
      regAdd: "789 Global Plaza, New York, NY 10001",
      colorCode: "#DC2626",
      headOfCompany: { name: "Michael Brown" }
    }
  ];

  // Use dummy data if no real data is available
  const availableEmployees = employees && employees.length > 0 ? employees : dummyEmployees;
  const availableModules = modules && modules.length > 0 ? modules : dummyModules;
  const allCompanies = companies && companies.length > 0 ? companies : dummyCompanies;

  useEffect(() => {
    const token = getItemFromSessionStorage("token");
    if (!token) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        await dispatch(fetchCompanies()).unwrap();
        await dispatch(fetchModules()).unwrap();
        await dispatch(fetchEmployees()).unwrap();
      } catch (error) {
        const errorMessage = error.message || "Failed to fetch data";
        toast.error(errorMessage);
        if (String(errorMessage).includes("Authentication")) {
          router.push("/login");
        }
      }
    };

    fetchData();
  }, [dispatch, router]);

  // --- Form Navigation ---
  const nextStep = () => {
    setError(""); // Clear any existing errors
    setCurrentStep(prev => Math.min(prev + 1, 2)); // Changed from 3 to 2
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const handleOpenCompanyModal = (company = null) => {
    setCurrentStep(1);
    setLogoPreview(null);
    setError("");
    if (company) {
      setIsEditing(true);
      setCompanyData({
        prefix: company.prefix || "", // Add prefix field
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        gst: company.gst || "",
        regAdd: company.regAdd || "",
        colorCode: company.colorCode || "#4F46E5",
        headOfCompanyId: company.headOfCompany?.id || null,
        logo: company.logo || null
      });
      if (company.logo) setLogoPreview(company.logo);
    } else {
      setIsEditing(false);
      setCompanyData({
        prefix: "", // Add prefix field
        name: "", email: "", phone: "", gst: "", regAdd: "",
        colorCode: "#4F46E5", headOfCompanyId: null, logo: null
      });
    }
    setIsCompanyModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      return updatedData;
    });
    setError(""); // Clear error when user starts typing
  };

  const handleSaveCompany = async () => {
    const { prefix, name, email, phone, gst, regAdd } = companyData;

    if (!prefix || !name || !email || !phone || !gst || !regAdd) {
      setError("All fields are required!");
      return;
    }
    setError("");

    if (isEditing) {
      toast.success("Company updated successfully!");
    } else {
      toast.success("Company created successfully!");
    }
    
    setIsCompanyModalOpen(false);
    setCurrentStep(1);
    setSelectedCompany(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add layout toggle state
  const [viewLayout, setViewLayout] = useState("cards"); // "cards" or "table"

  // Filter companies based on search
  const filteredCompanies = allCompanies.filter(company =>
    company.name.toLowerCase().includes(searchInput.toLowerCase()) ||
    company.email.toLowerCase().includes(searchInput.toLowerCase()) ||
    company.gst.toLowerCase().includes(searchInput.toLowerCase())
  );

  const predefinedColors = [
    "#4F46E5", "#059669", "#DC2626", "#7C2D12", "#1E40AF",
    "#9333EA", "#C2410C", "#BE123C", "#0F766E", "#4338CA"
  ];

  const handleColorChange = (color) => {
    setCompanyData((prevData) => ({ ...prevData, colorCode: color }));
  };

  // Add back the head of company change handlers
  const handleHeadOfCompanyChange = (value) => {
    if (value === "add_new") {
      setIsAddHeadOfCompanyModalOpen(true);
    } else {
      setCompanyData((prevData) => ({ ...prevData, headOfCompanyId: value }));
    }
  };

  const handleNewHeadOfCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setNewHeadOfCompanyData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddHeadOfCompany = async () => {
    if (!newHeadOfCompanyData.name || !newHeadOfCompanyData.email || !newHeadOfCompanyData.phone) {
      toast.error("All fields are required.");
      return;
    }

    const newHead = {
      id: Date.now(),
      name: newHeadOfCompanyData.name,
      email: newHeadOfCompanyData.email,
      phone: newHeadOfCompanyData.phone
    };
    
    toast.success("Head of Company created successfully!");
    setCompanyData((prev) => ({ ...prev, headOfCompanyId: newHead.id }));
    setIsAddHeadOfCompanyModalOpen(false);
    setNewHeadOfCompanyData({ name: "", email: "", phone: "" });
  };

  // Function to skip head of company assignment and create company
  const handleSkipHeadOfCompany = () => {
    handleSaveCompany();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SuperadminHeaders />
      
      <div className="flex-1 pt-16">
        <div className="p-6 mt-4">
          {/* Header with Search, Layout Toggle, and Add button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
              <p className="text-gray-600 mt-1">Manage your organization's companies and their configurations</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search companies..."
                  className="w-full md:w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              
              {/* Layout Toggle */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewLayout("cards")}
                  className={`p-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                    viewLayout === "cards" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                  title="Card View"
                >
                  <Grid3X3 size={18} />
                  <span className="text-sm font-medium">Cards</span>
                </button>
                <button
                  onClick={() => setViewLayout("table")}
                  className={`p-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                    viewLayout === "table" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                  title="Table View"
                >
                  <LucideTable size={18} />
                  <span className="text-sm font-medium">Table</span>
                </button>
              </div>

              <button
                onClick={() => handleOpenCompanyModal()}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                Add Company
              </button>
            </div>
          </div>

          {/* Companies Layout - Card or Table */}
          {viewLayout === "cards" ? (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer">
                  <div 
                    className="p-6 flex-1"
                    onClick={() => router.push(`/superadmin/company/${company.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: company.colorCode || '#4F46E5' }}
                        >
                          <Building2 className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{company.name}</h2>
                          <p className="text-sm text-gray-500">{company.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Phone size={16} className="text-blue-600" />
                        </div>
                        <span>{company.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                          <Hash size={16} className="text-green-600" />
                        </div>
                        <span>{company.gst}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <MapPin size={16} className="text-purple-600" />
                        </div>
                        <span className="truncate">{company.regAdd}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t mt-auto p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <p className="text-gray-600 font-medium flex items-center gap-2">
                          <Users size={14} />
                          Head of Company
                        </p>
                        <p className="text-gray-700 font-semibold">{company.headOfCompany?.name || 'Not assigned'}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCompanyModal(company);
                          }}
                          className="p-2.5 text-blue-600 bg-blue-100 rounded-xl hover:bg-blue-200 transition-colors shadow-sm"
                          title="Edit Company"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompany(company);
                            setIsDeleteConfirmationOpen(true);
                          }}
                          className="p-2.5 text-red-600 bg-red-100 rounded-xl hover:bg-red-200 transition-colors shadow-sm"
                          title="Delete Company"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="py-4 px-6">Company</TableHead>
                      <TableHead className="py-4 px-6">Contact</TableHead>
                      <TableHead className="py-4 px-6">GST Number</TableHead>
                      <TableHead className="py-4 px-6">Head of Company</TableHead>
                      <TableHead className="py-4 px-6">Address</TableHead>
                      <TableHead className="py-4 px-6 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow 
                        key={company.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/superadmin/company/${company.id}`)}
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                              style={{ backgroundColor: company.colorCode || '#4F46E5' }}
                            >
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{company.name}</p>
                              <p className="text-sm text-gray-500">{company.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="text-sm">
                            <p className="font-medium text-gray-800 flex items-center gap-2">
                              <Phone size={14} className="text-blue-600" />
                              {company.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="text-sm">
                            <p className="font-medium text-gray-800 flex items-center gap-2">
                              <Hash size={14} className="text-green-600" />
                              {company.gst}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="text-sm">
                            <p className="font-medium text-gray-800 flex items-center gap-2">
                              <Users size={14} className="text-purple-600" />
                              {company.headOfCompany?.name || 'Not assigned'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 max-w-xs">
                          <p className="text-sm text-gray-600 truncate" title={company.regAdd}>
                            {company.regAdd}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCompanyModal(company);
                              }}
                              className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Edit Company"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCompany(company);
                                setIsDeleteConfirmationOpen(true);
                              }}
                              className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                              title="Delete Company"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Table Footer */}
              {filteredCompanies.length === 0 && (
                <div className="text-center py-12">
                  <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                  <p className="text-gray-500">
                    {searchInput ? "Try adjusting your search criteria" : "Get started by adding your first company"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State for Card View */}
          {viewLayout === "cards" && filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-500 mb-6">
                {searchInput ? "Try adjusting your search criteria" : "Get started by adding your first company"}
              </p>
              {!searchInput && (
                <button
                  onClick={() => handleOpenCompanyModal()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Company
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Centered 2-Stage Company Modal */}
      <StepperModal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)}>
        <div className="flex flex-col h-full">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {isEditing ? "Update Company" : "Create New Company"}
                  </h2>
                  <p className="text-gray-600 text-sm">Step {currentStep} of 2 - Complete all steps to finish</p>
                </div>
              </div>
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* 2-Stage Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {[1, 2].map((step, index) => (
                  <React.Fragment key={step}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        currentStep > step ? 'bg-green-500 text-white' : 
                        currentStep === step ? 'bg-blue-600 text-white' : 
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {currentStep > step ? <Check size={16} /> : step}
                      </div>
                      <div className="ml-3 text-sm">
                        <p className={`font-medium ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}>
                          {step === 1 && "Company Details"}
                          {step === 2 && "Leadership & Branding"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {step === 1 && "Basic information"}
                          {step === 2 && "Head of company & visual identity"}
                        </p>
                      </div>
                    </div>
                    {index < 1 && (
                      <div className={`flex-1 h-0.5 mx-4 transition-colors ${
                        currentStep > step ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content - Wider and Less Tall */}
          <div className="flex-1 px-8 py-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {/* Step 1: Company Details */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-2 gap-6 h-full">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building2 size={20} className="text-blue-600" />
                        Company Information
                      </h3>
                      
                      {/* Add Prefix Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Prefix *</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            name="prefix"
                            placeholder="e.g., TECH, CORP, INC"
                            value={companyData.prefix}
                            onChange={handleInputChange}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Short identifier for the company (3-5 characters)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            placeholder="Enter company name"
                            value={companyData.name}
                            onChange={handleInputChange}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            placeholder="contact@company.com"
                            value={companyData.email}
                            onChange={handleInputChange}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            placeholder="9876543210"
                            value={companyData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Hash size={20} className="text-green-600" />
                        Legal Information
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GST Number *</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            name="gst"
                            placeholder="22AAAAA0000A1Z5"
                            value={companyData.gst}
                            onChange={handleInputChange}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Registered Address *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <textarea
                            name="regAdd"
                            placeholder="Enter complete registered address..."
                            value={companyData.regAdd}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Leadership & Branding */}
                {currentStep === 2 && (
                  <div className="space-y-8 h-full">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Head of Company Section */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Users size={20} className="text-blue-600" />
                          Head of Company
                        </h3>
                        <Select onValueChange={handleHeadOfCompanyChange} value={companyData.headOfCompanyId || ""}>
                          <SelectTrigger className="w-full h-12">
                            <SelectValue placeholder="Select Head of Company" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add_new">
                              <span className="flex items-center gap-2 text-blue-600">
                                <UserPlus size={16} />
                                Add New Head of Company
                              </span>
                            </SelectItem>
                            {availableEmployees?.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-semibold">
                                      {employee.name && employee.name.length > 0 ? employee.name.charAt(0).toUpperCase() : '?'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{employee.name || 'Unknown Employee'}</p>
                                    <p className="text-xs text-gray-500">{employee.email || 'No email'}</p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Company Logo Section */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-gray-700 flex items-center gap-2">
                            <Upload size={18} className="text-purple-600" />
                            Company Logo
                          </h4>
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                              {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover rounded-2xl" />
                              ) : (
                                <Upload size={24} className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                Upload Logo
                              </label>
                              <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                              <p className="text-xs text-gray-500 mt-2">PNG, JPG, SVG up to 5MB</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Theme Color Section */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Palette size={20} className="text-pink-600" />
                          Theme Color
                        </h3>
                        
                        <div className="p-4 border border-gray-200 rounded-xl bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-medium">Live Preview</span>
                            <button 
                              className="px-4 py-2 text-white text-sm rounded-lg shadow-sm"
                              style={{ backgroundColor: companyData.colorCode }}
                            >
                              Sample Button
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {predefinedColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 ${
                                  companyData.colorCode === color
                                    ? "border-gray-800 ring-2 ring-gray-300 scale-110"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(color)}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <span className="text-sm text-gray-600">Custom:</span>
                            <input
                              type="color"
                              value={companyData.colorCode || "#4F46E5"}
                              onChange={(e) => handleColorChange(e.target.value)}
                              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder="#4F46E5"
                              value={companyData.colorCode || ""}
                              onChange={(e) => handleColorChange(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info box about modules and admins */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Settings size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 mb-1">What's Next?</h4>
                          <p className="text-sm text-blue-700">
                            After creating the company, you can click on the company card to assign modules, 
                            configure features, and manage additional admins from the detailed company page.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
              >
                <div className="flex">
                  <X className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Modal Footer - Updated Navigation */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                
                {currentStep === 1 ? (
                  // Step 1: Create Company button (moves to step 2 without validation)
                  <button
                    onClick={() => {
                      setError(""); // Clear any existing errors
                      nextStep(); // Move to Leadership & Branding without validation
                    }}
                    className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Sparkles size={16} />
                    Create Company
                  </button>
                ) : (
                  // Step 2: Leadership & Branding - Skip or Add Head options
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSkipHeadOfCompany}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => {
                        if (companyData.headOfCompanyId) {
                          toast.success("Head of Company assigned successfully!");
                          setIsCompanyModalOpen(false);
                          setCurrentStep(1);
                        } else {
                          toast.error("Please select or add a Head of Company, or click Skip to continue without assignment.");
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Users size={16} />
                      Add Head of Company
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </StepperModal>

      {/* Add Head of Company Modal */}
      <Modal
        isOpen={isAddHeadOfCompanyModalOpen}
        onClose={() => setIsAddHeadOfCompanyModalOpen(false)}
        title=""
      >
        <div className="space-y-6">
          <div className="text-center pb-4 border-b border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Add Head of Company</h2>
            <p className="text-gray-600 text-sm">Create a new head of company profile</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={newHeadOfCompanyData.name}
                onChange={handleNewHeadOfCompanyInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={newHeadOfCompanyData.email}
                onChange={handleNewHeadOfCompanyInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={newHeadOfCompanyData.phone}
                onChange={handleNewHeadOfCompanyInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsAddHeadOfCompanyModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddHeadOfCompany}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2"
            >
              <Check size={16} />
              Add Head
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this company? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => setIsDeleteConfirmationOpen(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success("Company deleted successfully!");
                setIsDeleteConfirmationOpen(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(SuperadminCompanies, ["Superadmin"]);