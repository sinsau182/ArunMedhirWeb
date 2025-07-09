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
  FaChevronRight,
  FaRobot,
  FaEnvelopeOpenText,
  FaCopy,
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Simple UUID generator function
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Palette Field Component
const PaletteField = ({ field }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${field.type}`,
    data: {
      isPaletteItem: true,
      field: field,
    }
  });

  return (
    <div 
      ref={setNodeRef} 
      {...attributes} 
      {...listeners} 
      className={`w-full p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left cursor-grab bg-white group ${
        isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:shadow-md'
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{field.icon}</span>
        <div className="flex-1">
          <div className="font-medium text-gray-700 text-sm">{field.label}</div>
          <div className="text-xs text-gray-500">{field.description}</div>
        </div>
        <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
          </svg>
        </div>
      </div>
      {/* Drag hint overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-xs font-medium text-blue-700 bg-white px-2 py-1 rounded shadow">
          Drag to add →
        </span>
      </div>
    </div>
  )
};

// Field Preview Component
const FieldPreview = ({ field, availableFields }) => {
  const fieldInfo = availableFields.find(f => f.type === field.type);
  
  return (
     <div className="p-4 border rounded-lg bg-white shadow-xl w-72">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{fieldInfo?.icon || '📝'}</span>
            <label className="font-medium text-gray-800">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
          </div>
          <p className="text-sm text-gray-500">
            {field.placeholder || field.text || `${field.type} field`}
          </p>
        </div>
      </div>
    </div>
  )
};

// Palette Field Preview Component
const PaletteFieldPreview = ({ field }) => (
  <div className="p-3 border rounded-lg bg-white shadow-xl">
    <div className="flex items-center gap-3">
      <span className="text-xl">{field.icon}</span>
      <span className="font-medium text-gray-700 text-sm">{field.label}</span>
    </div>
  </div>
);

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
    activities: [
      { id: 1, type: 'task', summary: 'Follow-up call', dueDate: '2024-05-15', status: 'done' },
      { id: 2, type: 'meeting', summary: 'Client meeting', dueDate: '2024-07-30', status: 'pending' }, // Upcoming
    ],
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
    activities: [
      { id: 3, type: 'call', summary: 'Initial call', dueDate: '2024-05-21', status: 'done' },
      { id: 4, type: 'task', summary: 'Send quote', dueDate: '2024-05-25', status: 'pending' }, // Overdue
    ],
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
    activities: [], // No activities
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

// Form Preview Component - Shows actual form fields as they would appear to users
const FormPreview = ({ fields, availableFields, onFieldReorder }) => {
  const [formData, setFormData] = useState({});

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderFormField = (field) => {
    const fieldInfo = availableFields.find(f => f.type === field.type);
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{field.placeholder || 'Select an option...'}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleInputChange(field.id, newValues);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => handleInputChange(field.id, e.target.files[0])}
            required={field.required}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'header':
        return (
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {field.text || 'Section Header'}
          </h3>
        );

      case 'static-text':
        return (
          <p className="text-sm text-gray-600">
            {field.text || 'This is some informational text.'}
          </p>
        );

      case 'rating':
        return (
          <div className="flex items-center gap-1">
            {[...Array(field.maxRating || 5)].map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInputChange(field.id, idx + 1)}
                className={`w-8 h-8 ${
                  value > idx ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              >
                ⭐
              </button>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  if (!fields || fields.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <span className="text-4xl text-gray-400 mb-4 block">📝</span>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Form Fields</h3>
          <p className="text-sm text-gray-500">Add some fields to see the form preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-2">
          {field.type !== 'header' && field.type !== 'static-text' && (
            <label className="block text-sm font-medium text-gray-700">
              {field.label || 'Untitled Field'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {renderFormField(field)}
          {field.helpText && (
            <p className="text-xs text-gray-500">{field.helpText}</p>
          )}
        </div>
      ))}
    </div>
  );
};

// Form Preview Modal Component
const FormPreviewModal = ({ isOpen, onClose, fields, availableFields, stageName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Form Preview: {stageName}</h2>
            <p className="text-sm text-gray-500">This is how the form will appear to users</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        {/* Form Preview Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                {stageName} Stage Form
              </h3>
              <FormPreview 
                fields={fields} 
                availableFields={availableFields}
              />
              <div className="mt-8 flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const StageFormsSettings = ({ stages, formConfigs, onConfigChange }) => {
  const [selectedStage, setSelectedStage] = useState(stages[0] || null);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activeTab, setActiveTab] = useState('fields'); // 'fields' or 'templates'
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set(['Basic Fields'])); // Start with Basic Fields expanded
  const [previewMode, setPreviewMode] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);

  const FIELD_GROUPS = [
    {
      name: 'Basic Fields',
      icon: '📝',
      fields: [
        { type: 'text', label: 'Short Text', icon: '📝', description: 'Single-line text input', default: { label: 'Full Name', placeholder: 'Enter full name...' } },
        { type: 'textarea', label: 'Long Text', icon: '📄', description: 'Multi-line text area', default: { label: 'Description', placeholder: 'Enter detailed description...' } },
        { type: 'number', label: 'Number', icon: '🔢', description: 'Numeric input field', default: { label: 'Amount', placeholder: 'Enter amount...' } },
        { type: 'email', label: 'Email', icon: '📧', description: 'Email address input', default: { label: 'Work Email', placeholder: 'Enter work email...' } },
      ]
    },
    {
      name: 'Contact Fields',
      icon: '📞',
      fields: [
        { type: 'tel', label: 'Phone', icon: '📞', description: 'Phone number input', default: { label: 'Phone Number', placeholder: 'Enter phone number...' } },
        { type: 'text', label: 'Address', icon: '📍', description: 'Address input field', default: { label: 'Address', placeholder: 'Enter address...' } },
      ]
    },
    {
      name: 'Date & Time',
      icon: '📅',
      fields: [
        { type: 'date', label: 'Date', icon: '📅', description: 'Date picker', default: { label: 'Meeting Date', placeholder: 'Select meeting date' } },
        { type: 'time', label: 'Time', icon: '⏰', description: 'Time picker', default: { label: 'Meeting Time', placeholder: 'Select meeting time' } },
      ]
    },
    {
      name: 'Selection Fields',
      icon: '📋',
      fields: [
        { type: 'select', label: 'Dropdown', icon: '📋', description: 'Single choice dropdown', default: { label: 'Priority Level', options: ['Low', 'Medium', 'High'] } },
        { type: 'checkbox', label: 'Checkboxes', icon: '☑️', description: 'Multiple choice checkboxes', default: { label: 'Interests', options: ['Product Demo', 'Pricing', 'Technical Support'] } },
        { type: 'radio', label: 'Radio Group', icon: '🔘', description: 'Single choice radio buttons', default: { label: 'Decision Maker', options: ['Yes', 'No', 'Maybe'] } },
      ]
    },
    {
      name: 'File Upload',
      icon: '📎',
      fields: [
        { type: 'file', label: 'File Upload', icon: '📎', description: 'File upload field', default: { label: 'Upload Document' } },
        { type: 'signature', label: 'Signature', icon: '✍️', description: 'Digital signature field', default: { label: 'Digital Signature' } },
      ]
    },
    {
      name: 'Display Fields',
      icon: '🔤',
      fields: [
        { type: 'header', label: 'Header', icon: '🔤', description: 'Section header text', default: { text: 'Section Header' } },
        { type: 'static-text', label: 'Static Text', icon: '📖', description: 'Informational text', default: { text: 'This is some informational text.' } },
        { type: 'rating', label: 'Rating', icon: '⭐', description: 'Star rating field', default: { label: 'Satisfaction Rating', maxRating: 5 } },
      ]
    }
  ];

  // Flatten all fields for easy access
  const AVAILABLE_FIELDS = FIELD_GROUPS.flatMap(group => group.fields);

  const FIELD_TEMPLATES = [
    {
      name: 'Lead Contact Info',
      description: 'Basic contact information for leads',
      fields: [
        { type: 'text', label: 'Full Name', placeholder: 'Enter full name...', required: true },
        { type: 'email', label: 'Work Email', placeholder: 'Enter work email...', required: true },
        { type: 'tel', label: 'Phone Number', placeholder: 'Enter phone number...', required: true },
        { type: 'text', label: 'Company', placeholder: 'Enter company name...' },
        { type: 'text', label: 'Job Title', placeholder: 'Enter job title...' }
      ]
    },
    {
      name: 'Product Demo Info',
      description: 'Information needed for product demonstrations',
      fields: [
        { type: 'text', label: 'Use Case', placeholder: 'Describe your use case...', required: true },
        { type: 'select', label: 'Team Size', options: ['1-10', '11-50', '51-200', '200+'], required: true },
        { type: 'textarea', label: 'Current Solution', placeholder: 'Describe your current solution...' },
        { type: 'date', label: 'Preferred Demo Date', placeholder: 'Select preferred date' },
        { type: 'checkbox', label: 'Demo Requirements', options: ['Technical Demo', 'Business Demo', 'Integration Demo'] }
      ]
    },
    {
      name: 'Document Upload',
      description: 'Standard document collection',
      fields: [
        { type: 'file', label: 'Business Requirements', required: true },
        { type: 'file', label: 'Technical Specifications' },
        { type: 'file', label: 'Budget Approval' },
        { type: 'textarea', label: 'Additional Notes', placeholder: 'Any additional requirements...' }
      ]
    }
  ];

  useEffect(() => {
    console.log('StageFormsSettings useEffect triggered:', { selectedStage, formConfigs, hasConfigForStage: !!formConfigs[selectedStage] });
    if (selectedStage && formConfigs[selectedStage]) {
      console.log('Loading fields for stage:', selectedStage, 'fieldCount:', formConfigs[selectedStage].length);
      setFields(formConfigs[selectedStage]);
    } else {
      console.log('No config for stage, clearing fields');
      setFields([]);
    }
    setSelectedField(null);
  }, [selectedStage, formConfigs]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const activeFieldData = useMemo(() => {
    if (!activeId) return null;
    if (String(activeId).startsWith('palette-')) {
        const type = String(activeId).replace('palette-', '');
        return AVAILABLE_FIELDS.find(f => f.type === type);
    }
    return fields.find(f => f.id === activeId);
  }, [activeId, fields]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log('handleDragEnd called:', { activeId: active.id, overId: over?.id, isPaletteItem: active.data.current?.isPaletteItem });
    setActiveId(null);
    if (!over) return;
    
    const isPaletteItem = active.data.current?.isPaletteItem;

    if (isPaletteItem) {
      const overIsCanvas = over.id === 'form-canvas-droppable' || fields.find(f => f.id === over.id);
      console.log('Palette item dropped:', { overIsCanvas, overID: over.id });
      if (overIsCanvas) {
        const fieldTemplate = active.data.current.field;
        const newField = {
          id: generateId(),
          type: fieldTemplate.type,
          required: false,
          ...fieldTemplate.default,
        };
        console.log('Creating new field:', newField);

        const overIndex = fields.findIndex(f => f.id === over.id);
        const newFields = [...fields];

        if (overIndex !== -1) {
          newFields.splice(overIndex, 0, newField);
        } else {
          newFields.push(newField);
        }
        
        console.log('Updating fields:', { oldCount: fields.length, newCount: newFields.length });
        setFields(newFields);
        onConfigChange('update-stage-fields', selectedStage, newFields);
        setSelectedField(newField);
        
        // Show success animation
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1000);
      }
      return;
    }

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newFields = arrayMove(items, oldIndex, newIndex);
        onConfigChange('update-stage-fields', selectedStage, newFields);
        return newFields;
      });
    }
  };

  const applyTemplate = (template) => {
    const templateFields = template.fields.map(field => ({
      id: generateId(),
      type: field.type,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required || false,
      options: field.options,
      ...field
    }));
    
    setFields(templateFields);
    onConfigChange('update-stage-fields', selectedStage, templateFields);
    setSelectedField(templateFields[0]);
    
    // Show success animation
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 1000);
    
    toast.success(`Template "${template.name}" applied successfully!`);
  };
  
  const handleFieldUpdate = (updatedField) => {
    const newFields = fields.map(f => f.id === updatedField.id ? updatedField : f);
    setFields(newFields);
    onConfigChange('update-stage-fields', selectedStage, newFields);
    setSelectedField(updatedField);
  };

  const removeField = (id) => {
    const newFields = fields.filter(f => f.id !== id);
    setFields(newFields);
    onConfigChange('update-stage-fields', selectedStage, newFields);
    if (selectedField && selectedField.id === id) {
      setSelectedField(null);
    }
  };

  const duplicateField = (field) => {
    const fieldIndex = fields.findIndex(f => f.id === field.id);
    const newField = {
      ...field,
      id: generateId(),
      label: field.label ? `${field.label} (Copy)` : 'Untitled (Copy)',
    };
    const newFields = [
        ...fields.slice(0, fieldIndex + 1),
        newField,
        ...fields.slice(fieldIndex + 1)
    ];
    setFields(newFields);
    onConfigChange('update-stage-fields', selectedStage, newFields);
    setSelectedField(newField);
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const openFieldSettings = (field) => {
    setSelectedField(field);
    setShowFieldSettings(true);
  };

  const closeFieldSettings = () => {
    setShowFieldSettings(false);
    setSelectedField(null);
  };

  const isDraggingFromPalette = activeId && String(activeId).startsWith('palette-');

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Lead Management</span>
          <span>›</span>
          <span className="font-medium text-gray-800">Stage Forms</span>
        </div>

        {/* Stage Navigation Tabs */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="flex items-center gap-1 p-2 overflow-x-auto">
            {stages.map(stage => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  selectedStage === stage
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {stage}
              </button>
            ))}
            <button className="flex-shrink-0 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
              <FaPlus size={12} />
            </button>
          </div>
        </div>

        {/* Main Form Builder */}
        {selectedStage ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel: Form Elements */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg border shadow-sm h-full">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('fields')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeTab === 'fields'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Form Elements
                  </button>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeTab === 'templates'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Templates
                  </button>
                </div>

                <div className="p-4">
                  {activeTab === 'fields' ? (
                    <div className="space-y-4">
                      {FIELD_GROUPS.map((group) => (
                        <div key={group.name} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleGroup(group.name)}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{group.icon}</span>
                              <span className="font-medium text-gray-700">{group.name}</span>
                            </div>
                            <FaChevronDown 
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                expandedGroups.has(group.name) ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          
                          {expandedGroups.has(group.name) && (
                            <div className="border-t border-gray-200 p-3 space-y-2">
                              {group.fields.map((field) => (
                                <PaletteField key={field.type} field={field} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {FIELD_TEMPLATES.map((template) => (
                        <div
                          key={template.name}
                          onClick={() => applyTemplate(template)}
                          className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">📋</span>
                            <span className="font-medium text-gray-700 text-sm">{template.name}</span>
                          </div>
                          <p className="text-xs text-gray-500">{template.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {template.fields.slice(0, 3).map((field, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {field.label}
                              </span>
                            ))}
                            {template.fields.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{template.fields.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Panel: Form Builder */}
            <div className="col-span-6">
              <div className={`bg-white rounded-lg border shadow-sm transition-all ${
                isDraggingFromPalette ? 'border-blue-500 border-2' : 'border-gray-200'
              }`}>
                {/* Header with Mode Toggle */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Form for: {selectedStage}</h3>
                    <p className="text-sm text-gray-500">
                      {previewMode ? 'Live preview of your form' : 'Drag fields to build your form'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Success Animation */}
                    {showSuccessAnimation && (
                      <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
                        <div className="flex items-center gap-2">
                          <span>✅</span>
                          <span className="text-sm font-medium">Field added!</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Mode Toggle */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setPreviewMode(false)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                          !previewMode
                            ? 'bg-white text-gray-800 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Builder
                      </button>
                      <button
                        onClick={() => setPreviewMode(true)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                          previewMode
                            ? 'bg-white text-gray-800 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {previewMode ? (
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-gray-50 p-6 rounded-lg border">
                        <h4 className="text-lg font-semibold text-gray-800 mb-6">
                          {selectedStage} Stage Form
                        </h4>
                        <FormPreview 
                          fields={fields} 
                          availableFields={AVAILABLE_FIELDS}
                        />
                        {fields.length > 0 && (
                          <div className="mt-8 flex justify-end gap-3">
                            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                              Cancel
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                              Submit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                      <DroppableFormCanvas isDraggingFromPalette={isDraggingFromPalette} fields={fields}>
                        {fields.length > 0 ? (
                          <div className="space-y-3">
                            {fields.map(field => (
                              <FormFieldCard 
                                key={field.id} 
                                field={field}
                                availableFields={AVAILABLE_FIELDS}
                                onEdit={() => openFieldSettings(field)}
                                onRemove={removeField}
                                onDuplicate={duplicateField}
                                onToggleRequired={(required) => handleFieldUpdate({ ...field, required })}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl text-gray-400">📝</span>
                              </div>
                              <h4 className="text-lg font-medium text-gray-600 mb-2">No fields added yet</h4>
                              <p className="text-sm text-gray-500 mb-4">Drag fields from the left panel to build your form</p>
                              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                <span>💡</span>
                                <span>Try using a template to get started quickly</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </DroppableFormCanvas>
                    </SortableContext>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: Quick Actions */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h4>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📋</span>
                      <div>
                        <div className="font-medium text-gray-700">Use Template</div>
                        <div className="text-xs text-gray-500">Apply pre-built form templates</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      // Save form logic
                      toast.success('Form saved successfully!');
                    }}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💾</span>
                      <div>
                        <div className="font-medium text-gray-700">Save Form</div>
                        <div className="text-xs text-gray-500">Save current form configuration</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowFormPreview(true)}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">👁️</span>
                      <div>
                        <div className="font-medium text-gray-700">Full Screen Preview</div>
                        <div className="text-xs text-gray-500">Open form in fullscreen preview</div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Form Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Form Statistics</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Fields:</span>
                      <span className="font-medium">{fields.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Required Fields:</span>
                      <span className="font-medium">{fields.filter(f => f.required).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Optional Fields:</span>
                      <span className="font-medium">{fields.filter(f => !f.required).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">🎯</span>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Stage</h3>
            <p className="text-sm text-gray-500">Choose a stage from the tabs above to start building your form</p>
          </div>
        )}
      </div>

      {/* Field Settings Modal */}
      {showFieldSettings && selectedField && (
        <FieldSettingsModal
          field={selectedField}
          onClose={closeFieldSettings}
          onSave={(updatedField) => {
            handleFieldUpdate(updatedField);
            closeFieldSettings();
          }}
          availableFields={AVAILABLE_FIELDS}
        />
      )}

      <DragOverlay>
        {activeId && activeFieldData ? (
          String(activeId).startsWith('palette-') ? 
          <PaletteFieldPreview field={activeFieldData} /> : 
          <FieldPreview field={activeFieldData} availableFields={AVAILABLE_FIELDS} />
        ) : null}
      </DragOverlay>

      {/* Form Preview Modal */}
      {showFormPreview && (
        <FormPreviewModal
          isOpen={showFormPreview}
          onClose={() => setShowFormPreview(false)}
          fields={fields}
          availableFields={AVAILABLE_FIELDS}
          stageName={selectedStage}
        />
      )}
    </DndContext>
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

// +++ NEW: Template Management Settings +++
const TemplateSettings = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [templates, setTemplates] = useState({
    email: [
      { id: 'email1', name: 'Initial Introduction', subject: 'Following up from {{company.name}}', body: 'Hi {{lead.name}},\n\nThanks for your interest. I would love to schedule a brief call to discuss your needs.\n\nBest,\n{{user.name}}' },
      { id: 'email2', name: 'Quote Follow-Up', subject: 'Quote for {{lead.projectType}}', body: 'Hi {{lead.name}},\n\nHere is the quote we discussed. Please let me know if you have any questions.\n\nBest,\n{{user.name}}' },
    ],
    sms: [
      { id: 'sms1', name: 'Meeting Reminder', body: 'Hi {{lead.name}}, friendly reminder about our meeting today at {{activity.time}}. Talk soon! - {{user.name}}' },
    ],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });

  const handleCreate = () => {
    if (!newTemplate.name || !newTemplate.body) {
      toast.error("Template name and body are required.");
      return;
    }
    const newId = `${activeTab}${Date.now()}`;
    setTemplates(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], { ...newTemplate, id: newId }],
    }));
    setIsCreating(false);
    setNewTemplate({ name: '', subject: '', body: '' });
    toast.success("Template created successfully!");
  };

  const availablePlaceholders = [
    { value: '{{lead.name}}', description: "Lead's full name" },
    { value: '{{lead.email}}', description: "Lead's email address" },
    { value: '{{lead.projectType}}', description: 'Type of project' },
    { value: '{{user.name}}', description: 'Your name' },
    { value: '{{company.name}}', description: 'Your company name' },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">Email & SMS Templates</h3>
      <p className="text-sm text-gray-600 mb-6">Create and manage standardized templates for your team.</p>
      
      <div className="flex border-b mb-6">
        <button onClick={() => setActiveTab('email')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'email' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Email Templates</button>
        <button onClick={() => setActiveTab('sms')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'sms' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>SMS Templates</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-700 capitalize">{activeTab} Templates</h4>
            <button onClick={() => setIsCreating(true)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"><FaPlus /> Create New</button>
          </div>
          
          {isCreating && (
            <div className="p-4 bg-gray-50 rounded-lg border mb-6 space-y-4">
              <input type="text" placeholder="Template Name" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} className="w-full p-2 border rounded-md"/>
              {activeTab === 'email' && <input type="text" placeholder="Email Subject" value={newTemplate.subject} onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})} className="w-full p-2 border rounded-md"/>}
              <textarea placeholder="Template Body" value={newTemplate.body} onChange={e => setNewTemplate({...newTemplate, body: e.target.value})} className="w-full p-2 border rounded-md" rows="5"></textarea>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button onClick={handleCreate} className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">Save Template</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {templates[activeTab].map(template => (
              <div key={template.id} className="p-4 bg-white border rounded-lg shadow-sm">
                <p className="font-bold text-gray-800">{template.name}</p>
                {template.subject && <p className="text-sm text-gray-500 mt-1"><strong>Subject:</strong> {template.subject}</p>}
                <p className="text-sm text-gray-600 bg-gray-50 p-2 mt-2 rounded whitespace-pre-wrap">{template.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-700 mb-2">Placeholders</h4>
            <p className="text-xs text-gray-500 mb-4">Use these placeholders in your templates. They will be replaced with actual data.</p>
            <div className="space-y-2">
              {availablePlaceholders.map(p => (
                <div key={p.value}>
                  <code className="text-sm text-blue-700 bg-blue-100 px-1 rounded">{p.value}</code>
                  <p className="text-xs text-gray-500 ml-2">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// +++ NEW: Automation Rules Settings +++
const AutomationSettings = ({ stages }) => {
  const [rules, setRules] = useState([
    { id: 1, name: 'Stale Lead Alert', trigger: { type: 'time_in_stage', stage: 'Qualified', days: 7 }, action: { type: 'send_notification', recipient: 'assigned_salesperson' } },
    { id: 2, name: 'New Lead Task', trigger: { type: 'lead_created' }, action: { type: 'create_task', recipient: 'sales_manager' } },
  ]);

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">Automation Rules</h3>
      <p className="text-sm text-gray-600 mb-6">Create IF-THEN rules to automate tasks and alerts in your pipeline.</p>
      
      <div className="flex justify-end mb-4">
        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
          <FaPlus /> Add New Rule
        </button>
      </div>

      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <p className="font-bold text-gray-800 mb-4">{rule.name}</p>
            <div className="flex items-center gap-4 text-center">
              <div className="w-1/3">
                <p className="text-sm font-semibold text-gray-500 mb-1">IF</p>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {rule.trigger.type === 'time_in_stage' && `A lead stays in the "${rule.trigger.stage}" stage for more than ${rule.trigger.days} days`}
                  {rule.trigger.type === 'lead_created' && 'A new lead is created'}
                </div>
              </div>
              <FaChevronRight className="text-gray-300 text-xl" />
              <div className="w-1/3">
                <p className="text-sm font-semibold text-gray-500 mb-1">THEN</p>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {rule.action.type === 'send_notification' && `Send a notification to the ${rule.action.recipient.replace('_', ' ')}`}
                  {rule.action.type === 'create_task' && `Create a new task for the ${rule.action.recipient.replace('_', ' ')}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
    { id: 'pipelineStages', label: 'Pipeline Stages', icon: FaStream, description: 'Add, remove, and reorder the stages in your sales pipeline.' },
    { id: 'forms', label: 'Stage Forms', icon: FaTasks, description: 'Require specific information from users when a lead enters a stage.' },
    { id: 'permissions', label: 'User Roles & Permissions', icon: FaUserShield, description: 'Define what each user role can see and do within this module.' },
    { id: 'workflow', label: 'Approval Workflow', icon: FaSitemap, description: 'Set up a sequence of roles that must approve a lead to proceed.' },
    { id: 'automation', label: 'Automation Rules', icon: FaRobot, description: 'Create IF-THEN rules to automate tasks like alerts and notifications.' },
    { id: 'templates', label: 'Email & SMS Templates', icon: FaEnvelopeOpenText, description: 'Create and manage standardized templates for your team to use.' },
  ];

  const activePage = settingsPages.find(p => p.id === activeSettingsPage);

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
      case 'automation':
        return <AutomationSettings stages={kanbanStatuses} />;
      case 'templates':
        return <TemplateSettings />;
      default:
        return <div className="text-center text-gray-500">Select a setting to configure.</div>;
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg -m-6">
      {/* Top Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex flex-wrap gap-1 border-b border-gray-200">
          {settingsPages.map(page => (
            <button
              key={page.id}
              onClick={() => setActiveSettingsPage(page.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeSettingsPage === page.id
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <page.icon className="w-4 h-4 flex-shrink-0" />
              <span>{page.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {activePage && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <activePage.icon className="w-6 h-6 text-gray-400" />
              {activePage.label}
            </h3>
            <p className="mt-2 text-sm text-gray-600">{activePage.description}</p>
          </div>
        )}
        {renderSettingsContent()}
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

const DroppableFormCanvas = ({ children, isDraggingFromPalette, fields }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas-droppable',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`min-h-[300px] transition-all duration-200 p-4 rounded-lg ${
        isDraggingFromPalette && isOver 
          ? 'bg-blue-50 border-2 border-blue-400 border-dashed shadow-inner' 
          : isDraggingFromPalette 
          ? 'bg-gray-50 border-2 border-gray-300 border-dashed' 
          : 'border border-transparent'
      }`}
    >
      {isDraggingFromPalette && fields.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
              isOver ? 'bg-blue-200 text-blue-600' : 'bg-gray-200 text-gray-400'
            }`}>
              <span className="text-2xl">📝</span>
            </div>
            <h4 className={`text-lg font-medium mb-2 transition-colors ${
              isOver ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {isOver ? 'Drop field here!' : 'Drop zone'}
            </h4>
            <p className="text-sm text-gray-500">
              Release to add the field to your form
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

// Form Field Card Component
const FormFieldCard = ({ field, availableFields, onEdit, onRemove, onDuplicate, onToggleRequired }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  
  const fieldInfo = availableFields.find(f => f.type === field.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="absolute top-2 left-2 cursor-grab text-gray-400 hover:text-gray-600">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
        </svg>
      </div>

      {/* Field Content */}
      <div className="ml-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{fieldInfo?.icon || '📝'}</span>
            <span className="font-medium text-gray-800">
              {field.label || 'Untitled Field'} {field.required && <span className="text-red-500">*</span>}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleRequired(!field.required)}
              className={`p-1.5 rounded-md text-xs font-medium ${
                field.required 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={field.required ? 'Remove required' : 'Make required'}
            >
              {field.required ? 'Required' : 'Optional'}
            </button>
            <button
              onClick={() => onDuplicate(field)}
              className="p-1.5 bg-gray-100 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-200"
              title="Duplicate field"
            >
              <FaCopy size={12} />
            </button>
            <button
              onClick={() => onEdit(field)}
              className="p-1.5 bg-gray-100 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-200"
              title="Edit field"
            >
              <FaWrench size={12} />
            </button>
            <button
              onClick={() => onRemove(field.id)}
              className="p-1.5 bg-gray-100 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-200"
              title="Delete field"
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          {field.placeholder || field.text || `${field.type} field`}
        </p>
        
        {/* Field Type Badge */}
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            {fieldInfo?.label || field.type}
          </span>
        </div>
      </div>
    </div>
  );
};

// Field Settings Modal Component
const FieldSettingsModal = ({ field, onClose, onSave, availableFields }) => {
  const [editedField, setEditedField] = useState({ ...field });
  const fieldInfo = availableFields.find(f => f.type === field.type);

  const handleSave = () => {
    onSave(editedField);
  };

  const handleChange = (key, value) => {
    setEditedField(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{fieldInfo?.icon || '📝'}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Field Settings</h2>
              <p className="text-sm text-gray-500">{fieldInfo?.label || field.type} field</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Settings Panel */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
                    <input
                      type="text"
                      value={editedField.label || ''}
                      onChange={(e) => handleChange('label', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter field label"
                    />
                  </div>
                  
                  {(editedField.type === 'text' || editedField.type === 'textarea' || editedField.type === 'number' || editedField.type === 'email' || editedField.type === 'tel') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder Text</label>
                      <input
                        type="text"
                        value={editedField.placeholder || ''}
                        onChange={(e) => handleChange('placeholder', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter placeholder text"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editedField.required || false}
                        onChange={(e) => handleChange('required', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Required field</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Options for select, checkbox, radio */}
              {(editedField.type === 'select' || editedField.type === 'checkbox' || editedField.type === 'radio') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Options</h3>
                  <div className="space-y-2">
                    {editedField.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...editedField.options];
                            newOptions[index] = e.target.value;
                            handleChange('options', newOptions);
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                        />
                        <button
                          onClick={() => {
                            const newOptions = editedField.options.filter((_, i) => i !== index);
                            handleChange('options', newOptions);
                          }}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newOptions = [...(editedField.options || []), 'New Option'];
                        handleChange('options', newOptions);
                      }}
                      className="w-full mt-2 p-2 border-2 border-dashed rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Help Text</label>
                    <textarea
                      value={editedField.helpText || ''}
                      onChange={(e) => handleChange('helpText', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={2}
                      placeholder="Optional help text for users"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validation Rules</label>
                    <select
                      value={editedField.validation || 'none'}
                      onChange={(e) => handleChange('validation', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="none">No validation</option>
                      <option value="email">Email format</option>
                      <option value="phone">Phone number</option>
                      <option value="url">URL format</option>
                      <option value="number">Numbers only</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Preview</h3>
            <div className="bg-white p-6 rounded-lg border">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {editedField.label || 'Field Label'} {editedField.required && <span className="text-red-500">*</span>}
                </label>
                
                {editedField.type === 'text' && (
                  <input
                    type="text"
                    placeholder={editedField.placeholder}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled
                  />
                )}
                {editedField.type === 'textarea' && (
                  <textarea
                    placeholder={editedField.placeholder}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    disabled
                  />
                )}
                {editedField.type === 'select' && (
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>{editedField.placeholder || 'Select an option...'}</option>
                    {editedField.options?.map((option, idx) => (
                      <option key={idx} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                {editedField.type === 'checkbox' && (
                  <div className="space-y-2">
                    {editedField.options?.map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2">
                        <input type="checkbox" disabled className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                {editedField.type === 'radio' && (
                  <div className="space-y-2">
                    {editedField.options?.map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2">
                        <input type="radio" disabled className="border-gray-300" />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                {editedField.type === 'date' && (
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled
                  />
                )}
                {editedField.type === 'file' && (
                  <input
                    type="file"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled
                  />
                )}
                
                {editedField.helpText && (
                  <p className="text-xs text-gray-500">{editedField.helpText}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
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

  // --- ADD sensors DEFINITION HERE ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // --- END sensors DEFINITION ---

  // --- ADD DRAG EVENT HANDLERS ---
  const [activeId, setActiveId] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log('handleDragEnd called:', { activeId: active.id, overId: over?.id, isPaletteItem: active.data.current?.isPaletteItem });
    setActiveId(null);
    if (!over) return;
    
    const isPaletteItem = active.data.current?.isPaletteItem;

    if (isPaletteItem) {
      const overIsCanvas = over.id === 'form-canvas-droppable' || fields.find(f => f.id === over.id);
      console.log('Palette item dropped:', { overIsCanvas, overID: over.id });
      if (overIsCanvas) {
        const fieldTemplate = active.data.current.field;
        const newField = {
          id: generateId(),
          type: fieldTemplate.type,
          required: false,
          ...fieldTemplate.default,
        };
        console.log('Creating new field:', newField);

        const overIndex = fields.findIndex(f => f.id === over.id);
        const newFields = [...fields];

        if (overIndex !== -1) {
          newFields.splice(overIndex, 0, newField);
        } else {
          newFields.push(newField);
        }
        
        console.log('Updating fields:', { oldCount: fields.length, newCount: newFields.length });
        setFields(newFields);
        onConfigChange('update-stage-fields', selectedStage, newFields);
        setSelectedField(newField);
        
        // Show success animation
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1000);
      }
      return;
    }

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newFields = arrayMove(items, oldIndex, newIndex);
        onConfigChange('update-stage-fields', selectedStage, newFields);
        return newFields;
      });
    }
  };
  // --- END DRAG EVENT HANDLERS ---

  const handleFormConfigChange = (action, stage, field) => {
    console.log('handleFormConfigChange called:', { action, stage, fieldCount: Array.isArray(field) ? field.length : 'not array', field });
    setFormConfigs(prev => {
      const newConfigs = { ...prev };
      let stageFields = newConfigs[stage] ? [...newConfigs[stage]] : [];

      if (action === 'add') {
        stageFields.push(field);
      } else if (action === 'remove') {
        stageFields = stageFields.filter(f => f.id !== field.id);
      } else if (action === 'update-stage-fields') {
        // field parameter contains the complete array of fields for this stage
        stageFields = field;
      }
      
      newConfigs[stage] = stageFields;
      console.log('Updated formConfigs for stage:', stage, 'fieldCount:', stageFields.length);
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

  const FIELD_GROUPS = [
    {
      name: 'Basic Fields',
      icon: '📝',
      fields: [
        { type: 'text', label: 'Short Text', icon: '📝', description: 'Single-line text input', default: { label: 'Full Name', placeholder: 'Enter full name...' } },
        { type: 'textarea', label: 'Long Text', icon: '📄', description: 'Multi-line text area', default: { label: 'Description', placeholder: 'Enter detailed description...' } },
        { type: 'number', label: 'Number', icon: '🔢', description: 'Numeric input field', default: { label: 'Amount', placeholder: 'Enter amount...' } },
        { type: 'email', label: 'Email', icon: '📧', description: 'Email address input', default: { label: 'Work Email', placeholder: 'Enter work email...' } },
      ]
    },
    {
      name: 'Contact Fields',
      icon: '📞',
      fields: [
        { type: 'tel', label: 'Phone', icon: '📞', description: 'Phone number input', default: { label: 'Phone Number', placeholder: 'Enter phone number...' } },
        { type: 'text', label: 'Address', icon: '📍', description: 'Address input field', default: { label: 'Address', placeholder: 'Enter address...' } },
      ]
    },
    {
      name: 'Date & Time',
      icon: '📅',
      fields: [
        { type: 'date', label: 'Date', icon: '📅', description: 'Date picker', default: { label: 'Meeting Date', placeholder: 'Select meeting date' } },
        { type: 'time', label: 'Time', icon: '⏰', description: 'Time picker', default: { label: 'Meeting Time', placeholder: 'Select meeting time' } },
      ]
    },
    {
      name: 'Selection Fields',
      icon: '📋',
      fields: [
        { type: 'select', label: 'Dropdown', icon: '📋', description: 'Single choice dropdown', default: { label: 'Priority Level', options: ['Low', 'Medium', 'High'] } },
        { type: 'checkbox', label: 'Checkboxes', icon: '☑️', description: 'Multiple choice checkboxes', default: { label: 'Interests', options: ['Product Demo', 'Pricing', 'Technical Support'] } },
        { type: 'radio', label: 'Radio Group', icon: '🔘', description: 'Single choice radio buttons', default: { label: 'Decision Maker', options: ['Yes', 'No', 'Maybe'] } },
      ]
    },
    {
      name: 'File Upload',
      icon: '📎',
      fields: [
        { type: 'file', label: 'File Upload', icon: '📎', description: 'File upload field', default: { label: 'Upload Document' } },
        { type: 'signature', label: 'Signature', icon: '✍️', description: 'Digital signature field', default: { label: 'Digital Signature' } },
      ]
    },
    {
      name: 'Display Fields',
      icon: '🔤',
      fields: [
        { type: 'header', label: 'Header', icon: '🔤', description: 'Section header text', default: { text: 'Section Header' } },
        { type: 'static-text', label: 'Static Text', icon: '📖', description: 'Informational text', default: { text: 'This is some informational text.' } },
        { type: 'rating', label: 'Rating', icon: '⭐', description: 'Star rating field', default: { label: 'Satisfaction Rating', maxRating: 5 } },
      ]
    }
  ];

  // Flatten all fields for easy access
  const AVAILABLE_FIELDS = FIELD_GROUPS.flatMap(group => group.fields);

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-sm text-gray-600">Manage your sales pipeline and leads</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleViewChange('settings')}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <FaCog />
              Settings
            </button>
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus />
              Add Lead
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <FaThLarge />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 text-sm rounded-md ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm rounded-md ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaListUl />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {mainView === 'pipeline' ? (
          viewMode === 'kanban' ? (
            <KanbanBoard
              leadsByStatus={leadsByStatus}
              kanbanStatuses={kanbanStatuses}
              onEdit={handleEdit}
              onConvert={handleConvert}
              onMarkLost={handleMarkLost}
              onMarkJunk={handleMarkJunk}
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
      </div>

      {/* Modals */}
      {showAddLeadModal && (
        <AddLeadModal
          isOpen={showAddLeadModal}
          onClose={() => setShowAddLeadModal(false)}
          onSubmit={handleAddLeadSubmit}
          editingLead={editingLead}
          salesPersons={salesPersons}
          designers={designers}
        />
      )}

      {showConvertModal && (
        <ConvertLeadModal
          isOpen={showConvertModal}
          onClose={handleConvertModalClose}
          onSubmit={handleConvertSuccess}
          lead={pendingConversion?.lead}
          fromStatus={pendingConversion?.fromStatus}
        />
      )}

      {showLostReasonModal && (
        <LostLeadModal
          isOpen={showLostReasonModal}
          onClose={handleLostModalClose}
          onSubmit={handleLostSuccess}
          lead={pendingLost?.lead}
          fromStatus={pendingLost?.fromStatus}
        />
      )}

      {showJunkReasonModal && (
        <JunkReasonModal
          isOpen={showJunkReasonModal}
          onClose={handleJunkModalClose}
          onSubmit={handleJunkSuccess}
          lead={leads.find(l => l.leadId === leadToMarkJunkId)}
        />
      )}

      {showScheduleActivityModal && (
        <AdvancedScheduleActivityModal
          isOpen={showScheduleActivityModal}
          onClose={() => setShowScheduleActivityModal(false)}
          onSubmit={handleScheduleActivitySuccess}
          lead={leadToScheduleActivity}
        />
      )}

      {stageActionModalData.isOpen && (
        <StageActionModal
          isOpen={stageActionModalData.isOpen}
          onClose={() => setStageActionModalData({ isOpen: false, lead: null, targetStage: '' })}
          lead={stageActionModalData.lead}
          targetStage={stageActionModalData.targetStage}
          stageConfig={formConfigs[stageActionModalData.targetStage] || []}
          onSubmit={handleStageActionSubmit}
        />
      )}

      <DragOverlay>
        {activeId ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
            <div className="font-medium text-gray-800">
              {leads.find(l => l.leadId === activeId)?.name || 'Lead'}
            </div>
            <div className="text-sm text-gray-500">
              {leads.find(l => l.leadId === activeId)?.email || ''}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
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