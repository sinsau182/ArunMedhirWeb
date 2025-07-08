import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  FaStar,
  FaRegStar,
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaUserTie,
  FaPhone,
  FaEnvelope,
  FaCommentDots,
  FaRegClock,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import LeadActions from './LeadActions';

const LeadCard = ({ lead, onEdit, onConvert, onMarkLost, onMarkJunk, onScheduleActivity }) => {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: lead.leadId,
    data: {
      type: 'lead',
      lead: lead
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleCardDoubleClick = (e) => {
    if (e.target.closest('.lead-actions')) {
      e.stopPropagation();
      return;
    }
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
    return <div className="flex items-center">{stars}</div>;
  };

  // Helper to determine activity status
  const getActivityStatus = (activities) => {
    if (!activities || activities.length === 0) {
      return { status: 'None', text: 'No activity scheduled' };
    }

    const now = new Date();
    let hasUpcoming = false;

    for (const activity of activities) {
      if (activity.status !== 'done') {
        const dueDate = new Date(activity.dueDate);
        if (dueDate < now) {
          return { status: 'Overdue', text: 'Activity overdue!' };
        }
        hasUpcoming = true;
      }
    }

    if (hasUpcoming) {
      return { status: 'Upcoming', text: 'Activity upcoming' };
    }
    
    return { status: 'None', text: 'No upcoming activity' };
  };

  const activityStatus = getActivityStatus(lead.activities);

  // Initials for Sales Rep and Designer
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  // Tooltip helpers
  const tooltip = (label, value) => `${label}: ${value || 'Unassigned'}`;

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'});
  }

  function CustomTooltip({ children, text }) {
    const [show, setShow] = useState(false);
    return (
      <span
        className="relative"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
        {show && (
          <div className="absolute left-1/2 -translate-x-1/2 top-8 z-50 bg-white text-gray-800 px-3 py-2 rounded shadow-lg border text-xs whitespace-pre min-w-max">
            {text}
          </div>
        )}
      </span>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={handleCardDoubleClick}
      {...attributes}
      {...listeners}
      className={`
        bg-white p-4 rounded-xl shadow border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-grab
        ${isDragging ? 'opacity-50 shadow-lg scale-105 rotate-1' : 'hover:shadow-lg'}
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${isDragging ? 'z-50' : ''}
      `}
    >
      {/* Top section with status icon */}
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base truncate pr-2">{lead.name}</h3>
          <div className="mt-1 flex items-center">{renderStars(lead.rating || 0)}</div>
        </div>
        <CustomTooltip text={activityStatus.text}>
          {activityStatus.status === 'Overdue' && <FaExclamationTriangle className="text-red-500 text-lg" />}
          {activityStatus.status === 'Upcoming' && <FaCheckCircle className="text-green-500 text-lg" />}
          {activityStatus.status === 'None' && <FaRegClock className="text-yellow-500 text-lg" />}
        </CustomTooltip>
      </div>
      {/* Second row: Budget • Date of Creation */}
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
        <span className="flex items-center gap-1 font-semibold">
          <FaRupeeSign className="text-blue-500" />
          {lead.budget ? Number(lead.budget).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '₹0'}
        </span>
        <span className="text-gray-300 text-lg mx-1">•</span>
        <span className="flex items-center gap-1">
          <FaCalendarAlt className="text-gray-400" />
          {formatDate(lead.dateOfCreation)}
        </span>
      </div>
      {/* Team/summary row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Overlapping initials */}
          <div className="flex -space-x-2">
            <CustomTooltip text={`${lead.salesRep || 'Unassigned'}\nSales Rep`}>
              <span
                className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm cursor-pointer border-2 border-white shadow"
              >
                {getInitial(lead.salesRep)}
              </span>
            </CustomTooltip>
            <CustomTooltip text={`${lead.designer || 'Unassigned'}\nDesigner`}>
              <span
                className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm cursor-pointer border-2 border-white shadow"
              >
                {getInitial(lead.designer)}
              </span>
            </CustomTooltip>
          </div>
        </div>
      </div>
      {/* Horizontal divider and activity row at the bottom */}
      <div className="mt-4 border-t border-gray-200 mb-0.5" />
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-400">
          Last Updated: {formatDate(lead.updatedAt || lead.createdAt)}
        </div>
        <LeadActions 
            lead={lead} 
            onScheduleActivity={onScheduleActivity}
            onMarkLost={onMarkLost} 
        />
      </div>
    </div>
  );
};

export default LeadCard;