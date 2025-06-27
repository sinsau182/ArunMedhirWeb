import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { FaStar, FaRegStar, FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt,
    FaRupeeSign, FaBullseye, FaUserTie, FaTasks, FaHistory, FaPaperclip, FaUserCircle,
    FaCheck, FaUsers, FaFileAlt, FaTimes, FaPencilAlt, FaRegSmile, FaExpandAlt, FaChevronDown, FaClock
} from 'react-icons/fa';
import MainLayout from '@/components/MainLayout';
import { toast } from 'sonner';

// Add these lists for dropdowns/selects
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
const projectTypes = [
  'Residential', 'Commercial', 'Modular Kitchen', 'Office Interior', 'Retail Space', 'Other'
];
const propertyTypes = [
  'Apartment', 'Villa', 'Independent House', 'Duplex', 'Penthouse', 'Studio', 'Office', 'Shop', 'Warehouse', 'Plot', 'Other'
];

// Utility function for date/time formatting
function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + (timeStr ? 'T' + timeStr : ''));
  if (isNaN(date.getTime())) return dateStr + (timeStr ? ' ' + timeStr : '');
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const datePart = date.toLocaleDateString(undefined, options);
  let timePart = '';
  if (timeStr) {
    timePart = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  return timePart ? `${datePart}, ${timePart}` : datePart;
}

// --- Sub-components for the new Odoo-style layout ---

