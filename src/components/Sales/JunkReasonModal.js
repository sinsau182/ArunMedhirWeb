import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateLead, moveLeadToPipeline } from '@/redux/slices/leadsSlice';
import axios from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

const JunkReasonModal = ({ lead, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [reason, setReason] = useState('');

  useEffect(() => {
    setReason(lead?.reasonForJunk || '');
  }, [lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead) {
      alert("No lead selected.");
      return;
    }
    if (!reason.trim()) {
      alert("Please provide a reason for marking the lead as junk.");
      return;
    }

    try {
      // Update lead status and reason for junk
      await axios.put(`${API_BASE_URL}/leads/${lead.leadId}`, {
        status: 'Junk',
        reasonForJunk: reason.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      // Move the lead to the junk stage (update stageId)
      if (lead.pipelineId || lead.stageId) {
        await dispatch(moveLeadToPipeline({
          leadId: lead.leadId,
          newPipelineId: lead.pipelineId || lead.stageId
        }));
      }
      if (onSuccess) {
        onSuccess({ ...lead, status: 'Junk', reasonForJunk: reason.trim() });
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error marking lead as junk:', error);
      alert('Failed to mark lead as junk. Please try again.');
    }
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl w-full max-w-lg md:max-w-xl shadow-2xl my-8 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Mark Lead as Junk</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Marking as Junk
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="block w-full rounded-md border border-gray-300 bg-gray-50 py-3 px-4 text-gray-800 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-base placeholder-gray-400"
              placeholder="Enter reason for marking this lead as junk..."
              required
            />
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 text-white rounded-md text-base font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition-all"
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