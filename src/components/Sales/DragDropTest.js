import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const DraggableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white p-4 rounded-md shadow-sm border border-gray-200 cursor-grab
        ${isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'}
      `}
    >
      {children}
    </div>
  );
};

const DroppableZone = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        p-4 border-2 border-dashed rounded-md min-h-[100px] transition-all duration-200
        ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
      `}
    >
      <h3 className="font-semibold mb-2">{id}</h3>
      {children}
    </div>
  );
};

const DragDropTest = () => {
  const [items, setItems] = useState({
    'zone1': ['item1', 'item2'],
    'zone2': ['item3'],
    'zone3': []
  });
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems(prevItems => {
        const newItems = { ...prevItems };
        
        // Find which zone contains the active item
        let sourceZone = null;
        for (const [zone, zoneItems] of Object.entries(newItems)) {
          if (zoneItems.includes(active.id)) {
            sourceZone = zone;
            break;
          }
        }
        
        if (sourceZone) {
          // Remove from source zone
          newItems[sourceZone] = newItems[sourceZone].filter(id => id !== active.id);
          // Add to target zone
          newItems[over.id] = [...newItems[over.id], active.id];
        }
        
        return newItems;
      });
    }
    
    setActiveId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Drag and Drop Test</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(items).map(([zoneId, zoneItems]) => (
            <DroppableZone key={zoneId} id={zoneId}>
              {zoneItems.map(itemId => (
                <DraggableItem key={itemId} id={itemId}>
                  {itemId}
                </DraggableItem>
              ))}
            </DroppableZone>
          ))}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="bg-white p-4 rounded-md shadow-lg border border-gray-200">
              {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DragDropTest; 