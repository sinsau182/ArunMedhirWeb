import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Building2, Mail, Phone, Hash, MapPin, Users, Settings, 
  ArrowLeft, Edit, Plus, Check, X, Search, Trash, 
  UserPlus, Shield, ChevronDown, ChevronRight, Eye, Star,
  Database, Activity, Activity as ActivityIcon // <-- Import new icons
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SuperadminHeaders from "@/components/SuperadminHeaders";
import withAuth from "@/components/withAuth";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchEmployees, createEmployee } from "@/redux/slices/employeeSlice";

function CompanyDetails() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  // Enhanced company data with roles and permissions
  const [companyData, setCompanyData] = useState({
    id: 1,
    name: "TechCorp Solutions",
    email: "contact@techcorp.com",
    phone: "9876543210",
    gst: "07AAACT2727Q1ZS",
    regAdd: "123 Tech Street, Silicon Valley, CA 94000",
    colorCode: "#4F46E5",
    // Only required head of company details
    headOfCompany: { 
      id: 1, 
      name: "John Smith", 
      email: "john@techcorp.com", 
      phone: "9876543210"
    },
    roles: [
      {
        id: 1,
        name: "HR Manager",
        description: "Full access to all HR-related modules and functions.",
        assignedEntities: ["employees", "leaves", "attendance", "recruitment"],
        assignedActivities: ["manage_employees", "view_employees", "approve_leaves", "apply_leave", "view_leave_history", "mark_attendance", "view_attendance", "post_jobs", "conduct_interviews"],
      },
      {
        id: 2,
        name: "Finance Admin",
        description: "Manages payroll and expenses.",
        assignedEntities: ["payroll", "reports"],
        assignedActivities: ["process_payroll", "view_payroll", "generate_reports"],
      }
    ],
    assignedModules: [
      { 
        id: 1, 
        name: "HR Management", 
        icon: "👥", 
        enabledFeatures: ["Employee Management", "Attendance Tracking", "Leave Management"],
        admins: [
          { 
            id: 1, 
            name: "Alice Johnson", 
            email: "alice@techcorp.com", 
            role: "HR Manager",
            assignedFeatures: ["Employee Management", "Leave Management"]
          },
          { 
            id: 2, 
            name: "Bob Wilson", 
            email: "bob@techcorp.com", 
            role: "HR Assistant",
            assignedFeatures: ["Attendance Tracking"]
          }
        ]
      },
      { 
        id: 2, 
        name: "Accounting", 
        icon: "📊", 
        enabledFeatures: ["Invoice Management", "Expense Tracking"],
        admins: [
          { 
            id: 3, 
            name: "Carol Davis", 
            email: "carol@techcorp.com", 
            role: "Finance Manager",
            assignedFeatures: ["Invoice Management", "Expense Tracking"]
          }
        ]
      }
    ]
  });

  // Available modules with all possible features - these will be shown as cards
  const availableModules = [
    { 
      id: 1, 
      name: "HR Management", 
      description: "Human Resource Management System", 
      icon: "👥", 
      allFeatures: [
        "Employee Management", "Attendance Tracking", "Leave Management", 
        "Performance Evaluation", "Recruitment", "Training Management",
        "Payroll Processing", "Benefits Administration"
      ]
    },
    { 
      id: 2, 
      name: "Accounting", 
      description: "Financial Management and Accounting", 
      icon: "📊",
      allFeatures: [
        "Invoice Management", "Expense Tracking", "Financial Reporting", 
        "Tax Management", "Budget Planning", "Audit Trail",
        "Asset Management", "Vendor Management"
      ]
    },
    { 
      id: 3, 
      name: "Project Management", 
      description: "Project Planning and Tracking", 
      icon: "📋",
      allFeatures: [
        "Task Management", "Timeline Tracking", "Resource Allocation", 
        "Progress Monitoring", "Team Collaboration", "Milestone Management",
        "Risk Management", "Budget Tracking"
      ]
    },
    { 
      id: 4, 
      name: "Sales CRM", 
      description: "Customer relationship management", 
      icon: "💼",
      allFeatures: [
        "Lead Management", "Customer Database", "Sales Pipeline", 
        "Quote Generation", "Order Processing", "Sales Analytics",
        "Territory Management", "Commission Tracking"
      ]
    },
    { 
      id: 5, 
      name: "Inventory", 
      description: "Stock and warehouse management", 
      icon: "📦",
      allFeatures: [
        "Stock Tracking", "Purchase Orders", "Supplier Management", 
        "Warehouse Management", "Barcode Scanning", "Inventory Reports",
        "Low Stock Alerts", "Product Catalog"
      ]
    },
    { 
      id: 6, 
      name: "Payroll", 
      description: "Salary and benefits processing", 
      icon: "💰",
      allFeatures: [
        "Salary Calculation", "Tax Deductions", "Benefits Management", 
        "Payslip Generation", "Compliance Reporting", "Direct Deposit",
        "Overtime Tracking", "Bonus Management"
      ]
    }
  ];

  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [isAssignModuleModalOpen, setIsAssignModuleModalOpen] = useState(false);
  const [isAssignAdminModalOpen, setIsAssignAdminModalOpen] = useState(false);
  const [isCreateNewAdminInAssign, setIsCreateNewAdminInAssign] = useState(false);
  const [selectedModuleForAssignment, setSelectedModuleForAssignment] = useState(null);
  const [selectedModuleForAdmin, setSelectedModuleForAdmin] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedAdmins, setExpandedAdmins] = useState(new Set());

  // Enhanced state for module assignment with features
  const [moduleAssignmentData, setModuleAssignmentData] = useState({
    moduleId: null,
    selectedFeatures: []
  });

  // Enhanced state for admin assignment with features
  const [adminAssignmentData, setAdminAssignmentData] = useState({
    adminId: null,
    selectedFeatures: [],
    role: ""
  });

  const [newAdminData, setNewAdminData] = useState({
    name: "", email: "", phone: "", role: ""
  });

  const { employees } = useSelector((state) => state.employees);
  
  // Available admins (existing employees)
  const availableAdmins = [
    { id: 4, name: "David Brown", email: "david@techcorp.com", role: "IT Specialist" },
    { id: 5, name: "Emily White", email: "emily@techcorp.com", role: "Marketing Manager" },
    { id: 6, name: "Frank Miller", email: "frank@techcorp.com", role: "Operations Manager" }
  ];
  // Add new states for admin management
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState(null);
  const [editAdminData, setEditAdminData] = useState({
    selectedFeatures: [],
    role: ""
  });
  const [isRemoveAdminModalOpen, setIsRemoveAdminModalOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState(null);

  // Add new state for module detail view
  const [selectedModuleForDetail, setSelectedModuleForDetail] = useState(null);
  const [isModuleDetailOpen, setIsModuleDetailOpen] = useState(false);

  // Add state for feature filtering and admin filtering
  const [featureFilter, setFeatureFilter] = useState("");  // Remove "all" default
  const [adminFilter, setAdminFilter] = useState("");      // Keep empty for search

  // Add state for edit features modal
  const [isEditFeaturesModalOpen, setIsEditFeaturesModalOpen] = useState(false);
  const [selectedModuleForFeatures, setSelectedModuleForFeatures] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  // Add state for role management modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  
  // States for enhanced role management UI
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [expandedRoleEntities, setExpandedRoleEntities] = useState(new Set());

  // Constants for Roles & Permissions - Updated to include Accounting module
  const SYSTEM_ENTITIES = [
    // HR Management Entities
    { id: "employees", label: "Employees", description: "Employee management and records", icon: "👥", module: "HR Management" },
    { id: "attendance", label: "Attendance", description: "Time and attendance tracking", icon: "⏰", module: "HR Management" },
    { id: "leaves", label: "Leaves", description: "Leave management and approvals", icon: "🏖️", module: "HR Management" },
    { id: "performance", label: "Performance", description: "Performance reviews and evaluations", icon: "📊", module: "HR Management" },
    
    // Accounting Entities
    { id: "vendors", label: "Vendors", description: "Vendor management and records", icon: "🏭", module: "Accounting" },
    { id: "customers", label: "Customers", description: "Customer database and management", icon: "👤", module: "Accounting" },
    { id: "accounting_employees", label: "Employees", description: "Employee financial records and payroll", icon: "👥", module: "Accounting" },
    
    // System Administration Entities
    { id: "departments", label: "Departments", description: "Department structure and management", icon: "🏢", module: "Administration" },
    { id: "roles", label: "Roles", description: "User roles and permissions", icon: "🔐", module: "Administration" },
    { id: "settings", label: "Settings", description: "System configuration and settings", icon: "⚙️", module: "Administration" },
    { id: "reports", label: "Reports", description: "Report generation and analytics", icon: "📊", module: "Administration" },
    { id: "policies", label: "Policies", description: "Company policies and procedures", icon: "📜", module: "Administration" },
    { id: "audit_logs", label: "Audit Logs", description: "System audit and activity logs", icon: "🔍", module: "Administration" },
  ];

  const SYSTEM_ACTIVITIES = [
    // Employee Activities (HR Management)
    { id: "view_employees", label: "View Employees", entity: "employees" },
    { id: "manage_employees", label: "Manage Employees", entity: "employees" },
    { id: "update_employee", label: "Update Employee", entity: "employees" },
    { id: "assign_department", label: "Assign Department", entity: "employees" },
    { id: "update_job_detail", label: "Update Job Detail", entity: "employees" },
    { id: "reset_password", label: "Reset Password", entity: "employees" },
    { id: "deactivate_employee", label: "Deactivate Employee", entity: "employees" },
    { id: "terminate_employee", label: "Terminate Employee", entity: "employees" },
    { id: "reactivate_employee", label: "Reactivate Employee", entity: "employees" },
    { id: "upload_employee_docs", label: "Upload Employee Docs", entity: "employees" },
    { id: "assign_asset", label: "Assign Asset", entity: "employees" },
    { id: "assign_role_permission", label: "Assign Role Permission", entity: "employees" },
    
    // Attendance Activities
    { id: "mark_attendance", label: "Mark Attendance", entity: "attendance" },
    { id: "view_attendance", label: "View Attendance", entity: "attendance" },
    { id: "manage_attendance_policies", label: "Manage Attendance Policies", entity: "attendance" },
    { id: "approve_attendance", label: "Approve Attendance", entity: "attendance" },
    { id: "generate_attendance_reports", label: "Generate Attendance Reports", entity: "attendance" },
    
    // Leave Activities
    { id: "approve_leaves", label: "Approve Leaves", entity: "leaves" },
    { id: "apply_leave", label: "Apply Leave", entity: "leaves" },
    { id: "view_leave_history", label: "View Leave History", entity: "leaves" },
    { id: "manage_leave_policies", label: "Manage Leave Policies", entity: "leaves" },
    { id: "cancel_leave", label: "Cancel Leave", entity: "leaves" },
    { id: "view_team_leaves", label: "View Team Leaves", entity: "leaves" },
    
    // Performance Activities
    { id: "review_performance", label: "Review Performance", entity: "performance" },
    { id: "create_performance_goals", label: "Create Performance Goals", entity: "performance" },
    { id: "view_performance_reports", label: "View Performance Reports", entity: "performance" },
    { id: "conduct_appraisals", label: "Conduct Appraisals", entity: "performance" },
    
    // Vendor Activities (Accounting) - Updated: Removed "view_vendor_reports"
    { id: "create_vendor", label: "Create Vendor", entity: "vendors" },
    { id: "update_vendor", label: "Update Vendor", entity: "vendors" },
    { id: "view_vendor", label: "View Vendor", entity: "vendors" },
    { id: "delete_vendor", label: "Delete Vendor", entity: "vendors" },
    { id: "manage_vendor_payments", label: "Manage Vendor Payments", entity: "vendors" },
    { id: "approve_vendor_bills", label: "Approve Vendor Bills", entity: "vendors" },
    
    // Customer Activities (Accounting) - Updated: Removed "export_customer_data"
    { id: "create_customer", label: "Create Customer", entity: "customers" },
    { id: "update_customer", label: "Update Customer", entity: "customers" },
    { id: "view_customer", label: "View Customer", entity: "customers" },
    { id: "delete_customer", label: "Delete Customer", entity: "customers" },
    { id: "manage_customer_invoices", label: "Manage Customer Invoices", entity: "customers" },
    { id: "view_customer_history", label: "View Customer History", entity: "customers" },
    { id: "manage_customer_payments", label: "Manage Customer Payments", entity: "customers" },
    
    // Accounting Employee Activities - Updated: Only keeping expense-related activities
    { id: "manage_employee_expenses", label: "Manage Employee Expenses", entity: "accounting_employees" },
    { id: "approve_employee_expenses", label: "Approve Employee Expenses", entity: "accounting_employees" },
    
    // Department Activities
    { id: "manage_departments", label: "Manage Departments", entity: "departments" },
    { id: "view_departments", label: "View Departments", entity: "departments" },
    { id: "create_department", label: "Create Department", entity: "departments" },
    { id: "update_department", label: "Update Department", entity: "departments" },
    { id: "delete_department", label: "Delete Department", entity: "departments" },
    
    // Role Management Activities
    { id: "create_roles", label: "Create Roles", entity: "roles" },
    { id: "assign_permissions", label: "Assign Permissions", entity: "roles" },
    { id: "modify_roles", label: "Modify Roles", entity: "roles" },
    
    // Settings Activities
    { id: "manage_settings", label: "Manage Settings", entity: "settings" },
    { id: "configure_system", label: "Configure System", entity: "settings" },
    { id: "manage_integrations", label: "Manage Integrations", entity: "settings" },
    { id: "backup_restore", label: "Backup & Restore", entity: "settings" },
    
    // Reports Activities
    { id: "generate_reports", label: "Generate Reports", entity: "reports" },
    { id: "view_analytics", label: "View Analytics", entity: "reports" },
    { id: "export_data", label: "Export Data", entity: "reports" },
    { id: "create_custom_reports", label: "Create Custom Reports", entity: "reports" },
    
    // Policies Activities
    { id: "create_policies", label: "Create Policies", entity: "policies" },
    { id: "update_policies", label: "Update Policies", entity: "policies" },
    { id: "view_policies", label: "View Policies", entity: "policies" },
    { id: "enforce_policies", label: "Enforce Policies", entity: "policies" },
    
    // Audit Log Activities
    { id: "view_audit_logs", label: "View Audit Logs", entity: "audit_logs" },
    { id: "export_audit_logs", label: "Export Audit Logs", entity: "audit_logs" },
    { id: "configure_audit_settings", label: "Configure Audit Settings", entity: "audit_logs" },
  ];
  
  // Handlers for Role Management
  const handleOpenRoleModal = (role = null) => {
    setRoleSearchQuery(""); // Reset search on open
    if (role) {
      setIsEditingRole(true);
      setEditingRole({ ...role });
      // Pre-expand entities that have assigned activities for better UX
      const entitiesWithActivities = new Set(
        SYSTEM_ACTIVITIES
          .filter(act => role.assignedActivities.includes(act.id))
          .map(act => act.entity)
      );
      setExpandedRoleEntities(entitiesWithActivities);
    } else {
      setIsEditingRole(false);
      setEditingRole({ id: null, name: "", description: "", assignedEntities: [], assignedActivities: [] });
      setExpandedRoleEntities(new Set());
    }
    setIsRoleModalOpen(true);
  };
  
  const handleSaveRole = () => {
    if (!editingRole.name) {
      toast.error("Role name is required.");
      return;
    }
    
    if (isEditingRole) {
      setCompanyData(prev => ({
        ...prev,
        roles: prev.roles.map(r => r.id === editingRole.id ? editingRole : r)
      }));
      toast.success("Role updated successfully!");
    } else {
      const newRole = { ...editingRole, id: Date.now() };
      setCompanyData(prev => ({
        ...prev,
        roles: [...prev.roles, newRole]
      }));
      toast.success("Role created successfully!");
    }
    
    setIsRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleDeleteRole = (roleId) => {
    setCompanyData(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r.id !== roleId)
    }));
    toast.success("Role deleted successfully.");
  };

  // Handler to toggle collapsible entity sections
  const toggleEntityExpansion = (entityId) => {
    setExpandedRoleEntities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entityId)) {
        newSet.delete(entityId);
      } else {
        newSet.add(entityId);
      }
      return newSet;
    });
  };

  // Handler to expand/collapse all entities
  const handleExpandCollapseAll = (expand) => {
    if (expand) {
      setExpandedRoleEntities(new Set(SYSTEM_ENTITIES.map(e => e.id)));
    } else {
      setExpandedRoleEntities(new Set());
    }
  };

  // Handle selecting/deselecting all activities for an entity
  const handleSelectAllActivities = (entityId) => {
    const activitiesForEntity = SYSTEM_ACTIVITIES.filter(a => a.entity === entityId);
    const activityIds = activitiesForEntity.map(a => a.id);
    
    const currentlySelectedForEntity = editingRole.assignedActivities.filter(id => activityIds.includes(id));

    let newActivities;
    if (currentlySelectedForEntity.length === activityIds.length) {
      // All are selected, so deselect all
      newActivities = editingRole.assignedActivities.filter(id => !activityIds.includes(id));
    } else {
      // Not all are selected, so select all (add missing ones)
      const activitiesToAdd = activityIds.filter(id => !editingRole.assignedActivities.includes(id));
      newActivities = [...editingRole.assignedActivities, ...activitiesToAdd];
    }
    setEditingRole(prev => ({ ...prev, assignedActivities: newActivities }));
  };

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Handle module assignment with feature selection
  const handleAssignModule = () => {
    if (!moduleAssignmentData.moduleId || moduleAssignmentData.selectedFeatures.length === 0) {
      toast.error("Please select a module and at least one feature");
      return;
    }

    const module = availableModules.find(m => m.id === moduleAssignmentData.moduleId);
    if (module && !companyData.assignedModules.find(m => m.id === moduleAssignmentData.moduleId)) {
      const newModule = {
        ...module,
        enabledFeatures: moduleAssignmentData.selectedFeatures,
        admins: []
      };
      
      setCompanyData(prev => ({
        ...prev,
        assignedModules: [...prev.assignedModules, newModule]
      }));
      
      toast.success(`${module.name} module assigned with ${moduleAssignmentData.selectedFeatures.length} features!`);
    }
    
    setModuleAssignmentData({ moduleId: null, selectedFeatures: [] });
    setIsAssignModuleModalOpen(false);
  };

  const handleRemoveModule = (moduleId) => {
    setCompanyData(prev => ({
      ...prev,
      assignedModules: prev.assignedModules.filter(m => m.id !== moduleId)
    }));
    toast.success("Module removed successfully!");
  };

  // Updated assign admin handler to support both modes
  const handleAssignAdminToModule = () => {
    if (isCreateNewAdminInAssign) {
      // Handle creating new admin
      if (!newAdminData.name || !newAdminData.email || !newAdminData.phone || !newAdminData.role) {
        toast.error("Please fill in all required fields");
        return;
      }

      // If no module selected (from "Admins & Access" tab), just create admin without assignment
      if (!selectedModuleForAdmin) {
        // Store admin in availableAdmins list (you might want to save this to your backend)
      const newAdmin = {
        id: Date.now(),
        name: newAdminData.name,
        email: newAdminData.email,
          phone: newAdminData.phone,
          role: newAdminData.role
        };
        
        // Add to availableAdmins (you might want to update your state management here)
        availableAdmins.push(newAdmin);
        
        toast.success(`Admin ${newAdmin.name} created successfully! You can now assign them to modules.`);
      } else {
        // Create admin and assign to module
        const newAdmin = {
          id: Date.now(),
          name: newAdminData.name,
          email: newAdminData.email,
          phone: newAdminData.phone,
        role: newAdminData.role,
        assignedFeatures: adminAssignmentData.selectedFeatures
      };

      setCompanyData(prev => ({
        ...prev,
        assignedModules: prev.assignedModules.map(module => {
          if (module.id === selectedModuleForAdmin.id) {
              return { 
                ...module, 
                admins: [...(module.admins || []), newAdmin]
              };
          }
          return module;
        })
      }));

        toast.success(`Admin ${newAdmin.name} created and assigned to ${selectedModuleForAdmin.name} successfully!`);
      }
    } else {
      // Handle assigning existing admin (no changes needed here)
      if (!adminAssignmentData.adminId || adminAssignmentData.selectedFeatures.length === 0) {
        toast.error("Please select an admin and at least one feature");
        return;
      }

      const admin = availableAdmins.find(a => a.id === adminAssignmentData.adminId);
      if (admin && selectedModuleForAdmin) {
        setCompanyData(prev => ({
          ...prev,
          assignedModules: prev.assignedModules.map(module => {
            if (module.id === selectedModuleForAdmin.id) {
              const newAdmin = {
                ...admin,
                role: admin.role, // Use admin's original role (no override)
                assignedFeatures: adminAssignmentData.selectedFeatures
              };
              
              const moduleAdmins = module.admins || [];
              const existingAdminIndex = moduleAdmins.findIndex(a => a.id === admin.id);
              
              if (existingAdminIndex !== -1) {
                const updatedAdmins = [...moduleAdmins];
                updatedAdmins[existingAdminIndex] = newAdmin;
                return { ...module, admins: updatedAdmins };
              } else {
                return { 
                  ...module, 
                  admins: [...moduleAdmins, newAdmin]
                };
              }
            }
            return module;
          })
        }));
        
        toast.success(`${admin.name} assigned to ${selectedModuleForAdmin.name} successfully!`);
      }
    }
    
    // Reset all states
    setAdminAssignmentData({ adminId: null, selectedFeatures: [], role: "" });
    setNewAdminData({ name: "", email: "", phone: "", role: "" });
    setIsAssignAdminModalOpen(false);
    setIsCreateNewAdminInAssign(false);
    setSelectedModuleForAdmin(null);
  };

  // Function to switch to create new admin mode
  const handleSwitchToCreateMode = () => {
    setIsCreateNewAdminInAssign(true);
    setAdminAssignmentData({ adminId: null, selectedFeatures: [], role: "" });
  };

  // Function to switch back to assign existing admin mode
  const handleSwitchToAssignMode = () => {
    setIsCreateNewAdminInAssign(false);
    setNewAdminData({ name: "", email: "", phone: "", role: "" });
  };

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const toggleAdminExpansion = (adminId) => {
    setExpandedAdmins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(adminId)) {
        newSet.delete(adminId);
      } else {
        newSet.add(adminId);
      }
      return newSet;
    });
  };

  // Function to handle editing admin features
  const handleEditAdmin = (moduleId, admin) => {
    const module = companyData.assignedModules.find(m => m.id === moduleId);
    setSelectedModuleForAdmin(module);
    setSelectedAdminForEdit(admin);
    setEditAdminData({
      selectedFeatures: admin.assignedFeatures || [],
      role: admin.role || ""
    });
    setIsEditAdminModalOpen(true);
  };

  // Function to save admin feature updates
  const handleSaveAdminEdit = () => {
    if (!selectedAdminForEdit || !selectedModuleForAdmin) return;

    setCompanyData(prev => ({
      ...prev,
      assignedModules: prev.assignedModules.map(module => {
        if (module.id === selectedModuleForAdmin.id) {
          return {
            ...module,
            admins: module.admins.map(admin => {
              if (admin.id === selectedAdminForEdit.id) {
                return {
                  ...admin,
                  role: editAdminData.role || admin.role,
                  assignedFeatures: editAdminData.selectedFeatures
                };
              }
              return admin;
            })
          };
        }
        return module;
      })
    }));

    setIsEditAdminModalOpen(false);
    setSelectedAdminForEdit(null);
    setSelectedModuleForAdmin(null);
    setEditAdminData({ selectedFeatures: [], role: "" });
    toast.success("Admin features updated successfully!");
  };

  // Function to confirm admin removal
  const handleRemoveAdminConfirm = (moduleId, admin) => {
    const module = companyData.assignedModules.find(m => m.id === moduleId);
    setSelectedModuleForAdmin(module);
    setAdminToRemove(admin);
    setIsRemoveAdminModalOpen(true);
  };

  // Function to actually remove admin from module (renamed to avoid conflict)
  const handleConfirmRemoveAdmin = () => {
    if (!adminToRemove || !selectedModuleForAdmin) return;

    setCompanyData(prev => ({
      ...prev,
      assignedModules: prev.assignedModules.map(module => {
        if (module.id === selectedModuleForAdmin.id) {
          return { 
            ...module, 
            admins: module.admins.filter(admin => admin.id !== adminToRemove.id) 
          };
        }
        return module;
      })
    }));

    setIsRemoveAdminModalOpen(false);
    setAdminToRemove(null);
    setSelectedModuleForAdmin(null);
    toast.success(`${adminToRemove.name} removed from ${selectedModuleForAdmin.name} successfully!`);
  };

  // Function to open module detail view
  const handleOpenModuleDetail = (module) => {
    setSelectedModuleForDetail(module);
    setIsModuleDetailOpen(true);
  };

  // Handle Edit Features functionality
  const handleEditFeatures = (module) => {
    setSelectedModuleForFeatures(module);
    setSelectedFeatures(module.enabledFeatures || []);
    setIsEditFeaturesModalOpen(true);
  };

  const handleSaveFeatures = () => {
    if (!selectedModuleForFeatures) return;

    setCompanyData(prev => ({
      ...prev,
      assignedModules: prev.assignedModules.map(module => {
        if (module.id === selectedModuleForFeatures.id) {
          return {
            ...module,
            enabledFeatures: selectedFeatures
          };
        }
        return module;
      })
    }));

    setIsEditFeaturesModalOpen(false);
    setSelectedModuleForFeatures(null);
    setSelectedFeatures([]);
    toast.success("Features updated successfully!");
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? "bg-white text-blue-600 shadow-md"
          : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <SuperadminHeaders />
      
      <div className="flex-1 pt-16">
        <div className="p-6 mt-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/superadmin/companies")}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: companyData.colorCode }}
                >
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{companyData.name}</h1>
                  <p className="text-gray-600">{companyData.email}</p>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Edit size={16} />
              Edit Company
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-gray-50 rounded-xl p-2 mb-6">
            <div className="flex gap-2">
              <TabButton
                id="overview"
                label="Overview"
                icon={Eye}
                isActive={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
              />
              <TabButton
                id="modules"
                label="Modules & Features"
                icon={Settings}
                isActive={activeTab === "modules"}
                onClick={() => setActiveTab("modules")}
              />
              <TabButton
                id="admins"
                label="Admins & Access"
                icon={Users}
                isActive={activeTab === "admins"}
                onClick={() => setActiveTab("admins")}
              />
              <TabButton
                id="permissions"
                label="Roles & Permissions"
                icon={Shield}
                isActive={activeTab === "permissions"}
                onClick={() => setActiveTab("permissions")}
              />
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Summary Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Modules Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Modules</p>
                          <p className="text-2xl font-bold text-blue-800">
                            {companyData.assignedModules?.length || 0}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            Active modules assigned
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                          <Settings className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Total Admins Card */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Total Admins</p>
                          <p className="text-2xl font-bold text-green-800">
                            {companyData.assignedModules?.reduce((total, module) => total + (module.admins?.length || 0), 0) || 0}
                          </p>
                          <p className="text-xs text-green-500 mt-1">
                            Across all modules
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </div>

                    {/* Total Features Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Active Features</p>
                          <p className="text-2xl font-bold text-purple-800">
                            {companyData.assignedModules?.reduce((total, module) => total + (module.enabledFeatures?.length || 0), 0) || 0}
                          </p>
                          <p className="text-xs text-purple-500 mt-1">
                            Features enabled
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                          <Star className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </div>

                    {/* Company Status Card */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Company Status</p>
                          <p className="text-lg font-bold text-orange-800">Active</p>
                          <p className="text-xs text-orange-500 mt-1">
                            All systems operational
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Company Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        {/* Company Color Indicator */}
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: companyData.colorCode }}
                          title={`Company Color: ${companyData.colorCode}`}
                        ></div>
                        <h2 className="text-xl font-semibold text-gray-800">Company Information</h2>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Mail size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-800">{companyData.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <Phone size={18} className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-800">{companyData.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Hash size={18} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">GST Number</p>
                            <p className="font-medium text-gray-800">{companyData.gst}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                            <MapPin size={18} className="text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium text-gray-800">{companyData.regAdd}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Head of Company - Single Panel Layout */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Head of Company</h3>
                        <div className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                          Personal Info
                        </div>
                      </div>
                      
                      {/* Profile Header */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {companyData.headOfCompany?.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">{companyData.headOfCompany?.name}</p>
                          <p className="text-sm text-blue-600 font-medium">{companyData.headOfCompany?.designation}</p>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Mail size={14} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-800">{companyData.headOfCompany?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Phone size={14} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-medium text-gray-800">{companyData.headOfCompany?.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                          <Edit size={14} />
                          Edit Personal Info
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove the entire "Active Modules Overview" section */}
                </div>
              )}

              {activeTab === "modules" && (
                <div className="space-y-6">
                  {/* Header with Search - Remove Assign Module button */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">Modules & Features</h2>
                      <p className="text-gray-600 text-sm mt-1">Configure features and manage admin assignments for each module</p>
                        </div>
                        <div className="flex items-center gap-4">
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search modules, features, admins..."
                          value={featureFilter}
                          onChange={(e) => setFeatureFilter(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                      </div>
                      {/* Filter Dropdown */}
                          <select
                            value={adminFilter}
                            onChange={(e) => setAdminFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">All Modules</option>
                        <option value="with-features">With Features</option>
                        <option value="without-features">Without Features</option>
                            <option value="with-admins">With Admins</option>
                            <option value="without-admins">Without Admins</option>
                          </select>
                        </div>
                      </div>

                  {/* Compact Module Cards Grid - Updated Design */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {companyData.assignedModules
                          ?.filter(module => {
                        // Filter by admin/features status
                        const statusMatch = adminFilter === "all" || 
                          (adminFilter === "with-features" && module.enabledFeatures && module.enabledFeatures.length > 0) ||
                          (adminFilter === "without-features" && (!module.enabledFeatures || module.enabledFeatures.length === 0)) ||
                          (adminFilter === "with-admins" && module.admins && module.admins.length > 0) ||
                          (adminFilter === "without-admins" && (!module.admins || module.admins.length === 0));
                        
                        // Filter by search term
                        const searchMatch = !featureFilter || 
                          module.name.toLowerCase().includes(featureFilter.toLowerCase()) ||
                          (module.allFeatures || module.enabledFeatures)?.some(feature => 
                            feature.toLowerCase().includes(featureFilter.toLowerCase())
                          ) ||
                          module.admins?.some(admin => 
                            admin.name.toLowerCase().includes(featureFilter.toLowerCase())
                          );
                        
                        return statusMatch && searchMatch;
                      })
                      ?.map((module) => {
                        // Get allFeatures from availableModules for this module
                        const moduleDefinition = availableModules.find(m => m.id === module.id);
                        const allFeatures = moduleDefinition?.allFeatures || [];
                        
                        return (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -2 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                          >
                            {/* Module Header - Compact */}
                            <div className="p-5 pb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl">
                                    {module.icon}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-800 text-lg">{module.name}</h3>
                                  </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${
                                  module.enabledFeatures && module.enabledFeatures.length > 0 ? 'bg-green-500' : 'bg-gray-400'
                                }`} title={module.enabledFeatures && module.enabledFeatures.length > 0 ? 'Active' : 'Inactive'}></div>
                              </div>
                              </div>

                            {/* Features Section with Inline Action */}
                            <div className="px-5 pb-4 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                  🧩 Features ({module.enabledFeatures?.length || 0})
                                  </h4>
                                <button
                                  onClick={() => handleEditFeatures(module)}
                                  className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                                >
                                  <Settings size={12} />
                                  Edit Features
                                </button>
                                </div>
                              
                              {module.enabledFeatures && module.enabledFeatures.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {module.enabledFeatures.map((feature, idx) => {
                                    const assignedAdmins = module.admins?.filter(admin => 
                                      admin.assignedFeatures?.includes(feature)
                                    ) || [];
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                                          assignedAdmins.length > 0
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}
                                        title={assignedAdmins.length > 0 ? 
                                          `Assigned to: ${assignedAdmins.map(a => a.name).join(', ')}` : 
                                          'No admin assigned'
                                        }
                                      >
                                        {feature}
                                                  </div>
                                    );
                                  })}
                                              </div>
                                            ) : (
                                <div className="text-center py-2">
                                  <p className="text-xs text-gray-500">No features enabled</p>
                                              </div>
                                            )}
                              </div>

                            {/* Admins Section with Inline Action */}
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                  👥 Admins ({module.admins?.length || 0})
                                  </h4>
                                <button
                                  onClick={() => {
                                    setSelectedModuleForAdmin(module);
                                    setIsAssignAdminModalOpen(true);
                                    setIsCreateNewAdminInAssign(false);
                                  }}
                                  className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors flex items-center gap-1.5"
                                >
                                  <Users size={12} />
                                  Assign Admins
                                </button>
                                </div>
                                
                                {module.admins && module.admins.length > 0 ? (
                                  <div className="space-y-2">
                                    {module.admins.slice(0, 3).map((admin) => (
                                    <div key={admin.id} className="flex items-start gap-2">
                                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-semibold text-blue-600">
                                              {admin.name.charAt(0)}
                                            </span>
                                          </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="text-sm font-medium text-gray-800 truncate">{admin.name}</p>
                                          <span className="text-xs text-gray-500">({admin.role})</span>
                                          </div>
                                        <div className="flex flex-wrap gap-1">
                                          {admin.assignedFeatures?.slice(0, 3).map((feature, idx) => (
                                            <span
                                              key={idx}
                                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border"
                                            >
                                              {feature}
                                            </span>
                                          ))}
                                          {admin.assignedFeatures?.length > 3 && (
                                            <span className="text-xs text-gray-400">
                                              +{admin.assignedFeatures.length - 3}
                                            </span>
                                          )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {module.admins.length > 3 && (
                                    <div className="text-center py-1 text-xs text-gray-500 bg-gray-50 rounded">
                                          +{module.admins.length - 3} more admin(s)
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                <div className="text-center py-3">
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <UserPlus size={14} className="text-gray-500" />
                                    </div>
                                  <p className="text-xs text-gray-500">No admins assigned</p>
                                  </div>
                                )}
                              </div>
                          </motion.div>
                        );
                      })}
                                  </div>
                                  </div>
              )}

              {activeTab === "admins" && (
                <div className="space-y-6">
                  {/* Header with Actions and Filters */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Admins & Access</h2>
                      <p className="text-gray-600 text-sm mt-1">
                        Manage all module administrators and their permissions
                      </p>
                                </div>
                    <div className="flex items-center gap-3">
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name, email, role..."
                          value={adminFilter}
                          onChange={(e) => setAdminFilter(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                              </div>
                      
                      {/* Module Filter */}
                      <select
                        value={featureFilter}
                        onChange={(e) => setFeatureFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                      >
                        <option value="">All Modules</option>
                        {companyData.assignedModules?.map(module => (
                          <option key={module.id} value={module.name}>{module.name}</option>
                        ))}
                      </select>

                      {/* Add Admin Button */}
                            <button
                        onClick={() => {
                          setSelectedModuleForAdmin(null);
                          setIsAssignAdminModalOpen(true);
                          setIsCreateNewAdminInAssign(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <UserPlus size={16} />
                        Add Admin
                            </button>
                          </div>
                      </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Admins</p>
                          <p className="text-xl font-bold text-gray-800">
                            {(() => {
                              const allAdmins = companyData.assignedModules?.flatMap(module => 
                                module.admins?.map(admin => ({ ...admin, moduleId: module.id })) || []
                              ) || [];
                              // Remove duplicates based on email
                              const uniqueAdmins = allAdmins.filter((admin, index, self) => 
                                index === self.findIndex(a => a.email === admin.email)
                              );
                              return uniqueAdmins.length;
                            })()}
                          </p>
                          </div>
                            </div>
                          </div>
                          
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Settings className="h-5 w-5 text-green-600" />
                            </div>
                        <div>
                          <p className="text-sm text-gray-600">Active Modules</p>
                          <p className="text-xl font-bold text-gray-800">
                            {companyData.assignedModules?.filter(m => m.admins && m.admins.length > 0).length || 0}
                          </p>
                        </div>
                      </div>
                          </div>
                          
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                        <div>
                          <p className="text-sm text-gray-600">Unique Roles</p>
                          <p className="text-xl font-bold text-gray-800">
                            {(() => {
                              const allRoles = companyData.assignedModules?.flatMap(module => 
                                module.admins?.map(admin => admin.role) || []
                              ) || [];
                              const uniqueRoles = [...new Set(allRoles)];
                              return uniqueRoles.length;
                            })()}
                          </p>
                          </div>
                        </div>
                          </div>
                          
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Star className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                          <p className="text-sm text-gray-600">Avg Features/Admin</p>
                          <p className="text-xl font-bold text-gray-800">
                            {(() => {
                              const allAdmins = companyData.assignedModules?.flatMap(module => 
                                module.admins || []
                              ) || [];
                              const totalFeatures = allAdmins.reduce((sum, admin) => 
                                sum + (admin.assignedFeatures?.length || 0), 0
                              );
                              return allAdmins.length ? Math.round(totalFeatures / allAdmins.length) : 0;
                            })()}
                          </p>
                          </div>
                        </div>
                      </div>
                      </div>

                  {/* Admin Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700">
                        <div className="col-span-3">Admin Details</div>
                        <div className="col-span-2">Role & Contact</div>
                        <div className="col-span-3">Assigned Modules</div>
                        <div className="col-span-2">Features Access</div>
                        <div className="col-span-2 text-center">Actions</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                      {(() => {
                        // Flatten all admins with their module information
                        const allAdmins = companyData.assignedModules?.flatMap(module => 
                          module.admins?.map(admin => ({
                            ...admin,
                            moduleName: module.name,
                            moduleIcon: module.icon,
                            moduleId: module.id
                          })) || []
                        ) || [];

                        // Group by unique admin (email) to avoid duplicates
                        const groupedAdmins = allAdmins.reduce((acc, admin) => {
                          const existing = acc.find(a => a.email === admin.email);
                          if (existing) {
                            // Add this module to existing admin
                            existing.modules = existing.modules || [];
                            existing.modules.push({
                              id: admin.moduleId,
                              name: admin.moduleName,
                              icon: admin.moduleIcon,
                              assignedFeatures: admin.assignedFeatures
                            });
                          } else {
                            // Create new admin entry
                            acc.push({
                              ...admin,
                              modules: [{
                                id: admin.moduleId,
                                name: admin.moduleName,
                                icon: admin.moduleIcon,
                                assignedFeatures: admin.assignedFeatures
                              }]
                            });
                          }
                          return acc;
                        }, []);

                        // Apply filters - Fixed filtering logic
                        const filteredAdmins = groupedAdmins.filter(admin => {
                          // Search filter - check if search term exists and matches
                          const searchTerm = adminFilter.toLowerCase().trim();
                          const searchMatch = !searchTerm || 
                            admin.name.toLowerCase().includes(searchTerm) ||
                            admin.email.toLowerCase().includes(searchTerm) ||
                            admin.role.toLowerCase().includes(searchTerm);

                          // Module filter - check if module filter is applied
                          const moduleMatch = !featureFilter || 
                            admin.modules?.some(module => module.name === featureFilter);

                          return searchMatch && moduleMatch;
                        });

                        return filteredAdmins.length > 0 ? (
                          filteredAdmins.map((admin, index) => (
                            <div key={`${admin.email}-${index}`} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                              <div className="grid grid-cols-12 gap-4 items-center">
                                {/* Admin Details */}
                                <div className="col-span-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-sm font-bold text-white">
                                        {admin.name.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-800 truncate">{admin.name}</p>
                                      <p className="text-sm text-gray-500 truncate">{admin.email}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Role & Contact */}
                                <div className="col-span-2">
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-800">{admin.role}</p>
                                    <p className="text-xs text-gray-500">📞 {admin.phone || 'N/A'}</p>
                                  </div>
                                </div>

                                {/* Assigned Modules */}
                                <div className="col-span-3">
                                  <div className="flex flex-wrap gap-1">
                                    {admin.modules?.slice(0, 2).map((module, idx) => (
                                      <div
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                      >
                                        <span>{module.icon}</span>
                                        <span className="font-medium">{module.name}</span>
                            </div>
                                    ))}
                                    {admin.modules?.length > 2 && (
                                      <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        +{admin.modules.length - 2} more
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Features Access */}
                                <div className="col-span-2">
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-800">
                                      {admin.modules?.reduce((total, module) => 
                                        total + (module.assignedFeatures?.length || 0), 0
                                      )} Features
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {admin.modules?.flatMap(module => module.assignedFeatures || [])
                                        .slice(0, 2).map((feature, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                          {feature}
                                </span>
                                      ))}
                                      {admin.modules?.flatMap(module => module.assignedFeatures || []).length > 2 && (
                                        <span className="text-xs text-gray-400">
                                          +{admin.modules.flatMap(module => module.assignedFeatures || []).length - 2}
                                </span>
                                      )}
                              </div>
                            </div>
                          </div>

                                {/* Actions */}
                                <div className="col-span-2">
                                  <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                        // Find the first module this admin belongs to for editing
                                        const firstModule = companyData.assignedModules?.find(m => 
                                          m.admins?.some(a => a.email === admin.email)
                                        );
                                        if (firstModule) {
                                          const fullAdmin = firstModule.admins.find(a => a.email === admin.email);
                                          handleEditAdmin(firstModule.id, fullAdmin);
                                        }
                                      }}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Edit Admin"
                                    >
                                      <Edit size={16} />
                            </button>
                            <button
                                      onClick={() => {
                                        // Find the first module this admin belongs to for removal
                                        const firstModule = companyData.assignedModules?.find(m => 
                                          m.admins?.some(a => a.email === admin.email)
                                        );
                                        if (firstModule) {
                                          const fullAdmin = firstModule.admins.find(a => a.email === admin.email);
                                          handleRemoveAdminConfirm(firstModule.id, fullAdmin);
                                        }
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Remove Admin"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                                      </div>
                          ))
                        ) : (
                          <div className="px-6 py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Users className="h-8 w-8 text-gray-400" />
                                          </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                              {adminFilter || featureFilter ? "No Admins Found" : "No Admins Yet"}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">
                              {adminFilter || featureFilter 
                                ? "No admins match your search criteria. Try adjusting your filters."
                                : "No admins have been assigned to any modules yet."
                              }
                            </p>
                            {(!adminFilter && !featureFilter) && (
                              <button
                                onClick={() => {
                                  setSelectedModuleForAdmin(null);
                                  setIsAssignAdminModalOpen(true);
                                  setIsCreateNewAdminInAssign(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                              >
                                <UserPlus size={16} />
                                Add First Admin
                              </button>
                            )}
                          </div>
                        );
                      })()}
                        </div>
                      </div>

                  {/* Table Footer with Summary - Remove Export and Bulk Actions */}
                  <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 px-6 py-3 rounded-b-xl">
                    <div>
                      {(() => {
                        const allAdmins = companyData.assignedModules?.flatMap(module => 
                          module.admins?.map(admin => ({ ...admin, moduleId: module.id })) || []
                        ) || [];
                        const uniqueAdmins = allAdmins.filter((admin, index, self) => 
                          index === self.findIndex(a => a.email === admin.email)
                        );
                        const filteredCount = (() => {
                          const grouped = allAdmins.reduce((acc, admin) => {
                            const existing = acc.find(a => a.email === admin.email);
                            if (!existing) {
                              acc.push(admin);
                            }
                            return acc;
                          }, []);
                          
                          return grouped.filter(admin => {
                            const searchTerm = adminFilter.toLowerCase().trim();
                            const searchMatch = !searchTerm || 
                              admin.name.toLowerCase().includes(searchTerm) ||
                              admin.email.toLowerCase().includes(searchTerm) ||
                              admin.role.toLowerCase().includes(searchTerm);
                            
                            const moduleMatch = !featureFilter || 
                              companyData.assignedModules?.some(module => 
                                module.name === featureFilter && 
                                module.admins?.some(a => a.email === admin.email)
                              );
                            
                            return searchMatch && moduleMatch;
                          }).length;
                        })();
                        
                        return `Showing ${filteredCount} of ${uniqueAdmins.length} admin(s) across ${companyData.assignedModules?.length || 0} module(s)`;
                      })()}
                    </div>
                    {/* Removed Export List and Bulk Actions buttons */}
                  </div>
                </div>
              )}

              {activeTab === "permissions" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                          <div>
                      <h2 className="text-xl font-semibold text-gray-800">Roles & Permissions</h2>
                      <p className="text-gray-600 text-sm mt-1">Define custom roles and their access levels for this company.</p>
                          </div>
                    <button
                      onClick={() => handleOpenRoleModal()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <Plus size={16} />
                      Create Role
                    </button>
                        </div>
                        
                  {/* Roles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companyData.roles?.map(role => (
                      <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                        <div className="flex-grow">
                          <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
                          <p className="text-sm text-gray-500 mt-1 mb-4 h-10">{role.description}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Database size={14} className="text-blue-500" />
                              <span>{role.assignedEntities.length} Entities</span>
                                  </div>
                            <div className="flex items-center gap-2">
                              <Activity size={14} className="text-green-500" />
                              <span>{role.assignedActivities.length} Activities</span>
                                  </div>
                                </div>
                                  </div>
                        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                          <button 
                            onClick={() => handleOpenRoleModal(role)}
                            className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteRole(role.id)}
                            className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                          >
                            <Trash size={16} />
                          </button>
                                </div>
                              </div>
                            ))}
                    {(!companyData.roles || companyData.roles.length === 0) && (
                      <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        <Shield size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>No roles created yet.</p>
                        <p className="text-sm">Click "Create Role" to get started.</p>
                          </div>
                        )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Assign Module Modal with Feature Selection */}
      <Modal
        isOpen={isAssignModuleModalOpen}
        onClose={() => {
          setIsAssignModuleModalOpen(false);
          setModuleAssignmentData({ moduleId: null, selectedFeatures: [] });
        }}
        title="Assign Module with Features"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Module</label>
            <Select
              onValueChange={(value) => setModuleAssignmentData(prev => ({ ...prev, moduleId: parseInt(value), selectedFeatures: [] }))}
              value={moduleAssignmentData.moduleId?.toString() || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a module" />
              </SelectTrigger>
              <SelectContent>
                {availableModules
                  .filter(module => !companyData.assignedModules?.find(m => m.id === module.id))
                  .map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{module.icon}</span>
                        <span>{module.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {moduleAssignmentData.moduleId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Features for {availableModules.find(m => m.id === moduleAssignmentData.moduleId)?.name}
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
                {availableModules.find(m => m.id === moduleAssignmentData.moduleId)?.allFeatures.map((feature, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={moduleAssignmentData.selectedFeatures.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setModuleAssignmentData(prev => ({
                            ...prev,
                            selectedFeatures: [...prev.selectedFeatures, feature]
                          }));
                        } else {
                          setModuleAssignmentData(prev => ({
                            ...prev,
                            selectedFeatures: prev.selectedFeatures.filter(f => f !== feature)
                          }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {moduleAssignmentData.selectedFeatures.length} features
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => {
                setIsAssignModuleModalOpen(false);
                setModuleAssignmentData({ moduleId: null, selectedFeatures: [] });
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignModule}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Check size={16} />
              Assign Module
            </button>
          </div>
        </div>
      </Modal>

      {/* Updated Assign Admin Modal - Simplified for Module Cards */}
      <Modal
        isOpen={isAssignAdminModalOpen}
        onClose={() => {
          setIsAssignAdminModalOpen(false);
          setIsCreateNewAdminInAssign(false);
          setAdminAssignmentData({ adminId: null, selectedFeatures: [], role: "" });
          setNewAdminData({ name: "", email: "", phone: "", role: "" });
          setSelectedModuleForAdmin(null);
        }}
        title={selectedModuleForAdmin ? 
          (isCreateNewAdminInAssign ? 
            `Create Admin for ${selectedModuleForAdmin?.name}` : 
            `Assign Admin to ${selectedModuleForAdmin?.name}`
          ) : 
          "Create New Admin"
        }
      >
        <div className="space-y-6">
          <div className="text-center pb-4 border-b border-gray-200">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
              isCreateNewAdminInAssign 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'bg-gradient-to-br from-green-500 to-green-600'
            }`}>
              {isCreateNewAdminInAssign ? <UserPlus className="h-6 w-6 text-white" /> : <Users className="h-6 w-6 text-white" />}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {isCreateNewAdminInAssign ? 'Create New Admin' : 'Assign Existing Admin'}
            </h2>
            <p className="text-gray-600 text-sm">
              {selectedModuleForAdmin ? (
                isCreateNewAdminInAssign 
                ? `Create a new admin and assign to ${selectedModuleForAdmin?.name}`
                : `Select an existing admin to assign to ${selectedModuleForAdmin?.name}`
              ) : (
                isCreateNewAdminInAssign 
                  ? "Create a new admin and select modules to assign"
                  : "Select an admin to assign to modules"
              )}
            </p>
          </div>

          <div className="space-y-4">
            {!isCreateNewAdminInAssign ? (
              // Assign Existing Admin Mode (for Module Cards) - Remove create new option
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Admin</label>
                  <div className="flex items-center gap-2 mb-3">
                    {(() => {
                      // Get all existing admins from all modules
                      const allExistingAdmins = companyData.assignedModules?.flatMap(module => 
                        module.admins?.map(admin => ({ ...admin, moduleId: module.id, moduleName: module.name })) || []
                      ) || [];
                      
                      // Also include available admins from the predefined list
                      const combinedAdmins = [
                        ...availableAdmins,
                        ...allExistingAdmins
                      ];
                      
                      // Remove duplicates based on email and filter out already assigned to this module
                      const uniqueAdmins = combinedAdmins.filter((admin, index, self) => {
                        const isUnique = index === self.findIndex(a => a.email === admin.email);
                        const notInCurrentModule = !selectedModuleForAdmin?.admins?.some(a => a.email === admin.email);
                        return isUnique && notInCurrentModule;
                      });

                      return (
                        <>
                          <select
                            value={adminAssignmentData.adminId || ""}
                            onChange={(e) => {
                              const adminId = parseInt(e.target.value);
                              setAdminAssignmentData(prev => ({ ...prev, adminId }));
                            }}
                            className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Choose an admin to assign</option>
                            {uniqueAdmins.map((admin) => (
                              <option key={admin.id} value={admin.id}>
                                {admin.name} ({admin.role}) - {admin.email}
                              </option>
                            ))}
                          </select>

                          {uniqueAdmins.length === 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                              <p className="text-sm text-yellow-800">
                                No available admins to assign. All existing admins are already assigned to this module. 
                                Create new admins in the "Admins & Access" tab first.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                </div>

                {adminAssignmentData.adminId && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Admin Details:</h4>
                      {(() => {
                        const allAdmins = [
                          ...availableAdmins,
                          ...companyData.assignedModules?.flatMap(module => module.admins || []) || []
                        ];
                        const selectedAdmin = allAdmins.find(a => a.id === adminAssignmentData.adminId);
                        
                        return selectedAdmin ? (
                          <div className="text-sm space-y-1">
                            <div><strong>Name:</strong> {selectedAdmin.name}</div>
                            <div><strong>Email:</strong> {selectedAdmin.email}</div>
                            <div><strong>Role:</strong> {selectedAdmin.role}</div>
                          </div>
                        ) : null;
                      })()}
                  </div>
                )}
                </div>

                {/* Remove the Role Override field for Module Cards assignment */}
              </>
            ) : (
              // Create New Admin Mode (only for "Admins & Access" tab)
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={newAdminData.name}
                        onChange={(e) => setNewAdminData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g., HR Manager"
                        value={newAdminData.role}
                        onChange={(e) => setNewAdminData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="admin@company.com"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={newAdminData.phone}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Remove Module Selection - Allow creating admin without module assignment when from "Admins & Access" tab */}

            {/* Feature Selection - Show when admin and module are selected */}
            {((adminAssignmentData.adminId && !isCreateNewAdminInAssign) || (isCreateNewAdminInAssign && newAdminData.name)) && selectedModuleForAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grant Access to Features in {selectedModuleForAdmin.name}
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
                  {selectedModuleForAdmin.enabledFeatures?.map((feature, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={adminAssignmentData.selectedFeatures.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdminAssignmentData(prev => ({
                              ...prev,
                              selectedFeatures: [...prev.selectedFeatures, feature]
                            }));
                          } else {
                            setAdminAssignmentData(prev => ({
                              ...prev,
                              selectedFeatures: prev.selectedFeatures.filter(f => f !== feature)
                            }));
                          }
                        }}
                        className={`w-4 h-4 border-gray-300 rounded focus:ring-2 ${
                          isCreateNewAdminInAssign 
                            ? 'text-blue-600 focus:ring-blue-500' 
                            : 'text-green-600 focus:ring-green-500'
                        }`}
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {adminAssignmentData.selectedFeatures.length} of {selectedModuleForAdmin.enabledFeatures?.length} features
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setIsAssignAdminModalOpen(false);
                setIsCreateNewAdminInAssign(false);
                setAdminAssignmentData({ adminId: null, selectedFeatures: [], role: "" });
                setNewAdminData({ name: "", email: "", phone: "", role: "" });
                setSelectedModuleForAdmin(null);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignAdminToModule}
              className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                isCreateNewAdminInAssign 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={!adminAssignmentData.adminId && !isCreateNewAdminInAssign}
            >
              {isCreateNewAdminInAssign ? <UserPlus size={16} /> : <Users size={16} />}
              {isCreateNewAdminInAssign ? 'Create Admin' : 'Assign Admin'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Admin Features Modal */}
      <Modal
        isOpen={isEditAdminModalOpen}
        onClose={() => {
          setIsEditAdminModalOpen(false);
          setSelectedAdminForEdit(null);
          setEditAdminData({ selectedFeatures: [], role: "" });
          setSelectedModuleForAdmin(null);
        }}
        title={`Edit Admin: ${selectedAdminForEdit?.name}`}
      >
        <div className="space-y-6">
          <div className="text-center pb-4 border-b border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Edit Admin Access</h2>
            <p className="text-gray-600 text-sm">Update role and feature permissions for {selectedAdminForEdit?.name}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <Select
                onValueChange={(value) => setEditAdminData(prev => ({...prev, role: value}))}
                  value={editAdminData.role}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role for this admin" />
                </SelectTrigger>
                <SelectContent>
                  {companyData.roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedModuleForAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feature Access for {selectedModuleForAdmin.name}
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
                  {selectedModuleForAdmin.enabledFeatures?.map((feature, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={editAdminData.selectedFeatures.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditAdminData(prev => ({
                              ...prev,
                              selectedFeatures: [...prev.selectedFeatures, feature]
                            }));
                          } else {
                            setEditAdminData(prev => ({
                              ...prev,
                              selectedFeatures: prev.selectedFeatures.filter(f => f !== feature)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {editAdminData.selectedFeatures.length} of {selectedModuleForAdmin.enabledFeatures?.length} features
                </p>
              </div>
            )}

            {/* Show current vs new comparison */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Changes Summary</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Previous Features:</span>
                  <span className="font-medium">{selectedAdminForEdit?.assignedFeatures?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Features:</span>
                  <span className="font-medium text-purple-600">{editAdminData.selectedFeatures.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setIsEditAdminModalOpen(false);
                setSelectedAdminForEdit(null);
                setEditAdminData({ selectedFeatures: [], role: "" });
                setSelectedModuleForAdmin(null);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAdminEdit}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <Check size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Remove Admin Confirmation Modal */}
      <Modal
        isOpen={isRemoveAdminModalOpen}
        onClose={() => {
          setIsRemoveAdminModalOpen(false);
          setAdminToRemove(null);
          setSelectedModuleForAdmin(null);
        }}
        title="Remove Admin"
      >
        <div className="space-y-4">
          <div className="text-center pb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Remove Admin Access</h3>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              Are you sure you want to remove <strong>{adminToRemove?.name}</strong> from <strong>{selectedModuleForAdmin?.name}</strong>?
            </p>
            <p className="text-red-600 text-xs mt-2">
              This will revoke all their access to this module and its features. This action cannot be undone.
            </p>
          </div>

          {adminToRemove && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-700 text-sm mb-2">Admin Details:</h4>
              <div className="text-xs space-y-1 text-gray-600">
                <div>Email: {adminToRemove.email}</div>
                <div>Role: {adminToRemove.role}</div>
                <div>Current Features: {adminToRemove.assignedFeatures?.length || 0}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setIsRemoveAdminModalOpen(false);
                setAdminToRemove(null);
                setSelectedModuleForAdmin(null);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRemoveAdmin}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash size={16} />
              Remove Admin
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Features Modal - Update to use allFeatures from availableModules */}
      <Modal
        isOpen={isEditFeaturesModalOpen}
        onClose={() => {
          setIsEditFeaturesModalOpen(false);
          setSelectedModuleForFeatures(null);
          setSelectedFeatures([]);
        }}
        title={`Configure Features - ${selectedModuleForFeatures?.name}`}
      >
        <div className="space-y-6">
          <div className="text-center pb-4 border-b border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Configure Module Features</h2>
            <p className="text-gray-600 text-sm">Select which features to enable for {selectedModuleForFeatures?.name}</p>
          </div>

          {selectedModuleForFeatures && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Available Features</label>
                <div className="text-xs text-gray-500">
                  {selectedFeatures.length} of {(() => {
                    const moduleDefinition = availableModules.find(m => m.id === selectedModuleForFeatures.id);
                    return moduleDefinition?.allFeatures?.length || 0;
                  })()} selected
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
                {(() => {
                  const moduleDefinition = availableModules.find(m => m.id === selectedModuleForFeatures.id);
                  return moduleDefinition?.allFeatures?.map((feature, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ));
                })()}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Only enabled features will be available for admin assignment and company usage.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setIsEditFeaturesModalOpen(false);
                setSelectedModuleForFeatures(null);
                setSelectedFeatures([]);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFeatures}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <Check size={16} />
              Save Features
            </button>
          </div>
        </div>
      </Modal>

      {/* Role Management Modal - Completely Redesigned Wide & Clean Layout */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsRoleModalOpen(false)}
          />
          
          {/* Modal Container - Full Width */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
              
              {/* Modal Header - Clean & Modern */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-white">
                        {isEditingRole ? "Edit Role & Assign Permissions" : "Create New Role & Assign Permissions"}
                      </h1>
                      <p className="text-blue-100 text-sm">Configure role details and system access permissions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRoleModalOpen(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Main Content - 2-Column Layout */}
              <div className="h-[70vh] flex">
                
                {/* Left Column: Role Details (25% width) */}
                <div className="w-1/4 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    
                    {/* Role Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Role Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Role Name *</label>
                          <input
                            type="text"
                            value={editingRole?.name || ""}
                            onChange={(e) => setEditingRole(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="HR Manager"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={editingRole?.description || ""}
                            onChange={(e) => setEditingRole(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Full access to all HR-related modules and functions..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Permission Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Permission Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Entities Access</span>
                          <span className="text-xs font-semibold text-blue-600">
                            {editingRole?.assignedEntities?.length || 0} / {SYSTEM_ENTITIES.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Total Activities</span>
                          <span className="text-xs font-semibold text-green-600">
                            {editingRole?.assignedActivities?.length || 0} / {SYSTEM_ACTIVITIES.length}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="pt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Configuration Progress</span>
                            <span>{Math.round(((editingRole?.assignedActivities?.length || 0) / SYSTEM_ACTIVITIES.length) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${((editingRole?.assignedActivities?.length || 0) / SYSTEM_ACTIVITIES.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Actions</h4>
                      <button
                        onClick={() => handleExpandCollapseAll(true)}
                        className="w-full px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        📂 Expand All Sections
                      </button>
                      <button
                        onClick={() => handleExpandCollapseAll(false)}
                        className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        📁 Collapse All Sections
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Permissions (75% width) */}
                <div className="flex-1 flex flex-col bg-white">
                  
                  {/* Permissions Header */}
                  <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">System Permissions</h3>
                        <p className="text-xs text-gray-500 mt-1">Select entities and their specific activities to control access</p>
                      </div>
                      
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="🔍 Filter modules..."
                          value={roleSearchQuery}
                          onChange={(e) => setRoleSearchQuery(e.target.value)}
                          className="w-80 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permissions Grid - Updated to show module grouping */}
                  <div className="flex-1 px-8 py-6 overflow-y-auto">
                    <div className="space-y-6">
                      {/* Group entities by module - Updated to include Accounting */}
                      {["HR Management", "Accounting", "Administration"].map(module => {
                        const entitiesInModule = SYSTEM_ENTITIES
                          .filter(entity => entity.module === module)
                          .filter(entity => entity.label.toLowerCase().includes(roleSearchQuery.toLowerCase()));
                        
                        if (entitiesInModule.length === 0) return null;
                        
                        return (
                          <div key={module} className="space-y-4">
                            {/* Module Header */}
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              <h4 className="text-lg font-bold text-gray-800">{module}</h4>
                              <div className="text-sm text-gray-500">
                                ({entitiesInModule.length} {entitiesInModule.length === 1 ? 'entity' : 'entities'})
                              </div>
                            </div>
                            
                            {/* Entities in this module */}
                            <div className="space-y-4">
                              {entitiesInModule.map(entity => {
                                const isExpanded = expandedRoleEntities.has(entity.id);
                                const activitiesForEntity = SYSTEM_ACTIVITIES.filter(a => a.entity === entity.id);
                                const selectedCount = editingRole?.assignedActivities?.filter(actId => 
                                  activitiesForEntity.some(a => a.id === actId)
                                ).length || 0;
                                const isAllSelected = selectedCount === activitiesForEntity.length && activitiesForEntity.length > 0;

                                return (
                                  <div key={entity.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ml-4">
                                    
                                    {/* Entity Header - Modern Card Style */}
                                    <div className="bg-white px-6 py-4 border-b border-gray-100">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                                            <span className="text-lg">{entity.icon}</span>
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                              <input
                                                type="checkbox"
                                                checked={editingRole?.assignedEntities?.includes(entity.id) || false}
                                                onChange={(e) => {
                                                  const newEntities = e.target.checked
                                                    ? [...(editingRole?.assignedEntities || []), entity.id]
                                                    : (editingRole?.assignedEntities || []).filter(id => id !== entity.id);
                                                  setEditingRole(prev => ({...prev, assignedEntities: newEntities}));
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                              />
                                              <h4 className="font-semibold text-gray-900">{entity.label}</h4>
                                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                isAllSelected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                              }`}>
                                                {selectedCount}/{activitiesForEntity.length}
                                              </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{entity.description}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                          {activitiesForEntity.length > 0 && (
                                            <button
                                              onClick={() => handleSelectAllActivities(entity.id)}
                                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                isAllSelected 
                                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                              }`}
                                            >
                                              {isAllSelected ? '✅ All' : '🔘 All'}
                                            </button>
                                          )}
                                          
                                          <button
                                            onClick={() => toggleEntityExpansion(entity.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                          >
                                            <ChevronDown
                                              size={16}
                                              className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Activities Section - Horizontal Layout */}
                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="bg-gray-50 px-6 py-4">
                                            {activitiesForEntity.length > 0 ? (
                                              <div className="grid grid-cols-2 gap-3">
                                                {activitiesForEntity.map(activity => (
                                                  <label 
                                                    key={activity.id} 
                                                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all group"
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      checked={editingRole?.assignedActivities?.includes(activity.id) || false}
                                                      onChange={() => {
                                                        const newActivities = editingRole?.assignedActivities?.includes(activity.id)
                                                          ? (editingRole?.assignedActivities || []).filter(id => id !== activity.id)
                                                          : [...(editingRole?.assignedActivities || []), activity.id];
                                                        setEditingRole(prev => ({...prev, assignedActivities: newActivities}));
                                                      }}
                                                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700 group-hover:text-blue-700 font-medium">
                                                      {activity.label}
                                                    </span>
                                                  </label>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-center py-8 text-gray-400">
                                                <ActivityIcon size={24} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No activities available for this entity</p>
                                              </div>
                                            )}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Clean Actions */}
              <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    💡 Changes will be saved to this company's role configuration
                  </p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsRoleModalOpen(false)}
                      className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveRole} 
                      disabled={!editingRole?.name?.trim()}
                      className="px-8 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Check size={16} />
                      {isEditingRole ? "✅ Update Role" : "🎯 Create Role"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(CompanyDetails, ["Superadmin"]); 