const OdooHeader = ({ lead, stages, onStatusChange, onMarkLost, isEditing, onEditToggle }) => {
    const currentIndex = stages.indexOf(lead.status);
    // Priority and Next Action helpers
    const getPriorityLabel = (rating) => {
        if (rating >= 3) return 'High';
        if (rating === 2) return 'Medium';
        if (rating === 1) return 'Low';
        return 'No';
    };
    const getNextAction = () => {
        // This is a placeholder; you may want to use your actual logic for next action
        return lead.nextAction || 'N/A';
    };
    const priorityLabel = getPriorityLabel(lead.rating);
    return (
        <div className="bg-white border-b border-gray-100 px-8 pt-8 pb-4 mb-2"> {/* Increased pt and pb for more height */}
            {/* Top Row: Centered Name/Type, Buttons on right */}
            <div className="flex flex-row items-center justify-center mb-4 relative"> {/* Increased mb for more gap */}
                <div className="flex-1 flex justify-center">
                    <span className="text-xl font-semibold text-gray-900">{lead.name} &ndash; {lead.projectType}</span>
                </div>
                <div className="absolute right-0 top-0 flex gap-2">
                    <button
                        onClick={onMarkLost}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md text-sm font-semibold shadow-sm hover:bg-red-50 transition"
                        disabled={lead.status === 'Won' || lead.status === 'Lost'}
                    >
                        <FaTimes className="w-4 h-4" />
                        Mark as Lost
                    </button>
                </div>
            </div>
            {/* Horizontal line with extra margin above */}
            <div className="w-full border-t border-gray-200 mb-2" style={{ marginTop: 16 }} />
            {/* Stepper Row with Priority/NextAction on left, stepper centered */}
            <div className="flex flex-row items-center md:justify-between">
                {/* Left: Priority and Next Action */}
                <div className="flex items-center gap-4 min-w-[220px]">
                    <span className="text-sm text-gray-700 font-medium">Priority: <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${priorityLabel === 'High' ? 'bg-orange-100 text-orange-700' : priorityLabel === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{priorityLabel}</span></span>
                    <span className="text-sm text-gray-700 font-medium">Next Action: <span className="text-blue-700 underline cursor-pointer">{getNextAction()}</span></span>
                </div>
                {/* Center: Stepper, centered */}
                <div className="flex items-center justify-center gap-2 py-2">
                    {stages.map((stage, idx) => {
                        const isActive = stage === lead.status;
                        const isCompleted = idx < currentIndex;
                        return (
                            <React.Fragment key={stage}>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={isActive}
                                        onClick={() => !isActive && onStatusChange(stage)}
                                        className={`flex items-center justify-center rounded-full border-2 w-8 h-8 text-base font-medium transition-all duration-200 focus:outline-none ${isCompleted ? 'bg-black text-white border-black' : isActive ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-300'} ${!isActive ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'}`}
                                        aria-label={`Go to ${stage}`}
                                    >
                                        {isCompleted || isActive ? <FaCheck className="w-4 h-4" /> : idx + 1}
                                    </button>
                                    <span className={`text-sm font-semibold ${isActive ? 'text-black' : 'text-gray-500'}`}>{stage}</span>
                                </div>
                                {idx !== stages.length - 1 && (
                                    <span className="mx-2 text-gray-300">&gt;</span>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const PlannedActivityItem = ({ activity, onEditActivity, onDeleteActivity, onMarkDone }) => (
  <div className={`relative flex flex-col bg-white rounded-xl shadow border ${activity.status === 'done' ? 'border-green-200 bg-green-50' : 'border-gray-100'} p-2 min-w-[220px] max-w-[340px] transition-all`}>  
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 relative">
        {activity.status === 'done' && (
          <span className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow z-10">Done</span>
        )}
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-lg">
          {activity.type === 'To-Do' && <FaCheck />}
          {activity.type === 'Email' && <FaEnvelope />}
          {activity.type === 'Call' && <FaPhone />}
          {activity.type === 'Meeting' && <FaUsers />}
          {activity.type === 'Document' && <FaFileAlt />}
        </span>
        <span className="text-xs font-semibold text-blue-700">{activity.type}</span>
            </div>
      {activity.status !== 'done' && (
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => onMarkDone(activity.id)} title="Mark as Done" className="p-1.5 rounded-full hover:bg-green-100 text-green-600 transition"><FaCheck size={14} /></button>
          <button onClick={() => onEditActivity(activity)} title="Edit" className="p-1.5 rounded-full hover:bg-blue-100 text-blue-600 transition"><FaPencilAlt size={14} /></button>
          <button onClick={() => onDeleteActivity(activity.id)} title="Delete" className="p-1.5 rounded-full hover:bg-red-100 text-red-500 transition"><FaTimes size={14} /></button>
        </div>
      )}
            </div>
    <div className="font-bold text-base mb-1 truncate" title={activity.summary}>{activity.summary}</div>
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
      <FaClock className="inline mr-1" />
      <span className={`font-medium ${activity.status === 'done' ? 'text-gray-400' : (new Date(activity.dueDate) < new Date() ? 'text-red-500' : 'text-green-600')}`}>{formatDateTime(activity.dueDate, activity.dueTime)}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
      <FaUserCircle className="inline mr-1 text-blue-400" />
      <span className="font-medium text-gray-700">{activity.user}</span>
        </div>
    </div>
);

const formatRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return d.toLocaleString();
};

const OdooDetailBody = ({ lead, isEditing, editedFields, onFieldChange, onScheduleActivity, conversionData, showConversionDetails, onToggleConversionDetails, onConversionFieldChange, activities, onEditActivity, onDeleteActivity, onMarkDone, timelineEvents, onAddTimelineEvent, notes = [], onAddNote, onEditToggle }) => {
    const [isLoggingNote, setIsLoggingNote] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [previewFile, setPreviewFile] = useState(null); // for file preview popup
    const [isEditingConversion, setIsEditingConversion] = useState(false);
    const [conversionEdit, setConversionEdit] = useState(conversionData || {});
    const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'conversion'
    const timelineContainerRef = useRef(null);
    const [viewMore, setViewMore] = useState(false);

    useEffect(() => {
        setConversionEdit(conversionData || {});
    }, [conversionData]);

    useEffect(() => {
        if (timelineContainerRef.current) {
            timelineContainerRef.current.scrollLeft = 0;
        }
    }, [timelineEvents]);

    const handleConversionFieldChange = (field, value) => {
        setConversionEdit(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveConversion = () => {
        if (typeof onConversionFieldChange === 'function') {
            Object.entries(conversionEdit).forEach(([field, value]) => {
                onConversionFieldChange(field, value);
            });
        }
        setIsEditingConversion(false);
    };

    const renderStars = (rating) => {
        if (!isEditing) {
            return Array.from({ length: 3 }, (_, i) => (
                i < rating ? <FaStar key={i} className="text-yellow-400" /> : <FaRegStar key={i} className="text-gray-400" />
            ));
        } else {
            return Array.from({ length: 3 }, (_, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onFieldChange('rating', i + 1)}
                    className="focus:outline-none"
                >
                    {i < rating ? <FaStar className="text-yellow-400" /> : <FaRegStar className="text-gray-400" />}
                </button>
            ));
        }
    };

    // Helper for file preview
    const handleFilePreview = (file) => {
        if (file && file.type && file.type.startsWith('image/')) {
            setPreviewFile(file);
        } else if (file) {
            window.open(URL.createObjectURL(file), '_blank');
        }
    };
    const handleClosePreview = () => setPreviewFile(null);

    // Helper: Get next planned activity
    const getNextActivity = (activities) => {
      if (!activities || activities.length === 0) return null;
      const pending = activities.filter(a => a.status !== 'done' && a.dueDate);
      if (pending.length === 0) return null;
      pending.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      return pending[0];
    };
    // Helper: Check if any activity is overdue
    const getOverdueActivity = (activities) => {
      const now = new Date();
      return activities?.find(a => a.status !== 'done' && a.dueDate && new Date(a.dueDate) < now);
    };
    // Helper: Priority label and stars
    const getPriorityLabel = (rating) => {
      if (rating >= 3) return 'High Priority';
      if (rating === 2) return 'Medium Priority';
      if (rating === 1) return 'Low Priority';
      return 'No Priority';
    };

    const nextActivity = getNextActivity(activities);
    const overdueActivity = getOverdueActivity(activities);
    const priorityLabel = getPriorityLabel(lead.rating);

    return (
        <div className="flex-grow ">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Project Info, Tabs, Notes */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Project Information Card */}
                    <div className="bg-white rounded-xl shadow p-6 border border-blue-50 mb-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Project Details</h3>
                            <button
                                onClick={onEditToggle}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md text-sm font-semibold shadow-sm hover:bg-gray-100 transition"
                            >
                                <FaPencilAlt className="w-4 h-4" /> Edit
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12">
                                {/* Column 1 */}
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <div className="font-semibold text-sm mb-1">Project Type</div>
                                        <div className="text-base text-gray-900">{lead.projectType || <span className='text-gray-400'>N/A</span>}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm mb-1">Property Type</div>
                                        <div className="text-base text-gray-900">{lead.propertyType || <span className='text-gray-400'>N/A</span>}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm mb-1">Address</div>
                                        <div className="text-base text-gray-900">{lead.address || <span className='text-gray-400'>N/A</span>}</div>
                                    </div>
                                </div>
                                {/* Column 2 */}
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <div className="font-semibold text-sm mb-1">Expected Closing Date</div>
                                        <div className="text-base text-gray-900">{lead.nextCall ? new Date(lead.nextCall).toLocaleDateString() : <span className='text-gray-400'>N/A</span>}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm mb-1">Budget</div>
                                        <div className="text-base text-gray-900">
                                            <FaRupeeSign className="inline mr-1 text-gray-400" />
                                            {lead.budget ? Number(lead.budget).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : <span className='text-gray-400'>N/A</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm mb-1">Lead Source <span className="text-red-500">*</span></div>
                                        <div className="text-base text-gray-900">{lead.leadSource || <span className='text-gray-400'>N/A</span>}</div>
                                    </div>
                                </div>
                                {/* Column 3 */}
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <div className="font-semibold text-sm mb-1">Design Style</div>
                                        <div className="text-base text-gray-900">{lead.designStyle || <span className='text-gray-400'>N/A</span>}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Tabs and Tab Content */}
                    <div className="bg-white rounded-xl shadow p-6 border border-blue-50">
                        <div className="border-b border-gray-200 mb-4">
                            <nav className="flex space-x-6" aria-label="Tabs">
                <button
                                    className={`pb-2 text-sm font-semibold border-b-2 transition-all duration-150 focus:outline-none ${activeTab === 'notes' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700 hover:bg-gray-50'}`}
                                    onClick={() => setActiveTab('notes')}
                >
                                    Notes
                </button>
                <button
                                    className={`pb-2 text-sm font-semibold border-b-2 transition-all duration-150 focus:outline-none ${activeTab === 'activity' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700 hover:bg-gray-50'}`}
                                    onClick={() => setActiveTab('activity')}
                >
                                    Activity Log
                </button>
                                <button
                                    className={`pb-2 text-sm font-semibold border-b-2 transition-all duration-150 focus:outline-none ${activeTab === 'conversion' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700 hover:bg-gray-50'}`}
                                    onClick={() => setActiveTab('conversion')}
                                >
                                    Conversion Details
                                </button>
                            </nav>
            </div>
                        {/* Tab Content */}
                        {activeTab === 'notes' && (
                            <div className="min-h-[350px]">
                                {/* Add Note */}
                                <div className="mb-4">
                                    <label className="block text-xs text-gray-500 mb-2">Add New Note</label>
                            <textarea
                                        className="w-full p-3 border rounded-md bg-gray-50 min-h-[80px] text-gray-700"
                                        placeholder="Enter your note here..."
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                            />
                                    <div className="flex items-center gap-2 mt-2 justify-end">
                            <button
                                            onClick={() => setNoteContent('')}
                                            className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2"
                                        >
                                            Cancel
                            </button>
                            <button
                                onClick={() => {
                                                if (!noteContent.trim()) return;
                                                onAddNote({
                                                    user: 'You', // Replace with actual user if available
                                                    time: new Date(),
                                                    content: noteContent.trim(),
                                                });
                                    setNoteContent('');
                                }}
                                            className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md"
                                            disabled={!noteContent.trim()}
                            >
                                            Save Note
                            </button>
                        </div>
                    </div>
                                {/* Notes List */}
                                <div className="mt-4">
                                    {notes.length === 0 && (
                                        <div className="text-gray-400 text-sm">No notes yet.</div>
                                    )}
                                    {notes.map((note, idx) => (
                                        <div key={idx} className="mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FaUserCircle className="text-blue-400" />
                                                <span className="font-semibold text-gray-700">{note.user}</span>
                                                <span className="text-xs text-gray-400 ml-2">{formatRelativeTime(note.time)}</span>
                                            </div>
                                            <div className="text-sm text-gray-700">{note.content}</div>
                                        </div>
                                    ))}
                    </div>
                </div>
            )}
                        {activeTab === 'activity' && (
                            <div className="relative pl-8">
                                {/* Timeline vertical line */}
                                <div className="absolute left-3 top-0 bottom-0 w-1 bg-blue-100 rounded-full" />
                                <ul className="flex flex-col gap-6">
                                    {activities && activities.length > 0 ? (
                                        activities.map((activity, idx) => {
                                            const isDone = activity.status === 'done';
                                            // Icon and badge color
                                            let icon = <FaTasks />;
                                            let badge = 'To-Do';
                                            let badgeColor = 'bg-gray-200 text-gray-700';
                                            if (activity.type === 'Call') { icon = <FaPhone />; badge = 'Call'; badgeColor = 'bg-gray-100 text-blue-700'; }
                                            if (activity.type === 'Email') { icon = <FaEnvelope />; badge = 'Email'; badgeColor = 'bg-green-100 text-green-700'; }
                                            if (activity.type === 'Meeting') { icon = <FaUsers />; badge = 'Meeting'; badgeColor = 'bg-blue-100 text-blue-700'; }
                                            if (activity.type === 'Document') { icon = <FaFileAlt />; badge = 'Document'; badgeColor = 'bg-yellow-100 text-yellow-700'; }
                                            return (
                                                <li key={activity.id} className="relative flex gap-4 items-start">
                                                    {/* Timeline dot */}
                                                    <span className={`absolute -left-5 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center ${isDone ? 'bg-green-100 border-green-400' : 'bg-white border-blue-400'}`}>{isDone ? <FaCheck className="text-green-500 text-xs" /> : icon}</span>
                                                    <div className="flex-1 bg-white rounded-lg shadow p-4 border border-blue-50">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badgeColor}`}>{badge}</span>
                                                                <span className="font-bold text-gray-900 text-base">{activity.summary}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500 font-medium">{activity.dueDate}{activity.dueTime ? ' ' + activity.dueTime : ''}</span>
                                                        </div>
                                                        {activity.callPurpose && (
                                                            <div className="text-sm mt-1"><span className="font-semibold text-gray-700">Purpose:</span> {activity.callPurpose}</div>
                                                        )}
                                                        {activity.callOutcome && (
                                                            <div className="text-sm mt-1"><span className="font-semibold text-gray-700">Outcome:</span> {activity.callOutcome}</div>
                                                        )}
                                                        {activity.notes && (
                                                            <div className="text-sm mt-1"><span className="font-semibold text-gray-700">Notes:</span> {activity.notes}</div>
                                                        )}
                                                        {/* For Meeting type, show meetingVenue, attendees, meetingLink */}
                                                        {activity.type === 'Meeting' && (
                                                            <>
                                                                {activity.meetingVenue && <div className="text-sm mt-1"><span className="font-semibold text-gray-700">Venue:</span> {activity.meetingVenue}</div>}
                                                                {activity.attendees && activity.attendees.length > 0 && <div className="text-sm mt-1"><span className="font-semibold text-gray-700">Attendees:</span> {activity.attendees.map(a => a.name).join(', ')}</div>}
                                                                {activity.meetingLink && <div className="text-sm mt-1"><span className="font-semibold text-gray-700">Link:</span> <a href={activity.meetingLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{activity.meetingLink}</a></div>}
                                                            </>
                                                        )}
                                                        {/* Action icons */}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {isDone ? (
                                                                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow">Done</span>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => onMarkDone(activity.id)} title="Mark as Done" className="p-1.5 rounded-full hover:bg-green-100 text-green-600 transition"><FaCheck size={14} /></button>
                                                                    <button onClick={() => onEditActivity(activity)} title="Edit" className="p-1.5 rounded-full hover:bg-blue-100 text-blue-600 transition"><FaPencilAlt size={14} /></button>
                                                                    <button onClick={() => onDeleteActivity(activity.id)} title="Delete" className="p-1.5 rounded-full hover:bg-red-100 text-red-500 transition"><FaTimes size={14} /></button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <div className="text-gray-400 text-sm">No activity log yet.</div>
                                    )}
                                </ul>
                            </div>
                        )}
                        {activeTab === 'conversion' && (
                            <div>
                                {conversionData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div>
                                            <span className="text-xs text-gray-500">Initial Quoted Amount</span>
                                            <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mt-1">
                                                <FaRupeeSign className="text-gray-400" />
                                                {conversionData.initialQuote || 'N/A'}
                                            </div>
                            </div>
                            <div>
                                            <span className="text-xs text-gray-500">Final Quotation</span>
                                            <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mt-1">
                                                <FaRupeeSign className="text-gray-400" />
                                                {conversionData.finalQuotation || 'N/A'}
                                            </div>
                            </div>
                            <div>
                                            <span className="text-xs text-gray-500">Sign-up Amount</span>
                                            <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mt-1">
                                                <FaRupeeSign className="text-gray-400" />
                                                {conversionData.signUpAmount || 'N/A'}
                                            </div>
                            </div>
                            <div>
                                            <span className="text-xs text-gray-500">Payment Date</span>
                                            <div className="text-base text-gray-900 font-medium mt-1">{conversionData.paymentDate || 'N/A'}</div>
                            </div>
                            <div>
                                            <span className="text-xs text-gray-500">Payment Mode</span>
                                            <div className="text-base text-gray-900 font-medium mt-1">{conversionData.paymentMode || 'N/A'}</div>
                            </div>
                            <div>
                                            <span className="text-xs text-gray-500">PAN Number</span>
                                            <div className="text-base text-gray-900 font-medium mt-1">{conversionData.panNumber || 'N/A'}</div>
                            </div>
                                        <div>
                                            <span className="text-xs text-gray-500">Project Timeline</span>
                                            <div className="text-base text-gray-900 font-medium mt-1">{conversionData.projectTimeline || 'N/A'}</div>
                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500">Discount</span>
                                            <div className="text-base text-gray-900 font-medium mt-1">{conversionData.discount || 'N/A'}</div>
                                        </div>
                                        <div className="md:col-span-2 border-t pt-4">
                                            <span className="text-xs text-gray-500">Payment Details File</span>
                                            <div>
                                                {conversionData.paymentDetails ? (
                                                    <a
                                                        href={URL.createObjectURL(conversionData.paymentDetails)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline"
                                                    >
                                                        {conversionData.paymentDetails.name}
                                                    </a>
                                                ) : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-xs text-gray-500">Booking Form File</span>
                                            <div>
                                                {conversionData.bookingForm ? (
                                                    <a
                                                        href={URL.createObjectURL(conversionData.bookingForm)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline"
                                                    >
                                                        {conversionData.bookingForm.name}
                                                    </a>
                                                ) : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-sm">No conversion details yet.</div>
                                )}
                            </div>
            )}
                        </div>
                </div>
                {/* Right: Contact Info, Team Assignment, Planned Activities */}
                <div className="flex flex-col gap-6">
                    {/* Contact Details Card */}
                    <div className="bg-white rounded-xl shadow p-6 border border-blue-50 mb-4">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Contact Details</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <FaUser className="text-gray-400" />
                                <span className="font-semibold text-gray-900">{lead.name || <span className='text-gray-400'>N/A</span>}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaPhone className="text-gray-400" />
                                {lead.contactNumber ? (
                                    <a href={`tel:+91${lead.contactNumber}`} className="text-blue-600 font-medium hover:underline">+91 {lead.contactNumber}</a>
                                ) : (
                                    <span className="text-gray-400">N/A</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <FaEnvelope className="text-gray-400" />
                                {lead.email ? (
                                    <a href={`mailto:${lead.email}`} className="text-blue-600 font-medium hover:underline">{lead.email}</a>
                                ) : (
                                    <span className="text-gray-400">N/A</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Team Assignment Card */}
                    <div className="bg-white rounded-xl shadow p-6 border border-blue-50 mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Team Assignment</h3>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-1">
                                <FaUserTie className="text-blue-400" />
                                <span className="font-semibold text-gray-900">
                                    {lead.salesRep ? lead.salesRep : <span className="text-gray-400">No Sales Representative</span>}
                                </span>
                                <span className="text-xs text-gray-400 ml-2">Sales Representative</span>
                </div>
                            <div className="flex items-center gap-2 mb-1">
                                <FaUserTie className="text-blue-400" />
                                <span className="font-semibold text-gray-900">
                                    {lead.designer ? lead.designer : <span className="text-gray-400">No Interior Designer</span>}
                                </span>
                                <span className="text-xs text-gray-400 ml-2">Interior Designer</span>
                                    </div>
                                </div>
                                </div>
                    {/* Planned Activities Card */}
                    <div className="bg-white rounded-xl shadow p-6 border border-blue-50">
                        <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Activity </h3>
                            <button
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 text-lg font-bold transition"
                                title="Add Activity"
                                onClick={onScheduleActivity}
                            >
                                +
                            </button>
                            </div>
                        <div className="flex flex-col gap-2">
                            {activities && activities.length > 0 ? (
                                activities.map(activity => {
                                    const dueDateObj = activity.dueDate ? new Date(activity.dueDate) : null;
                                    const now = new Date();
                                    const isOverdue = dueDateObj && dueDateObj < now && activity.status !== 'done';
                                    let overdueText = '';
                                    if (isOverdue) {
                                        const diffMs = now - dueDateObj;
                                        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                        overdueText = `Overdue by ${diffDays} day${diffDays > 1 ? 's' : ''}`;
                                    }
                                    return (
                                        <div key={activity.id} className={`bg-white rounded-lg p-4 flex items-center border border-blue-100 relative shadow-sm`}> 
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-800 text-base mb-1 truncate">{activity.summary}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-700">Due: {activity.dueDate ? new Date(activity.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}</span>
                                                    {isOverdue && (
                                                        <span className="text-xs text-red-500 font-semibold">{overdueText}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                {activity.status !== 'done' && (
                                                    <>
                                                        <button onClick={() => onMarkDone(activity.id)} title="Mark as Done" className="p-1.5 rounded-full hover:bg-green-100 text-green-600 transition"><FaCheck size={16} /></button>
                                                        <button onClick={() => onEditActivity(activity)} title="Edit" className="p-1.5 rounded-full hover:bg-blue-100 text-blue-600 transition"><FaPencilAlt size={16} /></button>
                                                        <button onClick={() => onDeleteActivity(activity.id)} title="Delete" className="p-1.5 rounded-full hover:bg-red-100 text-red-500 transition"><FaTimes size={16} /></button>
                                                    </>
                                                )}
                                                {activity.status === 'done' && (
                                                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow">Done</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-gray-400 text-sm">No planned activities.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddActivityModal = ({ isOpen, onClose, leadId, initialData, onSaveActivity }) => {
  const [activeType, setActiveType] = useState('To-Do');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [attendees, setAttendees] = useState([{ id: 1, name: '' }]);
  const [callPurpose, setCallPurpose] = useState('');
  const [callOutcome, setCallOutcome] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTime, setNextFollowUpTime] = useState('');
  const [meetingVenue, setMeetingVenue] = useState('In Office');

  useEffect(() => {
    if (initialData) {
      setActiveType(initialData.type || 'To-Do');
      setDueDate(initialData.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(initialData.dueTime || '');
      setMeetingLink(initialData.meetingLink || '');
      setAttendees(initialData.attendees || [{ id: 1, name: '' }]);
      setCallPurpose(initialData.callPurpose || '');
      setCallOutcome(initialData.callOutcome || '');
      setNextFollowUpDate(initialData.nextFollowUpDate || '');
      setNextFollowUpTime(initialData.nextFollowUpTime || '');
      setMeetingVenue(initialData.meetingVenue || 'In Office');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const activityTypes = [
    { name: 'To-Do', icon: <FaCheck /> },
    { name: 'Email', icon: <FaEnvelope /> },
    { name: 'Call', icon: <FaPhone /> },
    { name: 'Meeting', icon: <FaUsers /> },
    { name: 'Document', icon: <FaFileAlt /> },
  ];

  const summary = activeType === 'Call' ? 'Call Information' : activeType;

  const handleSave = (statusOverride) => {
    const activity = {
      id: initialData && initialData.id ? initialData.id : undefined,
      type: activeType,
      summary,
      dueDate,
      dueTime,
      user: 'hjhjj', // Replace with actual user if needed
      status: statusOverride || 'pending',
      meetingLink,
      attendees,
      callPurpose,
      callOutcome,
      nextFollowUpDate,
      nextFollowUpTime,
      meetingVenue,
    };
    if (onSaveActivity) onSaveActivity(activity);
      onClose();
  };

  const handleAddAttendee = () => {
      setAttendees([...attendees, { id: Date.now(), name: '' }]);
  };

  const handleAttendeeChange = (id, name) => {
      setAttendees(attendees.map(att => att.id === id ? { ...att, name } : att));
  };

  const handleRemoveAttendee = (id) => {
      setAttendees(attendees.filter(att => att.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Schedule Activity</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                </button>
            </div>
            <div className="flex border-b mb-4">
              {activityTypes.map(type => (
                <button
                  key={type.name}
                  onClick={() => setActiveType(type.name)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm ${activeType === type.name ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}
                >
                  {type.icon}
                  {type.name}
                </button>
              ))}
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-semibold">{activeType === 'Call' ? 'Call Information' : 'Summary'}</label>
                    <input type="text" value={summary} readOnly className="w-full p-2 mt-1 border-b focus:outline-none" />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-sm font-semibold">Due Date</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 mt-1 border rounded-md" />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-semibold">Time</label>
                        <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="w-full p-2 mt-1 border rounded-md" />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-semibold">Assigned to</label>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">H</div>
                        <span>hjhjj</span>
                    </div>
                </div>

                {/* Conditional fields for Meeting */}
                {activeType === 'Meeting' && (
                    <>
                        <div>
                            <label className="text-sm font-semibold">Meeting Details</label>
                            <input type="text" value={summary} readOnly className="w-full p-2 mt-1 border-b focus:outline-none" />
                        </div>
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="flex-1">
                                <label className="text-sm font-semibold">Assigned to</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">H</div>
                                    <span>hjhjj</span>
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <label className="text-sm font-semibold">Meeting Venue</label>
                                <select
                                    className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-400 bg-blue-50 border-blue-200 text-gray-800 pr-10 pl-3 hover:border-blue-400 transition-all"
                                    value={meetingVenue}
                                    onChange={e => setMeetingVenue(e.target.value)}
                                    style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                                >
                                    <option value="In Office">In Office</option>
                                    <option value="Online">Online</option>
                                    <option value="Client Site">Client Site</option>
                                    <option value="Other">Other</option>
                                </select>
                                <span className="pointer-events-none absolute right-3 top-9 text-gray-500 flex items-center">
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Meeting Link</label>
                            <input
                                type="text"
                                value={meetingLink}
                                onChange={e => setMeetingLink(e.target.value)}
                                placeholder="https://..."
                                className="w-full p-2 mt-1 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Attendees</label>
                            {attendees.map((attendee, index) => (
                                <div key={attendee.id} className="flex items-center gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={attendee.name}
                                        onChange={e => handleAttendeeChange(attendee.id, e.target.value)}
                                        placeholder={`Attendee ${index + 1} name`}
                                        className="w-full p-2 border rounded-md"
                                    />
                                    <button onClick={() => handleRemoveAttendee(attendee.id)} className="text-red-500 hover:text-red-700 p-2">
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}
                            <button onClick={handleAddAttendee} className="text-blue-600 text-sm mt-2">+ Add Attendee</button>
                        </div>
                    </>
                )}

                {/* Conditional fields for Call */}
                {activeType === 'Call' && (
                    <>
                        <h3 className="text-lg font-semibold mb-2">Call Information</h3>
                        <div>
                            <label className="text-sm font-semibold">Purpose of the Call</label>
                            <textarea
                                className="w-full h-20 p-2 border rounded-md"
                                placeholder="Add purpose of the call..."
                                value={callPurpose}
                                onChange={e => setCallPurpose(e.target.value)}
                            />
                        </div>
                        {callPurpose.trim() && (
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-semibold">Outcome of the Call</label>
                                    <textarea
                                        className="w-full h-20 p-2 border rounded-md"
                                        placeholder="Add outcome of the call..."
                                        value={callOutcome}
                                        onChange={e => setCallOutcome(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-semibold">Next Follow Up</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={nextFollowUpDate}
                                            onChange={e => setNextFollowUpDate(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Next Date"
                                        />
                                        <input
                                            type="time"
                                            value={nextFollowUpTime}
                                            onChange={e => setNextFollowUpTime(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Call Time"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
            <button onClick={() => handleSave()} className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm">Save</button>
            <button onClick={() => handleSave('done')} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm">Mark Done</button>
            <button onClick={onClose} className="bg-white border px-4 py-2 rounded-md text-sm">Discard</button>
        </div>

      </div>
    </div>
  );
};

const LostReasonModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (reason) {
            onSubmit(reason);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Reason for Lost Lead</h2>
                <textarea
                    className="w-full p-2 border rounded-md"
                    rows="4"
                    placeholder="Enter the reason why this lead was lost..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="text-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                    <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-md">OK</button>
                </div>
            </div>
        </div>
    );
};

// --- Conversion Modal Component ---
const ConversionModal = ({ isOpen, onClose, onConfirm, lead }) => {
    const [form, setForm] = useState({
        finalQuotation: '',
        signUpAmount: '',
        paymentDate: '',
        paymentMode: '',
        panNumber: '',
        projectTimeline: '',
        discount: '',
        paymentDetails: null,
        bookingForm: null,
    });
    const [previewFile, setPreviewFile] = useState(null); // { file: File, type: string } | null
    
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setForm((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };
    const handleRemoveFile = (name) => {
        setForm((prev) => ({ ...prev, [name]: null }));
    };
    const handleFilePreview = (file, type) => {
        if (file && file.type.startsWith('image/')) {
            setPreviewFile({ file, type });
        } else if (file) {
            // For non-images, just open in new tab
            window.open(URL.createObjectURL(file), '_blank');
        }
    };
    const handleClosePreview = () => {
        setPreviewFile(null);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(form);
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
                <h2 className="text-2xl font-bold mb-6 text-center">Mark Lead as Converted</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Initial Quoted Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaRupeeSign /></span>
                            <input
                                type="number"
                                name="initialQuote"
                                value={form.initialQuote}
                                onChange={handleChange}
                                className="w-full p-2 pl-8 border rounded focus:ring-2 focus:ring-blue-400"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Final Quotation (₹) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                                type="number"
                                name="finalQuotation"
                                value={form.finalQuotation}
                                onChange={handleChange}
                                required
                                className="w-full p-2 pl-8 border rounded focus:ring-2 focus:ring-blue-400"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Sign-up Amount (₹) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                                type="number"
                                name="signUpAmount"
                                value={form.signUpAmount}
                                onChange={handleChange}
                                required
                                className="w-full p-2 pl-8 border rounded focus:ring-2 focus:ring-blue-400"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Payment Date</label>
                        <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Payment Mode</label>
                        <input type="text" name="paymentMode" value={form.paymentMode} onChange={handleChange} placeholder="e.g., Bank Transfer, UPI" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">PAN Number</label>
                        <input type="text" name="panNumber" value={form.panNumber} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold">Project Timeline</label>
                        <input type="text" name="projectTimeline" value={form.projectTimeline} onChange={handleChange} placeholder="e.g., 6 Months, Jan-Mar 2025" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold">Discount (Optional)</label>
                        <input type="text" name="discount" value={form.discount} onChange={handleChange} placeholder="e.g., 10% or 5000" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" />
                    </div>
                    {/* Payment Details File Upload */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold">Upload Payment Details</label>
                        <div className="flex items-center gap-3">
                            <label className="relative cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded shadow border border-blue-200 transition">
                                <input
                                    type="file"
                                    name="paymentDetails"
                                    onChange={handleChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                Choose File
                            </label>
                            {form.paymentDetails && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="text-blue-600 underline text-sm max-w-[120px] truncate"
                                        onClick={() => handleFilePreview(form.paymentDetails, 'paymentDetails')}
                                    >
                                        {form.paymentDetails.name}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile('paymentDetails')}
                                        className="text-red-500 hover:text-red-700 text-lg"
                                        title="Remove file"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Booking Form File Upload */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold">Upload Booking Form</label>
                        <div className="flex items-center gap-3">
                            <label className="relative cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded shadow border border-blue-200 transition">
                                <input
                                    type="file"
                                    name="bookingForm"
                                    onChange={handleChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                Choose File
                            </label>
                            {form.bookingForm && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="text-blue-600 underline text-sm max-w-[120px] truncate"
                                        onClick={() => handleFilePreview(form.bookingForm, 'bookingForm')}
                                    >
                                        {form.bookingForm.name}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile('bookingForm')}
                                        className="text-red-500 hover:text-red-700 text-lg"
                                        title="Remove file"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded border font-semibold">Cancel</button>
                        <button type="submit" className="px-5 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">Confirm Conversion</button>
                    </div>
                </form>
                {/* Image Preview Modal */}
                {previewFile && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-80">
                        <div className="relative max-w-3xl w-full flex flex-col items-center">
                            <button onClick={handleClosePreview} className="absolute top-2 right-2 text-white text-3xl font-bold z-10">×</button>
                            <img
                                src={URL.createObjectURL(previewFile.file)}
                                alt="Preview"
                                className="max-h-[80vh] max-w-full rounded-lg border-4 border-white shadow-2xl object-contain bg-white"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

          // --- Main View Component ---
          const LeadDetailContent = () => {
              const router = useRouter();
              const { id } = router.query;

              // Use local state for leads
              const [leads, setLeads] = useState([
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
                  },
                  // Additional leads for testing
                  {
                      leadId: 'LEAD103',
                      name: 'Mike Johnson',
                      contactNumber: '5551234567',
                      email: 'mikej@example.com',
                      projectType: 'Residential',
                      propertyType: 'Villa',
                      address: '789 Oak Ave',
                      area: '3000',
                      budget: '5000000',
                      designStyle: 'Traditional',
                      leadSource: 'Social Media',
                      preferredContact: 'Phone',
                      notes: 'Looking for luxury villa design',
                      status: 'Qualified',
                      rating: 1,
                      salesRep: 'Dana',
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
                  },
                  {
                      leadId: 'LEAD104',
                      name: 'Sarah Wilson',
                      contactNumber: '4449876543',
                      email: 'sarahw@example.com',
                      projectType: 'Commercial',
                      propertyType: 'Retail',
                      address: '321 Business Blvd',
                      area: '1500',
                      budget: '2000000',
                      designStyle: 'Minimalist',
                      leadSource: 'Cold Call',
                      preferredContact: 'Email',
                      notes: 'Boutique store design needed',
                      status: 'Quoted',
                      rating: 3,
                      salesRep: 'Charlie',
                      designer: 'Jack',
                      callDescription: null,
                      callHistory: [],
                      nextCall: null,
                      quotedAmount: '1800000',
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
                  },
                  {
                      leadId: 'LEAD105',
                      name: 'David Brown',
                      contactNumber: '7778889999',
                      email: 'davidb@example.com',
                      projectType: 'Residential',
                      propertyType: 'Penthouse',
                      address: '555 Luxury Tower',
                      area: '4000',
                      budget: '8000000',
                      designStyle: 'Luxury',
                      leadSource: 'Website',
                      preferredContact: 'Phone',
                      notes: 'Penthouse renovation project',
                      status: 'Converted',
                      rating: 2,
                      salesRep: 'Ivy',
                      designer: 'Jack',
                      callDescription: null,
                      callHistory: [],
                      nextCall: null,
                      quotedAmount: '7500000',
                      finalQuotation: '7500000',
                      signupAmount: '2000000',
                      paymentDate: '2024-01-15',
                      paymentMode: 'Bank Transfer',
                      panNumber: 'ABCDE1234F',
                      discount: '500000',
                      reasonForLost: null,
                      reasonForJunk: null,
                      submittedBy: 'MANAGER',
                      paymentDetailsFileName: null,
                      bookingFormFileName: null,
                  },
                  {
                      leadId: 'LEAD106',
                      name: 'Priya Mehra',
                      contactNumber: '9998887776',
                      email: 'priya.mehra@example.com',
                      projectType: 'Residential',
                      propertyType: 'Studio',
                      address: '22 Lotus Residency',
                      area: '600',
                      budget: '900000',
                      designStyle: 'Minimalist',
                      leadSource: 'Instagram',
                      preferredContact: 'Email',
                      notes: 'Studio apartment makeover',
                      status: 'New',
                      rating: 1,
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
                  },
                  {
                      leadId: 'LEAD107',
                      name: 'Rohit Sharma',
                      contactNumber: '8887776665',
                      email: 'rohit.sharma@example.com',
                      projectType: 'Commercial',
                      propertyType: 'Warehouse',
                      address: 'Industrial Area, Plot 45',
                      area: '10000',
                      budget: '12000000',
                      designStyle: 'Industrial',
                      leadSource: 'LinkedIn',
                      preferredContact: 'Phone',
                      notes: 'Warehouse interior setup',
                      status: 'Contacted',
                      rating: 2,
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
                  },
                  {
                      leadId: 'LEAD108',
                      name: 'Sneha Kapoor',
                      contactNumber: '7776665554',
                      email: 'sneha.kapoor@example.com',
                      projectType: 'Residential',
                      propertyType: 'Duplex',
                      address: 'Green Valley, Block B',
                      area: '2500',
                      budget: '3500000',
                      designStyle: 'Contemporary',
                      leadSource: 'Facebook',
                      preferredContact: 'Email',
                      notes: 'Duplex renovation',
                      status: 'Qualified',
                      rating: 3,
                      salesRep: 'Dana',
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
                  },
              ]);
              const stages = ['New', 'Contacted', 'Qualified', 'Quoted', 'Converted'];
              const lead = leads.find(l => l.leadId === id);

              const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
              const [isLostReasonModalOpen, setIsLostReasonModalOpen] = useState(false);
              // --- Edit mode state ---
              const [isEditing, setIsEditing] = useState(false);
              const [editedFields, setEditedFields] = useState({});
              const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
              const [conversionData, setConversionData] = useState(null);
              const [showConversionDetails, setShowConversionDetails] = useState(false);
              const [editingActivity, setEditingActivity] = useState(null);
              const [activities, setActivities] = useState([
                // Example initial activity
                { id: 1, type: 'To-Do', summary: 'Follow up with client', dueDate: '2025-06-24', dueTime: '', user: 'hjhjj', status: 'pending' }
              ]);
              const [timelineEvents, setTimelineEvents] = useState([]);
              // Notes state
              const [notes, setNotes] = useState([]);

              // Add a helper to add timeline events
              const addTimelineEvent = ({ action, details, user = 'You', time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) }) => {
                setTimelineEvents(prev => [
                  { id: Date.now() + Math.random(), user, time, action, details },
                  ...prev,
                ]);
              };

              // --- Status change logic (local only) ---
              const handleStatusChange = (newStatus) => {
                  if (newStatus === 'Converted') {
                      setIsConversionModalOpen(true);
                      return;
                  }
                  if (lead && newStatus !== lead.status) {
                      setLeads(prevLeads => prevLeads.map(l =>
                          l.leadId === lead.leadId ? { ...l, status: newStatus } : l
                      ));
                      addTimelineEvent({
                          action: 'Stage changed',
                          details: `${lead.status} → ${newStatus}`,
                      });
                      toast.success(`Lead moved to ${newStatus}`);
                  }
              };

              const handleMarkLost = () => {
                  setIsLostReasonModalOpen(true);
              };

              const handleLostReasonSubmit = (reason) => {
                  if (lead) {
                      setLeads(prevLeads => prevLeads.map(l =>
                          l.leadId === lead.leadId ? { ...l, status: 'Lost', reasonForLost: reason } : l
                      ));
                      setIsLostReasonModalOpen(false);
                  }
              };

              // --- Edit/Save logic ---
              const handleEditToggle = () => {
                  if (isEditing) {
                      // Save changes to local state
                      setLeads(prevLeads => prevLeads.map(l =>
                          l.leadId === lead.leadId ? { ...l, ...editedFields } : l
                      ));
                      setIsEditing(false);
                  } else {
                      // Enter edit mode, initialize editedFields with current lead values
                      setEditedFields({
                          budget: lead.budget || '',
                          projectType: lead.projectType || '',
                          propertyType: lead.propertyType || '',
                          address: lead.address || '',
                          name: lead.name || '',
                          email: lead.email || '',
                          contactNumber: lead.contactNumber || '',
                          salesRep: lead.salesRep || '',
                          designer: lead.designer || '',
                          nextCall: lead.nextCall || '',
                          rating: lead.rating || 0,
                      });
                      setIsEditing(true);
                  }
              };

              const handleFieldChange = (field, value) => {
                  setEditedFields(prev => ({ ...prev, [field]: value }));
              };

              // Confirm conversion handler
              const handleConfirmConversion = (formData) => {
                  setConversionData(formData);
                  setLeads(prevLeads => prevLeads.map(l =>
                      l.leadId === lead.leadId ? { ...l, status: 'Converted', ...formData } : l
                  ));
                  setIsConversionModalOpen(false);
                  toast.success('Lead marked as Converted!');
              };

              const onToggleConversionDetails = () => {
                  setShowConversionDetails(!showConversionDetails);
              };

              const handleEditActivity = (activity) => {
                  setEditingActivity(activity);
                  setIsActivityModalOpen(true);
              };

              const handleAddOrEditActivity = (activity) => {
                setActivities(prev => {
                  if (activity.id) {
                    // Edit
                    return prev.map(a => a.id === activity.id ? activity : a);
                  } else {
                    // Add
                    return [...prev, { ...activity, id: Date.now(), status: 'pending' }];
                  }
                });
              };
              const handleDeleteActivity = (id) => setActivities(prev => prev.filter(a => a.id !== id));
              const handleMarkDone = (id) => {
                setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'done' } : a));
                const doneActivity = activities.find(a => a.id === id);
                if (doneActivity) {
                    addTimelineEvent({
                        action: 'Activity completed',
                        details: doneActivity.summary,
                    });
                }
              };

              if (!lead) return <div className="p-6 text-center">Lead not found.</div>;

              return (
                  <div className="bg-gray-100 min-h-screen flex flex-col">
                      <OdooHeader
                          lead={isEditing ? { ...lead, ...editedFields } : lead}
                          stages={stages}
                          onStatusChange={handleStatusChange}
                          onMarkLost={handleMarkLost}
                          isEditing={isEditing}
                          onEditToggle={handleEditToggle}
                      />
                      <OdooDetailBody
                          lead={isEditing ? { ...lead, ...editedFields } : lead}
                          isEditing={isEditing}
                          editedFields={editedFields}
                          onFieldChange={handleFieldChange}
                          onScheduleActivity={() => setIsActivityModalOpen(true)}
                          conversionData={conversionData}
                          showConversionDetails={showConversionDetails}
                          onToggleConversionDetails={onToggleConversionDetails}
                          onConversionFieldChange={(field, value) => {
                              setConversionData(prev => ({ ...prev, [field]: value }));
                          }}
                          activities={activities}
                          onEditActivity={handleEditActivity}
                          onDeleteActivity={handleDeleteActivity}
                          onMarkDone={handleMarkDone}
                          timelineEvents={timelineEvents}
                          onAddTimelineEvent={addTimelineEvent}
                          notes={notes}
                          onAddNote={note => setNotes(prev => [note, ...prev])}
                      />
                      <AddActivityModal
                          isOpen={isActivityModalOpen}
                          onClose={() => { setIsActivityModalOpen(false); setEditingActivity(null); }}
                          leadId={lead.leadId}
                          initialData={editingActivity}
                          onSaveActivity={handleAddOrEditActivity}
                      />
                      <LostReasonModal
                          isOpen={isLostReasonModalOpen}
                          onClose={() => setIsLostReasonModalOpen(false)}
                          onSubmit={handleLostReasonSubmit}
                      />
                      <ConversionModal
                          isOpen={isConversionModalOpen}
                          onClose={() => setIsConversionModalOpen(false)}
                          onConfirm={handleConfirmConversion}
                          lead={lead}
                      />
                  </div>
              );
          };

          const LeadDetailPage = () => {
              return (
                  <MainLayout>
                      <LeadDetailContent />
                  </MainLayout>
              );
          };

          export default LeadDetailPage;

