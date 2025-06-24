import React from 'react';
import { useRouter } from 'next/router';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  FaStar,
  FaRegStar,
  FaClock,
} from "react-icons/fa";
import LeadActions from './LeadActions';

const LeadCard = ({ lead, onEdit, onConvert, onMarkLost, onMarkJunk }) => {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({ id: lead.leadId });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleCardDoubleClick = (e) => {
    // Prevent navigation if clicking on action buttons
    if (e.target.closest('.lead-actions')) {
      return;
    }
    // Navigate to lead detail page
    router.push(`/Sales/leads/${lead.leadId}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 3; i++) {
      stars.push(
        i < rating ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-gray-300" />
        )
      );
    }
    return <div className="flex items-center space-x-0.5">{stars}</div>;
  };

  const assigneeInitial = lead.name ? lead.name.charAt(0).toUpperCase() : 'A';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={handleCardDoubleClick}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{lead.name}</h3>
        <div className="lead-actions relative">
          <LeadActions
            lead={lead}
            onEdit={onEdit}
            onConvert={onConvert}
            onMarkLost={onMarkLost}
            onMarkJunk={onMarkJunk}
          />
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {renderStars(lead.rating || 0)}
            <FaClock className="text-gray-400" />
          </div>

          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {assigneeInitial}
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-xs text-gray-600">
          <div>{lead.contactNumber || 'No contact'}</div>
          <div className="truncate">{lead.email || 'No email'}</div>
        </div>

        {/* Sales Person and Designer Assignment Display */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span className="font-medium">SP:</span>
            <span className={`truncate max-w-20 ${lead.salesRep ? 'text-green-600' : 'text-gray-400'}`}>
              {lead.salesRep || 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium">D:</span>
            <span className={`truncate max-w-20 ${lead.designer ? 'text-green-600' : 'text-gray-400'}`}>
              {lead.designer || 'Unassigned'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;