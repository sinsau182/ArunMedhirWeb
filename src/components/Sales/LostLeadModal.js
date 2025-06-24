import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateLead } from '@/redux/slices/leadsSlice';

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

const LostLeadModal = ({ lead, onClose }) => {
    const dispatch = useDispatch();
    const [selectedReason, setSelectedReason] = useState('');

    // Reset selection when modal opens
    useEffect(() => {
        if (lead) {
            setSelectedReason(lead.reasonForLost || '');
        }
    }, [lead]);

    const handleChange = (e) => {
        setSelectedReason(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReason) {
            alert('Please select a reason for loss.');
            return;
        }

        try {
            await dispatch(updateLead({
                leadId: lead.leadId,
                status: 'Lost',
                reasonForLost: selectedReason
            }));
            onClose();
        } catch (error) {
            console.error('Error marking lead as lost:', error);
            alert('Failed to mark lead as lost. Please try again.');
        }
    };

    if (!lead) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white p-6 md:p-8 rounded-lg w-full max-w-sm shadow-xl my-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Mark Lead as Lost</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                </div>
                <p className="text-sm text-gray-600 mb-6">Please provide a reason for losing this lead.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="reasonForLoss" className="block text-sm font-medium text-gray-700">Reason for Loss</label>
                        <select
                            id="reasonForLoss"
                            name="reasonForLoss"
                            value={selectedReason}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>Select a reason</option>
                            {lostReasons.map(reason => (
                                <option key={reason} value={reason}>{reason}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit/Cancel Buttons */}
                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            disabled={!selectedReason} // Disable if no reason selected
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