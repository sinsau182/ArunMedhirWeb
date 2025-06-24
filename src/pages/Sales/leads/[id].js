import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, updateLead } from '@/redux/slices/leadsSlice';
import {
    FaStar, FaRegStar, FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt,
    FaRupeeSign, FaBullseye, FaUserTie, FaTasks, FaHistory, FaPaperclip, FaUserCircle,
    FaCheck, FaUsers, FaFileAlt, FaTimes, FaPencilAlt, FaRegSmile, FaExpandAlt, FaChevronDown
} from 'react-icons/fa';
import MainLayout from '@/components/MainLayout';
import { toast } from 'sonner';

// --- Sub-components for the new Odoo-style layout ---

const OdooHeader = ({ lead, stages, onStatusChange, onMarkLost, isEditing, onEditToggle }) => {
    const currentIndex = stages.indexOf(lead.status);

    return (
        <div className="bg-white p-4 shadow-sm border-b">
            <div className="flex justify-between items-center w-full">
                <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap pr-8">{lead.name}'s opportunity</h1>
                
                <div className="flex-grow flex justify-center">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        {stages.map((stage) => {
                            const isActive = stage === lead.status;
                            
                            return (
                                <button
                                    key={stage}
                                    onClick={() => onStatusChange(stage)}
                                    className={`
                                        px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer
                                        ${isActive ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200 hover:shadow-sm'}
                                    `}
                                >
                                    {stage}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="pl-8 flex gap-2">
                    <button
                        onClick={onEditToggle}
                        className="px-6 py-2 bg-yellow-100 text-yellow-700 rounded-md text-sm font-semibold hover:bg-yellow-200 shadow-sm whitespace-nowrap"
                    >
                        {isEditing ? 'Save' : 'Edit'}
                    </button>
                    <button
                        onClick={onMarkLost}
                        className="px-10 py-2 bg-red-100 text-red-700 rounded-md text-sm font-semibold hover:bg-red-200 shadow-sm whitespace-nowrap"
                        disabled={lead.status === 'Won' || lead.status === 'Lost'}>
                        Lost
                    </button>
                </div>
            </div>
        </div>
    );
};

const PlannedActivityItem = ({ activity, onEditActivity }) => (
    <div className="flex items-start gap-3 p-3 border-t">
        <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">{activity.user.charAt(0)}</div>
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <FaCheck size={12} />
            </div>
        </div>
        <div className="flex-grow">
            <p className="text-sm">
                <span className="font-bold text-green-600">{activity.dueDateText}:</span>
                <span className="font-semibold ml-1">"{activity.type}"</span>
                <span className="text-gray-500"> for {activity.user}</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                <button className="hover:text-black flex items-center gap-1"><FaCheck /> Mark Done</button>
                <button className="hover:text-black flex items-center gap-1" onClick={() => onEditActivity(activity)}><FaPencilAlt /> Edit</button>
                <button className="hover:text-black flex items-center gap-1"><FaTimes /> Cancel</button>
            </div>
        </div>
    </div>
);

const OdooDetailBody = ({ lead, isEditing, onFieldChange, onScheduleActivity, conversionData, showConversionDetails, onToggleConversionDetails, onConversionFieldChange }) => {
    const [isLoggingNote, setIsLoggingNote] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [previewFile, setPreviewFile] = useState(null); // for file preview popup
    const [isEditingConversion, setIsEditingConversion] = useState(false);
    const [conversionEdit, setConversionEdit] = useState(conversionData || {});

    useEffect(() => {
        setConversionEdit(conversionData || {});
    }, [conversionData]);

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

    // Mock data for timeline and activities
    const timelineEvents = [
        { user: 'hjhjj', time: '11:55 am', action: 'Stage changed', details: 'Proposition → Qualif' },
        { user: 'hjhjj', time: '11:55 am', action: 'Stage changed', details: 'New → Proposition (Stage)' },
    ];
    const plannedActivities = [
        { id: 1, dueDateText: 'Due in 5 days', type: 'To-Do', user: 'hjhjj' }
    ];

    return (
        <div className="flex-grow p-4">
            {/* Spread/sectioned lead details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4 text-sm">
                    <div>
                        <strong>Expected Budget</strong>
                        <div>₹ {lead.budget || '0.00'}</div>
                    </div>
                    <div>
                        <strong>Project Type</strong>
                        <div>{lead.projectType || 'N/A'}</div>
                    </div>
                    <div>
                        <strong>Property Type</strong>
                        <div>{lead.propertyType || 'N/A'}</div>
                    </div>
                    <div>
                        <strong>Location</strong>
                        <div>{lead.address || 'N/A'}</div>
                    </div>
                </div>
                <div className="space-y-4 text-sm">
                    <div>
                        <strong>Contact</strong>
                        <div>{lead.name || 'N/A'}, {lead.contactNumber || 'N/A'}</div>
                    </div>
                    <div>
                        <strong>Email</strong>
                        <div>{lead.email || 'N/A'}</div>
                    </div>
                    <div>
                        <strong>Phone</strong>
                        <div>{lead.contactNumber || 'N/A'}</div>
                    </div>
                </div>
                <div className="space-y-4 text-sm">
                    <div>
                        <strong>Salesperson</strong>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {lead.salesRep ? lead.salesRep.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span>{lead.salesRep || 'Unassigned'}</span>
                        </div>
                    </div>
                    <div>
                        <strong>Designer</strong>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {lead.designer ? lead.designer.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span>{lead.designer || 'Unassigned'}</span>
                        </div>
                    </div>
                    <div>
                        <strong>Expected Closing</strong>
                        <div>{lead.nextCall ? new Date(lead.nextCall).toLocaleDateString() : 'No closing date'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        {renderStars(lead.rating || 0)}
                    </div>
                </div>
            </div>

            {/* Note and Activity Buttons */}
            <div className="mt-6 flex gap-2">
                <button
                    onClick={() => setIsLoggingNote(true)}
                    className="bg-white border border-gray-300 px-4 py-2 text-sm rounded-md shadow-sm hover:bg-gray-50"
                >
                    Log Note
                </button>
                <button
                    onClick={onScheduleActivity}
                    className="bg-white border border-gray-300 px-4 py-2 text-sm rounded-md shadow-sm hover:bg-gray-50"
                >
                    Activity
                </button>
            </div>
            {isLoggingNote && (
                <div className="mt-4 flex items-start gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">N</div>
                    <div className="flex-grow">
                        <div className="relative">
                            <textarea
                                className="w-full p-2 border rounded-md bg-gray-50"
                                placeholder="Write a note..."
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <button
                                onClick={() => {
                                    // Save note logic here
                                    setIsLoggingNote(false);
                                    setNoteContent('');
                                }}
                                className="bg-purple-600 text-white px-4 py-1.5 text-sm rounded-md"
                                disabled={!noteContent.trim()}
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsLoggingNote(false);
                                    setNoteContent('');
                                }}
                                className="ml-2 text-gray-500 hover:text-gray-700 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Conversion Details Section */}
            {conversionData && (
                <div className="mt-6 bg-white border rounded-lg p-4 shadow">
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            className="px-4 py-2 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 hover:bg-blue-100 transition"
                            onClick={onToggleConversionDetails}
                        >
                            {showConversionDetails ? 'Hide Conversion Details' : 'View Conversion Details'}
                        </button>
                        {showConversionDetails && !isEditingConversion && (
                            <button
                                className="px-4 py-2 rounded bg-yellow-50 text-yellow-700 font-semibold border border-yellow-200 hover:bg-yellow-100 transition"
                                onClick={() => setIsEditingConversion(true)}
                            >
                                Edit
                            </button>
                        )}
                        {showConversionDetails && isEditingConversion && (
                            <>
                                <button
                                    className="px-4 py-2 rounded bg-green-50 text-green-700 font-semibold border border-green-200 hover:bg-green-100 transition"
                                    onClick={handleSaveConversion}
                                >
                                    Save
                                </button>
                                <button
                                    className="px-4 py-2 rounded bg-gray-50 text-gray-700 font-semibold border border-gray-200 hover:bg-gray-100 transition"
                                    onClick={() => { setIsEditingConversion(false); setConversionEdit(conversionData); }}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                    {showConversionDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <strong>Final Quotation:</strong>
                                {isEditingConversion ? (
                                    <input
                                        type="number"
                                        className="w-full p-1 border rounded mt-1"
                                        value={conversionEdit.finalQuotation || ''}
                                        onChange={e => handleConversionFieldChange('finalQuotation', e.target.value)}
                                    />
                                ) : (
                                    <div>{conversionData.finalQuotation || 'N/A'}</div>
                                )}
                            </div>
                            <div>
                                <strong>Sign-up Amount:</strong>
                                {isEditingConversion ? (
                                    <input
                                        type="number"
                                        className="w-full p-1 border rounded mt-1"
                                        value={conversionEdit.signUpAmount || ''}
                                        onChange={e => handleConversionFieldChange('signUpAmount', e.target.value)}
                                    />
                                ) : (
                                    <div>{conversionData.signUpAmount || 'N/A'}</div>
                                )}
                            </div>
                            <div>
                                <strong>Payment Date:</strong>
                                {isEditingConversion ? (
                                    <input
                                        type="date"
                                        className="w-full p-1 border rounded mt-1"
                                        value={conversionEdit.paymentDate || ''}
                                        onChange={e => handleConversionFieldChange('paymentDate', e.target.value)}
                                    />
                                ) : (
                                    <div>{conversionData.paymentDate || 'N/A'}</div>
                                )}
                            </div>
                            <div>
                                <strong>Payment Mode:</strong>
                                {isEditingConversion ? (
                                    <input
                                        type="text"
                                        className="w-full p-1 border rounded mt-1"
                                        value={conversionEdit.paymentMode || ''}
                                        onChange={e => handleConversionFieldChange('paymentMode', e.target.value)}
                                    />
                                ) : (
                                    <div>{conversionData.paymentMode || 'N/A'}</div>
                                )}
                            </div>
                            <div>
                                <strong>PAN Number:</strong>
                                {isEditingConversion ? (
                                    <input
                                        type="text"
                                        className="w-full p-1 border rounded mt-1"
                                        value={conversionEdit.panNumber || ''}
                                        onChange={e => handleConversionFieldChange('panNumber', e.target.value)}
                                    />
                                ) : (
                                    <div>{conversionData.panNumber || 'N/A'}</div>
                                )}
                            </div>
                            <div>
                                <strong>Project Timeline:</strong>
                                {isEditingConversion ? (
                                    <input
                                        type="text"
                                        className="w-full p-1 border rounded mt-1"
                                        value={conversionEdit.projectTimeline || ''}
                                        onChange={e => handleConversionFieldChange('projectTimeline', e.target.value)}
                                    />
                                ) : (
                                    <div>{conversionData.projectTimeline || 'N/A'}</div>
                                )}
                            </div>
                            <div>
                                <strong>Discount:</strong>
                                {isEditingConversion ? (
                                    <input
                                        type="text"
                                        className="w-full p-1 border rounded mt-1"
                                        value={conversionEdit.discount || ''}
                                        onChange={e => handleConversionFieldChange('discount', e.target.value)}
                                    />
                                ) : (
                                    <div>{conversionData.discount || 'N/A'}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Actions & Activity Log */}
            <div className="mt-6 border-t pt-4">
                {/* Planned Activities Section */}
                <div className="mt-6">
                    <details open className="w-full group">
                        <summary className="list-none flex items-center gap-1 cursor-pointer text-sm font-semibold text-gray-700 hover:text-black border-b pb-2">
                            <FaChevronDown className="group-open:rotate-0 -rotate-90 transition-transform" />
                            Planned Activities
                        </summary>
                        <div className="mt-2">
                            {plannedActivities.map(activity => (
                                <PlannedActivityItem key={activity.id} activity={activity} onEditActivity={onScheduleActivity} />
                            ))}
                        </div>
                    </details>
                </div>

                {/* Timeline */}
                <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-500 mb-4">TODAY</h3>
                    <div className="space-y-6 border-l-2 border-gray-200 ml-2">
                        {timelineEvents.map((event, index) => (
                            <div key={index} className="relative">
                                <div className="absolute -left-[1.3rem] top-0 flex items-center">
                                    <div className="h-2 w-2 bg-blue-600 rounded-full ring-4 ring-white"></div>
                                    <div className="ml-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {event.user ? event.user.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </div>
                                <div className="ml-8">
                                    <p className="text-sm font-semibold">{event.user} <span className="text-gray-500 font-normal text-xs ml-2">{event.time}</span></p>
                                    <p className="text-sm mt-1">{event.action}</p>
                                    <p className="text-sm text-gray-500 ml-4">• {event.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddActivityModal = ({ isOpen, onClose, leadId, initialData }) => {
  if (!isOpen) return null;

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

  const activityTypes = [
    { name: 'To-Do', icon: <FaCheck /> },
    { name: 'Email', icon: <FaEnvelope /> },
    { name: 'Call', icon: <FaPhone /> },
    { name: 'Meeting', icon: <FaUsers /> },
    { name: 'Document', icon: <FaFileAlt /> },
  ];

  const summary = activeType === 'Call' ? 'Call Information' : activeType;

  const handleSave = () => {
      let activityDetails = `Activity Saved for lead ${leadId}:
Type: ${activeType}
Summary: ${summary}
Due: ${dueDate} ${dueTime}`;
      if (activeType === 'Meeting') {
          activityDetails += `\nMeeting Link: ${meetingLink}`;
          activityDetails += `\nAttendees: ${attendees.map(a => a.name).join(', ')}`;
      }
      if (activeType === 'Call') {
          activityDetails += `\nPurpose: ${callPurpose}`;
          if (callOutcome) activityDetails += `\nOutcome: ${callOutcome}`;
      }
      alert(activityDetails);
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
            <button onClick={handleSave} className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm">Save</button>
            <button className="bg-white border px-4 py-2 rounded-md text-sm">Mark Done</button>
            <button onClick={onClose} className="bg-white border px-4 py-2 rounded-md text-sm">Discard</button>
        </div>

      </div>
    </div>
  );
};

const LostReasonModal = ({ isOpen, onClose, onSubmit }) => {
    if (!isOpen) return null;

    const [reason, setReason] = useState('');

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
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
                <h2 className="text-2xl font-bold mb-6 text-center">Mark Lead as Converted</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Initial Quoted Amount</label>
                        <input type="number" name="initialQuote" value={form.initialQuote} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" />
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
              const dispatch = useDispatch();
              const { id } = router.query;

              const { leads, loading, error } = useSelector((state) => state.leads);
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

              useEffect(() => {
                  if (!leads.length) {
                      dispatch(fetchLeads());
                  }
              }, [dispatch, leads.length]);

              const handleStatusChange = (newStatus) => {
                  if (newStatus === 'Converted') {
                      setIsConversionModalOpen(true);
                      return;
                  }
                  if (lead && newStatus !== lead.status) {
                      dispatch(updateLead({ leadId: lead.leadId, status: newStatus }))
                        .unwrap()
                        .then(() => {
                            toast.success(`Lead moved to ${newStatus}`);
                            router.push('/Sales/LeadManagement');
                        })
                        .catch((err) => {
                            toast.error(err.message || 'Failed to update lead status');
                        });
                  }
              };

              const handleMarkLost = () => {
                  setIsLostReasonModalOpen(true);
              };

              const handleLostReasonSubmit = (reason) => {
                  if (lead) {
                      dispatch(updateLead({ leadId: lead.leadId, status: 'Lost', reasonForLost: reason }));
                      setIsLostReasonModalOpen(false);
                  }
              };

              // --- Edit/Save logic ---
              const handleEditToggle = () => {
                  if (isEditing) {
                      // Just exit edit mode, do not dispatch or update anything
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
                  // Mark as converted (local only)
                  // Optionally, update local lead status here if needed
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

              if (loading && !lead) return <div className="p-6 text-center">Loading...</div>;
              if (error) return <div className="p-6 text-center text-red-500">Error: {error.message}</div>;
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
                          onFieldChange={handleFieldChange}
                          onScheduleActivity={() => setIsActivityModalOpen(true)}
                          conversionData={conversionData}
                          showConversionDetails={showConversionDetails}
                          onToggleConversionDetails={onToggleConversionDetails}
                          onConversionFieldChange={(field, value) => {
                              setConversionData(prev => ({ ...prev, [field]: value }));
                          }}
                      />
                      <AddActivityModal
                          isOpen={isActivityModalOpen}
                          onClose={() => { setIsActivityModalOpen(false); setEditingActivity(null); }}
                          leadId={lead.leadId}
                          initialData={editingActivity}
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
