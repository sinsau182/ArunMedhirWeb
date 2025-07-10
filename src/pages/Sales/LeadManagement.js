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
  moveLeadToPipeline,
} from "@/redux/slices/leadsSlice";
import {
  addStage,
  removeStage,
  fetchPipelines,
  createPipeline,
  deletePipeline,
} from "@/redux/slices/pipelineSlice";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import AdvancedScheduleActivityModal from "@/components/Sales/AdvancedScheduleActivityModal";
import Tooltip from "@/components/ui/ToolTip";

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

const DeletePipelineModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { pipelines } = useSelector((state) => state.pipelines);
  const { leads } = useSelector((state) => state.leads);
  const [selectedStages, setSelectedStages] = useState([]);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPipelines());
      setSelectedStages([]);
      setWarning("");
    }
  }, [isOpen, dispatch]);

  // Check if any selected stage has leads
  useEffect(() => {
    if (selectedStages.length > 0) {
      const hasLeads = selectedStages.some((stageId) =>
        leads.some((lead) => lead.stageId === stageId)
      );
      if (hasLeads) {
        setWarning(
          "Cannot delete: One or more selected pipeline stages contain leads. Please move or delete all leads in these stages first."
        );
      } else {
        setWarning("");
      }
    } else {
      setWarning("");
    }
  }, [selectedStages, leads]);

  const handleStageToggle = (stageId) => {
    setSelectedStages((prev) =>
      prev.includes(stageId)
        ? prev.filter((id) => id !== stageId)
        : [...prev, stageId]
    );
  };

  const handleDelete = async () => {
    // Prevent deletion if warning is present
    if (warning) return;
    if (selectedStages.length === 0) return;
    const results = await Promise.all(
      selectedStages.map((id) => dispatch(deletePipeline(id)))
    );
    let hadLeadsError = false;
    results.forEach((result) => {
      if (result.type && result.type.endsWith("rejected")) {
        const errorMsg = result.payload || result.error?.message || "";
        if (
          typeof errorMsg === "string" &&
          errorMsg.toLowerCase().includes("lead")
        ) {
          hadLeadsError = true;
        }
      }
    });
    if (hadLeadsError) {
      toast.error(
        "Cannot delete pipeline: it contains leads. Please move or delete all leads in this stage first."
      );
    }
    setSelectedStages([]);
    onClose();
    dispatch(fetchPipelines());
    // Refresh leads to get the updated grouped format
    dispatch(fetchLeads());
  };

  const handleSelectAll = () => {
    setSelectedStages(pipelines.map((p) => p.stageId));
  };

  const handleDeselectAll = () => {
    setSelectedStages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Delete Pipeline Stages
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Select one or more pipeline stages to delete. This action cannot be
            undone.
          </p>
          {warning && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-300 text-red-700 text-sm font-semibold">
              {warning}
            </div>
          )}
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
            {pipelines.map((stage) => (
              <label
                key={stage.stageId}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStages.includes(stage.stageId)}
                  onChange={() => handleStageToggle(stage.stageId)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium">{stage.name}</span>
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
            disabled={selectedStages.length === 0 || !!warning}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Delete{" "}
            {selectedStages.length > 0 ? `(${selectedStages.length})` : ""}
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
            <TableCell>
              {lead.salesRep || (
                <span className="text-gray-400">Unassigned</span>
              )}
            </TableCell>
            <TableCell>
              {lead.designer || (
                <span className="text-gray-400">Unassigned</span>
              )}
            </TableCell>
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
  const [newStageFormType, setNewStageFormType] = useState("");

  // Delete pipeline modal state
  const [showDeletePipelineModal, setShowDeletePipelineModal] = useState(false);
  const [selectedPipelinesToDelete, setSelectedPipelinesToDelete] = useState(
    []
  );

  // Add lead modal state
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);

  // Pipeline action confirmation modal state
  const [pipelineAction, setPipelineAction] = useState(null); // 'add' or 'delete' or null

  // Advanced Schedule Activity Modal state
  const [showAdvancedScheduleModal, setShowAdvancedScheduleModal] =
    useState(false);
  const [selectedLeadForActivity, setSelectedLeadForActivity] = useState(null);

  // Modal states for formType pipelines
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showJunkModal, setShowJunkModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Fetch pipelines and all leads on mount
  useEffect(() => {
    dispatch(fetchPipelines());
    dispatch(fetchLeads());
  }, [dispatch]);



  // Group leads by pipelineId for Kanban board
  const leadsByStatus = useMemo(() => {
    const grouped = {};

    // Check if leads is in the new grouped format
    if (Array.isArray(leads) && leads.length > 0 && leads[0].stageId && leads[0].leads) {
      // New format: leads grouped by stageId
      leads.forEach((stageGroup) => {
        const stageId = stageGroup.stageId;
        const stageLeads = stageGroup.leads || [];
        
        // Find the pipeline/stage name for this stageId
        const pipeline = pipelines.find(p => 
          p.stageId === stageId || p.pipelineId === stageId
        );
        
        if (pipeline) {
          grouped[pipeline.name] = stageLeads;
        } else {
          // Create a fallback name if pipeline not found
          grouped[`Stage-${stageId.slice(-8)}`] = stageLeads;
        }
      });
    } else {
      // Old format: individual leads with pipelineId/stageId
      const usedLeadIds = new Set();

      pipelines.forEach((pipeline) => {
        const matchingLeads = leads.filter((lead) => {
          if (usedLeadIds.has(lead.leadId)) {
            return false;
          }

          const leadPipelineId = lead.pipelineId || lead.stageId;
          const pipelineId = pipeline.pipelineId || pipeline.stageId;
          const isMatch = String(leadPipelineId) === String(pipelineId);

          if (isMatch) {
            usedLeadIds.add(lead.leadId);
          }

          return isMatch;
        });

        grouped[pipeline.name] = matchingLeads;
      });

      // Handle leads without pipelineId
      const leadsWithoutPipeline = leads.filter((lead) => {
        if (usedLeadIds.has(lead.leadId)) {
          return false;
        }
        const leadPipelineId = lead.pipelineId || lead.stageId;
        return !leadPipelineId || leadPipelineId === null || leadPipelineId === undefined;
      });

      if (leadsWithoutPipeline.length > 0) {
        const newStage = pipelines.find((p) => p.name.toLowerCase() === "new") || pipelines[0];
        if (newStage) {
          if (!grouped[newStage.name]) {
            grouped[newStage.name] = [];
          }
          grouped[newStage.name] = [...grouped[newStage.name], ...leadsWithoutPipeline];
        }
      }
    }

    return grouped;
  }, [pipelines, leads]);



  // Add pipeline handler
  const handleAddStage = () => {
    if (!newStageName) {
      toast.error("Stage name is required");
      return;
    }
    if (newStageIsForm && !newStageFormType) {
      toast.error("Form type is required when 'Is Form' is enabled");
      return;
    }
    dispatch(
      createPipeline({
        name: newStageName,
        color: newStageColor,
        isFormRequired: newStageIsForm,
        formType: newStageIsForm ? newStageFormType : null,
      })
    );
    setNewStageName("");
    setNewStageColor("#3b82f6");
    setNewStageIsForm(false);
    setNewStageFormType("");
    setIsAddingStage(false);
    // Refresh leads to get the updated grouped format
    dispatch(fetchLeads());
  };

  // Delete pipeline handler
  const handleDeleteStages = (pipelineIds) => {
    pipelineIds.forEach((id) => {
      dispatch(deletePipeline(id));
    });
    dispatch(fetchPipelines());
    // Refresh leads to get the updated grouped format
    dispatch(fetchLeads());
    setShowDeletePipelineModal(false);
    setSelectedPipelinesToDelete([]);
  };

  // Handle schedule activity
  const handleScheduleActivity = (lead) => {
    setSelectedLeadForActivity(lead);
    setShowAdvancedScheduleModal(true);
  };

  // Drag-and-drop handler for Kanban board
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || !active) {
      console.log("No over or active element");
      return;
    }

    const leadId = active.id;
    const newPipelineName = over.id;

    if (!leadId || !newPipelineName) {
      console.log("Missing leadId or newPipelineName");
      return;
    }

    // Find the new pipeline by name
    const newPipeline = pipelines.find((p) => p.name === newPipelineName);

    if (!newPipeline) {
      console.log("Pipeline not found for name:", newPipelineName);
      return;
    }

    // Find the lead in the grouped format
    let lead = null;
    let currentPipelineId = null;
    
    // Check if leads is in the new grouped format
    if (Array.isArray(leads) && leads.length > 0 && leads[0].stageId && leads[0].leads) {
      // New format: find lead in grouped structure
      for (const stageGroup of leads) {
        const foundLead = stageGroup.leads.find(l => l.leadId === leadId);
        if (foundLead) {
          lead = foundLead;
          currentPipelineId = stageGroup.stageId;
          break;
        }
      }
    } else {
      // Old format: find lead directly
      lead = leads.find((l) => l.leadId === leadId);
      currentPipelineId = lead?.pipelineId || lead?.stageId;
    }

    if (!lead) {
      console.log("Lead not found for ID:", leadId);
      return;
    }

    const newPipelineId = newPipeline.pipelineId || newPipeline.stageId;

    console.log("Pipeline comparison:", {
      currentPipelineId,
      newPipelineId,
      isDifferent: String(currentPipelineId) !== String(newPipelineId),
    });

    if (String(currentPipelineId) !== String(newPipelineId)) {
      // If pipeline requires a form, open the modal instead of moving directly
      if (newPipeline.formType === "CONVERTED") {
        setSelectedLead({ ...lead, pipelineId: newPipelineId });
        setShowConvertModal(true);
        return;
      } else if (newPipeline.formType === "JUNK") {
        setSelectedLead({ ...lead, pipelineId: newPipelineId });
        setShowJunkModal(true);
        return;
      } else if (newPipeline.formType === "LOST") {
        setSelectedLead({ ...lead, pipelineId: newPipelineId });
        setShowLostModal(true);
        return;
      }

      // Otherwise, move lead directly
      console.log("Moving lead directly via API:", { leadId, newPipelineId });
      dispatch(moveLeadToPipeline({ leadId, newPipelineId }));
    } else {
      console.log("Pipeline is the same, no move needed");
    }
  };

  // Confirmation modal for pipeline actions
  const PipelineActionConfirmModal = () =>
    pipelineAction && (
      <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {pipelineAction === "add" ? "Add Pipeline" : "Delete Pipeline"}
          </h3>
          <p className="mb-6 text-gray-700">
            {pipelineAction === "add"
              ? "Do you want to add a new pipeline stage?"
              : "Do you want to delete pipeline stages?"}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setPipelineAction(null)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (pipelineAction === "add") setIsAddingStage(true);
                if (pipelineAction === "delete")
                  setShowDeletePipelineModal(true);
                setPipelineAction(null);
              }}
              className={`px-4 py-2 text-sm rounded-md ${
                pipelineAction === "add"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              } font-semibold shadow`}
            >
              {pipelineAction === "add" ? "Add Pipeline" : "Delete Pipeline"}
            </button>
          </div>
        </div>
      </div>
    );

  // Add lead handler for AddLeadModal
  const handleAddLead = async (leadData) => {
    await dispatch(createLead(leadData));
    // Refresh leads to get the updated grouped format
    dispatch(fetchLeads());
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setShowAddLeadModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow flex items-center min-w-24 justify-center transition-colors duration-200 hover:bg-blue-700"
          >
            New
          </button>
          <div className="flex items-center space-x-1">
            <h2 className="text-xl font-semibold text-gray-700">Pipeline</h2>
            <div className="relative pipeline-dropdown">
              <button
                onClick={() => setShowPipelineDropdown((prev) => !prev)}
                className="text-gray-500 hover:text-gray-700 p-1 flex items-center gap-1 transition-colors duration-200"
              >
                <FaCog />
                <FaChevronDown
                  className={`text-xs transition-transform duration-200 ${
                    showPipelineDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showPipelineDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-40 transform opacity-100 scale-100 transition-all duration-200">
                  <button
                    onClick={() => {
                      setIsAddingStage(true);
                      setShowPipelineDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
                  >
                    <FaPlus className="text-xs" />
                    Add Pipeline
                  </button>
                  <button
                    onClick={() => {
                      setShowDeletePipelineModal(true);
                      setShowPipelineDropdown(false);
                    }}
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
      </div>
      <KanbanBoardClientOnly
        leadsByStatus={leadsByStatus}
        statuses={pipelines.map((p) => p.name)}
        kanbanStatuses={pipelines}
        onScheduleActivity={handleScheduleActivity}
        onDragEnd={handleDragEnd}
        // Debug props
        debugProps={{ leadsByStatus, statuses: pipelines.map((p) => p.name) }}
      />
      <DeletePipelineModal
        isOpen={showDeletePipelineModal}
        onClose={() => setShowDeletePipelineModal(false)}
      />
      {isAddingStage && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-30">
          <div
            className="w-full max-w-md bg-gray-50 rounded-xl shadow-xl p-6 m-8 flex flex-col"
            style={{ minHeight: "auto", maxHeight: "90vh" }}
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add Pipeline
              </h3>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-medium text-gray-700">
                  Pipeline Name
                </label>
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Enter pipeline name..."
                  className="p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {newStageName === "" && (
                  <span className="text-xs text-red-500 mt-1">
                    Pipeline name is required.
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3 mt-3">
                <label className="text-xs font-medium text-gray-700">
                  Pipeline Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    "#3b82f6",
                    "#6366f1",
                    "#10b981",
                    "#f59e42",
                    "#22d3ee",
                    "#ef4444",
                    "#a3a3a3",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewStageColor(color)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                        newStageColor === color
                          ? "border-blue-600 ring-2 ring-blue-200"
                          : "border-gray-200"
                      }`}
                      style={{ background: color }}
                      aria-label={`Select color ${color}`}
                    >
                      {newStageColor === color && (
                        <span className="w-3 h-3 bg-white rounded-full border border-blue-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <label className="text-xs font-medium text-gray-700">
                  Is Form
                </label>
                <button
                  type="button"
                  onClick={() => setNewStageIsForm((prev) => !prev)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    newStageIsForm ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  aria-pressed={newStageIsForm}
                >
                  <span
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                      newStageIsForm ? "translate-x-6" : ""
                    }`}
                  ></span>
                </button>
                <span className="text-xs text-gray-500">
                  {newStageIsForm ? "Yes" : "No"}
                </span>
              </div>
              {newStageIsForm && (
                <div className="flex flex-col gap-3 mt-3">
                  <label className="text-xs font-medium text-gray-700">
                    Form Type
                  </label>
                  <select
                    value={newStageFormType}
                    onChange={(e) => setNewStageFormType(e.target.value)}
                    className="p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select form type...</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="JUNK">Junk</option>
                    <option value="LOST">Lost</option>
                    <option value="ONBOARDING">Onboarding</option>
                    <option value="APPROVAL">Approval</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                  {newStageFormType === "" && (
                    <span className="text-xs text-red-500 mt-1">
                      Form type is required.
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setNewStageName("");
                  setNewStageIsForm(false);
                  setNewStageColor("#3b82f6");
                  setNewStageFormType("");
                  setIsAddingStage(false);
                }}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStage}
                disabled={
                  !newStageName || (newStageIsForm && !newStageFormType)
                }
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
      <PipelineActionConfirmModal />
      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSubmit={handleAddLead}
        // Add other props as needed
      />
      <AdvancedScheduleActivityModal
        isOpen={showAdvancedScheduleModal}
        onClose={() => {
          setShowAdvancedScheduleModal(false);
          setSelectedLeadForActivity(null);
        }}
        lead={selectedLeadForActivity}
      />
      <ConvertLeadModal
        lead={showConvertModal ? selectedLead : null}
        onClose={() => setShowConvertModal(false)}
        onSuccess={() => {
          setShowConvertModal(false);
          setSelectedLead(null);
          // Refresh leads to get the updated grouped format
          dispatch(fetchLeads());
        }}
      />
      <JunkReasonModal
        lead={showJunkModal ? selectedLead : null}
        onClose={() => setShowJunkModal(false)}
        onSuccess={() => {
          setShowJunkModal(false);
          setSelectedLead(null);
          // Refresh leads to get the updated grouped format
          dispatch(fetchLeads());
        }}
      />
      <LostLeadModal
        lead={showLostModal ? selectedLead : null}
        onClose={() => setShowLostModal(false)}
        onSuccess={() => {
          setShowLostModal(false);
          setSelectedLead(null);
          // Refresh leads to get the updated grouped format
          dispatch(fetchLeads());
        }}
      />
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
