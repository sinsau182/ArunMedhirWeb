import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { FaStar, FaRegStar, FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt,
    FaRupeeSign, FaBullseye, FaUserTie, FaTasks, FaHistory, FaPaperclip, FaUserCircle,
    FaCheck, FaUsers, FaFileAlt, FaTimes, FaPencilAlt, FaRegSmile, FaExpandAlt, FaChevronDown, FaClock,
    FaRegCheckCircle, FaRegClock } from 'react-icons/fa';
import MainLayout from '@/components/MainLayout';
import { toast } from 'sonner';
import AdvancedScheduleActivityModal from '@/components/Sales/AdvancedScheduleActivityModal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'});
}

function formatRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-GB');
}

// --- Sub-components for the new UI ---

const OdooHeader = ({ lead, stages, onStatusChange, onMarkLost, onMarkJunk }) => {
    const currentIndex = stages.indexOf(lead.status);
    
    const getPriorityLabel = (rating) => {
        if (rating >= 3) return 'High';
        if (rating === 2) return 'Medium';
        if (rating === 1) return 'Low';
        return 'No';
    };

    const getNextAction = (activities) => {
        if (!activities || activities.length === 0) return 'N/A';
        const now = new Date();
        const pending = activities.filter(a => a.status !== 'done' && a.dueDate && new Date(a.dueDate + 'T' + (a.dueTime || '00:00')) > now);
        if (pending.length === 0) return 'N/A';
        pending.sort((a, b) => new Date(a.dueDate + 'T' + (a.dueTime || '00:00')) - new Date(b.dueDate + 'T' + (b.dueTime || '00:00')));
        const next = pending[0];
        return next.summary || next.title || 'N/A';
    };

    const priorityLabel = getPriorityLabel(lead.rating);
    const priorityClass = {
        'High': 'bg-orange-100 text-orange-700',
        'Medium': 'bg-blue-100 text-blue-700',
        'Low': 'bg-gray-100 text-gray-600',
        'No': 'bg-gray-100 text-gray-600'
    }[priorityLabel];

    return (
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            {/* Left Side */}
          <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-bold text-gray-800">{lead.name} &ndash; {lead.projectType}</h1>
                <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-medium">Priority:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityClass}`}>{priorityLabel}</span>
            </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-medium">Next Action:</span>
                        <span className="text-sm text-gray-500">{getNextAction(lead.activities)}</span>
          </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Pipeline Stepper */}
                <div className="flex items-center gap-2">
              {stages.map((stage, idx) => {
                        const isActive = idx === currentIndex;
                const isCompleted = idx < currentIndex;
                return (
                  <React.Fragment key={stage}>
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => onStatusChange(stage)}>
                                    {isCompleted ? (
                                        <FaCheck className="text-green-500" />
                                    ) : (
                                        <span className={`flex items-center justify-center rounded-full border w-5 h-5 text-xs font-bold ${isActive ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-400 border-gray-300'}`}>
                      {idx + 1}
                                        </span>
                    )}
                                    <span className={`text-sm ${isActive || isCompleted ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{stage}</span>
                                </div>
                                {idx < stages.length - 1 && <span className="text-gray-300">&gt;</span>}
                  </React.Fragment>
                );
              })}
            </div>
                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button onClick={onMarkJunk} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Mark as Junk</button>
                    <button onClick={onMarkLost} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"><FaTimes className="text-red-500" /> Mark as Lost</button>
            </div>
          </div>
        </div>
    );
};

const OdooDetailBody = ({ lead, isEditing, setIsEditing, onFieldChange, onScheduleActivity, activities, onEditActivity, onDeleteActivity, onMarkDone, notes, onAddNote, conversionData, timelineEvents, deletedActivityIds }) => {
    const [activeTab, setActiveTab] = useState('activity');
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [expandedActivities, setExpandedActivities] = useState({});
    const [showAllHistory, setShowAllHistory] = useState(false);

    const [contactFields, setContactFields] = useState({
      name: lead.name || '',
      contactNumber: lead.contactNumber || '',
      email: lead.email || '',
    });

    const [projectFields, setProjectFields] = useState({});

    // --- Assigned Team Edit State ---
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [assignedSalesRep, setAssignedSalesRep] = useState(lead.salesRep || '');
    const [assignedDesigner, setAssignedDesigner] = useState(lead.designer || '');
    useEffect(() => {
      setAssignedSalesRep(lead.salesRep || '');
      setAssignedDesigner(lead.designer || '');
    }, [lead]);
    // --- End Assigned Team Edit State ---

    useEffect(() => {
      setProjectFields({
        projectType: lead.projectType || '',
        propertyType: lead.propertyType || '',
        address: lead.address || '',
        budget: lead.budget || '',
        leadSource: lead.leadSource || '',
        designStyle: lead.designStyle || '',
        projectTimeline: lead.projectTimeline || '',
      });
    }, [lead, isEditing]);

    const handleContactFieldChange = (field, value) => {
      setContactFields(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveContact = () => {
      onFieldChange('name', contactFields.name);
      onFieldChange('contactNumber', contactFields.contactNumber);
      onFieldChange('email', contactFields.email);
      setIsEditingContact(false);
    };

    const handleProjectFieldChange = (field, value) => {
      setProjectFields(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProject = () => {
      Object.entries(projectFields).forEach(([field, value]) => {
        onFieldChange(field, value);
      });
      setIsEditing(false);
    };

    const combinedLog = [
        // Include all activities (both active and deleted) to show them in their original timeline position
        ...(activities || [])
            .map(a => ({ 
                ...a, 
                // DON'T mark activities as deleted here - keep them as original
                // Use createdAt for display and sorting to show when the activity was actually created
                date: new Date(a.createdAt || Date.now()),
                sortDate: new Date(a.createdAt || Date.now()),
                timestamp: a.createdAt || new Date().toISOString()
            })),
        // Include all timeline events (including deletion events)
        ...(timelineEvents || []).map(e => ({ 
            ...e, 
            // Use the event date for sorting (when the event actually happened)
            sortDate: new Date(e.date),
            timestamp: e.date instanceof Date ? e.date.toISOString() : new Date(e.date).toISOString()
        }))
    ].sort((a, b) => {
        // Sort by when things actually happened (creation time for activities, event time for timeline events)
        const dateA = new Date(a.sortDate);
        const dateB = new Date(b.sortDate);
        return dateB.getTime() - dateA.getTime(); // Most recent first
    });

    return (
        <div className="flex-grow bg-gray-50 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Project Details */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Project Details</h3>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                    <button onClick={handleSaveProject} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold shadow-sm hover:bg-blue-700"><FaCheck /> Save</button>
                            </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold shadow-sm hover:bg-gray-50"><FaPencilAlt className="w-3 h-3" /> Edit</button>
                                )}
                    </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
                            {/* Fields */}
                            {[
                                {label: 'Project Type', field: 'projectType', type: 'select', options: projectTypes},
                                {label: 'Address', field: 'address', type: 'text'},
                                {label: 'Area (sq. ft.)', field: 'area', type: 'number', optional: true},
                                {label: 'Budget', field: 'budget', type: 'number'},
                                {label: 'Project Timeline', field: 'projectTimeline', type: 'text'},
                                {label: 'Property Type', field: 'propertyType', type: 'select', options: propertyTypes},
                                {label: 'Lead Source', field: 'leadSource', type: 'text', required: true},
                                {label: 'Design Style', field: 'designStyle', type: 'text'},
                            ].map(({label, field, type, options, required, optional}) => (
                                <div key={field}>
                                    <div className="text-sm text-gray-500">{label}{required && <span className="text-red-500">*</span>}{optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}</div>
                                {isEditing ? (
                                        type === 'select' ? (
                                            <select value={projectFields[field] || ''} onChange={e => handleProjectFieldChange(field, e.target.value)} className="w-full p-1 mt-1 border-b text-gray-900 focus:outline-none focus:border-blue-500">
                                                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                            <input 
                                                type={type} 
                                                value={projectFields[field] || ''} 
                                                onChange={e => handleProjectFieldChange(field, e.target.value)} 
                                                className="w-full p-1 mt-1 border-b text-gray-900 focus:outline-none focus:border-blue-500"
                                            />
                                        )
                                    ) : (
                                        <div className="text-base text-gray-900 font-medium mt-1">
                                            {field === 'budget' && lead.budget ? <FaRupeeSign className="inline text-gray-400 text-sm mr-1" /> : null}
                                            {field === 'budget' && lead.budget ? Number(lead.budget).toLocaleString('en-IN') : field === 'area' ? (lead.area ? `${lead.area} sq. ft.` : 'N/A') : lead[field] || 'N/A'}
                    </div>
                                )}
                </div>
                            ))}
                                    </div>
                                    </div>

                    {/* Tabs and Tab Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[300px]">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-6" aria-label="Tabs">
                                <button className={`pb-3 text-sm font-medium border-b-2 ${activeTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`} onClick={() => setActiveTab('notes')}>Notes</button>
                                <button className={`pb-3 text-sm font-medium border-b-2 ${activeTab === 'activity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`} onClick={() => setActiveTab('activity')}>Activity Log</button>
                                <button className={`pb-3 text-sm font-medium border-b-2 ${activeTab === 'conversion' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`} onClick={() => setActiveTab('conversion')}>Conversion Details</button>
                                <button className={`pb-3 text-sm font-medium border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`} onClick={() => setActiveTab('history')}>Activity History</button>
                            </nav>
            </div>
                        <div className="pt-4">
                        {activeTab === 'notes' && (
                                <div>
                                    <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Add a note..."></textarea>
                                    <div className="text-right mt-2">
                                        <button onClick={() => { onAddNote({ user: 'You', time: new Date(), content: noteContent }); setNoteContent(''); }} className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold">Save Note</button>
                        </div>
                                    <div className="mt-4 space-y-4">
                                    {notes.map((note, idx) => (
                                            <div key={idx}><p className="font-semibold text-sm">{note.user} <span className="text-xs text-gray-400 ml-2">{formatRelativeTime(note.time)}</span></p><p className="text-sm">{note.content}</p></div>
                                    ))}
                    </div>
                </div>
            )}
                        {activeTab === 'activity' && (
                                <div className="relative">
                                    {combinedLog.filter(item => item.status === 'done').length > 0 && <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />}
                                    <ul className="space-y-4">
                                        {combinedLog.filter(item => item.status === 'done').map((item, index) => {
                                            const isEvent = item.type === 'event';
                                        const isDone = item.status === 'done';
                                            const isDeleted = isEvent && item.action === 'Activity Deleted';
                                            const iconBg = isDeleted ? 'bg-red-100' : (isEvent || isDone ? 'bg-green-100' : 'bg-blue-100');
                                            const iconColor = isDeleted ? 'text-red-600' : (isEvent || isDone ? 'text-green-600' : 'text-blue-600');
                                            const icon = isDeleted ? <FaTimes /> : (isEvent ? <FaHistory /> : (isDone ? <FaCheck /> : <FaRegClock />));
                                        return (
                                                <li key={`done-${item.type}-${item.id}-${index}`} className="relative pl-12">
                                                    <div className="absolute left-0 top-1 flex items-center justify-center">
                                                        <span className={`w-8 h-8 flex items-center justify-center rounded-full border-4 border-gray-50 ${iconBg}`}>
                                                            <span className={iconColor}>{icon}</span>
                                            </span>
                                              </div>
                                                    
                                                    {/* The content */}
                                                    <div className={`flex items-center justify-between p-3 rounded-md ${isDeleted ? 'bg-red-50' : ''}`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isDeleted ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {isEvent ? item.action : item.type}
                                                            </span>
                                                            <span className={`font-medium ${isDeleted ? 'text-red-700' : 'text-gray-800'}`}>{isEvent ? item.details : item.title || item.summary}</span>
                                                </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-sm text-gray-500">{formatDateTime(item.date)}</span>
                                                            <button onClick={() => setExpandedActivities(prev => ({...prev, [item.id]: !prev[item.id]}))} className="text-gray-400 hover:text-gray-600">
                                                                <FaChevronDown size={12} className={`transition-transform ${expandedActivities[item.id] ? 'rotate-180' : ''}`}/>
                                                            </button>
                                            </div>
                                                    </div>
                                                    {/* Expanded details for notes, attachment, outcome */}
                                                    {(!isEvent && (item.note || item.attachment || (['Email','Call','Meeting'].includes(item.type) && item.callOutcome))) && (
                                                        <div className="ml-12 mt-1 mb-2 bg-gray-50 rounded p-3 border border-gray-100 text-xs text-gray-700 flex flex-col gap-1">
                                                            {item.note && <div><span className="font-semibold">Note:</span> {item.note}</div>}
                                                            {item.attachment && <div className="flex items-center gap-2"><FaPaperclip className="text-blue-500" /><span className="font-semibold">Attachment:</span> {typeof item.attachment === 'string' ? <a href={item.attachment} target="_blank" rel="noopener noreferrer" className="underline">View</a> : (item.attachment.name || 'Attached')}</div>}
                                                            {['Email','Call','Meeting'].includes(item.type) && item.callOutcome && <div><span className="font-semibold">Outcome:</span> {item.callOutcome}</div>}
                                                        </div>
                                                    )}
                                          </li>
                                        );
                                        })}
                                        </ul>
                            </div>
                        )}
                        {activeTab === 'conversion' && (
                            <div>
                                    {lead.status === 'Converted' && conversionData ? (
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <p><span className="text-gray-500">Final Quotation:</span><span className="font-medium ml-2">₹{conversionData.finalQuotation}</span></p>
                                            <p><span className="text-gray-500">Sign-up Amount:</span><span className="font-medium ml-2">₹{conversionData.signupAmount}</span></p>
                                            {/* Add more fields here */}
                                            </div>
                                    ) : <p className="text-center text-gray-400 py-4">Lead not converted yet.</p>}
                            </div>
                                )}
                            {activeTab === 'history' && (
                                <div className="relative">
                                    {combinedLog.length > 0 && <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />}
                                    <ul className="space-y-4">
                                        {(showAllHistory ? combinedLog : combinedLog.slice(0, 5)).map((item, index) => {
                                            const isEvent = item.type === 'event';
                                            const isDone = item.status === 'done';
                                            const isDeleted = isEvent && item.action === 'Activity Deleted';
                                            const iconBg = isDeleted ? 'bg-red-100' : (isEvent || isDone ? 'bg-green-100' : 'bg-blue-100');
                                            const iconColor = isDeleted ? 'text-red-600' : (isEvent || isDone ? 'text-green-600' : 'text-blue-600');
                                            const icon = isDeleted ? <FaTimes /> : (isEvent ? <FaHistory /> : (isDone ? <FaCheck /> : <FaRegClock />));
                                            return (
                                                <li key={`history-${item.type}-${item.id}-${index}`} className="relative pl-12">
                                                    <div className="absolute left-0 top-1 flex items-center justify-center">
                                                        <span className={`w-8 h-8 flex items-center justify-center rounded-full border-4 border-gray-50 ${iconBg}`}>
                                                            <span className={iconColor}>{icon}</span>
                                                        </span>
                                                    </div>
                                                    <div className={`flex items-center justify-between p-3 rounded-md ${isDeleted ? 'bg-red-50' : ''}`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isDeleted ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {isEvent ? item.action : item.type}
                                                            </span>
                                                            <span className={`font-medium ${isDeleted ? 'text-red-700' : 'text-gray-800'}`}>{isEvent ? item.details : item.title || item.summary}</span>
                                                            {isDone && !isEvent && (
                                                                <span className="flex items-center gap-1 ml-2 text-green-600 text-xs font-semibold"><FaCheck className="inline" /> Done</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-sm text-gray-500">{formatDateTime(item.date)}</span>
                                                            <button onClick={() => setExpandedActivities(prev => ({...prev, [item.id]: !prev[item.id]}))} className="text-gray-400 hover:text-gray-600">
                                                                <FaChevronDown size={12} className={`transition-transform ${expandedActivities[item.id] ? 'rotate-180' : ''}`}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {(!isEvent && (item.note || item.attachment || (['Email','Call','Meeting'].includes(item.type) && item.callOutcome))) && (
                                                        <div className="ml-12 mt-1 mb-2 bg-gray-50 rounded p-3 border border-gray-100 text-xs text-gray-700 flex flex-col gap-1">
                                                            {item.note && <div><span className="font-semibold">Note:</span> {item.note}</div>}
                                                            {item.attachment && <div className="flex items-center gap-2"><FaPaperclip className="text-blue-500" /><span className="font-semibold">Attachment:</span> {typeof item.attachment === 'string' ? <a href={item.attachment} target="_blank" rel="noopener noreferrer" className="underline">View</a> : (item.attachment.name || 'Attached')}</div>}
                                                            {['Email','Call','Meeting'].includes(item.type) && item.callOutcome && <div><span className="font-semibold">Outcome:</span> {item.callOutcome}</div>}
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    {!showAllHistory && combinedLog.length > 5 && (
                                        <div className="flex justify-center mt-8">
                                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all font-semibold" onClick={() => setShowAllHistory(true)}>
                                                View More
                                            </button>
                                        </div>
                                    )}
                            </div>
                                )}
                            </div>
                        </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-800">Contact Details</h3>
                            <button onClick={() => setIsEditingContact(!isEditingContact)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50"><FaPencilAlt className="w-3 h-3" /> {isEditingContact ? 'Cancel' : 'Edit'}</button>
                        </div>
                                {isEditingContact ? (
                            <div className="space-y-3">
                                <input value={contactFields.name} onChange={e => handleContactFieldChange('name', e.target.value)} className="w-full p-1 border-b" />
                                <input value={contactFields.contactNumber} onChange={e => handleContactFieldChange('contactNumber', e.target.value)} className="w-full p-1 border-b" />
                                <input value={contactFields.email} onChange={e => handleContactFieldChange('email', e.target.value)} className="w-full p-1 border-b" />
                                <button onClick={handleSaveContact} className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold">Save</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3"><FaUser className="text-gray-400" /><span className="font-medium text-gray-900">{lead.name || 'N/A'}</span></div>
                                <div className="flex items-center gap-3"><FaPhone className="text-gray-400" /><a href={`tel:+91${lead.contactNumber}`} className="text-blue-600 hover:underline">{`+91 ${lead.contactNumber}`}</a></div>
                                <div className="flex items-center gap-3"><FaEnvelope className="text-gray-400" /><a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a></div>
                            </div>
                                )}
                        </div>

                    {/* --- Assigned Team Section --- */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-800">Assigned Team</h3>
                            {isEditingTeam ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setIsEditingTeam(false)}
                                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    onFieldChange('salesRep', assignedSalesRep);
                                    onFieldChange('designer', assignedDesigner);
                                    setIsEditingTeam(false);
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold shadow-sm hover:bg-blue-700"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setIsEditingTeam(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50"
                              >
                                <FaPencilAlt className="w-3 h-3" /> Edit
                              </button>
                            )}
                        </div>
                        {isEditingTeam ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Sales Person</label>
                              <Select
                                value={assignedSalesRep || "unassigned"}
                                onValueChange={val => setAssignedSalesRep(val === "unassigned" ? "" : val)}
                              >
                                <SelectTrigger className="w-full border-gray-300 text-sm rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                                  <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent className="rounded-md shadow-lg">
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  {salesPersons.map(person => (
                                    <SelectItem key={person.id} value={person.name}>{person.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Designer</label>
                              <Select
                                value={assignedDesigner || "unassigned"}
                                onValueChange={val => setAssignedDesigner(val === "unassigned" ? "" : val)}
                              >
                                <SelectTrigger className="w-full border-gray-300 text-sm rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                                  <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent className="rounded-md shadow-lg">
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  {designers.map(designer => (
                                    <SelectItem key={designer.id} value={designer.name}>{designer.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500 text-sm">Sales Person: </span>
                              <span className="font-medium text-gray-800">{lead.salesRep || <span className="text-gray-400">Unassigned</span>}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">Designer: </span>
                              <span className="font-medium text-gray-800">{lead.designer || <span className="text-gray-400">Unassigned</span>}</span>
                            </div>
                          </div>
                        )}
                </div>
                    {/* --- End Assigned Team Section --- */}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-800">Activity</h3>
                            <button onClick={onScheduleActivity} className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition" title="Add Activity">+</button>
                        </div>
                        <div className="space-y-3">
                            {(activities || []).filter(a => a.status !== 'done' && !deletedActivityIds.has(a.id)).map(activity => (
                                <div key={activity.id} className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="px-2 py-0.5 rounded font-semibold bg-gray-200 text-gray-700">{activity.type}</span>
                                        <span className="text-blue-600 font-medium">{activity.status}</span>
                </div>
                                    <p className="font-semibold text-gray-800 text-sm my-1">{activity.title || activity.summary}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">{activity.dueDate}</span>
                                        <div className="flex items-center gap-2.5">
                                            <button onClick={() => onEditActivity(activity)} title="Edit" className="text-blue-600 hover:text-blue-800"><FaPencilAlt size={14} /></button>
                                            <button onClick={() => onMarkDone(activity.id)} title="Mark as Done" className="text-green-600 hover:text-green-800"><FaCheck size={14} /></button>
                                            <button onClick={() => onDeleteActivity(activity.id)} title="Delete" className="text-red-500 hover:text-red-700"><FaTimes size={14} /></button>
                                </div>
                                </div>
                            </div>
                            ))}
                            {(activities || []).filter(a => a.status !== 'done' && !deletedActivityIds.has(a.id)).length === 0 && (
                                <div className="text-center text-sm text-gray-400 py-4">No pending activities.</div>
                          )}
                        </div>
                    </div>
        </div>
      </div>
    </div>
  );
};

const LostReasonModal = ({ isOpen, onClose, onSubmit, title, placeholder }) => {
    const [reason, setReason] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <textarea className="w-full p-2 border rounded-md" rows="4" placeholder={placeholder} value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="flex justify-end mt-4 gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
                    <button onClick={() => onSubmit(reason)} className="bg-blue-600 text-white px-4 py-2 rounded-md">Submit</button>
                </div>
            </div>
        </div>
    );
};

const ConversionModal = ({ isOpen, onClose, onConfirm, lead }) => {
    const [form, setForm] = useState({
        finalQuotation: lead?.finalQuotation || '',
        signupAmount: lead?.signupAmount || '',
        paymentDate: lead?.paymentDate || '',
        paymentMode: lead?.paymentMode || '',
        panNumber: lead?.panNumber || '',
        projectTimeline: lead?.projectTimeline || '',
        discount: lead?.discount || '',
        paymentDetails: null,
        bookingForm: null,
    });
    
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Mark Lead as Converted</h2>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Form fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Final Quotation (₹) *</label>
                                <input type="number" name="finalQuotation" value={form.finalQuotation} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sign-up Amount (₹) *</label>
                                <input type="number" name="signupAmount" value={form.signupAmount} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                                <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                                <input type="text" name="paymentMode" value={form.paymentMode} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                                <input type="text" name="panNumber" value={form.panNumber} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Project Timeline</label>
                                <input type="text" name="projectTimeline" value={form.projectTimeline} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Discount</label>
                                <input type="text" name="discount" value={form.discount} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Upload Payment Details</label>
                                <input type="file" name="paymentDetails" onChange={handleChange} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Upload Booking Form</label>
                                <input type="file" name="bookingForm" onChange={handleChange} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    </div>
                                </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border text-sm font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold">Confirm Conversion</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

          // --- Main View Component ---
          const LeadDetailContent = () => {
              const router = useRouter();
              const { id } = router.query;

              const [leads, setLeads] = useState([
                  {
            leadId: 'LEAD101', name: 'John Doe', contactNumber: '1234567890', email: 'john@example.com',
            projectType: 'Residential', propertyType: 'Apartment', address: '123 Main St', budget: '1500000',
            leadSource: 'Website', designStyle: 'Modern', status: 'Qualified', rating: 2,
            activities: [
                { 
                    id: 1, 
                    type: 'To-Do', 
                    title: 'Follow up with client', 
                    dueDate: '2025-06-24', 
                    status: 'done', 
                    date: new Date('2025-06-24'),
                    createdAt: '2025-06-20T09:00:00.000Z',
                    completedAt: '2025-06-24T14:30:00.000Z'
                },
                { 
                    id: 2, 
                    type: 'Call', 
                    title: 'Initial consultation', 
                    dueDate: '2025-06-28', 
                    status: 'pending', 
                    date: new Date('2025-06-28'),
                    createdAt: '2025-06-25T10:15:00.000Z'
                },
            ],
            notes: [ {user: 'Alice', time: new Date(), content: 'Client is interested in minimalist designs.'} ]
                  },
              ]);
              const stages = ['New', 'Contacted', 'Qualified', 'Quoted', 'Converted'];
              const lead = leads.find(l => l.leadId === id);

    // All state hooks
              const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
              const [isLostReasonModalOpen, setIsLostReasonModalOpen] = useState(false);
    const [isJunkReasonModalOpen, setIsJunkReasonModalOpen] = useState(false);
              const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
              const [editingActivity, setEditingActivity] = useState(null);
    const [activities, setActivities] = useState(lead?.activities || []);
    const [notes, setNotes] = useState(lead?.notes || []);
              const [timelineEvents, setTimelineEvents] = useState([]);
    const [deletedActivityIds, setDeletedActivityIds] = useState(new Set());
    const [conversionData, setConversionData] = useState(lead?.status === 'Converted' ? lead : null);
    
    // Handlers
    const addTimelineEvent = ({ action, details, user = 'You', date = null }) => {
        const eventDate = date || new Date();
        setTimelineEvents(prev => [{ 
            id: Date.now(), 
            type: 'event', 
            action, 
            details, 
            user, 
            date: eventDate 
        }, ...prev]);
    };
    
              const handleStatusChange = (newStatus) => {
        if (newStatus === 'Converted') return setIsConversionModalOpen(true);
                  if (lead && newStatus !== lead.status) {
            // Use current timestamp for stage changes as they happen now
            addTimelineEvent({ 
                action: 'Stage Changed', 
                details: `${lead.status} → ${newStatus}`,
                date: new Date() // This is correct - stage changes happen now
            });
            setLeads(prev => prev.map(l => l.leadId === lead.leadId ? { ...l, status: newStatus } : l));
                      toast.success(`Lead moved to ${newStatus}`);
                  }
              };

    const handleConfirmConversion = (formData) => {
        addTimelineEvent({ 
            action: 'Converted to Project',
            date: new Date() // Conversion happens now
        });
        const updatedLead = { ...lead, status: 'Converted', ...formData };
        setLeads(prev => prev.map(l => l.leadId === lead.leadId ? updatedLead : l));
        setConversionData(updatedLead);
        setIsConversionModalOpen(false);
        toast.success('Lead marked as Converted!');
    };
    
    const handleMarkLost = () => setIsLostReasonModalOpen(true);
              const handleLostReasonSubmit = (reason) => {
        addTimelineEvent({ 
            action: 'Marked as Lost', 
            details: reason,
            date: new Date() // Lost marking happens now
        });
        handleStatusChange('Lost');
                      setIsLostReasonModalOpen(false);
    };
    
    const handleMarkJunk = () => setIsJunkReasonModalOpen(true);
    const handleJunkReasonSubmit = (reason) => {
        addTimelineEvent({ 
            action: 'Marked as Junk', 
            details: reason,
            date: new Date() // Junk marking happens now
        });
        handleStatusChange('Junk');
        setIsJunkReasonModalOpen(false);
              };

              const handleFieldChange = (field, value) => {
        setLeads(prev => prev.map(l => l.leadId === lead.leadId ? { ...l, [field]: value } : l));
              };

              const handleAddOrEditActivity = (activity) => {
        const now = new Date().toISOString();
        const activityWithTimestamp = {
            ...activity,
            createdAt: activity.createdAt || now,
            updatedAt: now
        };
        setActivities(prev => activity.id ? 
            prev.map(a => a.id === activity.id ? activityWithTimestamp : a) : 
            [...prev, { ...activityWithTimestamp, id: Date.now() }]
        );
    };

              const handleDeleteActivity = (id) => {
        const toDelete = activities.find(a => a.id === id);
        if (toDelete) {
          // Mark the activity as deleted (don't remove it from activities array)
          setDeletedActivityIds(prev => new Set([...prev, id]));
          
          // Add a separate timeline event for deletion happening now
          const deletionDate = new Date();
          setTimelineEvents(prevEvents => [{
            id: `deleted-${id}-${Date.now()}`, // Unique ID for deletion event
            type: 'event',
            action: 'Activity Deleted',
            details: `${toDelete.type}: ${toDelete.title || toDelete.summary || ''}`,
            user: 'You',
            date: deletionDate // Deletion happens now
          }, ...prevEvents]);
        }
    };

    const handleMarkDone = (id) => {
        const completedAt = new Date().toISOString();
        const completionDate = new Date();
        setActivities(prev => prev.map(a => a.id === id ? { 
            ...a, 
            status: 'done', 
            completedAt: completedAt,
            updatedAt: completedAt 
        } : a));
        
        // Add a timeline event for completion using the completion date
        const activity = activities.find(a => a.id === id);
        if (activity) {
            addTimelineEvent({
                action: 'Activity Completed',
                details: `${activity.type}: ${activity.title || activity.summary || ''}`,
                date: completionDate
            });
        }
    };
    const handleAddNote = (note) => setNotes(prev => [note, ...prev]);

              if (!lead) return <div className="p-6 text-center">Lead not found.</div>;

    const updatedLead = { ...lead, activities, notes };

              return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
                      <OdooHeader
                lead={updatedLead}
                          stages={stages}
                          onStatusChange={handleStatusChange}
                          onMarkLost={handleMarkLost}
                          onMarkJunk={handleMarkJunk}
                      />
                      <OdooDetailBody
                lead={updatedLead}
                          isEditing={isEditing}
                          setIsEditing={setIsEditing}
                          onFieldChange={handleFieldChange}
                          activities={activities}
                onScheduleActivity={() => { setEditingActivity(null); setIsActivityModalOpen(true); }}
                onEditActivity={(activity) => { setEditingActivity(activity); setIsActivityModalOpen(true); }}
                          onDeleteActivity={handleDeleteActivity}
                          onMarkDone={handleMarkDone}
                          notes={notes}
                onAddNote={handleAddNote}
                conversionData={conversionData}
                timelineEvents={timelineEvents}
                deletedActivityIds={deletedActivityIds}
            />
            <AdvancedScheduleActivityModal
              isOpen={isActivityModalOpen}
              onClose={() => setIsActivityModalOpen(false)}
              lead={lead}
              initialData={editingActivity}
              onSuccess={handleAddOrEditActivity}
            />
            <LostReasonModal isOpen={isLostReasonModalOpen} onClose={() => setIsLostReasonModalOpen(false)} onSubmit={handleLostReasonSubmit} title="Reason for Lost Lead" placeholder="Enter reason..."/>
            <LostReasonModal isOpen={isJunkReasonModalOpen} onClose={() => setIsJunkReasonModalOpen(false)} onSubmit={handleJunkReasonSubmit} title="Reason for Junk" placeholder="Enter reason..." />
            <ConversionModal isOpen={isConversionModalOpen} onClose={() => setIsConversionModalOpen(false)} onConfirm={handleConfirmConversion} lead={lead} />
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

