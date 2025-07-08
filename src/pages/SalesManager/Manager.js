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
  FaTimes
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
import { addStage, removeStage, fetchPipelines } from "@/redux/slices/pipelineSlice";
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

const ManagerContent = ({ role }) => {
  const dispatch = useDispatch();
  const { leads, loading, error } = useSelector((state) => state.leads);
  const { stages: kanbanStages = [], status: pipelineStatus = 'idle' } = useSelector((state) => state.pipeline || {});

  useEffect(() => { dispatch(fetchLeads()); }, [dispatch]);
  useEffect(() => { dispatch(fetchPipelines()); }, [dispatch]);

  // Deduplicate leads by leadId (keep first occurrence)
  const dedupedLeads = React.useMemo(() => {
    const seen = new Set();
    return (leads || []).filter(lead => {
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
  const [pendingConversion, setPendingConversion] = useState(null);
  const [pendingLost, setPendingLost] = useState(null);
  const [pendingJunk, setPendingJunk] = useState(null);
  const [showScheduleActivityModal, setShowScheduleActivityModal] = useState(false);
  const [leadToScheduleActivity, setLeadToScheduleActivity] = useState(null);

  // Group leads by stageId using kanbanStages
  const leadsByStatus = useMemo(() => {
    const grouped = {};
    (kanbanStages || []).forEach(stage => {
      grouped[stage.stageId] = [];
    });
    const filteredLeads = dedupedLeads.filter(lead =>
      Object.values(lead).some(value =>
        String(value).toLowerCase().includes(filterText.toLowerCase())
      )
    );
    filteredLeads.forEach(lead => {
      if (grouped[lead.stageId]) {
        grouped[lead.stageId].push(lead);
      }
    });
    return grouped;
  }, [dedupedLeads, filterText, kanbanStages]);

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
      // This case should ideally not happen if KanbanBoard handles status updates correctly
      // but as a fallback, we can update the lead locally if needed.
      // For now, we rely on the backend update.
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
      dispatch(updateLead(leadData));
    } else {
      // Assign a new unique leadId
      const newId = `LEAD${Math.floor(Math.random() * 100000)}`;
      dispatch(createLead({ ...leadData, leadId: newId }));
    }
    setShowAddLeadModal(false);
  };

  const handleAddStage = () => {
    if (newStageName && !kanbanStages.some(stage => stage.name === newStageName)) {
      dispatch(addStage({ name: newStageName, color: '#4f46e5' })); // Default color
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
    stagesToDelete.forEach(stageName => {
      dispatch(removeStage(stageName));
    });
    toast.success(`Successfully deleted ${stagesToDelete.length} stage(s)`);
  };

  const handleConvertModalClose = () => {
    setShowConvertModal(false);
    setLeadToConvertId(null);
    setPendingConversion(null);
  };
  const handleConvertSuccess = (updatedLead) => {
    dispatch(updateLead({ ...updatedLead, status: 'Converted' }));
    handleConvertModalClose();
  };
  const handleLostModalClose = () => {
    setShowLostReasonModal(false);
    setLeadToMarkLost(null);
    setPendingLost(null);
  };
  const handleLostSuccess = (updatedLead) => {
    dispatch(updateLead({ ...updatedLead, status: 'Lost' }));
    handleLostModalClose();
  };
  const handleJunkModalClose = () => {
    setShowJunkReasonModal(false);
    setLeadToMarkJunkId(null);
    setPendingJunk(null);
  };
  const handleJunkSuccess = (updatedLead) => {
    dispatch(updateLead({ ...updatedLead, status: 'Junk' }));
    handleJunkModalClose();
  };

  const handleScheduleActivity = (lead) => {
    setLeadToScheduleActivity(lead);
    setShowScheduleActivityModal(true);
  };

  const handleScheduleActivitySuccess = (activity) => {
    dispatch(updateLead({
      ...leadToScheduleActivity,
      activities: Array.isArray(leadToScheduleActivity.activities) ? [...leadToScheduleActivity.activities] : [],
      activities: [...leadToScheduleActivity.activities, { ...activity, createdAt: new Date().toISOString() }],
      updatedAt: new Date().toISOString()
    }));
    setShowScheduleActivityModal(false);
    setLeadToScheduleActivity(null);
    toast.success('Activity scheduled successfully!');
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
          <div className="flex items-center space-x-1">
            <h2 className="text-xl font-semibold text-gray-700">Manager Pipeline</h2>
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

      {loading && <p className="text-center">Loading opportunities...</p>}
      {error && <p className="text-center text-red-500">Error: {error.message || "Could not fetch opportunities."}</p>}

      {viewMode === 'kanban' ? (
        pipelineStatus === 'loading' ? (
          <div className="text-gray-400 text-center py-4">Loading pipeline stages...</div>
        ) : !kanbanStages || kanbanStages.length === 0 ? (
          <div className="text-gray-400 text-center py-4">No pipeline stages found.</div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {kanbanStages.map(stage => (
              <KanbanColumn
                key={stage.stageId}
                status={stage.name}
                stage={stage}
                leads={leadsByStatus[stage.stageId] || []}
                onEdit={handleEdit}
                onConvert={handleConvert}
                onMarkLost={handleMarkLost}
                onMarkJunk={handleMarkJunk}
                onAddLead={handleOpenAddLeadForm}
                onScheduleActivity={handleScheduleActivity}
              />
            ))}
          </div>
        )
      ) : (
        <LeadsTable leads={dedupedLeads} />
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
        stages={kanbanStages.map(s => s.name)}
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