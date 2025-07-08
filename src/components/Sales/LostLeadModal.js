import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateLead, moveLeadToPipeline } from '@/redux/slices/leadsSlice';
import axios from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

// Define predefined reasons for losing a lead
const lostReasons = [
  "Budget constraints",
  "Timeline mismatch",
  "Went with competitor",
  "Project cancelled/postponed",
  "Unresponsive",
  "Requirements not met",
  "Location issue",
  "Other (Specify in notes if possible)" // Consider adding a notes field later if needed
];

const LostLeadModal = ({ lead, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const [reason, setReason] = useState('');

    // Reset selection when modal opens
    useEffect(() => {
        setReason(lead?.reasonForLost || '');
    }, [lead]);

    const handleChange = (e) => {
        setReason(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!lead) {
            alert("No lead selected.");
            return;
        }
        if (!reason.trim()) {
            alert("Please provide a reason for marking the lead as lost.");
            return;
        }

        try {
            // Update lead status and reason for lost
            await axios.put(`${API_BASE_URL}/leads/${lead.leadId}`, {
                status: 'Lost',
                reasonForLost: reason.trim()
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            // Move the lead to the lost stage (update stageId)
            if (lead.pipelineId || lead.stageId) {
                await dispatch(moveLeadToPipeline({
                    leadId: lead.leadId,
                    newPipelineId: lead.pipelineId || lead.stageId
                }));
            }
            if (onSuccess) {
                onSuccess({ ...lead, status: 'Lost', reasonForLost: reason.trim() });
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Error marking lead as lost:', error);
            alert('Failed to mark lead as lost. Please try again.');
        }
    };

    if (!lead) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white p-8 rounded-xl w-full max-w-lg md:max-w-xl shadow-2xl my-8 max-h-[95vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Mark Lead as Lost</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-3xl leading-none">&times;</button>
                </div>
                <p className="text-base text-gray-600 mb-8">Please provide a reason for losing this lead.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label htmlFor="reasonForLoss" className="block text-sm font-medium text-gray-700 mb-2">Reason for Loss</label>
                        <div className="relative">
                          <select
                              id="reasonForLoss"
                              name="reasonForLoss"
                              value={reason}
                              onChange={handleChange}
                              className="block w-full appearance-none rounded-md border border-gray-300 bg-gray-50 py-3 px-4 pr-10 text-gray-800 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-base placeholder-gray-400"
                              required
                          >
                              <option value="" disabled>Select a reason</option>
                              {lostReasons.map(reason => (
                                  <option key={reason} value={reason}>{reason}</option>
                              ))}
                          </select>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-lg">
                            ▼
                          </span>
                        </div>
                    </div>

                    {/* Submit/Cancel Buttons */}
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
                            className="px-5 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition-all disabled:opacity-50"
                            disabled={!reason} // Disable if no reason selected
                        >
                            Mark as Lost
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LostLeadModal; 