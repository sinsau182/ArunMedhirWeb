import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateLead } from '@/redux/slices/leadsSlice';

const JunkReasonModal = ({ leadId, onClose }) => {
  const dispatch = useDispatch();
  const [reason, setReason] = useState('');

  useEffect(() => {
    setReason('');
  }, [leadId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason for marking the lead as junk.");
      return;
    }

    try {
      await dispatch(updateLead({
        leadId,
        status: 'Junk',
        reasonForJunk: reason.trim()
      }));
      onClose();
    } catch (error) {
      console.error('Error marking lead as junk:', error);
      alert('Failed to mark lead as junk. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Mark Lead as Junk</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason for Marking as Junk
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter reason for marking this lead as junk..."
              required
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Mark as Junk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JunkReasonModal; 