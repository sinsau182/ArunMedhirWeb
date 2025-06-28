import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaFileInvoice } from 'react-icons/fa';

// Mock data that would typically come from an API
const MOCK_BILLS = [
  { id: 'BILL-12345', vendor: 'WoodWorks', poReference: 'PO-2025-001', items: [{ id: 1, name: 'Oak Tabletop', qty: 2, rate: 5000 }, { id: 2, name: 'Pine Legs', qty: 8, rate: 500 }] },
  { id: 'BILL-12346', vendor: 'MetalCo', poReference: 'PO-2025-002', items: [{ id: 3, name: 'Chair Legs', qty: 20, rate: 200 }, { id: 4, name: 'Steel Screws', qty: 100, rate: 10 }] },
];

const AddRefundForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    referencedBill: '',
    poReference: '',
    vendorName: '',
    refundDate: new Date().toISOString().split('T')[0],
    itemsToReturn: [],
    refundType: 'credit', // 'credit' or 'cash'
    paymentMethod: '',
    accountDetails: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.referencedBill) {
      const selectedBill = MOCK_BILLS.find(b => b.id === formData.referencedBill);
      if (selectedBill) {
        setFormData(prev => ({
          ...prev,
          vendorName: selectedBill.vendor,
          poReference: selectedBill.poReference,
          itemsToReturn: selectedBill.items.map(item => ({ ...item, qtyToReturn: 0, amount: 0 }))
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, vendorName: '', poReference: '', itemsToReturn: [] }));
    }
  }, [formData.referencedBill]);

  useEffect(() => {
    const total = formData.itemsToReturn.reduce((sum, item) => sum + item.amount, 0);
    setFormData(prev => ({ ...prev, totalCredit: total }));
  }, [formData.itemsToReturn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemReturnChange = (index, qty) => {
    const newItems = [...formData.itemsToReturn];
    const item = newItems[index];
    let newQty = parseInt(qty, 10) || 0;

    if (newQty < 0) newQty = 0;
    if (newQty > item.qty) newQty = item.qty;

    newItems[index].qtyToReturn = newQty;
    newItems[index].amount = item.rate * newQty;
    setFormData(prev => ({ ...prev, itemsToReturn: newItems }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation logic here if needed
    onSubmit({ ...formData, totalCredit: formData.totalCredit });
  };
  
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 mb-24">
        {/* Main Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Refund Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referenced Bill <span className="text-red-500">*</span></label>
                  <select name="referencedBill" value={formData.referencedBill} onChange={handleChange} className="w-full px-4 py-3 text-base border rounded-lg border-gray-300">
                    <option value="">Select a bill to refund</option>
                    {MOCK_BILLS.map(bill => <option key={bill.id} value={bill.id}>{bill.id} - {bill.vendor}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PO Reference</label>
                  <input type="text" value={formData.poReference} readOnly className="w-full px-4 py-3 text-base border rounded-lg border-gray-300 bg-gray-50" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <input type="text" value={formData.vendorName} readOnly className="w-full px-4 py-3 text-base border rounded-lg border-gray-300 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Refund</label>
              <input type="date" name="refundDate" value={formData.refundDate} onChange={handleChange} className="w-full px-4 py-3 text-base border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Refund Type</label>
              <select name="refundType" value={formData.refundType} onChange={handleChange} className="w-full px-4 py-3 text-base border rounded-lg border-gray-300">
                <option value="credit">Vendor Credit</option>
                <option value="cash">Cash/Bank Refund</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items to Return */}
        {formData.itemsToReturn.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Items to Return</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3 text-left font-medium text-gray-500">Item Name</th>
                    <th className="py-2 px-3 text-right font-medium text-gray-500">Qty Available</th>
                    <th className="py-2 px-3 text-right font-medium text-gray-500">Rate</th>
                    <th className="py-2 px-3 text-center font-medium text-gray-500 w-32">Qty to Return</th>
                    <th className="py-2 px-3 text-right font-medium text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.itemsToReturn.map((item, index) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3 px-3">{item.name}</td>
                      <td className="py-3 px-3 text-right">{item.qty}</td>
                      <td className="py-3 px-3 text-right">{formatCurrency(item.rate)}</td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={item.qtyToReturn}
                          onChange={(e) => handleItemReturnChange(index, e.target.value)}
                          className="w-full px-2 py-1 text-base text-center border rounded-lg border-gray-300"
                          min="0"
                          max={item.qty}
                        />
                      </td>
                      <td className="py-3 px-3 text-right font-semibold">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Credit:</span>
                  <span>{formatCurrency(formData.totalCredit)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash/Bank Refund Details (Conditional) */}
        {formData.refundType === 'cash' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash/Bank Refund Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full px-4 py-3 text-base border rounded-lg border-gray-300">
                            <option value="">Select method</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Cash">Cash</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Refund Amount</label>
                        <input type="text" value={formatCurrency(formData.totalCredit)} readOnly className="w-full px-4 py-3 text-base border rounded-lg border-gray-300 bg-gray-50" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Details / Reference</label>
                        <input type="text" name="accountDetails" value={formData.accountDetails} onChange={handleChange} className="w-full px-4 py-3 text-base border rounded-lg border-gray-300" placeholder="e.g., Bank account, Cheque no." />
                    </div>
                </div>
            </div>
        )}

         {/* Notes Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 text-base border rounded-lg border-gray-300"
                placeholder="Add any internal notes about this refund..."
            />
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6">
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-end space-x-4">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <span>Cancel</span>
            </button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <FaSave className="w-4 h-4" />
              <span>Submit Refund Request</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddRefundForm; 