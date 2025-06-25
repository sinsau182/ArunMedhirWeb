import { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import HradminNavbar from '../HradminNavbar';

const BulkPaymentForm = ({ onSubmit, onCancel }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const [formData, setFormData] = useState({
    vendor: '',
    gstin: '',
    paymentDate: new Date().toISOString().split('T')[0],
    company: 'ABC Pvt Ltd',
    journal: '',
    paymentMethod: '',
    bankAccount: '',
    currency: 'INR',
    reference: '',
    tdsApplied: false,
    notes: ''
  });

  const [selectedBills, setSelectedBills] = useState([]);
  const [availableBills, setAvailableBills] = useState([]);
  const [errors, setErrors] = useState({});

  // Sample data
  const vendors = [
    { id: 1, name: 'Acme Ltd.', gstin: '29ABCDE1234F1Z5' },
    { id: 2, name: 'XYZ India', gstin: '29XYZE5678K9Z2' },
    { id: 3, name: 'Tech Solutions', gstin: '29TECH5678K9Z3' }
  ];

  const journals = ['Bank', 'Cash', 'Cheque'];
  const paymentMethods = ['NEFT', 'RTGS', 'UPI', 'Cheque', 'Cash', 'Wire Transfer'];
  const bankAccounts = ['SBI - 1234567890', 'HDFC - 0987654321', 'ICICI - 1122334455'];
  const currencies = ['INR', 'USD', 'EUR'];

  const unpaidBills = [
    {
      id: 1,
      billNo: 'VB-1001',
      billDate: '12-06-25',
      dueDate: '22-06-25',
      amountDue: 12500,
      gstTreatment: 'Registered',
      reference: 'PO-2025-001',
      reverseCharge: 'No',
      attachments: 'Yes'
    },
    {
      id: 2,
      billNo: 'VB-1002',
      billDate: '13-06-25',
      dueDate: '23-06-25',
      amountDue: 8000,
      gstTreatment: 'Unregistered',
      reference: '',
      reverseCharge: 'Yes',
      attachments: 'No'
    },
    {
      id: 3,
      billNo: 'VB-1003',
      billDate: '14-06-25',
      dueDate: '24-06-25',
      amountDue: 15000,
      gstTreatment: 'Registered',
      reference: 'PO-2025-002',
      reverseCharge: 'No',
      attachments: 'Yes'
    }
  ];

  useEffect(() => {
    if (formData.vendor) {
      // Filter bills for selected vendor
      setAvailableBills(unpaidBills);
      
      // Auto-fill GSTIN
      const selectedVendor = vendors.find(v => v.name === formData.vendor);
      if (selectedVendor) {
        setFormData(prev => ({ ...prev, gstin: selectedVendor.gstin }));
      }
    } else {
      setAvailableBills([]);
      setFormData(prev => ({ ...prev, gstin: '' }));
    }
  }, [formData.vendor]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBillSelection = (billId, checked) => {
    if (checked) {
      const bill = availableBills.find(b => b.id === billId);
      setSelectedBills(prev => [...prev, { ...bill, paymentAmount: bill.amountDue }]);
    } else {
      setSelectedBills(prev => prev.filter(b => b.id !== billId));
    }
  };

  const handlePaymentAmountChange = (billId, amount) => {
    setSelectedBills(prev => 
      prev.map(bill => 
        bill.id === billId 
          ? { ...bill, paymentAmount: parseFloat(amount) || 0 }
          : bill
      )
    );
  };

  const getTotalPaymentAmount = () => {
    return selectedBills.reduce((sum, bill) => sum + bill.paymentAmount, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vendor) newErrors.vendor = 'Please select a vendor';
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
    if (!formData.journal) newErrors.journal = 'Please select a journal';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method';
    if (selectedBills.length === 0) newErrors.bills = 'Please select at least one bill to pay';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const paymentData = {
        ...formData,
        selectedBills,
        totalAmount: getTotalPaymentAmount(),
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      onSubmit(paymentData);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentRole={"accounting"}
      />

      {/* Navbar */}
      <HradminNavbar />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300 overflow-x-auto`}
      >
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50 mt-16">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-2 top-16">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">💰</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Vendor Payment</h1>
            <p className="text-sm text-gray-500">Process bulk payments to vendors</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Payment Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Payment Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* First Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor <span className="text-red-500">*</span>
              </label>
              <select
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.vendor ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">🔍 Select vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.name}>{vendor.name}</option>
                ))}
              </select>
              {errors.vendor && <p className="text-red-500 text-sm mt-1">{errors.vendor}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor GSTIN</label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                readOnly
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-gray-50"
                placeholder="Auto-filled from vendor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.paymentDate && <p className="text-red-500 text-sm mt-1">{errors.paymentDate}</p>}
            </div>

            {/* Second Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journal <span className="text-red-500">*</span>
              </label>
              <select
                name="journal"
                value={formData.journal}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.journal ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select journal</option>
                {journals.map(journal => (
                  <option key={journal} value={journal}>{journal}</option>
                ))}
              </select>
              {errors.journal && <p className="text-red-500 text-sm mt-1">{errors.journal}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}
            </div>

            {/* Third Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
              <select
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select bank account</option>
                {bankAccounts.map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., June 2025 settlement"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="tdsApplied"
                checked={formData.tdsApplied}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-base font-medium text-gray-700">TDS/TCS Applied</span>
            </label>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional notes about this payment"
            />
          </div>
        </div>

        {/* Bill Selection Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            Select Bills to Pay
          </h3>

          {!formData.vendor ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-lg font-medium">Please select a vendor first</p>
              <p className="text-sm mt-2">Bills will appear here once you choose a vendor</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Select</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount Due</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GST Treatment</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reference/PO</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {availableBills.map((bill) => {
                      const isSelected = selectedBills.some(sb => sb.id === bill.id);
                      const selectedBill = selectedBills.find(sb => sb.id === bill.id);
                      
                      return (
                        <tr key={bill.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleBillSelection(bill.id, e.target.checked)}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-blue-600">{bill.billNo}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{bill.billDate}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{bill.dueDate}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">₹{bill.amountDue.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              bill.gstTreatment === 'Registered' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {bill.gstTreatment}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`text-sm ${bill.reference ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                              {bill.reference || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {isSelected && (
                              <input
                                type="number"
                                value={selectedBill?.paymentAmount || 0}
                                onChange={(e) => handlePaymentAmountChange(bill.id, e.target.value)}
                                className="w-32 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                max={bill.amountDue}
                                step="0.01"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {errors.bills && <p className="text-red-500 text-sm mt-2">{errors.bills}</p>}

              {selectedBills.length > 0 && (
                <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-semibold text-gray-900">
                        {selectedBills.length} bill{selectedBills.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        Total Payment: ₹{getTotalPaymentAmount().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-gray-900">
              Total Payment Amount: ₹{getTotalPaymentAmount().toLocaleString()}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-base font-medium bg-blue-600 text-white border-2 border-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
              >
                Save Payment
              </button>
              <button
                type="button"
                className="px-8 py-3 text-base font-bold bg-green-600 text-white border-2 border-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                Confirm & Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
    </div>
    </div>
  );
};

export default BulkPaymentForm; 