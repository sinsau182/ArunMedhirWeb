// src/components/ConvertLeadModal.js (Apply these changes manually)
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLead } from '@/redux/slices/leadsSlice';

// Receive leadData object containing id and initialQuote
const ConvertLeadModal = ({ leadId, onClose }) => {
  const dispatch = useDispatch();
  const { leads } = useSelector((state) => state.leads);
  const lead = leads.find(l => l.leadId === leadId);

  const [finalQuotation, setFinalQuotation] = useState('');
  const [signupAmount, setSignupAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [projectTimeline, setProjectTimeline] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentDetailsFile, setPaymentDetailsFile] = useState(null);
  const [bookingFormFile, setBookingFormFile] = useState(null);
  const [quotedAmount, setQuotedAmount] = useState(lead?.quotedAmount || '');

  useEffect(() => {
    if (lead) {
      setFinalQuotation(lead.finalQuotation || '');
      setSignupAmount(lead.signupAmount || '');
      setPaymentDate(lead.paymentDate || '');
      setPaymentMode(lead.paymentMode || '');
      setPanNumber(lead.panNumber || '');
      setProjectTimeline(lead.projectTimeline || '');
      setDiscount(lead.discount || '');
      setQuotedAmount(lead.quotedAmount || '');
    }
  }, [lead]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      if (name === 'paymentDetailsFile') {
        setPaymentDetailsFile(files[0]);
      } else if (name === 'bookingFormFile') {
        setBookingFormFile(files[0]);
      }
    } else {
      if (name === 'paymentDetailsFile') setPaymentDetailsFile(null);
      if (name === 'bookingFormFile') setBookingFormFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!finalQuotation || !signupAmount) {
      alert("Please fill in Final Quotation and Sign-up Amount.");
      return;
    }
    
    if (isNaN(parseFloat(finalQuotation)) || isNaN(parseFloat(signupAmount))) {
      alert("Quotation and Sign-up Amount must be valid numbers.");
      return;
    }

    try {
      const updateData = {
        leadId,
        status: 'Converted',
        initialQuote: parseFloat(quotedAmount),
        finalQuotation: parseFloat(finalQuotation),
        signupAmount: parseFloat(signupAmount),
        paymentDate,
        paymentMode,
        panNumber,
        projectTimeline,
        discount,
        paymentDetailsFileName: paymentDetailsFile?.name || null,
        bookingFormFileName: bookingFormFile?.name || null,
      };

      await dispatch(updateLead(updateData));
      onClose();
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Failed to convert lead. Please try again.');
    }
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Mark Lead as Converted</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Quoted Amount</label>
              <input 
                type="number" 
                value={quotedAmount}
                onChange={e => setQuotedAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                placeholder="Enter initial quoted amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Final Quotation (₹) *</label>
              <input 
                type="number" 
                value={finalQuotation} 
                onChange={(e) => setFinalQuotation(e.target.value)} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                required 
                min="0" 
                step="any" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Sign-up Amount (₹) *</label>
            <input 
              type="number" 
              value={signupAmount} 
              onChange={(e) => setSignupAmount(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
              required 
              min="0" 
              step="any" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Date</label>
            <input 
              type="date" 
              value={paymentDate} 
              onChange={(e) => setPaymentDate(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
            <input 
              type="text" 
              value={paymentMode} 
              onChange={(e) => setPaymentMode(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
              placeholder="e.g., Bank Transfer, UPI" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">PAN Number</label>
            <input 
              type="text" 
              value={panNumber} 
              onChange={(e) => setPanNumber(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Timeline</label>
            <input 
              type="text" 
              value={projectTimeline} 
              onChange={(e) => setProjectTimeline(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
              placeholder="e.g., 6 Months, Jan-Mar 2025" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount (Optional)</label>
            <input 
              type="text" 
              value={discount} 
              onChange={(e) => setDiscount(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
              placeholder="e.g., 10% or 5000" 
            />
          </div>

          <hr className="my-4"/>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Payment Details</label>
            <input 
              type="file" 
              name="paymentDetailsFile" 
              onChange={handleFileChange} 
              accept="image/*,application/pdf" 
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            {paymentDetailsFile && <span className="text-xs text-gray-600 mt-1 block">Selected: {paymentDetailsFile.name}</span>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Booking Form</label>
            <input 
              type="file" 
              name="bookingFormFile" 
              onChange={handleFileChange} 
              accept="image/*,application/pdf" 
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            {bookingFormFile && <span className="text-xs text-gray-600 mt-1 block">Selected: {bookingFormFile.name}</span>}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Confirm Conversion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertLeadModal;