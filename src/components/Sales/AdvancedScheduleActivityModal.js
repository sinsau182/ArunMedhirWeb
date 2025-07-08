import React, { useState, useEffect } from 'react';
import { FaCheck, FaEnvelope, FaPhone, FaUsers, FaPaperclip, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

const AdvancedScheduleActivityModal = ({ isOpen, onClose, lead, initialData, onSuccess, onActivityChange }) => {
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
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);

  // Add separate state for each outcome field
  const [meetingOutcome, setMeetingOutcome] = useState('');
  const [emailOutcome, setEmailOutcome] = useState('');

  // Add a flag to determine if editing and which tab is being edited
  const isEditingActivity = !!(initialData && initialData.id);
  const editingType = initialData?.type;

  // Per-tab state
  const [todo, setTodo] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null });
  const [email, setEmail] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callOutcome: '' });
  const [call, setCall] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callPurpose: '', callOutcome: '', nextFollowUpDate: '', nextFollowUpTime: '' });
  const [meeting, setMeeting] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, meetingVenue: 'In Office', meetingLink: '', attendees: [{ id: 1, name: '' }], callOutcome: '' });
  const [attachmentPreviewTab, setAttachmentPreviewTab] = useState(null);

  // Reset all tab states on open/close
  useEffect(() => {
    if (isOpen && initialData && (initialData.id || initialData._id)) {
      setActiveType(initialData.type || 'To-Do');
      if (initialData.type === 'To-Do') setTodo({ ...todo, ...initialData });
      if (initialData.type === 'Email') setEmail({ ...email, ...initialData });
      if (initialData.type === 'Call') setCall({ ...call, ...initialData });
      if (initialData.type === 'Meeting') setMeeting({ ...meeting, ...initialData });
    } else if (isOpen && !initialData) {
      setTodo({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null });
      setEmail({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callOutcome: '' });
      setCall({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callPurpose: '', callOutcome: '', nextFollowUpDate: '', nextFollowUpTime: '' });
      setMeeting({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, meetingVenue: 'In Office', meetingLink: '', attendees: [{ id: 1, name: '' }], callOutcome: '' });
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (initialData) {
      setActiveType(initialData.type || 'To-Do');
      setTitle(initialData.title || '');
      setDueDate(initialData.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(initialData.dueTime || '');
      setMeetingLink(initialData.meetingLink || '');
      setAttendees(initialData.attendees || [{ id: 1, name: '' }]);
      setCallPurpose(initialData.callPurpose || '');
      setCallOutcome(initialData.type === 'Call' ? initialData.callOutcome || '' : '');
      setNextFollowUpDate(initialData.nextFollowUpDate || '');
      setNextFollowUpTime(initialData.nextFollowUpTime || '');
      setMeetingVenue(initialData.meetingVenue || 'In Office');
      setNote(initialData.note || '');
      setAttachment(initialData.attachment || null);
      setMeetingOutcome(initialData.type === 'Meeting' ? initialData.callOutcome || '' : '');
      setEmailOutcome(initialData.type === 'Email' ? initialData.callOutcome || '' : '');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Per-tab field/handler mapping
  const tabState = {
    'To-Do': [todo, setTodo],
    'Email': [email, setEmail],
    'Call': [call, setCall],
    'Meeting': [meeting, setMeeting],
  };
  const [tabData, setTabData] = tabState[activeType];

  // Per-tab attendee handlers for Meeting
  const handleAddAttendee = () => setMeeting(m => ({ ...m, attendees: [...m.attendees, { id: Date.now(), name: '' }] }));
  const handleAttendeeChange = (id, name) => setMeeting(m => ({ ...m, attendees: m.attendees.map(att => att.id === id ? { ...att, name } : att) }));
  const handleRemoveAttendee = (id) => setMeeting(m => ({ ...m, attendees: m.attendees.filter(att => att.id !== id) }));

  // Save: if editing, only update the selected activity; if creating, create all filled tabs
  const handleSave = async (statusOverride) => {
    try {
      const token = localStorage.getItem('token') || '';
      let formData = new FormData();
      let activities = [];
      // If editing, only update the selected activity
      if (isEditingActivity && initialData && initialData.id) {
        // Build the activity object as per backend format
        let activityToSend = null;
        if (editingType === 'To-Do') {
          activityToSend = {
            type: 'To-Do',
            title: todo.title,
            notes: todo.note || '',
            dueDate: todo.dueDate,
            dueTime: todo.dueTime,
            user: lead?.name || '',
            status: statusOverride || 'pending',
            meetingLink: '',
            attendees: [],
            callPurpose: '',
            callOutcome: '',
            nextFollowUpDate: '',
            nextFollowUpTime: '',
            meetingVenue: '',
            note: '',
            attachment: ''
          };
        } else if (editingType === 'Email') {
          activityToSend = {
            type: 'Email',
            title: email.title,
            notes: email.note || '',
            dueDate: email.dueDate,
            dueTime: email.dueTime,
            user: lead?.name || '',
            status: statusOverride || 'pending',
            meetingLink: '',
            attendees: [],
            callPurpose: '',
            callOutcome: emailOutcome || '',
            nextFollowUpDate: '',
            nextFollowUpTime: '',
            meetingVenue: '',
            note: '',
            attachment: ''
          };
        } else if (editingType === 'Call') {
          activityToSend = {
            type: 'Call',
            title: call.title,
            notes: call.note || '',
            dueDate: call.dueDate,
            dueTime: call.dueTime,
            user: lead?.name || '',
            status: statusOverride || 'pending',
            meetingLink: call.meetingLink || '',
            attendees: [],
            callPurpose: call.callPurpose || '',
            callOutcome: callOutcome || '',
            nextFollowUpDate: call.nextFollowUpDate || '',
            nextFollowUpTime: call.nextFollowUpTime || '',
            meetingVenue: call.meetingVenue || '',
            note: '',
            attachment: ''
          };
        } else if (editingType === 'Meeting') {
          let attendeesArr = Array.isArray(meeting.attendees)
            ? meeting.attendees.map(att => att.name || '').filter(Boolean)
            : [];
          activityToSend = {
            type: 'Meeting',
            title: meeting.title,
            notes: meeting.note || '',
            dueDate: meeting.dueDate,
            dueTime: meeting.dueTime,
            user: lead?.name || '',
            status: statusOverride || 'pending',
            meetingLink: meeting.meetingLink || '',
            attendees: attendeesArr,
            callPurpose: '',
            callOutcome: meetingOutcome || '',
            nextFollowUpDate: '',
            nextFollowUpTime: '',
            meetingVenue: meeting.meetingVenue || '',
            note: '',
            attachment: ''
          };
        }
        await axios.put(
          `${API_BASE_URL}/leads/${lead.leadId}/activities/${initialData.id}`,
          activityToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (onSuccess) onSuccess(activityToSend);
        if (onActivityChange) onActivityChange(lead.leadId);
        onClose();
        return;
      }
      // To-Do
      if (todo.title) {
        activities.push({
          type: 'To-Do',
          title: todo.title,
          notes: todo.note || '',
          dueDate: todo.dueDate,
          dueTime: todo.dueTime,
          user: lead?.name || '',
          status: statusOverride || 'pending',
          meetingLink: '',
          attendees: [],
          callPurpose: '',
          callOutcome: '',
          nextFollowUpDate: '',
          nextFollowUpTime: '',
          meetingVenue: '',
          note: '',
          attachment: ''
        });
      }
      // Email
      if (email.title) {
        activities.push({
          type: 'Email',
          title: email.title,
          notes: email.note || '',
          dueDate: email.dueDate,
          dueTime: email.dueTime,
          user: lead?.name || '',
          status: statusOverride || 'pending',
          meetingLink: '',
          attendees: [],
          callPurpose: '',
          callOutcome: emailOutcome || '',
          nextFollowUpDate: '',
          nextFollowUpTime: '',
          meetingVenue: '',
          note: '',
          attachment: ''
        });
      }
      // Call
      if (call.title) {
        activities.push({
          type: 'Call',
          title: call.title,
          notes: call.note || '',
          dueDate: call.dueDate,
          dueTime: call.dueTime,
          user: lead?.name || '',
          status: statusOverride || 'pending',
          meetingLink: call.meetingLink || '',
          attendees: [],
          callPurpose: call.callPurpose || '',
          callOutcome: callOutcome || '',
          nextFollowUpDate: call.nextFollowUpDate || '',
          nextFollowUpTime: call.nextFollowUpTime || '',
          meetingVenue: call.meetingVenue || '',
          note: '',
          attachment: ''
        });
      }
      // Meeting
      if (meeting.title) {
        let attendeesArr = Array.isArray(meeting.attendees)
          ? meeting.attendees.map(att => att.name || '').filter(Boolean)
          : [];
        activities.push({
          type: 'Meeting',
          title: meeting.title,
          notes: meeting.note || '',
          dueDate: meeting.dueDate,
          dueTime: meeting.dueTime,
          user: lead?.name || '',
          status: statusOverride || 'pending',
          meetingLink: meeting.meetingLink || '',
          attendees: attendeesArr,
          callPurpose: '',
          callOutcome: meetingOutcome || '',
          nextFollowUpDate: '',
          nextFollowUpTime: '',
          meetingVenue: meeting.meetingVenue || '',
          note: '',
          attachment: ''
        });
      }
      formData.append('activities', JSON.stringify(activities));
      // Only one file supported per request, so send the first activity with a file
      const firstWithFile = [todo, email, call, meeting].find(a => a.attachment instanceof File);
      if (firstWithFile && firstWithFile.attachment) {
        formData.append('files', firstWithFile.attachment);
      }
      const response = await axios.post(
        `${API_BASE_URL}/leads/${lead.leadId}/activities/bulk-with-files`,
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (onSuccess && response.data && response.data.length > 0) {
        onSuccess(response.data[0]);
      } else if (onSuccess && activities.length) {
        onSuccess(activities[0]);
      }
      onClose();
      setTodo({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null });
      setEmail({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callOutcome: '' });
      setCall({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callPurpose: '', callOutcome: '', nextFollowUpDate: '', nextFollowUpTime: '' });
      setMeeting({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, meetingVenue: 'In Office', meetingLink: '', attendees: [{ id: 1, name: '' }], callOutcome: '' });
    } catch (e) {
      console.error('Failed to save activity:', e);
    }
  };

  const activityTypes = [
    { name: 'To-Do', icon: <FaCheck /> },
    { name: 'Email', icon: <FaEnvelope /> },
    { name: 'Call', icon: <FaPhone /> },
    { name: 'Meeting', icon: <FaUsers /> },
  ];

  const summary = activeType === 'Call' ? 'Call Information' : activeType;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] h-auto flex flex-col border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl">
          <h2 className="text-base font-semibold text-gray-900">Schedule Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        <div className="flex border-b mb-0 px-4 bg-white sticky top-0 z-10">
          {activityTypes.map(type => (
            <button
              key={type.name}
              onClick={() => !isEditingActivity || editingType === type.name ? setActiveType(type.name) : null}
              disabled={isEditingActivity && editingType !== type.name}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium ${activeType === type.name ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-100'} ${isEditingActivity && editingType !== type.name ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {type.icon}
              {type.name}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50" style={{ minHeight: '320px', maxHeight: '420px' }}>
          {/* Title Field */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={tabData.title}
              onChange={e => setTabData({ ...tabData, title: e.target.value })}
              className="w-full p-2 mt-1 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
              placeholder="Enter activity title"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">Due Date</label>
              <input type="date" value={tabData.dueDate} onChange={e => setTabData({ ...tabData, dueDate: e.target.value })} className="w-full p-2 mt-1 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">Time</label>
              <input type="time" value={tabData.dueTime} onChange={e => setTabData({ ...tabData, dueTime: e.target.value })} className="w-full p-2 mt-1 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Assigned to</label>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">H</div>
              <span className="text-xs">hjhjj</span>
            </div>
          </div>

          {/* Call Fields */}
          {activeType === 'Call' && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-700">Purpose of the Call</label>
                <textarea
                  className="w-full h-16 p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                  placeholder="Add purpose of the call..."
                  value={callPurpose}
                  onChange={e => setCallPurpose(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Outcome of the Call</label>
                <textarea
                  className="w-full h-16 p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                  placeholder="Add outcome of the call..."
                  value={callOutcome}
                  onChange={e => setCallOutcome(e.target.value)}
                />
              </div>
              {isEditingActivity && (
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-700">Next Follow Up</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={nextFollowUpDate}
                        onChange={e => setNextFollowUpDate(e.target.value)}
                        className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                        placeholder="Next Date"
                      />
                      <input
                        type="time"
                        value={nextFollowUpTime}
                        onChange={e => setNextFollowUpTime(e.target.value)}
                        className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                        placeholder="Call Time"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email Fields */}
          {activeType === 'Email' && isEditingActivity && (
            <div>
              <label className="text-xs font-medium text-gray-700">Outcome</label>
              <textarea
                className="w-full h-16 p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                placeholder="Add outcome of the email..."
                value={emailOutcome}
                onChange={e => setEmailOutcome(e.target.value)}
              />
            </div>
          )}

          {/* Meeting Fields */}
          {activeType === 'Meeting' && (
            <>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <label className="text-xs font-medium text-gray-700">Meeting Venue</label>
                  <select
                    className="w-full p-2 mt-1 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-100 border-gray-300 text-gray-800 pr-10 pl-3 hover:border-blue-400 transition-all"
                    value={meetingVenue}
                    onChange={e => setMeeting(m => ({ ...m, meetingVenue: e.target.value }))}
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
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700">Meeting Link</label>
                  <input
                    type="text"
                    value={meetingLink}
                    onChange={e => setMeeting(m => ({ ...m, meetingLink: e.target.value }))}
                    placeholder="https://..."
                    className="w-full p-2 mt-1 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Attendees</label>
                {meeting.attendees.map((attendee, index) => (
                  <div key={attendee.id} className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={attendee.name}
                      onChange={e => handleAttendeeChange(attendee.id, e.target.value)}
                      placeholder={`Attendee ${index + 1} name`}
                      className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                    />
                    <button type="button" onClick={() => handleRemoveAttendee(attendee.id)} className="text-red-500 hover:text-red-700 p-2">
                      <FaTimes />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddAttendee} className="text-blue-600 text-xs mt-2">+ Add Attendee</button>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Outcome of the Meeting</label>
                <textarea
                  className="w-full h-16 p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                  placeholder="Add outcome of the meeting..."
                  value={meetingOutcome}
                  onChange={e => setMeetingOutcome(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Note and Attachment Section (all tabs) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
            <textarea
              className="w-full h-16 p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
              placeholder="Add a note..."
              value={tabData.note}
              onChange={e => setTabData({ ...tabData, note: e.target.value })}
            />
            <div className="flex items-center gap-2 mt-2">
              <label className="cursor-pointer flex items-center gap-1 text-blue-600 hover:text-blue-800">
                <FaPaperclip />
                <input
                  type="file"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) setTabData({ ...tabData, attachment: e.target.files[0] });
                  }}
                />
                <span className="text-xs font-medium">Attach</span>
              </label>
              {tabData.attachment && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1 cursor-pointer text-xs" onClick={() => setShowAttachmentPreview(true)}>
                  {tabData.attachment.name}
                  <FaTimes className="ml-1 text-xs hover:text-red-500" onClick={e => { e.stopPropagation(); setTabData({ ...tabData, attachment: null }); }} />
                </span>
              )}
            </div>
            {/* Attachment Preview Popup */}
            {showAttachmentPreview && tabData.attachment && (
              <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                  <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowAttachmentPreview(false)}><FaTimes /></button>
                  <div className="text-xs font-semibold mb-2">{tabData.attachment.name}</div>
                  {tabData.attachment.type && tabData.attachment.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(tabData.attachment)} alt="Attachment Preview" className="max-h-96 w-auto mx-auto rounded" />
                  ) : (
                    <div className="bg-gray-100 p-4 rounded text-center">Preview not available for this file type.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white border-t shadow-lg flex items-center justify-end gap-2 p-4 z-10 rounded-b-2xl sticky bottom-0">
          <button onClick={() => handleSave()} className="bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-blue-700">{isEditingActivity ? 'Edit' : 'Save'}</button>
          <button onClick={() => handleSave('done')} className="bg-gray-600 text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-gray-700">Mark Done</button>
          <button onClick={onClose} className="bg-white border border-gray-300 px-4 py-2 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50">Discard</button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedScheduleActivityModal; 