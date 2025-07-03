import React, { useEffect, useRef, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';

const KanbanBoard = ({
  leadsByStatus,
  onDragEnd,
  statuses,
  onEdit,
  onConvert,
  onMarkLost,
  onMarkJunk,
  onAddLead,
  isAddingStage,
  newStageName,
  setNewStageName,
  onAddStage,
  onCancelAddStage,
  onScheduleActivity,
  setIsForm,
  setStageColor,
  stageColor,
  isForm,
  ...rest
}) => {
  const inputRef = useRef(null);
  const [activeLead, setActiveLead] = useState(null);

  // Configure sensors for better drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced minimum distance to start dragging
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Define a simple color palette
  const COLOR_PALETTE = ['#3b82f6', '#6366f1', '#10b981', '#f59e42', '#22d3ee', '#ef4444', '#a3a3a3'];

  useEffect(() => {
    if (isAddingStage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingStage]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancelAddStage();
      }
    };

    if (isAddingStage) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddingStage, onCancelAddStage]);

  const handleDragStart = (event) => {
    const { active } = event;
    
    // Find the lead being dragged
    const leadId = active.id;
    const allLeads = Object.values(leadsByStatus).flat();
    const draggedLead = allLeads.find(lead => lead.leadId === leadId);
    setActiveLead(draggedLead);
  };

  const handleDragEnd = (event) => {
    setActiveLead(null);
    onDragEnd(event);
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {Array.isArray(statuses) && statuses.map((statusName, idx) => {
          // Find the stage object for this status
          const stageObj = (rest.kanbanStatuses || []).find(s => s.name === statusName);
          return (
            <KanbanColumn
              key={statusName}
              status={statusName}
              stage={stageObj}
              leads={leadsByStatus[statusName] || []}
              onEdit={onEdit}
              onConvert={onConvert}
              onMarkLost={onMarkLost}
              onMarkJunk={onMarkJunk}
              onAddLead={onAddLead}
              onScheduleActivity={onScheduleActivity}
            />
          );
        })}
        {isAddingStage && (
          <div className="flex-1 min-w-[320px] max-w-[380px] bg-white rounded-xl shadow-lg p-6 border border-blue-200 flex flex-col gap-4 items-stretch">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Add Pipeline Stage</h3>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-gray-700">Stage Name</label>
              <input
                ref={inputRef}
                type="text"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAddStage()}
                placeholder="Enter stage name..."
                className="p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {newStageName === '' && <span className="text-xs text-red-500 mt-1">Stage name is required.</span>}
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-gray-700">Stage Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PALETTE.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setStageColor(color)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${stageColor === color ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'}`}
                    style={{ background: color }}
                    aria-label={`Select color ${color}`}
                  >
                    {stageColor === color && <span className="w-3 h-3 bg-white rounded-full border border-blue-600"></span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-700">Is Form</label>
              <button
                type="button"
                onClick={() => setIsForm(prev => !prev)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${isForm ? 'bg-blue-600' : 'bg-gray-300'}`}
                aria-pressed={isForm}
              >
                <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${isForm ? 'translate-x-6' : ''}`}></span>
              </button>
              <span className="text-xs text-gray-500">{isForm ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={onCancelAddStage}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={onAddStage}
                disabled={!newStageName}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Stage
              </button>
            </div>
          </div>
        )}
      </div>
      
      <DragOverlay zIndex={9999}>
        {activeLead ? (
          <div className="transform rotate-2 scale-105 shadow-2xl">
            <LeadCard
              lead={activeLead}
              onEdit={onEdit}
              onConvert={onConvert}
              onMarkLost={onMarkLost}
              onMarkJunk={onMarkJunk}
              onScheduleActivity={onScheduleActivity}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;