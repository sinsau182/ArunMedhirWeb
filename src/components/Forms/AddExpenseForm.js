import { useState } from 'react';
import { FaSave, FaTimes, FaUpload, FaChevronDown, FaChevronRight, FaReceipt, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import HradminNavbar from '../HradminNavbar';

const AddExpenseForm = ({ onSubmit, onCancel }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const [formData, setFormData] = useState({
    // Basic Information
    expenseType: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    paidBy: 'Employee',
    description: '',
    vendor: '',
    projectJob: '',
    receipt: null,
    
    // Accounting Details (Collapsible)
    account: '',
    tax: 'None',
    costCenter: ''
  });

  const [errors, setErrors] = useState({});
  const [isAccountingCollapsed, setIsAccountingCollapsed] = useState(true);
  const [receiptPreview, setReceiptPreview] = useState(null);

  // Static data - in real app, these would come from APIs
  const expenseTypes = [
    'Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Training',
    'Marketing', 'Utilities', 'Rent', 'Insurance', 'Legal', 'Consulting',
    'Transportation', 'Accommodation', 'Entertainment', 'Other'
  ];

  const paidByOptions = ['Employee', 'Company'];
  
  const vendors = [
    { id: 1, name: 'Uber India', gstin: '29ABCDE1234F1Z5' },
    { id: 2, name: 'Café Coffee Day', gstin: '29CCDE5678K9Z2' },
    { id: 3, name: 'Amazon India', gstin: '29AMZN5678K9Z3' },
    { id: 4, name: 'Flipkart', gstin: '29FLIP5678K9Z4' },
    { id: 5, name: 'Swiggy', gstin: '29SWIG5678K9Z5' }
  ];

  const projectsJobs = [
    'Project Alpha', 'Project Beta', 'Project Gamma', 'Client A', 'Client B',
    'Internal Development', 'Marketing Campaign', 'Sales Initiative', 'R&D'
  ];

  const accounts = [
    'Travel Expenses', 'Meals & Entertainment', 'Office Supplies', 'Equipment & Machinery',
    'Software Licenses', 'Training & Development', 'Marketing Expenses', 'Utilities',
    'Rent Expense', 'Insurance Premium', 'Legal Fees', 'Consulting Fees'
  ];

  const taxOptions = [
    { value: 'None', label: 'No Tax' },
    { value: 'GST_5', label: 'GST 5%' },
    { value: 'GST_12', label: 'GST 12%' },
    { value: 'GST_18', label: 'GST 18%' },
    { value: 'GST_28', label: 'GST 28%' },
    { value: 'IGST_5', label: 'IGST 5%' },
    { value: 'IGST_12', label: 'IGST 12%' },
    { value: 'IGST_18', label: 'IGST 18%' },
    { value: 'IGST_28', label: 'IGST 28%' }
  ];

  const costCenters = [
    'Sales', 'Marketing', 'Development', 'Operations', 'Finance', 'HR',
    'Customer Support', 'Research', 'Administration', 'IT'
  ];

  // Expense types that require receipts
  const receiptRequiredTypes = ['Travel', 'Meals', 'Equipment', 'Software', 'Training', 'Marketing'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        receipt: file
      }));

      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setReceiptPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }

      // Clear error
      if (errors.receipt) {
        setErrors(prev => ({
          ...prev,
          receipt: ''
        }));
      }
    }
  };

  const removeReceipt = () => {
    setFormData(prev => ({
      ...prev,
      receipt: null
    }));
    setReceiptPreview(null);
  };

  const toggleAccountingSection = () => {
    setIsAccountingCollapsed(!isAccountingCollapsed);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.expenseType) {
      newErrors.expenseType = 'Please select an expense type';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (new Date(formData.date) > new Date()) {
      newErrors.date = 'Date cannot be in the future';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Receipt validation for certain expense types
    if (receiptRequiredTypes.includes(formData.expenseType) && !formData.receipt) {
      newErrors.receipt = 'Receipt is required for this expense type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Calculate tax amount if applicable
      let taxAmount = 0;
      if (formData.tax !== 'None') {
        const taxRate = parseFloat(formData.tax.split('_')[1]);
        taxAmount = (parseFloat(formData.amount) * taxRate) / 100;
      }

      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        taxAmount,
        totalAmount: parseFloat(formData.amount) + taxAmount,
        id: Date.now(),
        status: 'Draft',
        createdAt: new Date().toISOString()
      };
      
      onSubmit(submitData);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="flex h-screen">
    {/* Sidebar */}
    <Sidebar
      isCollapsed={isSidebarCollapsed}
      toggleSidebar={toggleSidebar}
      currentRole={"employee"}
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
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <FaReceipt className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
            <p className="text-sm text-gray-500">Record business expense with receipt attachment</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            Expense Details
            <span className="ml-2 text-red-500">*</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Type <span className="text-red-500">*</span>
              </label>
              <select
                name="expenseType"
                value={formData.expenseType}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.expenseType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select expense type</option>
                {expenseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.expenseType && <p className="text-red-500 text-sm mt-1">{errors.expenseType}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (INR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paid By</label>
              <select
                name="paidBy"
                value={formData.paidBy}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {paidByOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor (if any)</label>
              <select
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select vendor (optional)</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.name}>{vendor.name}</option>
                ))}
              </select>
            </div>

            {/* Project/Job */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project/Job</label>
              <select
                name="projectJob"
                value={formData.projectJob}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select project/job (optional)</option>
                {projectsJobs.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the expense..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Receipt Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Receipt
                {receiptRequiredTypes.includes(formData.expenseType) && (
                  <span className="text-red-500 ml-1">*</span>
                )}
                <FaInfoCircle className="inline ml-1 text-gray-400 cursor-help" title="Upload receipt image or PDF" />
              </label>
              
              {!formData.receipt ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Upload Receipt</p>
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                  </label>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaFileAlt className="text-green-600 text-xl" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.receipt.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.receipt.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {receiptPreview && (
                    <div className="mt-3">
                      <img 
                        src={receiptPreview} 
                        alt="Receipt preview" 
                        className="max-w-xs rounded border"
                      />
                    </div>
                  )}
                </div>
              )}
              
              {errors.receipt && <p className="text-red-500 text-sm mt-1">{errors.receipt}</p>}
              
              {receiptRequiredTypes.includes(formData.expenseType) && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Receipt is required for {formData.expenseType} expenses
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Accounting Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <button
            type="button"
            onClick={toggleAccountingSection}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaFileAlt className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Accounting Details</h3>
            </div>
            {isAccountingCollapsed ? (
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <FaChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {!isAccountingCollapsed && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Account */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                  <select
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select account</option>
                    {accounts.map(account => (
                      <option key={account} value={account}>{account}</option>
                    ))}
                  </select>
                </div>
                
                {/* Tax */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax</label>
                  <select
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {taxOptions.map(tax => (
                      <option key={tax.value} value={tax.value}>{tax.label}</option>
                    ))}
                  </select>
                </div>
                
                {/* Cost Center */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost Center</label>
                  <select
                    name="costCenter"
                    value={formData.costCenter}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select cost center</option>
                    {costCenters.map(center => (
                      <option key={center} value={center}>{center}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Tax Calculation Preview */}
              {formData.tax !== 'None' && formData.amount && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tax Calculation</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Base Amount:</span>
                      <span className="ml-2 font-medium">{formatCurrency(parseFloat(formData.amount))}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tax Amount:</span>
                      <span className="ml-2 font-medium text-red-600">
                        {formatCurrency((parseFloat(formData.amount) * parseFloat(formData.tax.split('_')[1])) / 100)}
                      </span>
                    </div>
                    <div className="col-span-2 border-t pt-2">
                      <span className="text-gray-600 font-medium">Total Amount:</span>
                      <span className="ml-2 font-bold text-lg">
                        {formatCurrency(parseFloat(formData.amount) + ((parseFloat(formData.amount) * parseFloat(formData.tax.split('_')[1])) / 100))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-r border-l border-gray-200 shadow-lg ">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <FaTimes className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            
            <button
              type="submit"
              className="px-6 py-3 text-base font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <FaSave className="w-4 h-4" />
              <span>Save Expense</span>
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

export default AddExpenseForm; 