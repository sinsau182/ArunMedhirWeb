import { useState, useEffect, useRef } from 'react';

const BulkPaymentForm = ({ onSubmit, onCancel }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const vendorInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('bills'); // 'bills' | 'notes'

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const [formData, setFormData] = useState({
    vendor: '',
    gstin: '',
    paymentDate: new Date().toISOString().split('T')[0],
    company: 'ABC Enterprises Ltd.',
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
    { id: 1, name: 'Acme Ltd.', gstin: '27AABCU9603R1ZX' },
    { id: 2, name: 'XYZ India', gstin: '29XYZE5678K9Z2' },
    { id: 3, name: 'Tech Solutions', gstin: '29TECH5678K9Z3' }
  ];

  const companies = ['ABC Enterprises Ltd.', 'XYZ India Pvt Ltd.', 'Tech Solutions Pvt Ltd.'];
  const journals = ['Cash Payment Journal', 'Bank Payment Journal', 'Cheque Payment Journal'];
  const paymentMethods = ['Bank Transfer', 'Cheque', 'Cash'];
  const bankAccounts = ['HDFC Bank - *****5678', 'SBI Bank - *****1234', 'ICICI Bank - *****4321'];
  const currencies = ['INR', 'USD', 'EUR'];

  const unpaidBills = [
    {
      id: 1,
      billNo: 'INV-2025-001',
      billDate: '2025-06-15',
      dueDate: '2025-07-15',
      amountDue: 45000.00,
      gstTreatment: 'GST Registered',
      reference: 'PO-2025-123'
    },
    {
      id: 2,
      billNo: 'INV-2025-002',
      billDate: '2025-06-18',
      dueDate: '2025-06-28',
      amountDue: 23500.00,
      gstTreatment: 'Composition',
      reference: 'PO-2025-124'
    },
    {
      id: 3,
      billNo: 'INV-2025-003',
      billDate: '2025-06-20',
      dueDate: '2025-07-20',
      amountDue: 67800.00,
      gstTreatment: 'GST Registered',
      reference: 'PO-2025-125'
    }
  ];

  useEffect(() => {
    if (formData.vendor) {
      const selectedVendor = vendors.find(v => v.name === formData.vendor);
      if (selectedVendor) {
        setAvailableBills(unpaidBills.filter(bill => bill.vendorId === selectedVendor.id));
        setFormData(prev => ({ ...prev, gstin: selectedVendor.gstin }));
      }
    } else {
      setAvailableBills([]);
      setSelectedBills([]);
      setFormData(prev => ({ ...prev, gstin: '' }));
    }
  }, [formData.vendor, unpaidBills, vendors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleVendorInput = (e) => {
    setVendorSearch(e.target.value);
    setShowVendorDropdown(true);
    setFormData(prev => ({ ...prev, vendor: '', gstin: '' }));
  };

  const handleVendorSelect = (vendor) => {
    setFormData(prev => ({ ...prev, vendor: vendor.name, gstin: vendor.gstin }));
    setVendorSearch(vendor.name);
    setShowVendorDropdown(false);
    setErrors(prev => ({ ...prev, vendor: undefined }));
  };

  const handleBillSelection = (billId, checked) => {
    if (checked) {
      const bill = availableBills.find(b => b.id === billId);
      setSelectedBills(prev => [...prev, { ...bill, paymentAmount: bill.amountDue }]);
    } else {
      setSelectedBills(prev => prev.filter(b => b.id !== billId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBills(availableBills.map(bill => ({
        ...bill,
        paymentAmount: bill.amountDue
      })));
    } else {
      setSelectedBills([]);
    }
  };

  const handlePaymentAmountChange = (billId, amount) => {
    setSelectedBills(prev =>
      prev.map(bill => {
        let newAmount = parseFloat(amount) || 0;
        if (newAmount > bill.amountDue) newAmount = bill.amountDue;
        return bill.id === billId ? { ...bill, paymentAmount: newAmount } : bill;
      })
    );
  };

  const getTotalPaymentAmount = () => {
    return selectedBills.reduce((sum, bill) => sum + (bill.paymentAmount || 0), 0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vendor) newErrors.vendor = 'Please select a vendor';
    if (!formData.company) newErrors.company = 'Please select a company';
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
    if (!formData.journal) newErrors.journal = 'Please select a journal';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method';
    if (!formData.bankAccount) newErrors.bankAccount = 'Please select a bank account';
    if (selectedBills.length === 0) newErrors.bills = 'Please select at least one bill to pay';
    
    selectedBills.forEach(bill => {
      if (bill.paymentAmount > bill.amountDue) {
        newErrors[`bill_${bill.id}`] = 'Payment amount cannot exceed amount due';
      }
      if (bill.paymentAmount <= 0) {
        newErrors[`bill_${bill.id}`] = 'Payment amount must be greater than zero';
      }
    });
    
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatCurrency = (num) =>
    '₹' + (num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes((vendorSearch || '').toLowerCase()) ||
    vendor.gstin.toLowerCase().includes((vendorSearch || '').toLowerCase())
  );

  // Close vendor dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorInputRef.current && !vendorInputRef.current.contains(event.target)) {
        setShowVendorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full px-0">
      <div className="space-y-6">
        {/* Payment Details */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Vendor */}
              <div className="relative" ref={vendorInputRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.vendor ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Select vendor"
                    value={vendorSearch || formData.vendor}
                    onChange={handleVendorInput}
                    onFocus={() => setShowVendorDropdown(true)}
                    autoComplete="off"
                  />
                  {showVendorDropdown && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {filteredVendors.map(vendor => (
                        <div
                          key={vendor.id}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          onClick={() => handleVendorSelect(vendor)}
                        >
                          <div className="font-medium text-gray-900">{vendor.name}</div>
                          <div className="text-xs text-gray-500">{vendor.gstin}</div>
                        </div>
                      ))}
                      {filteredVendors.length === 0 && (
                        <div className="px-4 py-3 text-gray-400">No vendors found</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.vendor && <p className="text-red-500 text-xs mt-1">{errors.vendor}</p>}
              </div>
              {/* Vendor GSTIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor GSTIN</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value={formData.gstin}
                  placeholder="Auto-filled from vendor"
                  readOnly
                />
              </div>
              {/* Bank Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                <select
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.bankAccount ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select bank account</option>
                  {bankAccounts.map(account => (
                    <option key={account} value={account}>{account}</option>
                  ))}
                </select>
                {errors.bankAccount && <p className="text-red-500 text-xs mt-1">{errors.bankAccount}</p>}
              </div>
            </div>
            {/* Right column */}
            <div className="space-y-6">
              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>}
              </div>
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
              </div>
              {/* Payment Transaction ID (was Reference) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Transaction ID</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., June 2025 settlement"
                />
              </div>
            </div>
          </div>
          {/* TDS/TCS Checkbox */}
          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="tdsApplied"
                checked={formData.tdsApplied}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">TDS/TCS Applied</span>
            </label>
          </div>
        </div>

        {/* Bills & Notes Tabbed Section */}
        <div className="w-full mt-8">
          {/* Tab Buttons */}
          <div className="flex border-b border-gray-200 mb-0">
            <button
              type="button"
              className={`px-6 py-3 font-semibold text-lg focus:outline-none transition-colors border-b-2
                ${activeTab === 'bills' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('bills')}
              style={{ borderTopLeftRadius: 8, borderTopRightRadius: 0 }}
            >
              Bills
            </button>
            <button
              type="button"
              className={`px-6 py-3 font-semibold text-lg focus:outline-none transition-colors border-b-2
                ${activeTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('notes')}
              style={{ borderTopLeftRadius: 0, borderTopRightRadius: 8 }}
            >
              Notes
            </button>
          </div>
          {/* Tab Content */}
          <div className="bg-white p-6 border border-t-0 border-gray-200 min-h-[300px]">
            {activeTab === 'bills' && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Select Bills to Pay</h2>
                </div>
                {!formData.vendor ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-lg font-medium text-gray-600">Please select a vendor first</p>
                    <p className="text-sm text-gray-500 mt-2">Bills will appear here once you choose a vendor</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selectedBills.length === availableBills.length && availableBills.length > 0}
                                onChange={e => handleSelectAll(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                              />
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">BILL NO.</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">BILL DATE</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">DUE DATE</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">AMOUNT DUE</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">GST TREATMENT</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">REFERENCE/PO</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PAYMENT AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {availableBills.map((bill) => {
                            const isSelected = selectedBills.some(sb => sb.id === bill.id);
                            const selectedBill = selectedBills.find(sb => sb.id === bill.id);
                            return (
                              <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={e => handleBillSelection(bill.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="py-4 px-4 text-sm font-medium">{bill.billNo}</td>
                                <td className="py-4 px-4 text-sm">{formatDate(bill.billDate)}</td>
                                <td className="py-4 px-4 text-sm">{formatDate(bill.dueDate)}</td>
                                <td className="py-4 px-4 text-sm font-medium">{formatCurrency(bill.amountDue)}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    bill.gstTreatment === 'GST Registered' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {bill.gstTreatment}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-sm">{bill.reference}</td>
                                <td className="py-4 px-4">
                                  {isSelected && (
                                    <input
                                      type="number"
                                      value={selectedBill?.paymentAmount || ''}
                                      onChange={e => handlePaymentAmountChange(bill.id, e.target.value)}
                                      className={`w-28 px-2 py-1 text-sm border rounded text-right transition-all ${
                                        errors[`bill_${bill.id}`] ? 'border-red-500' : 'border-gray-300'
                                      }`}
                                      min="0"
                                      max={bill.amountDue}
                                      step="0.01"
                                    />
                                  )}
                                  {isSelected && errors[`bill_${bill.id}`] && (
                                    <div className="text-xs text-red-500 mt-1">{errors[`bill_${bill.id}`]}</div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {errors.bills && <div className="text-red-500 text-sm mt-4">{errors.bills}</div>}

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        {selectedBills.length} bills selected
                      </div>
                      <div className="text-lg font-semibold">
                        Total Payment: {formatCurrency(getTotalPaymentAmount())}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {activeTab === 'notes' && (
              <div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Add payment notes (optional)"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 sticky bottom-0 z-20">
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold">
            Total: {formatCurrency(getTotalPaymentAmount())}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => alert('Draft saved!')}
            >
              Save Draft
            </button>
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => alert('Preview opened!')}
            >
              Preview
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              onClick={handleSubmit}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPaymentForm; 