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

  // Initials for Sales Rep and Designer
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  // Tooltip helpers
  const tooltip = (label, value) => `${label}: ${value || 'Unassigned'}`;

  // Find the latest activity (by due date/time)
  let latestActivity = null;
  if (Array.isArray(lead.activities) && lead.activities.length > 0) {
    latestActivity = [...lead.activities]
      .filter(a => a.dueDate)
      .sort((a, b) => new Date(b.dueDate + 'T' + (b.dueTime || '00:00')) - new Date(a.dueDate + 'T' + (a.dueTime || '00:00')))[0];
  }

  function formatRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000); // in seconds
    if (isNaN(diff)) return '';
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 172800) return 'Yesterday';
    return date.toLocaleDateString();
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
        <div className="mt-1 flex items-center">{renderStars(lead.rating || 0)}</div>
      </div>
      {/* Second row: Budget • Due Date */}
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
        <span className="flex items-center gap-1 font-semibold">
          <FaRupeeSign className="text-blue-500" />
          {lead.budget ? Number(lead.budget).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '₹0'}
        </span>
        <span className="text-gray-300 text-lg mx-1">•</span>
        <span className="flex items-center gap-1">
          <FaCalendarAlt className="text-gray-400" />
          {latestActivity ? (
            new Date(latestActivity.dueDate + 'T' + (latestActivity.dueTime || '00:00')) < new Date() ? (
              <span className="text-red-600 font-semibold">
                {new Date(latestActivity.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            ) : (
              new Date(latestActivity.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
            )
          ) : 'No due date'}
        </span>
      </div>
      {/* Third row: Overlapping Team, Recent Activity */}
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
        {/* Recent Activity summary */}
        {latestActivity ? (
          <span className="text-xs text-blue-700 truncate max-w-[120px] text-right" title={latestActivity.summary}>
            {latestActivity.type === 'Email' && 'Email sent'}
            {latestActivity.type === 'Meeting' && 'Meeting scheduled'}
            {latestActivity.type === 'Call' && 'Call scheduled'}
            {latestActivity.type === 'To-Do' && 'To-Do'}
            {latestActivity.type === 'Document' && 'Document added'}
            {latestActivity.user ? ` — ${latestActivity.user}` : ''}
          </span>
        ) : null}
      </div>
      {/* Horizontal divider with extra margin above */}
      <div className="mt-4 border-t border-gray-200 mb-0.5" />
      {/* Scheduled Activity (latest only) */}
      {/* Removed: No activity scheduled fallback */}
      {/* Row: Watch icon left, due date, recent activity, updated just now right-aligned */}
      <div className="flex items-center justify-between mt-1 mb-1 w-full">
        <button
          type="button"
          title="Schedule Activity"
          onClick={() => onScheduleActivity && onScheduleActivity(lead)}
          className="hover:bg-blue-50 rounded-full p-1 transition-colors text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <FaRegClock size={20} />
        </button>
        <div className="flex items-center gap-3 ml-auto text-xs text-gray-500">
          <span className="text-gray-400">{latestActivity
            ? formatRelativeTime(
                latestActivity.createdAt ||
                (latestActivity.dueDate + 'T' + (latestActivity.dueTime || '00:00'))
              )
            : 'No activity scheduled'}</span>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;