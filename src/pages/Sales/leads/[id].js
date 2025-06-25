import React, { useEffect, useState } from 'react';
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

const OdooDetailBody = ({ lead, isEditing, editedFields, onFieldChange, onScheduleActivity, conversionData, showConversionDetails, onToggleConversionDetails, onConversionFieldChange, activities, onEditActivity, onDeleteActivity, onMarkDone, timelineEvents }) => {
    const [isLoggingNote, setIsLoggingNote] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [previewFile, setPreviewFile] = useState(null); // for file preview popup
    const [isEditingConversion, setIsEditingConversion] = useState(false);
    const [conversionEdit, setConversionEdit] = useState(conversionData || {});
    const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'conversion'

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

    return (
        <div className="flex-grow p-4">
            {/* Spread/sectioned lead details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4 text-sm">
                    <div>
                        <span className="block text-xs text-gray-700 mb-1">Expected Budget</span>
                        {isEditing ? (
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaRupeeSign /></span>
                                <input
                                    type="number"
                                    value={editedFields.budget}
                                    onChange={e => onFieldChange('budget', e.target.value)}
                                    className="w-full pl-8 pr-2 py-2 border rounded-md bg-white text-gray-900 font-medium text-base focus:outline-none"
                                    placeholder="0"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center text-base font-semibold text-gray-900">
                                <FaRupeeSign className="mr-1 text-base text-gray-500" />
                                {lead.budget || '0.00'}
                            </div>
                        )}
                    </div>
                    <div>
                        <span className="block text-xs text-gray-700 mb-1">Project Type</span>
                        {isEditing ? (
                            <select
                                value={editedFields.projectType}
                                onChange={e => onFieldChange('projectType', e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-base"
                            >
                                <option value="">Select Project Type</option>
                                {projectTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        ) : (
                            <div>{lead.projectType || 'N/A'}</div>
                        )}
                    </div>
                    <div>
                        <span className="block text-xs text-gray-700 mb-1">Property Type</span>
                        {isEditing ? (
                            <select
                                value={editedFields.propertyType}
                                onChange={e => onFieldChange('propertyType', e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-base"
                            >
                                <option value="">Select Property Type</option>
                                {propertyTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        ) : (
                            <div>{lead.propertyType || 'N/A'}</div>
                        )}
                    </div>
                    <div>
                        <span className="block text-xs text-gray-700 mb-1">Location</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedFields.address}
                                onChange={e => onFieldChange('address', e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-base"
                                placeholder="Enter address"
                            />
                        ) : (
                            <div>{lead.address || 'N/A'}</div>
                        )}
                    </div>
                </div>
                <div className="space-y-4 text-sm">
                    <div>
                        <span className="block text-xs text-gray-700 mb-1">Contact</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedFields.name}
                                onChange={e => onFieldChange('name', e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-base mb-2"
                                placeholder="Name"
                            />
                        ) : (
                            <div>{lead.name || 'N/A'}, {lead.contactNumber || 'N/A'}</div>
                        )}
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedFields.contactNumber}
                                onChange={e => onFieldChange('contactNumber', e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-base"
                                placeholder="Contact Number"
                            />
                        ) : null}
                    </div>
                    <div>
                        <span className="block text-xs text-gray-700 mb-1">Email</span>
                        {isEditing ? (
                            <input
                                type="email"
                                value={editedFields.email}
                                onChange={e => onFieldChange('email', e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-base"
                                placeholder="Email"
                            />
                        ) : (
                            <div>{lead.email || 'N/A'}</div>
                        )}
                    </div>
                    <div>
                        <span className="block text-xs text-gray-700 mb-1">Phone</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedFields.contactNumber}
                                onChange={e => onFieldChange('contactNumber', e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-base"
                                placeholder="Phone"
                            />
                        ) : (
                            <div>{lead.contactNumber || 'N/A'}</div>
                        )}
                    </div>
                </div>
                <div className="space-y-4 text-sm">
                    <div>
                        <span className="block text-xs text-gray-700 mb-1">Salesperson</span>
                        {isEditing ? (
                            <select
                                value={editedFields.salesRep}
                                onChange={e => onFieldChange('salesRep', e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-base"
                            >
                                <option value="">Select Salesperson</option>
                                {salesPersons.map(person => (
                                    <option key={person.id} value={person.name}>{person.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {lead.salesRep ? lead.salesRep.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span>{lead.salesRep || 'Unassigned'}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <span className="block text-xs text-gray-700 mb-1">Designer</span>
                        {isEditing ? (
                            <select
                                value={editedFields.designer}
                                onChange={e => onFieldChange('designer', e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-base"
                            >
                                <option value="">Select Designer</option>
                                {designers.map(designer => (
                                    <option key={designer.id} value={designer.name}>{designer.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {lead.designer ? lead.designer.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span>{lead.designer || 'Unassigned'}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <span className="block text-xs text-gray-700 mb-1">Expected Closing</span>
                        {isEditing ? (
                            <input
                                type="date"
                                value={editedFields.nextCall || ''}
                                onChange={e => onFieldChange('nextCall', e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-base"
                            />
                        ) : (
                            <div>{lead.nextCall ? new Date(lead.nextCall).toLocaleDateString() : 'No closing date'}</div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {renderStars(isEditing ? editedFields.rating : lead.rating || 0)}
                    </div>
                </div>
            </div>

            {/* Divider before actions */}
            <hr className="my-8 border-gray-200" />

            {/* Tab Toggle for Notes and Conversion Details */}
            <div className="border-b border-gray-200 mb-0">
                <nav className="flex space-x-2" aria-label="Tabs">
                    <button
                        className={`px-6 py-2 text-sm font-medium border-b-2 transition-all duration-150 focus:outline-none ${activeTab === 'notes' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-blue-700 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        Notes
                    </button>
                    <button
                        className={`px-6 py-2 text-sm font-medium border-b-2 transition-all duration-150 focus:outline-none ${activeTab === 'conversion' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-blue-700 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('conversion')}
                        disabled={!conversionData}
                    >
                        View Conversion Details
                    </button>
                </nav>
            </div>

            {/* Tab Content Area */}
            <div className="bg-gray-50 min-h-[160px] border-b border-gray-200 px-4 py-6">
                {activeTab === 'notes' && (
                    <div>
                        <label className="block text-xs font-normal text-gray-500 mb-2">Log Note</label>
                        <textarea
                            className="w-full p-3 border rounded-md bg-white min-h-[100px] text-gray-700"
                            placeholder="Add a description..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                        />
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={() => {
                                    // Save note logic here
                                    setIsLoggingNote(false);
                                    setNoteContent('');
                                }}
                                className="bg-purple-600 text-white px-4 py-2 text-sm rounded-md"
                                disabled={!noteContent.trim()}
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setNoteContent('')}
                                className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {activeTab === 'conversion' && conversionData && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Initial Quoted Amount */}
                            <div>
                                <span className="block text-xs text-gray-700 mb-1">Initial Quoted Amount:</span>
                                {isEditing ? (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaRupeeSign /></span>
                                        <input
                                            type="number"
                                            value={conversionEdit.initialQuote || ''}
                                            onChange={e => handleConversionFieldChange('initialQuote', e.target.value)}
                                            className="w-full pl-8 pr-2 py-2 border rounded-md bg-white text-gray-900 font-medium text-base focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                ) : (
                                    <span className="flex items-center text-base font-semibold text-gray-900">
                                        <FaRupeeSign className="mr-1 text-base text-gray-500" />
                                        {conversionData.initialQuote ? (
                                            <span>{conversionData.initialQuote}</span>
                                        ) : (
                                            <span className="text-gray-400">N/A</span>
                                        )}
                                    </span>
                                )}
                            </div>
                            {/* Final Quotation */}
                            <div>
                                <span className="block text-xs text-gray-700 mb-1">Final Quotation:</span>
                                {isEditing ? (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaRupeeSign /></span>
                                        <input
                                            type="number"
                                            value={conversionEdit.finalQuotation || ''}
                                            onChange={e => handleConversionFieldChange('finalQuotation', e.target.value)}
                                            className="w-full pl-8 pr-2 py-2 border rounded-md bg-white text-gray-900 font-medium text-base focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                ) : (
                                    <span className="flex items-center text-base font-semibold text-gray-900">
                                        <FaRupeeSign className="mr-1 text-base text-gray-500" />
                                        {conversionData.finalQuotation ? (
                                            <span>{conversionData.finalQuotation}</span>
                                        ) : (
                                            <span className="text-gray-400">N/A</span>
                                        )}
                                    </span>
                                )}
                            </div>
                            {/* Sign-up Amount */}
                            <div>
                                <span className="block text-xs text-gray-700 mb-1">Sign-up Amount:</span>
                                {isEditing ? (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaRupeeSign /></span>
                                        <input
                                            type="number"
                                            value={conversionEdit.signUpAmount || ''}
                                            onChange={e => handleConversionFieldChange('signUpAmount', e.target.value)}
                                            className="w-full pl-8 pr-2 py-2 border rounded-md bg-white text-gray-900 font-medium text-base focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                ) : (
                                    <span className="flex items-center text-base font-semibold text-gray-900">
                                        <FaRupeeSign className="mr-1 text-base text-gray-500" />
                                        {conversionData.signUpAmount ? (
                                            <span>{conversionData.signUpAmount}</span>
                                        ) : (
                                            <span className="text-gray-400">N/A</span>
                                        )}
                                    </span>
                                )}
                            </div>
                            {/* Payment Date */}
                            <div>
                                <span className="block text-xs text-gray-700 mb-1">Payment Date:</span>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={conversionEdit.paymentDate || ''}
                                        onChange={e => handleConversionFieldChange('paymentDate', e.target.value)}
                                        className="w-full border rounded-md px-2 py-2 text-base"
                                    />
                                ) : (
                                    <span className={`block text-base font-semibold ${conversionData.paymentDate ? 'text-gray-900' : 'text-gray-400'}`}>{conversionData.paymentDate || 'N/A'}</span>
                                )}
                            </div>
                            {/* Payment Mode */}
                            <div>
                                <span className="block text-xs text-gray-700 mb-1">Payment Mode:</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={conversionEdit.paymentMode || ''}
                                        onChange={e => handleConversionFieldChange('paymentMode', e.target.value)}
                                        className="w-full border rounded-md px-2 py-2 text-base"
                                        placeholder="e.g., UPI, Bank Transfer"
                                    />
                                ) : (
                                    <span className={`block text-base font-semibold ${conversionData.paymentMode ? 'text-gray-900' : 'text-gray-400'}`}>{conversionData.paymentMode || 'N/A'}</span>
                                )}
                            </div>
                            {/* PAN Number */}
                            <div>
                                <span className="block text-xs text-gray-700 mb-1">PAN Number:</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={conversionEdit.panNumber || ''}
                                        onChange={e => handleConversionFieldChange('panNumber', e.target.value)}
                                        className="w-full border rounded-md px-2 py-2 text-base"
                                        placeholder="PAN Number"
                                    />
                                ) : (
                                    <span className={`block text-base font-semibold ${conversionData.panNumber ? 'text-gray-900' : 'text-gray-400'}`}>{conversionData.panNumber || 'N/A'}</span>
                                )}
                            </div>
                            {/* Project Timeline */}
                            <div>
                                <span className="block text-xs text-gray-700 mb-1">Project Timeline:</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={conversionEdit.projectTimeline || ''}
                                        onChange={e => handleConversionFieldChange('projectTimeline', e.target.value)}
                                        className="w-full border rounded-md px-2 py-2 text-base"
                                        placeholder="e.g., 6 Months, Jan-Mar 2025"
                                    />
                                ) : (
                                    <span className={`block text-base font-semibold ${conversionData.projectTimeline ? 'text-gray-900' : 'text-gray-400'}`}>{conversionData.projectTimeline || 'N/A'}</span>
                                )}
                            </div>
                            {/* Discount */}
                            <div>
                                <span className="block text-xs text-gray-700 mb-1">Discount:</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={conversionEdit.discount || ''}
                                        onChange={e => handleConversionFieldChange('discount', e.target.value)}
                                        className="w-full border rounded-md px-2 py-2 text-base"
                                        placeholder="Discount"
                                    />
                                ) : (
                                    <span className={`block text-base font-semibold ${conversionData.discount ? 'text-gray-900' : 'text-gray-400'}`}>{conversionData.discount || 'N/A'}</span>
                                )}
                            </div>
                        </div>
                        {isEditing && (
                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={handleSaveConversion}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => { setIsEditingConversion(false); setConversionEdit(conversionData); }}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions & Activity Log */}
            <div className="mt-6 border-t pt-4">
                {/* Log Note and Activity Buttons - now just above Planned Activities */}
                <div className="mb-6 flex gap-2">
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
                {/* Planned Activities Section */}
                <div className="mt-6">
                    <details open className="w-full group">
                        <summary className="list-none flex items-center gap-1 cursor-pointer text-sm font-semibold text-gray-700 hover:text-black border-b pb-2">
                            <FaChevronDown className="group-open:rotate-0 -rotate-90 transition-transform" />
                            Planned Activities
                        </summary>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {activities.length === 0 ? (
                                <div className="text-gray-400 text-sm italic py-4 col-span-full">No planned activities.</div>
                            ) : (
                                activities.map(activity => (
                                    <PlannedActivityItem
                                        key={activity.id}
                                        activity={activity}
                                        onEditActivity={onEditActivity}
                                        onDeleteActivity={onDeleteActivity}
                                        onMarkDone={onMarkDone}
                                    />
                                ))
                            )}
                        </div>
                    </details>
                </div>
                {/* Timeline */}
                <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-500 mb-4">TODAY</h3>
                    <div className="w-full overflow-x-auto">
                        <div className="flex items-center gap-0 min-w-[600px] pb-2">
                            {timelineEvents.length === 0 ? (
                                <div className="text-gray-400 text-sm italic py-4">No events today.</div>
                            ) : (
                                timelineEvents.map((event, idx) => (
                                    <React.Fragment key={event.id}>
                                        <div className={`flex flex-col items-center min-w-[180px] ${idx === 0 ? 'border-blue-400 border-2 rounded-xl bg-blue-50' : ''} p-2`}>
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white shadow">
                                                    {event.user ? event.user.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <span className="text-xs text-gray-400 mt-1">{event.time}</span>
                                            </div>
                                            <div className="mt-2 bg-white rounded-lg shadow px-4 py-2 w-full text-center border border-blue-50">
                                                <div className="text-sm font-semibold text-blue-700">{event.action}</div>
                                                <div className="text-xs text-gray-500 mt-1">{event.details}</div>
                                            </div>
                                            {idx === 0 && <span className="mt-1 text-xs text-blue-500 font-bold">Start</span>}
                                        </div>
                                        {idx !== timelineEvents.length - 1 && (
                                            <div className="flex items-center justify-center h-10">
                                                <FaChevronDown className="rotate-[-90deg] text-blue-300 text-2xl mx-2" />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddActivityModal = ({ isOpen, onClose, leadId, initialData, onSaveActivity }) => {
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
              const [timelineEvents, setTimelineEvents] = useState([
                { id: 1, user: 'hjhjj', time: '11:55 am', action: 'Stage changed', details: 'Proposition → Qualif' },
                { id: 2, user: 'hjhjj', time: '11:55 am', action: 'Stage changed', details: 'New → Proposition (Stage)' },
              ]);

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
                      // Optionally, navigate back to list
                      // router.push('/Sales/LeadManagement');
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
              const handleMarkDone = (id) => setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'done' } : a));

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

