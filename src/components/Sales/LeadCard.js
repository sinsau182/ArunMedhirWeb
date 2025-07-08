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
      return;
    }
    router.push(`/Sales/leads/${lead.leadId}`);
  };

  const renderStars = (priority) => {
    const stars = [];
    for (let i = 0; i < 3; i++) {
      stars.push(
        i < priority ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-gray-300" />
        )
      );
    }
    return <div className="flex items-center">{stars}</div>;
  };

  // Map priority string to stars
  const priorityToStars = (priority) => {
    if (typeof priority === 'number') return priority;
    if (!priority) return 0;
    const map = { low: 1, medium: 2, high: 3 };
    return map[String(priority).toLowerCase()] || 0;
  };

  // Initials for Sales Rep and Designer (fallback to salesRep/designer if assignSalesPersonEmpId/assignDesignerEmpId are null)
  const getInitial = (id, fallback) => {
    if (id) return id.toString().charAt(0).toUpperCase();
    if (fallback) return fallback.toString().charAt(0).toUpperCase();
    return '--';
  };

  // Tooltip helpers
  const tooltip = (label, value) => `${label}: ${value || 'Unassigned'}`;

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
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
      {/* Top: Name, then Stars below, both left-aligned */}
      <div className="mb-1">
        <h3 className="font-semibold text-gray-900 text-base truncate">{lead.name}</h3>
        <div className="mt-1 flex items-center">{renderStars(priorityToStars(lead.priority))}</div>
      </div>
      {/* Second row: Budget • Date of Creation */}
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
        <span className="flex items-center gap-1 font-semibold">
          <FaRupeeSign className="text-blue-500" />
          {lead.budget ? Number(lead.budget).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
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
            <CustomTooltip text={`${lead.assignSalesPersonEmpId || lead.salesRep || '--'}\nSales Person`}>
              <span
                className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm cursor-pointer border-2 border-white shadow"
              >
                {getInitial(lead.assignSalesPersonEmpId, lead.salesRep)}
              </span>
            </CustomTooltip>
            <CustomTooltip text={`${lead.assignDesignerEmpId || lead.designer || '--'}\nDesigner`}>
              <span
                className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm cursor-pointer border-2 border-white shadow"
              >
                {getInitial(lead.assignDesignerEmpId, lead.designer)}
              </span>
            </CustomTooltip>
          </div>
        </div>
      </div>
      {/* Horizontal divider and activity row at the bottom */}
      <div className="mt-4 border-t border-gray-200 mb-0.5" />
      <div className="flex items-center justify-between mt-2 mb-2">
        <button
          type="button"
          title="Schedule Activity"
          onClick={() => onScheduleActivity && onScheduleActivity(lead)}
          className="hover:bg-blue-50 rounded-full p-1 transition-colors text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <FaRegClock size={20} />
        </button>
        <span className="text-xs text-gray-400 ml-2">{lead.latestActivityTitle || ''}</span>
      </div>
    </div>
  );
};

export default LeadCard;