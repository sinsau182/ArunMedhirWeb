import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { FaStar, FaRegStar, FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt,
    FaRupeeSign, FaBullseye, FaUserTie, FaTasks, FaHistory, FaPaperclip, FaUserCircle,
    FaCheck, FaUsers, FaFileAlt, FaTimes, FaPencilAlt, FaRegSmile, FaExpandAlt, FaChevronDown, FaClock,
    FaRegCheckCircle, FaRegClock, FaDownload, FaCommentAlt, FaTrash, FaPlus, FaCheckCircle } from 'react-icons/fa';
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

const VisualProgressTracker = ({ stages, currentStage }) => {
    const currentIndex = stages.indexOf(currentStage);
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
                {stages.map((stage, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;
                    return (
                        <React.Fragment key={stage}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : isActive ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300'}`}>
                                    {isCompleted ? <FaCheck /> : <span className="font-bold">{index + 1}</span>}
                                </div>
                                <p className={`mt-2 text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>{stage}</p>
                            </div>
                            {index < stages.length - 1 && <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

const FilesTab = ({ files }) => (
    <div className="space-y-4">
        {files.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No files have been uploaded for this lead.</p>
        ) : (
            files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center gap-3">
                        <FaFileAlt className="text-gray-400" />
                        <div>
                            <p className="font-semibold text-gray-800">{file.name}</p>
                            <p className="text-xs text-gray-500">Uploaded by {file.uploadedBy} on {formatDateTime(file.date)}</p>
                        </div>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-blue-600">
                        <FaDownload />
                    </button>
                </div>
            ))
        )}
    </div>
);

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

const ConversionDetails = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>This lead has not been converted yet.</p>
            </div>
        );
    }

    return (
        <div className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 border-b pb-2">Financial Details</h4>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Final Quotation:</span>
                        <span className="font-medium text-gray-900">₹{data.finalQuotation?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Signup/Advance Amount:</span>
                        <span className="font-medium text-gray-900">₹{data.signupAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Date:</span>
                        <span className="font-medium text-gray-900">{formatDateTime(data.paymentDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Mode:</span>
                        <span className="font-medium text-gray-900">{data.paymentMode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">PAN Number:</span>
                        <span className="font-medium text-gray-900">{data.panNumber}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 border-b pb-2">Project & Documentation</h4>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Project Start Date:</span>
                        <span className="font-medium text-gray-900">{formatDateTime(data.projectStartDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Assigned Project Manager:</span>
                        <span className="font-medium text-gray-900">{data.projectManager}</span>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 text-sm mb-2">Uploaded Documents:</p>
                        <div className="space-y-2">
                            {data.bookingFormFileName && (
                                <div className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer text-sm">
                                    <FaFileAlt />
                                    <span>{data.bookingFormFileName}</span>
                                </div>
                            )}
                            {data.paymentDetailsFileName && (
                                <div className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer text-sm">
                                    <FaFileAlt />
                                    <span>{data.paymentDetailsFileName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OdooDetailBody = ({ lead, stages, isEditing, setIsEditing, onFieldChange, onScheduleActivity, activities, onEditActivity, onDeleteActivity, onMarkDone, notes, onAddNote, conversionData, timelineEvents, deletedActivityIds, files }) => {
    const [activeTab, setActiveTab] = useState('activity');
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [internalNote, setInternalNote] = useState('');
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

    const handleAddInternalNote = () => {
        if (!internalNote.trim()) return;
        onAddNote({
            content: internalNote,
            user: 'You',
            date: new Date().toISOString()
        });
        setInternalNote('');
    };

    // Separate activities and notes for individual timelines
    const activitiesLog = (activities || [])
            .map(a => ({ 
                ...a, 
            type: 'activity',
                date: new Date(a.createdAt || Date.now()),
                sortDate: new Date(a.createdAt || Date.now()),
                timestamp: a.createdAt || new Date().toISOString()
        }))
        .sort((a, b) => {
        const dateA = new Date(a.sortDate);
        const dateB = new Date(b.sortDate);
        return dateB.getTime() - dateA.getTime(); // Most recent first
    });

    const notesLog = (notes || [])
        .map(n => {
            const d = new Date(n.date);
            return {
                ...n,
                type: 'note',
                sortDate: d,
                timestamp: n.date instanceof Date ? n.date.toISOString() : (!isNaN(d.getTime()) ? d.toISOString() : null)
            }
        })
        .sort((a, b) => {
            const dateA = new Date(a.sortDate);
            const dateB = new Date(b.sortDate);
            return dateB.getTime() - dateA.getTime(); // Most recent first
        });

    const timelineEventsLog = (timelineEvents || [])
        .map(e => {
            const d = new Date(e.date);
            return { 
                ...e, 
                type: 'event',
                sortDate: d,
                timestamp: e.date instanceof Date ? e.date.toISOString() : (!isNaN(d.getTime()) ? d.toISOString() : null)
            }
        })
        .sort((a, b) => {
            const dateA = new Date(a.sortDate);
            const dateB = new Date(b.sortDate);
            return dateB.getTime() - dateA.getTime(); // Most recent first
        });

    // Get upcoming activities for the schedule cards
    const upcomingActivities = (activities || [])
        .filter(a => a.status !== 'done' && !deletedActivityIds.includes(a.id))
        .filter(a => a.dueDate && new Date(a.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

    const overdueActivities = (activities || [])
        .filter(a => a.status !== 'done' && !deletedActivityIds.includes(a.id))
        .filter(a => a.dueDate && new Date(a.dueDate) < new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

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
                                            <input type={type} value={projectFields[field] || ''} onChange={e => handleProjectFieldChange(field, e.target.value)} className="w-full p-1 mt-1 border-b text-gray-900 focus:outline-none focus:border-blue-500" />
                                        )
                                    ) : (
                                        <p className="text-gray-900 font-medium mt-1">{lead[field] || <span className="text-gray-400">N/A</span>}</p>
                                )}
                </div>
                            ))}
                                    </div>
                                    </div>

                    {/* Separate Tabs for Activities, Notes, and Files */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="flex border-b border-gray-200">
                            <button onClick={() => setActiveTab('activity')} className={`px-4 py-3 text-sm font-semibold ${activeTab === 'activity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Activities</button>
                            <button onClick={() => setActiveTab('notes')} className={`px-4 py-3 text-sm font-semibold ${activeTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Notes</button>
                            <button onClick={() => setActiveTab('files')} className={`px-4 py-3 text-sm font-semibold ${activeTab === 'files' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Files</button>
                            {lead.status === 'Converted' && (
                                <button onClick={() => setActiveTab('conversion')} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold ${activeTab === 'conversion' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <FaCheckCircle />
                                    Conversion
                                            </button>
                                        )}
                        </div>

                        <div className="p-6">
                            {/* Activities Tab */}
                            {activeTab === 'activity' && (
                                <div>
                                    <div className="space-y-6 border-l-2 border-gray-200 ml-4 pl-8">
                                        {activitiesLog
                                            .filter((item, index) => showAllHistory || index < 5)
                                            .map((item, index) => (
                                                <ActivityLogItem 
                                                    key={item.timestamp || index} 
                                                    activity={item} 
                                                    onEdit={onEditActivity} 
                                                    onDelete={onDeleteActivity} 
                                                    onMarkDone={onMarkDone} 
                                                    isExpanded={!!expandedActivities[item.id]} 
                                                    onToggleExpand={() => setExpandedActivities(prev => ({...prev, [item.id]: !prev[item.id]}))} 
                                                    isDeleted={deletedActivityIds.includes(item.id)} 
                                                />
                                    ))}
                    </div>
                                    {activitiesLog.length > 5 && (
                                        <div className="text-center mt-6">
                                            <button onClick={() => setShowAllHistory(!showAllHistory)} className="text-sm text-blue-600 font-semibold hover:underline">
                                                {showAllHistory ? 'Show Less' : 'Show All Activities'}
                                            </button>
                </div>
            )}
                                              </div>
                            )}

                            {/* Notes Tab */}
                            {activeTab === 'notes' && (
                                <div>
                                    <div className="flex items-start gap-3 mb-6">
                                        <FaUserCircle className="text-gray-400 w-8 h-8 mt-1" />
                                        <div className="flex-1">
                                            <textarea
                                                value={internalNote}
                                                onChange={(e) => setInternalNote(e.target.value)}
                                                placeholder="Add an internal note... (@mention a colleague)"
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                                rows="2"
                                            ></textarea>
                                            <div className="mt-2 text-right">
                                                <button onClick={handleAddInternalNote} className="px-4 py-1.5 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-800">Save Note</button>
                                                </div>
                                            </div>
                                                    </div>
                                    
                                    <div className="space-y-6 border-l-2 border-gray-200 ml-4 pl-8">
                                        {notesLog.map((note, index) => (
                                            <NoteLogItem key={note.timestamp || index} note={note} />
                                        ))}
                                        {notesLog.length === 0 && (
                                            <p className="text-gray-500 text-center py-8">No notes have been added yet.</p>
                                        )}
                                    </div>
                            </div>
                        )}

                            {/* Files Tab */}
                            {activeTab === 'files' && (
                                <FilesTab files={files} />
                            )}
                            {/* NEW: Conversion Tab */}
                            {activeTab === 'conversion' && (
                                <ConversionDetails data={conversionData} />
                            )}
                                                    </div>
                                                        </div>
                                                        </div>

                {/* Right Column - Schedule Activity Cards */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Contact Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Contact</h3>
                            {isEditingContact ? (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditingContact(false)} className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                    <button onClick={handleSaveContact} className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold shadow-sm hover:bg-blue-700">Save</button>
                                                    </div>
                            ) : (
                                <button onClick={() => setIsEditingContact(true)} className="p-1.5 text-gray-400 hover:text-gray-700"><FaPencilAlt className="w-3 h-3" /></button>
                            )}
                                        </div>
                        <div className="space-y-4">
                            {[
                                {icon: FaUser, field: 'name', value: contactFields.name},
                                {icon: FaPhone, field: 'contactNumber', value: contactFields.contactNumber},
                                {icon: FaEnvelope, field: 'email', value: contactFields.email},
                            ].map(({icon: Icon, field, value}) => (
                                <div key={field} className="flex items-center gap-4">
                                    <Icon className="w-4 h-4 text-gray-400" />
                                    {isEditingContact ? (
                                        <input type="text" value={value} onChange={e => handleContactFieldChange(field, e.target.value)} className="w-full text-sm p-1 border-b focus:outline-none focus:border-blue-500" />
                                    ) : (
                                        <span className="text-sm text-gray-700">{value}</span>
                                    )}
                            </div>
                            ))}
                        </div>
                </div>

                    {/* Assigned Team Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Assigned Team</h3>
                            {isEditingTeam ? (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditingTeam(false)} className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                    <button onClick={() => { onFieldChange('salesRep', assignedSalesRep); onFieldChange('designer', assignedDesigner); setIsEditingTeam(false); }} className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold shadow-sm hover:bg-blue-700">Save</button>
                        </div>
                            ) : (
                                <button onClick={() => setIsEditingTeam(true)} className="p-1.5 text-gray-400 hover:text-gray-700"><FaPencilAlt className="w-3 h-3" /></button>
                            )}
                            </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <FaUserTie className="w-4 h-4 text-gray-400" />
                                {isEditingTeam ? (
                                    <Select onValueChange={setAssignedSalesRep} defaultValue={assignedSalesRep}>
                                        <SelectTrigger><SelectValue placeholder="Select Sales Rep..." /></SelectTrigger>
                                        <SelectContent>
                                            {salesPersons.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className="text-sm text-gray-700">{assignedSalesRep || 'Unassigned'}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <FaUserTie className="w-4 h-4 text-gray-400" />
                                {isEditingTeam ? (
                                    <Select onValueChange={setAssignedDesigner} defaultValue={assignedDesigner}>
                                        <SelectTrigger><SelectValue placeholder="Select Designer..." /></SelectTrigger>
                                        <SelectContent>
                                            {designers.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className="text-sm text-gray-700">{assignedDesigner || 'Unassigned'}</span>
                                )}
                            </div>
                        </div>
                        </div>

                    {/* Schedule Activity Cards */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                                <button
                                onClick={onScheduleActivity} 
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center gap-2"
                                >
                                <FaPlus className="w-3 h-3" /> Schedule
                                </button>
                        </div>
                        
                        {/* Overdue Activities Alert */}
                        {overdueActivities.length > 0 && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaClock className="text-red-600 w-4 h-4" />
                                    <span className="text-sm font-semibold text-red-800">Overdue Activities</span>
                                </div>
                                <div className="space-y-2">
                                    {overdueActivities.slice(0, 2).map(activity => (
                                        <div key={activity.id} className="text-xs text-red-700">
                                            <span className="font-medium">{activity.summary}</span>
                                            <span className="text-red-500 ml-2">({formatDateTime(activity.dueDate)})</span>
                                        </div>
                                    ))}
                                    {overdueActivities.length > 2 && (
                                        <div className="text-xs text-red-600 font-medium">
                                            +{overdueActivities.length - 2} more overdue
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Activities */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700">Upcoming Activities</h4>
                            {upcomingActivities.length > 0 ? (
                                upcomingActivities.map(activity => (
                                    <div key={activity.id} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-blue-900">{activity.summary}</p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    {formatDateTime(activity.dueDate)}
                                                    {activity.dueTime && ` at ${activity.dueTime}`}
                                                </p>
                                            </div>
                                <button
                                                onClick={() => onMarkDone(activity.id)}
                                                className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                                                title="Mark as done"
                                >
                                                <FaCheck className="w-3 h-3" />
                                </button>
                              </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No upcoming activities scheduled.</p>
                            )}
                        </div>
                            </div>
                            </div>
                          </div>
                            </div>
    );
};

const NoteLogItem = ({ note }) => (
    <div className="flex items-start gap-4 relative">
        <div className="absolute -left-[42px] top-1.5 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center ring-4 ring-gray-50">
            <FaCommentAlt className="text-yellow-600 w-3 h-3" />
                            </div>
        <div className="flex-1">
            <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{note.user}</span> added a note
            </p>
            <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-gray-700 whitespace-pre-wrap">
                {note.content}
                          </div>
            <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(note.date)}</p>
                    </div>
                                </div>
);

const ActivityLogItem = ({ activity, onEdit, onDelete, onMarkDone, isExpanded, onToggleExpand, isDeleted }) => {
    const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date() && activity.status !== 'done';
    const activityIcon = {
        call: <FaPhone />,
        email: <FaEnvelope />,
        meeting: <FaUsers />,
        task: <FaTasks />,
        deadline: <FaClock />,
    }[activity.type] || <FaTasks />;

    const activityTitle = {
        call: 'Call',
        email: 'Email',
        meeting: 'Meeting',
        task: 'Task',
        deadline: 'Deadline',
    }[activity.type] || 'Activity';

    return (
        <div className="flex items-start gap-4 relative">
            <div className={`absolute -left-[42px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-gray-50 ${isDeleted ? 'bg-gray-200' : isOverdue ? 'bg-red-100' : 'bg-blue-100'}`}>
                {isDeleted ? <FaTimes className="text-gray-500 w-3 h-3" /> : activity.status === 'done' ? <FaRegCheckCircle className="text-green-500 w-4 h-4" /> : activityIcon}
                        </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`text-sm font-semibold ${isDeleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{activity.summary || 'No summary'}</p>
                        <p className={`text-xs ${isDeleted ? 'text-gray-400 line-through' : 'text-gray-500'}`}>{activityTitle} &bull; {activity.assignedTo}</p>
                </div>
                    {!isDeleted && activity.status !== 'done' && (
                        <div className="flex items-center gap-2">
                             <span className={`text-xs font-semibold flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                <FaRegClock className="w-3 h-3" />
                                {formatDateTime(activity.dueDate)}
                             </span>
                             <button onClick={() => onEdit(activity)} className="p-1 text-gray-400 hover:text-gray-600"><FaPencilAlt className="w-3 h-3"/></button>
                             <button onClick={() => onDelete(activity.id)} className="p-1 text-gray-400 hover:text-red-500"><FaTrash className="w-3 h-3"/></button>
                             <button onClick={() => onMarkDone(activity.id)} className="p-1 text-gray-400 hover:text-green-500"><FaCheck className="w-4 h-4"/></button>
                                </div>
                          )}
                                </div>
                 {activity.description && (
                     <p className={`text-sm mt-2 ${isDeleted ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{activity.description}</p>
                          )}
                        </div>
                    </div>
    );
};

const TimelineEventItem = ({ event }) => {
    return (
        <div className="flex items-start gap-4 relative">
            <div className="absolute -left-[42px] top-1.5 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center ring-4 ring-gray-50">
                <FaHistory className="text-gray-500 w-3 h-3" />
        </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{event.user}</span> {event.action.replace('_', ' ')}: <span className="text-gray-600">{event.details}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(event.date)}</p>
      </div>
    </div>
  );
};

const LostReasonModal = ({ isOpen, onClose, onSubmit, title, placeholder }) => {
    if (!isOpen) return null;
  const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                </div>
        <div className="p-6">
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder={placeholder} className="w-full p-2 border rounded" rows="4"></textarea>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={() => { onSubmit(reason); onClose(); }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
        </div>
            </div>
        </div>
    );
};

const ConversionModal = ({ isOpen, onClose, onConfirm, lead }) => {
    if (!isOpen) return null;
    const [formData, setFormData] = useState({
        quotedAmount: lead.quotedAmount || '',
        finalQuotation: lead.finalQuotation || '',
        signupAmount: lead.signupAmount || '',
        panNumber: lead.panNumber || '',
        paymentMode: lead.paymentMode || '',
        paymentDate: lead.paymentDate || new Date().toISOString().split('T')[0],
        paymentDetailsFileName: null,
        bookingFormFileName: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Convert Lead to Project</h2>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {/* Fields */}
              <input name="quotedAmount" value={formData.quotedAmount} onChange={handleChange} placeholder="Quoted Amount" type="number" className="p-2 border rounded w-full" />
              <input name="finalQuotation" value={formData.finalQuotation} onChange={handleChange} placeholder="Final Quotation" type="number" className="p-2 border rounded w-full" />
              <input name="signupAmount" value={formData.signupAmount} onChange={handleChange} placeholder="Signup Amount" type="number" className="p-2 border rounded w-full" />
              <input name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="PAN Number" className="p-2 border rounded w-full" />
              <input name="paymentDate" value={formData.paymentDate} onChange={handleChange} type="date" className="p-2 border rounded w-full" />
              <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="p-2 border rounded w-full">
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
                    </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Confirm Conversion</button>
                    </div>
                </form>
        </div>
    );
};

          const LeadDetailContent = () => {
              const router = useRouter();
              const { id } = router.query;
    const [lead, setLead] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
              const [activities, setActivities] = useState([]);
    const [showScheduleActivityModal, setShowScheduleActivityModal] = useState(false);
    const [leadToScheduleActivity, setLeadToScheduleActivity] = useState(null);
    const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
              const [isLostReasonModalOpen, setIsLostReasonModalOpen] = useState(false);
    const [isJunkReasonModalOpen, setIsJunkReasonModalOpen] = useState(false);
    const [lostReason, setLostReason] = useState('');
    const [junkReason, setJunkReason] = useState('');
    const [conversionData, setConversionData] = useState({});
              const [timelineEvents, setTimelineEvents] = useState([]);
    const [deletedActivityIds, setDeletedActivityIds] = useState([]);
              const [notes, setNotes] = useState([]);
    
    const [files, setFiles] = useState([
        { id: 1, name: 'Initial Brief.pdf', uploadedBy: 'Client', date: '2024-05-10T10:00:00Z' },
        { id: 2, name: 'Floor_Plan_v1.dwg', uploadedBy: 'Alice', date: '2024-05-12T14:30:00Z' },
        { id: 3, name: 'Quotation_rev2.docx', uploadedBy: 'You', date: '2024-05-20T11:00:00Z' },
    ]);
    
    const pipelineStages = ['New', 'Contacted', 'Qualified', 'Quoted', 'Converted'];

              useEffect(() => {
                if (id) {
            const mockLead = {
                id: id,
                name: "Innovate Inc. Office",
                rating: 3,
                contactNumber: "9876543210",
                email: "contact@innovateinc.com",
                projectType: "Commercial",
                propertyType: "Office",
                address: "123 Tech Park, Bangalore",
                area: "2000",
                budget: "3000000",
                designStyle: "Modern",
                leadSource: "Website",
                preferredContact: "Email",
                notes: "Looking for a full-service interior design for their new office space. Key requirements include an open-plan workspace, 2 meeting rooms, and a breakout area. They are on a tight timeline.",
                status: "Qualified",
                salesRep: 'Alice',
                designer: 'Dana',
                createdAt: '2024-05-10T10:00:00Z',
                activities: [
                    { id: 1, type: 'task', summary: 'Initial research on Innovate Inc.', assignedTo: 'You', dueDate: '2024-05-11', status: 'done', createdAt: '2024-05-10T11:00:00Z' },
                    { id: 2, type: 'call', summary: 'First contact call', assignedTo: 'You', dueDate: '2024-05-12', dueTime: '14:30', status: 'done', createdAt: '2024-05-11T15:00:00Z', description: 'Spoke with Mr. Sharma. They are keen to move forward. Scheduled a meeting.' },
                    { id: 3, type: 'meeting', summary: 'Discovery meeting with client', assignedTo: 'You', dueDate: '2024-05-15', dueTime: '11:00', status: 'pending', createdAt: '2024-05-12T14:35:00Z' },
                    { id: 4, type: 'task', summary: 'Prepare initial quotation', assignedTo: 'You', dueDate: '2024-05-20', status: 'pending', createdAt: '2024-05-15T12:00:00Z' },
                ],
            };
            setLead(mockLead);
            setActivities(mockLead.activities || []);
            addTimelineEvent({ action: 'viewed', details: 'You viewed this lead.' });
        }
    }, [id]);

    const addTimelineEvent = ({ action, details, user = 'You', date = null }) => {
        setTimelineEvents(prev => [{ action, details, user, date: date || new Date() }, ...prev]);
    };
    
              const handleStatusChange = (newStatus) => {
        if (newStatus === 'Converted') {
            setIsConversionModalOpen(true);
        } else {
            setLead(prev => ({ ...prev, status: newStatus }));
            addTimelineEvent({ action: 'status_change', details: `Status changed to ${newStatus}` });
            toast.success(`Lead status updated to "${newStatus}"`);
                  }
              };

    const handleConfirmConversion = (formData) => {
        setConversionData(formData);
        setLead(prev => ({ ...prev, status: 'Converted', ...formData }));
        addTimelineEvent({ action: 'converted', details: 'Lead was converted to a project.' });
        setIsConversionModalOpen(false);
        toast.success('Lead successfully converted!');
    };
    
    const handleMarkLost = () => setIsLostReasonModalOpen(true);
              const handleLostReasonSubmit = (reason) => {
        setLostReason(reason);
        setLead(prev => ({ ...prev, status: 'Lost', reasonForLost: reason }));
        addTimelineEvent({ action: 'marked_lost', details: `Reason: ${reason}` });
        toast.error('Lead marked as Lost.');
    };
    
    const handleMarkJunk = () => setIsJunkReasonModalOpen(true);
    const handleJunkReasonSubmit = (reason) => {
        setJunkReason(reason);
        setLead(prev => ({ ...prev, status: 'Junk', reasonForJunk: reason }));
        addTimelineEvent({ action: 'marked_junk', details: `Reason: ${reason}` });
        toast.warning('Lead marked as Junk.');
              };

              const handleFieldChange = (field, value) => {
        setLead(prev => ({ ...prev, [field]: value }));
        addTimelineEvent({ action: 'field_update', details: `Updated ${field} to "${value}"` });
              };

              const handleAddOrEditActivity = (activity) => {
        const isEditing = activities.some(a => a.id === activity.id);
        if (isEditing) {
            setActivities(prevActivities => prevActivities.map(a => a.id === activity.id ? activity : a));
            addTimelineEvent({ action: 'edited_activity', details: 'Activity "' + activity.summary + '" was updated.' });
        } else {
            const newActivity = { ...activity, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() };
            setActivities(prevActivities => [newActivity, ...prevActivities]);
            addTimelineEvent({ action: 'created_activity', details: 'Activity "' + newActivity.summary + '" was scheduled.' });
        }
        setShowScheduleActivityModal(false);
    };

              const handleDeleteActivity = (id) => {
      const activityTitle = activities.find(a => a.id === id)?.summary || 'an activity';
      setDeletedActivityIds(prev => [...prev, id]);
      addTimelineEvent({ action: 'deleted_activity', details: 'Activity "' + activityTitle + '" was deleted.' });
    };

    const handleScheduleActivity = (leadForModal) => {
        setLeadToScheduleActivity(leadForModal);
        setShowScheduleActivityModal(true);
    };

    const handleMarkDone = (id) => {
        const activity = activities.find(a => a.id === id);
        if (!activity) return;
        setActivities(prevActivities => prevActivities.map(a => a.id === id ? { ...a, status: 'done' } : a));
        addTimelineEvent({ action: 'completed_activity', details: 'Activity "' + activity.summary + '" marked as done.' });
    };

    const handleAddNote = (note) => {
        setNotes(prev => [note, ...prev]);
        addTimelineEvent({ action: 'note_added', details: `Note added: "${note.content.substring(0, 30)}..."` });
    };

    if (!lead) {
      return (
        <MainLayout>
          <div className="text-center p-12">Loading Lead Details...</div>
        </MainLayout>
      );
    }

              return (
        <MainLayout>
                      <OdooHeader
                lead={lead} 
                stages={pipelineStages} 
                          onStatusChange={handleStatusChange}
                          onMarkLost={handleMarkLost}
                          onMarkJunk={handleMarkJunk}
                      />
                      <OdooDetailBody
                lead={lead}
                stages={pipelineStages}
                          isEditing={isEditing}
                          setIsEditing={setIsEditing}
                          onFieldChange={handleFieldChange}
                onScheduleActivity={() => handleScheduleActivity(lead)}
                          activities={activities}
                onEditActivity={handleAddOrEditActivity}
                          onDeleteActivity={handleDeleteActivity}
                          onMarkDone={handleMarkDone}
                          notes={notes}
                onAddNote={handleAddNote}
                conversionData={conversionData}
                timelineEvents={timelineEvents}
                deletedActivityIds={deletedActivityIds}
                files={files}
            />

            <LostReasonModal
                isOpen={isLostReasonModalOpen}
                onClose={() => setIsLostReasonModalOpen(false)}
                onSubmit={handleLostReasonSubmit}
                title="Mark Lead as Lost"
                placeholder="Enter the reason why this lead was lost (e.g., budget too high, chose competitor)..."
            />
             <LostReasonModal
                isOpen={isJunkReasonModalOpen}
                onClose={() => setIsJunkReasonModalOpen(false)}
                onSubmit={handleJunkReasonSubmit}
                title="Mark Lead as Junk"
                placeholder="Enter the reason why this lead is junk (e.g., spam, wrong number)..."
            />
            <ConversionModal
                isOpen={isConversionModalOpen}
                onClose={() => setIsConversionModalOpen(false)}
                onConfirm={handleConfirmConversion}
              lead={lead}
            />
            {showScheduleActivityModal && (
                <AdvancedScheduleActivityModal
                    isOpen={showScheduleActivityModal}
                    onClose={() => setShowScheduleActivityModal(false)}
                    lead={leadToScheduleActivity}
              onSuccess={handleAddOrEditActivity}
            />
            )}
        </MainLayout>
              );
          };

          const LeadDetailPage = () => {
    return <LeadDetailContent />;
          };

          export default LeadDetailPage;

