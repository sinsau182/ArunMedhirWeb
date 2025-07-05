import React, { useState, useMemo, useEffect } from "react";
import {
  FaPlus,
  FaCog,
  FaSearch,
  FaThLarge,
  FaListUl,
  FaCalendarAlt,
  FaChartBar,
  FaMapMarkerAlt,
  FaClock,
  FaChevronDown,
  FaTrash,
  FaTimes,
  FaWrench,
  FaStream,
  FaTasks,
  FaUserShield,
  FaSitemap,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import ConvertLeadModal from "@/components/Sales/ConvertLeadModal";
import LostLeadModal from "@/components/Sales/LostLeadModal";
import JunkReasonModal from "@/components/Sales/JunkReasonModal";
import AddLeadModal from "@/components/Sales/AddLeadModal";
import KanbanBoard from "@/components/Sales/KanbanBoard";
import {
  fetchLeads,
  updateLead,
  createLead,
} from "@/redux/slices/leadsSlice";
import { addStage, removeStage } from "@/redux/slices/pipelineSlice";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import AdvancedScheduleActivityModal from '@/components/Sales/AdvancedScheduleActivityModal';
import { useRouter } from 'next/router';

const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: 'Super Admin',
    description: 'Has access to all features, including this settings panel.',
    permissions: ['manageSettings', 'viewAllLeads', 'editAllLeads', 'deleteAllLeads', 'reassignLeads', 'exportLeads'],
    isEditable: false,
  },
  {
    id: 'sales_manager',
    name: 'Sales Manager',
    description: 'Can view all leads and manage their team.',
    permissions: ['viewAllLeads', 'editAllLeads', 'reassignLeads', 'exportLeads'],
    isEditable: true,
  },
  {
    id: 'sales_person',
    name: 'Salesperson',
    description: 'Can only view and manage leads assigned to them.',
    permissions: ['viewAssignedLeadsOnly'],
    isEditable: true,
  },
];

const salesPersons = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'Dana' },
];
const designers = [
  { id: 1, name: 'Bob' },
  { id: 2, name: 'Dana' },
  { id: 3, name: 'Frank' },
  { id: 4, name: 'Jack' },
];

const defaultLeadData = {
  name: "",
  contactNumber: "",
  email: "",
  projectType: "",
  propertyType: "",
  address: "",
  area: "",
  budget: "",
  designStyle: "",
  leadSource: "",
  preferredContact: "",
  notes: "",
  status: "New",
  rating: 0,
  salesRep: null,
  designer: null,
  callDescription: null,
  callHistory: [],
  nextCall: null,
  quotedAmount: null,
  finalQuotation: null,
  signupAmount: null,
  paymentDate: null,
  paymentMode: null,
  panNumber: null,
  discount: null,
  reasonForLost: null,
  reasonForJunk: null,
  submittedBy: null,
  paymentDetailsFileName: null,
  bookingFormFileName: null,
};

