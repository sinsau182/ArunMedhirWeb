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
import KanbanBoardClientOnly from "@/components/Sales/KanbanBoardClientOnly";
import {
  fetchLeads,
  updateLead,
  createLead,
  moveLeadToPipeline
} from "@/redux/slices/leadsSlice";
import { addStage, removeStage, fetchPipelines, createPipeline, deletePipeline } from "@/redux/slices/pipelineSlice";
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
import Tooltip from '@/components/ui/ToolTip';

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

const LeadManagementContent = ({ role }) => {
  const dispatch = useDispatch();
  const { pipelines } = useSelector((state) => state.pipelines);
  const { leads } = useSelector((state) => state.leads);

  // Add pipeline modal state
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState("#3b82f6");
  const [newStageIsForm, setNewStageIsForm] = useState(false);

  // Delete pipeline modal state
  const [showDeletePipelineModal, setShowDeletePipelineModal] = useState(false);
  const [selectedPipelinesToDelete, setSelectedPipelinesToDelete] = useState([]);

  // Fetch pipelines and all leads on mount
  useEffect(() => {
    dispatch(fetchPipelines());
    dispatch(fetchLeads());
  }, [dispatch]);

  // Group leads by pipelineId for Kanban board
  const leadsByStatus = useMemo(() => {
    const grouped = {};
    pipelines.forEach((pipeline) => {
      grouped[pipeline.name] = leads.filter(
        lead => String(lead.pipelineId) === String(pipeline.id)
      );
    });
    return grouped;
  }, [pipelines, leads]);

  // Add pipeline handler
  const handleAddStage = () => {
    if (!newStageName) {
      toast.error("Stage name is required");
      return;
    }
    dispatch(
      createPipeline({
        name: newStageName,
        color: newStageColor,
        isFormRequired: newStageIsForm,
        formType: null,
      })
    );
    setNewStageName("");
    setNewStageColor("#3b82f6");
    setNewStageIsForm(false);
    setIsAddingStage(false);
  };

  // Delete pipeline handler
  const handleDeleteStages = (pipelineIds) => {
    pipelineIds.forEach((id) => {
      dispatch(deletePipeline(id));
    });
    setShowDeletePipelineModal(false);
    setSelectedPipelinesToDelete([]);
  };

  // UI for delete modal (simplified)
  const DeletePipelineModal = () => (
    showDeletePipelineModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Delete Pipeline Stages</h2>
            <button onClick={() => setShowDeletePipelineModal(false)} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Select the pipeline stages you want to delete. This action cannot be undone.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pipelines.map((pipeline) => (
                <label key={pipeline.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPipelinesToDelete.includes(pipeline.id)}
                    onChange={() => {
                      setSelectedPipelinesToDelete((prev) =>
                        prev.includes(pipeline.id)
                          ? prev.filter((id) => id !== pipeline.id)
                          : [...prev, pipeline.id]
                      );
                    }}
                  />
                  <span className="text-sm font-medium">{pipeline.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
            <button onClick={() => setShowDeletePipelineModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button
              onClick={() => handleDeleteStages(selectedPipelinesToDelete)}
              disabled={selectedPipelinesToDelete.length === 0}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Delete {selectedPipelinesToDelete.length > 0 ? `(${selectedPipelinesToDelete.length})` : ""}
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setIsAddingStage(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow flex items-center min-w-24 justify-center transition-colors duration-200 hover:bg-blue-700"
          >
            New
          </button>
          <div className="flex items-center space-x-1">
            <h2 className="text-xl font-semibold text-gray-700">Pipeline</h2>
            <div className="relative pipeline-dropdown">
              <button
                onClick={() => setShowDeletePipelineModal(true)}
                className="text-gray-500 hover:text-gray-700 p-1 flex items-center gap-1 transition-colors duration-200"
              >
                Delete Pipeline
              </button>
            </div>
          </div>
        </div>
      </div>
      <KanbanBoardClientOnly
        leadsByStatus={leadsByStatus}
        statuses={pipelines.map((p) => p.name)}
        isAddingStage={isAddingStage}
        newStageName={newStageName}
        setNewStageName={setNewStageName}
        onAddStage={handleAddStage}
        onCancelAddStage={() => setIsAddingStage(false)}
        setStageColor={setNewStageColor}
        stageColor={newStageColor}
        setIsForm={setNewStageIsForm}
        isForm={newStageIsForm}
      />
      <DeletePipelineModal />
    </div>
  );
};

const LeadManagement = ({ role }) => {
  return (
    <MainLayout>
      <LeadManagementContent role={role} />
    </MainLayout>
  );
};

export default LeadManagement;
