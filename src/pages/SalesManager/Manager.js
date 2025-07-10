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
import Tooltip from '@/components/ui/ToolTip';

// Add these imports for settings functionality
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
      { id: 2, type: 'meeting', summary: 'Client meeting', dueDate: '2024-07-30', status: 'pending' },
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
      { id: 4, type: 'task', summary: 'Send quote', dueDate: '2024-05-25', status: 'pending' },
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
    activities: [],
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

// Settings Components
const SettingsPage = ({ 
  leads, 
  kanbanStatuses, 
  setKanbanStatuses, 
  onDeleteStages,
}) => {
  const [activeSettingsPage, setActiveSettingsPage] = useState('pipelineStages');

  const settingsPages = [
    { id: 'pipelineStages', label: 'Pipeline Stages', icon: FaStream, description: 'Add, remove, and reorder the stages in your sales pipeline.' },
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
      case 'permissions':
        return <div className="text-center text-gray-500 p-8">User Roles & Permissions settings coming soon...</div>;
      case 'workflow':
        return <div className="text-center text-gray-500 p-8">Approval Workflow settings coming soon...</div>;
      case 'automation':
        return <div className="text-center text-gray-500 p-8">Automation Rules settings coming soon...</div>;
      case 'templates':
        return <div className="text-center text-gray-500 p-8">Email & SMS Templates settings coming soon...</div>;
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
  const [newStageColor, setNewStageColor] = useState("#3b82f6");
  const [newStageIsForm, setNewStageIsForm] = useState(false);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [showDeletePipelineModal, setShowDeletePipelineModal] = useState(false);

  const handleAddStage = () => {
    if (newStageName && !stages.find(s => s.name === newStageName)) {
      const newStage = {
        id: Date.now(),
        name: newStageName,
        color: newStageColor,
        isForm: newStageIsForm
      };
      setStages(prev => [...prev, newStage]);
      toast.success(`Stage "${newStageName}" added successfully.`);
      setNewStageName("");
      setNewStageColor("#3b82f6");
      setNewStageIsForm(false);
      setIsAddingStage(false);
    } else {
      toast.error("Stage name cannot be empty or a duplicate.");
    }
  };

  const handleCancelAddStage = () => {
    setNewStageName("");
    setNewStageColor("#3b82f6");
    setNewStageIsForm(false);
    setIsAddingStage(false);
  };

  const COLOR_PALETTE = ['#3b82f6', '#6366f1', '#10b981', '#f59e42', '#22d3ee', '#ef4444', '#a3a3a3'];
  
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
          <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage Name</label>
              <input
                type="text"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="Enter new stage name"
                className="border p-2 rounded-md shadow-sm w-full"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PALETTE.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewStageColor(color)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${newStageColor === color ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'}`}
                    style={{ background: color }}
                  >
                    {newStageColor === color && <span className="w-3 h-3 bg-white rounded-full border border-blue-600"></span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Is Form Required</label>
              <button
                type="button"
                onClick={() => setNewStageIsForm(prev => !prev)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${newStageIsForm ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${newStageIsForm ? 'translate-x-6' : ''}`}></span>
              </button>
              <span className="text-sm text-gray-500">{newStageIsForm ? 'Yes' : 'No'}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddStage} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">Save</button>
              <button onClick={handleCancelAddStage} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md">Cancel</button>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-4">Current Stages:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stages.map(stage => (
              <div key={stage.id} className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: stage.color }}
                  ></div>
                  <span className="font-medium text-gray-800">{stage.name}</span>
                  {stage.isForm && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Form Required</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {leads.filter(lead => lead.status === stage.name).length} leads
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <DeletePipelineModal
        isOpen={showDeletePipelineModal}
        onClose={() => setShowDeletePipelineModal(false)}
        stages={stages.map(s => s.name)}
        onDeleteStages={onDeleteStages}
      />
    </div>
  );
};

const ManagerContent = ({ role }) => {
  // Use local state for leads and pipeline stages
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [kanbanStatuses, setKanbanStatuses] = useState([
    { id: 1, name: 'New', color: '#3b82f6', isForm: false },
    { id: 2, name: 'Contacted', color: '#6366f1', isForm: false },
    { id: 3, name: 'Qualified', color: '#10b981', isForm: false },
    { id: 4, name: 'Quoted', color: '#f59e42', isForm: false },
    { id: 5, name: 'Converted', color: '#22d3ee', isForm: false },
    { id: 6, name: 'Lost', color: '#ef4444', isForm: false },
    { id: 7, name: 'Junk', color: '#a3a3a3', isForm: false },
  ]);

  const [filterText, setFilterText] = useState("");
  const [viewMode, setViewMode] = useState('kanban');
  const [mainView, setMainView] = useState('pipeline'); // Add this state
  const router = useRouter();
  const { view: queryView } = router.query;

  // Modal states
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [leadToConvertId, setLeadToConvertId] = useState(null);
  const [showLostReasonModal, setShowLostReasonModal] = useState(false);
  const [leadToMarkLost, setLeadToMarkLost] = useState(null);
  const [showJunkReasonModal, setShowJunkReasonModal] = useState(false);
  const [leadToMarkJunkId, setLeadToMarkJunkId] = useState(null);
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState("#3b82f6");
  const [newStageIsForm, setNewStageIsForm] = useState(false);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const [showDeletePipelineModal, setShowDeletePipelineModal] = useState(false);

  const [pendingConversion, setPendingConversion] = useState(null);
  const [pendingLost, setPendingLost] = useState(null);
  const [pendingJunk, setPendingJunk] = useState(null);

  const [showScheduleActivityModal, setShowScheduleActivityModal] = useState(false);
  const [leadToScheduleActivity, setLeadToScheduleActivity] = useState(null);

  // Deduplicate leads by leadId
  const dedupedLeads = useMemo(() => {
    const seen = new Set();
    return leads.filter(lead => {
      if (lead && lead.leadId && !seen.has(lead.leadId)) {
        seen.add(lead.leadId);
        return true;
      }
      return false;
    });
  }, [leads]);

  // All lead operations now update local state
  const leadsByStatus = useMemo(() => {
    const grouped = {};
    kanbanStatuses.forEach(status => {
      grouped[status.name] = [];
    });
    
    const filteredLeads = dedupedLeads.filter(lead => {
      const matchesText = filterText
        ? Object.values(lead).some(value =>
            String(value).toLowerCase().includes(filterText.toLowerCase())
          )
        : true;
      return matchesText;
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
  }, [dedupedLeads, filterText, kanbanStatuses]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const leadId = active.id;
    const newStatus = over.id;
    const lead = dedupedLeads.find(l => l.leadId === leadId);
    
    if (!lead || lead.status === newStatus) return;

    // Handle special stage transitions
    if (newStatus === 'Converted') {
      setPendingConversion({ lead, fromStatus: lead.status });
      setShowConvertModal(true);
      return;
    }
    
    if (newStatus === 'Lost') {
      setPendingLost({ lead, fromStatus: lead.status });
      setShowLostReasonModal(true);
      return;
    }
    
    if (newStatus === 'Junk') {
      setPendingJunk({ lead, fromStatus: lead.status });
      setShowJunkReasonModal(true);
      return;
    }

    // For regular status changes
    setLeads(prevLeads => prevLeads.map(l => 
      l.leadId === leadId ? { ...l, status: newStatus } : l
    ));
    
    toast.success(`Lead moved to ${newStatus}`);
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
    if (newStageName && !kanbanStatuses.find(s => s.name === newStageName)) {
      const newStage = {
        id: Date.now(),
        name: newStageName,
        color: newStageColor,
        isForm: newStageIsForm
      };
      setKanbanStatuses(prev => [...prev, newStage]);
      setNewStageName("");
      setIsAddingStage(false);
      toast.success(`Stage "${newStageName}" added successfully!`);
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
    setKanbanStatuses(prev => prev.filter(stage => !stagesToDelete.includes(stage.name)));
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

  const isPipelinePresent = kanbanStatuses && kanbanStatuses.length > 0;

  // Handle query view changes
  useEffect(() => {
    if (queryView === 'settings') {
      setMainView('settings');
    } else {
      setMainView('pipeline');
    }
  }, [queryView]);

  const handleViewChange = (view) => {
    setMainView(view);
    router.push('/SalesManager/Manager' + (view === 'settings' ? '?view=settings' : ''), undefined, { shallow: true });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Only show the pipeline header and content when not in settings */}
      {mainView === 'pipeline' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-6">
              <Tooltip text={!isPipelinePresent ? 'Please add pipeline.' : ''}>
                <button
                  onClick={() => handleOpenAddLeadForm()}
                  className={`bg-blue-600 text-white px-6 py-2 rounded-lg shadow flex items-center min-w-24 justify-center transition-colors duration-200 ${!isPipelinePresent ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                  disabled={!isPipelinePresent}
                  tabIndex={isPipelinePresent ? 0 : -1}
                >
                  New
                </button>
              </Tooltip>
              <div className="flex items-center space-x-1">
                <h2 className="text-xl font-semibold text-gray-700">Pipeline</h2>
                <div className="relative pipeline-dropdown">
                  <button 
                    onClick={() => setShowPipelineDropdown(!showPipelineDropdown)} 
                    className="text-gray-500 hover:text-gray-700 p-1 flex items-center gap-1 transition-colors duration-200"
                  >
                    <FaCog />
                    <FaChevronDown className={`text-xs transition-transform duration-200 ${showPipelineDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showPipelineDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-40 transform opacity-100 scale-100 transition-all duration-200">
                      <button
                        onClick={() => handlePipelineAction('add')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
                      >
                        <FaPlus className="text-xs" />
                        Add Pipeline
                      </button>
                      <button
                        onClick={() => handlePipelineAction('delete')}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
                      >
                        <FaTrash className="text-xs" />
                        Delete Pipeline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
              
              {/* Add Settings Button */}
              <button
                onClick={() => handleViewChange('settings')}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
                title="Settings"
              >
                <FaCog />
                Settings
              </button>

              {/* View toggle icons */}
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
          </div>

          {viewMode === 'kanban' ? (
            <KanbanBoard
              leadsByStatus={leadsByStatus}
              onDragEnd={handleDragEnd}
              statuses={kanbanStatuses.map(s => s.name)}
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
              setIsForm={setNewStageIsForm}
              setStageColor={setNewStageColor}
              stageColor={newStageColor}
              isForm={newStageIsForm}
              kanbanStatuses={kanbanStatuses}
            />
          ) : (
            <LeadsTable leads={dedupedLeads} />
          )}
        </>
      )}

      {/* Settings View */}
      {mainView === 'settings' && (
        <div className="space-y-6">
          {/* Settings Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600">Configure your lead management system</p>
          </div>

          <SettingsPage
            leads={dedupedLeads}
            kanbanStatuses={kanbanStatuses}
            setKanbanStatuses={setKanbanStatuses}
            onDeleteStages={handleDeleteStages}
          />
        </div>
      )}

      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSubmit={handleAddLeadSubmit}
        initialData={editingLead || defaultLeadData}
        isManagerView={true}
      />

      {/* Only show ConvertLeadModal for drag-to-Converted or explicit convert */}
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
        stages={kanbanStatuses.map(s => s.name)}
        onDeleteStages={handleDeleteStages}
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