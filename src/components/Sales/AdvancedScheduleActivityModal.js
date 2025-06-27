import React, { useState, useEffect } from 'react';
import { FaCheck, FaEnvelope, FaPhone, FaUsers, FaFileAlt, FaTimes } from 'react-icons/fa';

const AdvancedScheduleActivityModal = ({ isOpen, onClose, lead, initialData, onSuccess }) => {
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
    if (onSuccess) onSuccess(activity);
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
                      <button type="button" onClick={() => handleRemoveAttendee(attendee.id)} className="text-red-500 hover:text-red-700 p-2">
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddAttendee} className="text-blue-600 text-sm mt-2">+ Add Attendee</button>
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

export default AdvancedScheduleActivityModal; 