const DeletePipelineModal = ({ isOpen, onClose, stages, onDeleteStages }) => {
  const [selectedStages, setSelectedStages] = useState([]);

  const handleStageToggle = (stage) => {
    setSelectedStages(prev => 
      prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  const handleDelete = () => {
    if (selectedStages.length === 0) {
      toast.error("Please select at least one stage to delete");
      return;
    }
    onDeleteStages(selectedStages);
    setSelectedStages([]);
    onClose();
  };

  const handleSelectAll = () => {
    setSelectedStages(stages);
  };

  const handleDeselectAll = () => {
    setSelectedStages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Delete Pipeline Stages</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Select the pipeline stages you want to delete. This action cannot be undone.
          </p>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Deselect All
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stages.map((stage) => (
              <label key={stage} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStages.includes(stage)}
                  onChange={() => handleStageToggle(stage)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium">{stage}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedStages.length === 0}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Delete {selectedStages.length > 0 ? `(${selectedStages.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

// MOCK DATA: Replace with your own if needed
const MOCK_LEADS = [
  {
    leadId: 'LEAD101',
    name: 'John Doe',
    contactNumber: '1234567890',
    email: 'john@example.com',
    projectType: 'Residential',
    propertyType: 'Apartment',
    address: '123 Main St',
    area: '1200',
    budget: '1500000',
    designStyle: 'Modern',
    leadSource: 'Website',
    preferredContact: 'Phone',
    notes: 'Interested in 2BHK',
    status: 'New',
    rating: 2,
    salesRep: 'Alice',
    designer: 'Bob',
    callDescription: null,
    callHistory: [],
    nextCall: null,
    quotedAmount: null,
    finalQuotation: null,
    signupAmount: null,
    paymentDate: null,
    paymentMode: null,
    panNumber: null,
    discount: null,
    reasonForLost: null,
    reasonForJunk: null,
    submittedBy: 'MANAGER',
    paymentDetailsFileName: null,
    bookingFormFileName: null,
    createdAt: '2024-05-10T09:00:00Z',
  },
  {
    leadId: 'LEAD102',
    name: 'Jane Smith',
    contactNumber: '9876543210',
    email: 'jane@example.com',
    projectType: 'Commercial',
    propertyType: 'Office',
    address: '456 Market St',
    area: '2000',
    budget: '3000000',
    designStyle: 'Contemporary',
    leadSource: 'Referral',
    preferredContact: 'Email',
    notes: 'Needs open workspace',
    status: 'Contacted',
    rating: 3,
    salesRep: 'Charlie',
    designer: 'Dana',
    callDescription: null,
    callHistory: [],
    nextCall: null,
    quotedAmount: null,
    finalQuotation: null,
    signupAmount: null,
    paymentDate: null,
    paymentMode: null,
    panNumber: null,
    discount: null,
    reasonForLost: null,
    reasonForJunk: null,
    submittedBy: 'MANAGER',
    paymentDetailsFileName: null,
    bookingFormFileName: null,
    createdAt: '2024-05-20T11:30:00Z',
  },
  {
    leadId: 'LEAD103',
    name: 'Emily Davis',
    contactNumber: '1112223333',
    email: 'emily@example.com',
    projectType: 'Residential',
    propertyType: 'Villa',
    address: '789 Pine Ln',
    area: '2500',
    budget: '4000000',
    designStyle: 'Minimalist',
    leadSource: 'Social Media',
    preferredContact: 'Email',
    notes: 'Wants a minimalist design for a new villa.',
    status: 'Qualified',
    rating: 3,
    salesRep: 'Alice',
    designer: 'Frank',
    callDescription: null,
    callHistory: [],
    nextCall: null,
    quotedAmount: null,
    finalQuotation: null,
    signupAmount: null,
    paymentDate: null,
    paymentMode: null,
    panNumber: null,
    discount: null,
    reasonForLost: null,
    reasonForJunk: null,
    submittedBy: 'MANAGER',
    paymentDetailsFileName: null,
    bookingFormFileName: null,
    createdAt: '2024-06-01T14:00:00Z',
  }
];

const LeadsTable = ({ leads }) => (
  <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sales Rep</TableHead>
          <TableHead>Designer</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.leadId}>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell>{lead.contactNumber}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>{lead.status}</TableCell>
            <TableCell>{lead.salesRep || <span className="text-gray-400">Unassigned</span>}</TableCell>
            <TableCell>{lead.designer || <span className="text-gray-400">Unassigned</span>}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// +++ NEW: Stage-Dependent Forms Settings +++
const FIELD_LABELS = {
  name: "Lead Name",
  contactNumber: "Contact Number",
  email: "Email Address",
  projectType: "Project Type",
  propertyType: "Property Type",
  address: "Address",
  area: "Area (sq. ft.)",
  budget: "Budget",
  designStyle: "Design Style",
  leadSource: "Lead Source",
  preferredContact: "Preferred Contact Method",
  notes: "Notes",
};
const CONFIGURABLE_FIELDS = Object.keys(FIELD_LABELS);

const StageFormsSettings = ({ stages, formConfigs, onConfigChange }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false });

  const handleAddField = () => {
    if (!newField.label || !selectedStage) {
      toast.error("Field label cannot be empty.");
      return;
    }
    onConfigChange('add', selectedStage, { ...newField, id: `field_${Date.now()}` });
    setNewField({ label: '', type: 'text', required: false });
    setIsAddingField(false);
  };

  const handleRemoveField = (fieldId) => {
    onConfigChange('remove', selectedStage, { id: fieldId });
  };

  const currentFields = (selectedStage && formConfigs[selectedStage]) ? formConfigs[selectedStage] : [];

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">Stage-Dependent Forms</h3>
      <p className="text-sm text-gray-600 mb-6">
        Add custom fields that will be required when a lead enters a specific stage.
      </p>

      <div className="mb-6 flex items-end gap-4">
        <div className="flex-grow">
          <label htmlFor="stage-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select a Stage to Configure
          </label>
          <select
            id="stage-select"
            value={selectedStage || ""}
            onChange={(e) => {
              setSelectedStage(e.target.value);
              setIsAddingField(false);
            }}
            className="block w-full max-w-sm p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>-- Choose a stage --</option>
            {stages.filter(s => !['Converted', 'Lost', 'Junk'].includes(s)).map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
        {selectedStage && (
          <button
            onClick={() => setIsAddingField(!isAddingField)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> {isAddingField ? 'Cancel' : 'Add Field'}
          </button>
        )}
      </div>

      {isAddingField && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6 flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="New field label (e.g., 'Quote Amount')"
            value={newField.label}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
            className="border p-2 rounded-md shadow-sm w-full md:w-1/3"
          />
          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            className="border p-2 rounded-md shadow-sm w-full md:w-auto"
          >
            <option value="text">Text</option>
            <option value="textarea">Text Area</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="image">Image Upload</option>
            <option value="file">File Upload</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newField.required}
              onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span>Required</span>
          </label>
          <button onClick={handleAddField} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">Save Field</button>
        </div>
      )}

      {selectedStage ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-bold text-gray-800 mb-4">
            Custom Fields for "{selectedStage}" Stage
          </h4>
          {currentFields.length > 0 ? (
            <div className="space-y-3">
              {currentFields.map(field => (
                <div key={field.id} className="flex justify-between items-center p-3 bg-white border rounded-md">
                  <div>
                    <span className="font-semibold text-gray-800">{field.label}</span>
                    {field.required && <span className="text-red-500 ml-2">*Required</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full capitalize">{field.type}</span>
                    <button onClick={() => handleRemoveField(field.id)} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No custom fields defined for this stage.</p>
          )}
        </div>
      ) : (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
          Please select a stage to add custom fields.
        </div>
      )}
    </div>
  );
};

const WorkflowSettings = ({ workflow, onUpdateWorkflow }) => {
  const [currentWorkflow, setCurrentWorkflow] = useState(workflow);
  const [availableRoles] = useState(['Salesperson', 'Designer', 'Project Manager', 'Accounts']);

  const handleAddRole = (role) => {
    if (!currentWorkflow.includes(role)) {
      setCurrentWorkflow([...currentWorkflow, role]);
    }
  };
  
  const handleRemoveRole = (roleToRemove) => {
    setCurrentWorkflow(currentWorkflow.filter(role => role !== roleToRemove));
  };

  const handleMoveRole = (index, direction) => {
    if ((index === 0 && direction === -1) || (index === currentWorkflow.length - 1 && direction === 1)) {
      return;
    }
    const newWorkflow = [...currentWorkflow];
    const [item] = newWorkflow.splice(index, 1);
    newWorkflow.splice(index + direction, 0, item);
    setCurrentWorkflow(newWorkflow);
  };

  const handleSave = () => {
    onUpdateWorkflow(currentWorkflow);
    toast.success("Workflow saved successfully!");
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">Authorization Workflow</h3>
      <p className="text-sm text-gray-600 mb-6">
        Define the sequence of roles that must approve a lead for it to proceed.
      </p>

      <div className="md:flex gap-8">
        <div className="md:w-2/3">
          <h4 className="font-semibold text-gray-700 mb-2">Approval Sequence</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[200px] w-full">
            {currentWorkflow.length > 0 ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-4">
                {currentWorkflow.map((role, index) => (
                  <React.Fragment key={role}>
                    <div className="relative group flex-shrink-0 bg-white border border-gray-300 rounded-lg p-4 shadow-sm w-44 h-28 flex flex-col justify-center items-center">
                      <button
                        onClick={() => handleRemoveRole(role)}
                        className="absolute top-1 right-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes size={12} />
                      </button>
                      <div className="text-xs font-bold text-blue-600">STEP {index + 1}</div>
                      <div className="text-md font-semibold text-gray-800 mt-1 text-center truncate w-full">{role}</div>
                      <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                              onClick={() => handleMoveRole(index, -1)} 
                              disabled={index === 0}
                              className="p-1.5 bg-white border rounded-full shadow-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                              <FaChevronLeft size={10} />
                          </button>
                          <button 
                              onClick={() => handleMoveRole(index, 1)} 
                              disabled={index === currentWorkflow.length - 1}
                              className="p-1.5 bg-white border rounded-full shadow-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                              <FaChevronRight size={10} />
                          </button>
                      </div>
                    </div>
                    {index < currentWorkflow.length - 1 && (
                      <FaChevronRight className="text-gray-300 flex-shrink-0" size={20} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8 flex flex-col items-center justify-center">
                <FaSitemap className="w-12 h-12 text-gray-300 mb-4" />
                <p className="font-semibold">The approval sequence is empty.</p>
                <p className="text-sm mt-1">Add roles from the right to build your workflow.</p>
              </div>
            )}
          </div>
        </div>
        <div className="md:w-1/3 mt-6 md:mt-0">
          <h4 className="font-semibold text-gray-700 mb-2">Available Roles</h4>
          <div className="space-y-2">
            {availableRoles.map(role => (
              <button
                key={role}
                onClick={() => handleAddRole(role)}
                disabled={currentWorkflow.includes(role)}
                className="w-full text-left p-3 bg-white border rounded-md flex items-center justify-between disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <span className="font-medium text-gray-700">{role}</span>
                <FaPlus className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 shadow-sm"
        >
          Save Workflow
        </button>
      </div>
    </div>
  );
};

const PermissionsSettings = () => {
  const allPermissions = [
    { id: 'manageSettings', label: 'Manage Module Settings' },
    { id: 'viewAllLeads', label: 'View All Leads' },
    { id: 'editAllLeads', label: 'Edit All Leads' },
    { id: 'deleteAllLeads', label: 'Delete Leads' },
    { id: 'reassignLeads', label: 'Reassign Leads' },
    { id: 'viewAssignedLeadsOnly', label: 'View Assigned Leads Only' },
    { id: 'exportLeads', label: 'Export Data' },
  ];

  const [roles, setRoles] = useState(DEFAULT_ROLES);

  const handlePermissionChange = (roleId, permissionId) => {
    setRoles(roles.map(role => {
      if (role.id === roleId && role.isEditable) {
        const newPermissions = role.permissions.includes(permissionId)
          ? role.permissions.filter(p => p !== permissionId)
          : [...role.permissions, permissionId];
        return { ...role, permissions: newPermissions };
      }
      return role;
    }));
  };
  
  const handleGrantAdminAccess = (roleId) => {
      const adminPermissions = roles.find(r => r.id === 'admin').permissions;
      setRoles(roles.map(role => {
          if (role.id === roleId) {
              return { ...role, permissions: [...adminPermissions] };
          }
          return role;
      }));
      toast.success(`Granted Full Admin Access to ${roles.find(r => r.id === roleId).name}`);
  }

  const handleRevokeAdminAccess = (roleId) => {
    const defaultRole = DEFAULT_ROLES.find(r => r.id === roleId);
    if (!defaultRole) return;

    setRoles(roles.map(role => {
      if (role.id === roleId) {
        return { ...role, permissions: defaultRole.permissions };
      }
      return role;
    }));
    toast.error(`Revoked Admin Access from ${defaultRole.name}`);
  };

  const adminPermissionsSet = new Set(roles.find(r => r.id === 'admin').permissions);

  const isFullAdmin = (role) => {
    if (!role.isEditable) return false;
    if (role.permissions.length !== adminPermissionsSet.size) return false;
    return role.permissions.every(p => adminPermissionsSet.has(p));
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">User Roles & Permissions</h3>
      <p className="text-sm text-gray-600 mb-6">Define what each role can see and do within the Sales module.</p>

      <div className="space-y-6">
        {roles.map(role => {
          const hasAdminAccess = isFullAdmin(role);
          
          return (
            <div key={role.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-800 text-md">
                    {role.name} {(hasAdminAccess || role.id === 'sales_manager') && <span className="text-green-600 font-semibold">(Admin)</span>}
                  </h4>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
                <div className="flex gap-2">
                  {role.id !== 'sales_manager' && role.isEditable && !hasAdminAccess && (
                     <button 
                       onClick={() => handleGrantAdminAccess(role.id)} 
                       className="text-xs bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-amber-600 whitespace-nowrap"
                     >
                       Grant Full Admin Access
                     </button>
                  )}
                  {role.id !== 'sales_manager' && role.isEditable && hasAdminAccess && (
                     <button 
                       onClick={() => handleRevokeAdminAccess(role.id)} 
                       className="text-xs bg-red-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-red-700 whitespace-nowrap"
                     >
                       Revoke Admin Access
                     </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                {allPermissions.map(permission => (
                  <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={role.permissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(role.id, permission.id)}
                      disabled={!role.isEditable || role.id === 'sales_manager'}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={`text-sm ${(!role.isEditable || role.id === 'sales_manager') ? 'text-gray-400' : 'text-gray-700'}`}>{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-8 flex justify-end">
          <button
              onClick={() => toast.success("Permissions saved successfully!")}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 shadow-sm"
          >
              Save Changes
          </button>
      </div>
    </div>
  );
};

// +++ NEW: Settings Page for Pipeline & Stage Management +++
const SettingsPage = ({ 
  leads, 
  kanbanStatuses, 
  setKanbanStatuses, 
  onDeleteStages,
  formConfigs,
  onFormConfigChange,
  workflowConfig,
  onWorkflowConfigChange,
}) => {
  const [activeSettingsPage, setActiveSettingsPage] = useState('pipelineStages');

  const settingsPages = [
    { id: 'pipelineStages', label: 'Pipeline Stages', icon: FaStream },
    { id: 'forms', label: 'Stage-Dependent Forms', icon: FaTasks },
    { id: 'permissions', label: 'User Roles & Permissions', icon: FaUserShield },
    { id: 'workflow', label: 'Workflow', icon: FaSitemap },
  ];

  const renderSettingsContent = () => {
    switch (activeSettingsPage) {
      case 'pipelineStages':
        return (
          <PipelineSettings
            stages={kanbanStatuses}
            setStages={setKanbanStatuses}
            leads={leads}
            onDeleteStages={onDeleteStages}
          />
        );
      case 'forms':
        return <StageFormsSettings stages={kanbanStatuses} formConfigs={formConfigs} onConfigChange={onFormConfigChange} />;
      case 'permissions':
        return <PermissionsSettings />;
      case 'workflow':
        return <WorkflowSettings workflow={workflowConfig} onUpdateWorkflow={onWorkflowConfigChange} />;
      default:
        return <div className="text-center text-gray-500">Select a setting to configure.</div>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex gap-8">
        <aside className="w-1/4 border-r border-gray-200 pr-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Module Settings</h2>
          <nav className="flex flex-col gap-2">
            {settingsPages.map(page => (
              <button
                key={page.id}
                onClick={() => setActiveSettingsPage(page.id)}
                className={`flex items-center gap-3 w-full text-left p-3 rounded-md transition-colors duration-150 text-sm font-medium ${
                  activeSettingsPage === page.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <page.icon className="w-5 h-5" />
                <span>{page.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="w-3/4">
          {renderSettingsContent()}
        </main>
      </div>
    </div>
  );
};

const PipelineSettings = ({ stages, setStages, leads, onDeleteStages }) => {
  const [newStageName, setNewStageName] = useState("");
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [showDeletePipelineModal, setShowDeletePipelineModal] = useState(false);

  const handleAddStage = () => {
    if (newStageName && !stages.includes(newStageName)) {
      setStages(prev => [...prev, newStageName]);
      toast.success(`Stage "${newStageName}" added successfully.`);
      setNewStageName("");
      setIsAddingStage(false);
    } else {
      toast.error("Stage name cannot be empty or a duplicate.");
    }
  };

  const handleCancelAddStage = () => {
    setNewStageName("");
    setIsAddingStage(false);
  };
  
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Pipeline Stage Management</h3>
      <p className="text-sm text-gray-600 mb-6">Add, remove, and reorder stages for your sales pipeline.</p>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAddingStage(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Add Stage
          </button>
          <button
            onClick={() => setShowDeletePipelineModal(true)}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <FaTrash /> Delete Stages
          </button>
        </div>

        {isAddingStage && (
          <div className="p-4 bg-gray-50 rounded-lg border flex items-center gap-4">
            <input
              type="text"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="Enter new stage name"
              className="border p-2 rounded-md shadow-sm w-full"
              autoFocus
            />
            <button onClick={handleAddStage} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">Save</button>
            <button onClick={handleCancelAddStage} className="text-gray-500 hover:text-gray-700"><FaTimes /></button>
          </div>
        )}
        
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-2">Current Stages:</h4>
          <div className="flex flex-wrap gap-2">
            {stages.map(stage => (
              <span key={stage} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">{stage}</span>
            ))}
          </div>
        </div>
      </div>
      
      <DeletePipelineModal
        isOpen={showDeletePipelineModal}
        onClose={() => setShowDeletePipelineModal(false)}
        stages={stages}
        onDeleteStages={onDeleteStages}
      />
    </div>
  );
};

const StageActionModal = ({ isOpen, onClose, lead, targetStage, stageConfig, onSubmit }) => {
  if (!isOpen || !lead || !stageConfig) return null;

  // We only care about required fields that are not yet filled.
  const requiredFields = (stageConfig || []).filter(field => {
    return field.required && (!lead.customData || !lead.customData[field.id]);
  });
  
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    requiredFields.forEach(field => {
      initialData[field.id] = '';
    });
    return initialData;
  });

  // If there are no required fields, submit immediately and close.
  useEffect(() => {
    if (requiredFields.length === 0 && isOpen) {
      onSubmit({ ...lead, status: targetStage });
      onClose();
    }
  }, [isOpen, requiredFields.length]);


  const handleChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };
  
  const handleFileChange = (fieldId, file) => {
    setFormData(prev => ({ ...prev, [fieldId]: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const field of requiredFields) {
      if (!formData[field.id]) {
        toast.error(`'${field.label}' is required for the "${targetStage}" stage.`);
        return;
      }
    }
    
    const newCustomData = { ...(lead.customData || {}) };
    for (const field of requiredFields) {
        newCustomData[field.id] = formData[field.id];
    }

    const updatedLead = { 
        ...lead, 
        customData: newCustomData,
        status: targetStage 
    };
    onSubmit(updatedLead);
  };

  // If there are no required fields, don't render anything, the useEffect will handle it.
  if (requiredFields.length === 0) {
    return null;
  }
  
  const renderField = (field) => {
      const commonProps = {
          id: field.id,
          required: field.required,
      };

      switch (field.type) {
          case 'textarea':
              return <textarea {...commonProps} value={formData[field.id] || ''} onChange={(e) => handleChange(field.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />;
          case 'number':
              return <input {...commonProps} type="number" value={formData[field.id] || ''} onChange={(e) => handleChange(field.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />;
          case 'date':
              return <input {...commonProps} type="date" value={formData[field.id] || ''} onChange={(e) => handleChange(field.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />;
          case 'image':
              return <input {...commonProps} type="file" accept="image/*" onChange={(e) => handleFileChange(field.id, e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>;
          case 'file':
              return <input {...commonProps} type="file" onChange={(e) => handleFileChange(field.id, e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>;
          default: // 'text'
              return <input {...commonProps} type="text" value={formData[field.id] || ''} onChange={(e) => handleChange(field.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />;
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Complete Required Fields for "{targetStage}"</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {requiredFields.map(field => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Update Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FiltersDropdown = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  salesPersons,
  designers,
  leadSources,
  projectTypes,
  activeFiltersCount
}) => {
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 w-96">
      <div className="p-4 border-b">
        <h4 className="font-semibold text-gray-800">Filter Leads</h4>
      </div>
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Sales Rep */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sales Rep</label>
          <select
            name="salesRep"
            value={filters.salesRep}
            onChange={(e) => onFilterChange('salesRep', e.target.value)}
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm text-sm"
          >
            <option value="">All</option>
            {salesPersons.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        {/* Designer */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Designer</label>
          <select
            name="designer"
            value={filters.designer}
            onChange={(e) => onFilterChange('designer', e.target.value)}
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm text-sm"
          >
            <option value="">All</option>
            {designers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
        {/* Lead Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Lead Source</label>
          <select
            name="leadSource"
            value={filters.leadSource}
            onChange={(e) => onFilterChange('leadSource', e.target.value)}
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm text-sm"
          >
            <option value="">All</option>
            {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Type</label>
          <select
            name="projectType"
            value={filters.projectType}
            onChange={(e) => onFilterChange('projectType', e.target.value)}
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm text-sm"
          >
            <option value="">All</option>
            {projectTypes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Creation Date</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="date"
              name="from"
              value={filters.dateRange.from}
              onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })}
              className="w-full p-2 border-gray-300 rounded-md shadow-sm text-sm"
            />
            <span>to</span>
            <input
              type="date"
              name="to"
              value={filters.dateRange.to}
              onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, to: e.target.value })}
              className="w-full p-2 border-gray-300 rounded-md shadow-sm text-sm"
            />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-3 flex justify-end">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

const ManagerContent = ({ role }) => {
  // const dispatch = useDispatch();
  // const { leads, loading, error } = useSelector((state) => state.leads);
  // const { stages: kanbanStatuses } = useSelector((state) => state.pipeline);

  // Use local state for leads and pipeline stages
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [kanbanStatuses, setKanbanStatuses] = useState([
    'New',
    'Contacted',
    'Qualified',
    'Quoted',
    'Converted',
    'Lost',
    'Junk',
  ]);

  const [workflowConfig, setWorkflowConfig] = useState(['Salesperson', 'Designer']);

  const [formConfigs, setFormConfigs] = useState(() => {
    const initialConfigs = {};
    // This should ideally be initialized with kanbanStatuses, but it's empty at first.
    // We'll rely on the effect below to populate it.
    return initialConfigs;
  });

  useEffect(() => {
    setFormConfigs(prev => {
      const newConfigs = { ...prev };
      kanbanStatuses.forEach(stage => {
        if (!newConfigs[stage]) { // Only initialize if it doesn't exist
          newConfigs[stage] = []; // Now an array for custom fields
        }
      });
      return newConfigs;
    });
  }, [kanbanStatuses]);


  const handleFormConfigChange = (action, stage, field) => {
    setFormConfigs(prev => {
      const newConfigs = { ...prev };
      let stageFields = newConfigs[stage] ? [...newConfigs[stage]] : [];

      if (action === 'add') {
        stageFields.push(field);
      } else if (action === 'remove') {
        stageFields = stageFields.filter(f => f.id !== field.id);
      }
      
      newConfigs[stage] = stageFields;
      return newConfigs;
    });
  };

  // Deduplicate leads by leadId (keep first occurrence)
  const dedupedLeads = React.useMemo(() => {
    const seen = new Set();
    return leads.filter(lead => {
      if (lead && lead.leadId && !seen.has(lead.leadId)) {
        seen.add(lead.leadId);
        return true;
      }
      return false;
    });
  }, [leads]);

  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [filterText, setFilterText] = useState("");

  // Modal states
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [leadToConvertId, setLeadToConvertId] = useState(null);
  const [showLostReasonModal, setShowLostReasonModal] = useState(false);
  const [leadToMarkLost, setLeadToMarkLost] = useState(null);
  const [showJunkReasonModal, setShowJunkReasonModal] = useState(false);
  const [leadToMarkJunkId, setLeadToMarkJunkId] = useState(null);
  const [newStageName, setNewStageName] = useState("");
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const [showDeletePipelineModal, setShowDeletePipelineModal] = useState(false);
  const [viewMode, setViewMode] = useState('kanban');
  const router = useRouter();
  const { view: queryView } = router.query;
  const [mainView, setMainView] = useState('pipeline'); // 'pipeline' | 'settings'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    salesRep: '',
    designer: '',
    leadSource: '',
    projectType: '',
    dateRange: { from: '', to: '' },
  });

  const [stageActionModalData, setStageActionModalData] = useState({ 
    isOpen: false, 
    lead: null, 
    targetStage: '' 
  });

  useEffect(() => {
    if (queryView === 'settings') {
      setMainView('settings');
    } else {
      setMainView('pipeline');
    }
  }, [queryView]);

  const [pendingConversion, setPendingConversion] = useState(null); // {lead, fromStatus}
  const [pendingLost, setPendingLost] = useState(null); // {lead, fromStatus}
  const [pendingJunk, setPendingJunk] = useState(null); // {lead, fromStatus}

  const [showScheduleActivityModal, setShowScheduleActivityModal] = useState(false);
  const [leadToScheduleActivity, setLeadToScheduleActivity] = useState(null);

  const uniqueLeadSources = useMemo(() => [...new Set(MOCK_LEADS.map(lead => lead.leadSource).filter(Boolean))], [MOCK_LEADS]);
  const uniqueProjectTypes = useMemo(() => [...new Set(MOCK_LEADS.map(lead => lead.projectType).filter(Boolean))], [MOCK_LEADS]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      salesRep: '',
      designer: '',
      leadSource: '',
      projectType: '',
      dateRange: { from: '', to: '' },
    });
    setShowFilters(false);
  };
  
  const activeFiltersCount = Object.values(filters).filter(v => {
    if (typeof v === 'string') return v !== '';
    if (typeof v === 'object' && v !== null) return v.from !== '' || v.to !== '';
    return false;
  }).length;

  // All lead operations now update local state
  const leadsByStatus = useMemo(() => {
    const grouped = {};
    kanbanStatuses.forEach(status => {
      grouped[status] = [];
    });
    const filteredLeads = dedupedLeads.filter(lead => {
        // Text search (if text is present)
        const matchesText = filterText
          ? Object.values(lead).some(value =>
              String(value).toLowerCase().includes(filterText.toLowerCase())
            )
          : true;

        // Structured filters
        const matchesSalesRep = filters.salesRep ? lead.salesRep === filters.salesRep : true;
        const matchesDesigner = filters.designer ? lead.designer === filters.designer : true;
        const matchesLeadSource = filters.leadSource ? lead.leadSource === filters.leadSource : true;
        const matchesProjectType = filters.projectType ? lead.projectType === filters.projectType : true;
        
        const matchesDate = (() => {
          if (!filters.dateRange.from && !filters.dateRange.to) return true;
          if (!lead.createdAt) return false;
          
          const leadDate = new Date(lead.createdAt);
          // Set time to 0 to compare dates only
          leadDate.setHours(0, 0, 0, 0);

          if (filters.dateRange.from) {
              const fromDate = new Date(filters.dateRange.from);
              if (leadDate < fromDate) return false;
          }
          if (filters.dateRange.to) {
              const toDate = new Date(filters.dateRange.to);
              if (leadDate > toDate) return false;
          }
          return true;
        })();

        return matchesText && matchesSalesRep && matchesDesigner && matchesLeadSource && matchesProjectType && matchesDate;
    });
    
    filteredLeads.forEach(lead => {
      if (grouped[lead.status]) {
        grouped[lead.status].push(lead);
      } else {
        if (!grouped[lead.status]) {
            grouped[lead.status] = [];
        }
        grouped[lead.status].push(lead);
      }
    });
    return grouped;
  }, [dedupedLeads, filterText, kanbanStatuses, filters]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const leadId = active.id;
    const newStatus = over.id;
    const oldLead = leads.find(l => l.leadId === leadId);
    if (newStatus === 'Converted') {
      setPendingConversion({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToConvertId(leadId);
      setShowConvertModal(true);
    } else if (newStatus === 'Lost') {
      setPendingLost({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToMarkLost(oldLead);
      setShowLostReasonModal(true);
    } else if (newStatus === 'Junk') {
      setPendingJunk({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToMarkJunkId(leadId);
      setShowJunkReasonModal(true);
    } else {
      const requiredFields = (formConfigs[newStatus] || []).filter(field => {
        // A field is required if it's marked as such AND the lead doesn't already have a value for it.
        // We will assume custom data is stored in a `customData` object on the lead.
        return field.required && (!oldLead.customData || !oldLead.customData[field.id]);
      });

      if (requiredFields.length > 0) {
        setStageActionModalData({ isOpen: true, lead: oldLead, targetStage: newStatus });
      } else {
        setLeads(prevLeads => prevLeads.map(l =>
          l.leadId === leadId ? { ...l, status: newStatus } : l
        ));
      }
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setShowAddLeadModal(true);
  };

  const handleConvert = (lead) => {
    setLeadToConvertId(lead.leadId);
    setShowConvertModal(true);
  };

  const handleMarkLost = (lead) => {
    setLeadToMarkLost(lead);
    setShowLostReasonModal(true);
  };

  const handleMarkJunk = (lead) => {
    setLeadToMarkJunkId(lead.leadId);
    setShowJunkReasonModal(true);
  };

  const handleOpenAddLeadForm = (status) => {
    const newLeadData = { ...defaultLeadData };
    if (typeof status === 'string') {
      newLeadData.status = status;
    }
    setEditingLead(newLeadData);
    setShowAddLeadModal(true);
  };

  const handleAddLeadSubmit = (formData) => {
    if (!formData.salesRep || !formData.designer) {
      toast.error('Please assign both Sales Person and Designer.');
      return;
    }
    const leadData = {
      ...defaultLeadData,
      ...formData,
      status: formData.status || "New",
      submittedBy: role,
    };
    if (editingLead && editingLead.leadId) {
      setLeads(prevLeads => prevLeads.map(l =>
        l.leadId === editingLead.leadId ? { ...l, ...leadData } : l
      ));
    } else {
      // Assign a new unique leadId
      const newId = `LEAD${Math.floor(Math.random() * 100000)}`;
      setLeads(prevLeads => [
        ...prevLeads,
        { ...leadData, leadId: newId },
      ]);
    }
    setShowAddLeadModal(false);
  };

  const handleAddStage = () => {
    if (newStageName && !kanbanStatuses.includes(newStageName)) {
      setKanbanStatuses(prev => [...prev, newStageName]);
      setNewStageName("");
      setIsAddingStage(false);
    }
  };

  const handleCancelAddStage = () => {
    setNewStageName("");
    setIsAddingStage(false);
  };

  const handlePipelineAction = (action) => {
    setShowPipelineDropdown(false);
    if (action === 'add') {
      setIsAddingStage(true);
    } else if (action === 'delete') {
      setShowDeletePipelineModal(true);
    }
  };

  const handleDeleteStages = (stagesToDelete) => {
    // Check if any leads are currently in the stages being deleted
    const leadsInStages = dedupedLeads.filter(lead => stagesToDelete.includes(lead.status));
    if (leadsInStages.length > 0) {
      toast.error(`Cannot delete stages with active leads. Please move ${leadsInStages.length} lead(s) to other stages first.`);
      return;
    }
    setKanbanStatuses(prev => prev.filter(stage => !stagesToDelete.includes(stage)));
    toast.success(`Successfully deleted ${stagesToDelete.length} stage(s)`);
  };

  const handleConvertModalClose = () => {
    setShowConvertModal(false);
    setLeadToConvertId(null);
    setPendingConversion(null);
  };
  const handleConvertSuccess = (updatedLead) => {
    setLeads(prevLeads => prevLeads.map(l =>
      l.leadId === updatedLead.leadId ? { ...l, ...updatedLead, status: 'Converted' } : l
    ));
    handleConvertModalClose();
  };
  const handleLostModalClose = () => {
    setShowLostReasonModal(false);
    setLeadToMarkLost(null);
    setPendingLost(null);
  };
  const handleLostSuccess = (updatedLead) => {
    setLeads(prevLeads => prevLeads.map(l =>
      l.leadId === updatedLead.leadId ? { ...l, ...updatedLead, status: 'Lost' } : l
    ));
    handleLostModalClose();
  };
  const handleJunkModalClose = () => {
    setShowJunkReasonModal(false);
    setLeadToMarkJunkId(null);
    setPendingJunk(null);
  };
  const handleJunkSuccess = (updatedLead) => {
    setLeads(prevLeads => prevLeads.map(l =>
      l.leadId === updatedLead.leadId ? { ...l, ...updatedLead, status: 'Junk' } : l
    ));
    handleJunkModalClose();
  };

  const handleScheduleActivity = (lead) => {
    setLeadToScheduleActivity(lead);
    setShowScheduleActivityModal(true);
  };

  const handleScheduleActivitySuccess = (activity) => {
    setLeads(prevLeads => prevLeads.map(l => {
      if (l.leadId === leadToScheduleActivity.leadId) {
        const activities = Array.isArray(l.activities) ? [...l.activities] : [];
        activities.push({ ...activity, createdAt: new Date().toISOString() });
        return { ...l, activities, updatedAt: new Date().toISOString() };
      }
      return l;
    }));
    setShowScheduleActivityModal(false);
    setLeadToScheduleActivity(null);
    toast.success('Activity scheduled successfully!');
  };

  const handleStageActionSubmit = (updatedLead) => {
    setLeads(prevLeads => prevLeads.map(l => (l.leadId === updatedLead.leadId ? updatedLead : l)));
    setStageActionModalData({ isOpen: false, lead: null, targetStage: '' });
    toast.success(`Lead moved to "${updatedLead.status}" successfully.`);
  };

  const handleViewChange = (view) => {
    setMainView(view);
    router.push('/SalesManager/Manager' + (view === 'settings' ? '?view=settings' : ''), undefined, { shallow: true });
  };

  const handleWorkflowConfigChange = (newWorkflow) => {
    setWorkflowConfig(newWorkflow);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => handleOpenAddLeadForm()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow flex items-center min-w-24 justify-center transition-colors duration-200 hover:bg-blue-700"
          >
            New
          </button>
        </div>

        {mainView === 'pipeline' && (
          <div className="flex items-center space-x-4">
            <div className="relative w-72">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="border p-2 rounded-md shadow-sm w-full pl-10 bg-white"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 border transition-colors ${
                  activeFiltersCount > 0 ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaCog />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <FiltersDropdown 
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                salesPersons={salesPersons}
                designers={designers}
                leadSources={uniqueLeadSources}
                projectTypes={uniqueProjectTypes}
                activeFiltersCount={activeFiltersCount}
              />
            </div>

            <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-md">
              <button
                className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-blue-600 shadow text-white' : 'hover:bg-blue-100 text-blue-600'}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban Board View"
              >
                <FaThLarge size={18} />
              </button>
              <button
                className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'hover:bg-blue-100 text-blue-600'}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <FaListUl size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* {loading && <p className="text-center">Loading opportunities...</p>}
      {error && <p className="text-center text-red-500">Error: {error.message || "Could not fetch opportunities."}</p>} */}

      {mainView === 'pipeline' ? (
        viewMode === 'kanban' ? (
          <KanbanBoard
            leadsByStatus={leadsByStatus}
            onDragEnd={handleDragEnd}
            statuses={kanbanStatuses}
            onEdit={handleEdit}
            onConvert={handleConvert}
            onMarkLost={handleMarkLost}
            onMarkJunk={handleMarkJunk}
            onAddLead={handleOpenAddLeadForm}
            isAddingStage={isAddingStage}
            newStageName={newStageName}
            setNewStageName={setNewStageName}
            onAddStage={handleAddStage}
            onCancelAddStage={handleCancelAddStage}
            onScheduleActivity={handleScheduleActivity}
          />
        ) : (
          <LeadsTable leads={dedupedLeads} />
        )
      ) : (
        <SettingsPage
          leads={dedupedLeads}
          kanbanStatuses={kanbanStatuses}
          setKanbanStatuses={setKanbanStatuses}
          onDeleteStages={handleDeleteStages}
          formConfigs={formConfigs}
          onFormConfigChange={handleFormConfigChange}
          workflowConfig={workflowConfig}
          onWorkflowConfigChange={handleWorkflowConfigChange}
        />
      )}

      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSubmit={handleAddLeadSubmit}
        initialData={editingLead || defaultLeadData}
        isManagerView={true}
        salesPersons={salesPersons}
        designers={designers}
      />

      {showConvertModal && (
        <ConvertLeadModal
          lead={pendingConversion?.lead}
          onClose={handleConvertModalClose}
          onSuccess={pendingConversion ? handleConvertSuccess : undefined}
        />
      )}
      {showLostReasonModal && (
        <LostLeadModal
          lead={pendingLost?.lead}
          onClose={handleLostModalClose}
          onSuccess={pendingLost ? handleLostSuccess : undefined}
        />
      )}
      {showJunkReasonModal && (
        <JunkReasonModal
          lead={pendingJunk?.lead}
          onClose={handleJunkModalClose}
          onSuccess={pendingJunk ? handleJunkSuccess : undefined}
        />
      )}
      
      <DeletePipelineModal
        isOpen={showDeletePipelineModal}
        onClose={() => setShowDeletePipelineModal(false)}
        stages={kanbanStatuses}
        onDeleteStages={handleDeleteStages}
      />

      <StageActionModal
        isOpen={stageActionModalData.isOpen}
        onClose={() => setStageActionModalData({ isOpen: false, lead: null, targetStage: '' })}
        lead={stageActionModalData.lead}
        targetStage={stageActionModalData.targetStage}
        stageConfig={formConfigs[stageActionModalData.targetStage]}
        onSubmit={handleStageActionSubmit}
      />

      <AdvancedScheduleActivityModal
        isOpen={showScheduleActivityModal}
        onClose={() => { setShowScheduleActivityModal(false); setLeadToScheduleActivity(null); }}
        lead={leadToScheduleActivity}
        onSuccess={handleScheduleActivitySuccess}
      />
    </div>
  );
};

const Manager = ({ role }) => {
  return (
    <MainLayout>
      <ManagerContent role={role} />
    </MainLayout>
  );
};

export default Manager; 