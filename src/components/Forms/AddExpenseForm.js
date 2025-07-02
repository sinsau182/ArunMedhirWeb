import { useState } from 'react';
import { FaSave, FaTimes, FaUpload, FaFileAlt, FaInfoCircle } from 'react-icons/fa';

const AddExpenseForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    expenseType: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    vendor: '',
    projectJob: '',
    receipt: null,
    paymentProof: null,
  });

  const [errors, setErrors] = useState({});
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);

  // Static data
  const expenseTypes = [
    'Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Training',
    'Marketing', 'Utilities', 'Rent', 'Insurance', 'Legal', 'Consulting',
    'Transportation', 'Accommodation', 'Entertainment', 'Other'
  ];

  const categories = [
    'Business', 'Personal', 'Client', 'Team', 'Admin', 'Other'
  ];

  const vendors = [
    { id: 1, name: 'Uber India' },
    { id: 2, name: 'Café Coffee Day' },
    { id: 3, name: 'Amazon India' },
    { id: 4, name: 'Flipkart' },
    { id: 5, name: 'Swiggy' }
  ];

  const projectsJobs = [
    'Project Alpha', 'Project Beta', 'Project Gamma', 'Client A', 'Client B',
    'Internal Development', 'Marketing Campaign', 'Sales Initiative', 'R&D'
  ];

  const receiptRequiredTypes = ['Travel', 'Meals', 'Equipment', 'Software', 'Training', 'Marketing'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (field === 'receipt') setReceiptPreview(event.target.result);
          else if (field === 'paymentProof') setPaymentProofPreview(event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        if (field === 'receipt') setReceiptPreview(null);
        else if (field === 'paymentProof') setPaymentProofPreview(null);
      }

      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  const removeAttachment = (field) => {
    setFormData(prev => ({ ...prev, [field]: null }));
    if (field === 'receipt') setReceiptPreview(null);
    else if (field === 'paymentProof') setPaymentProofPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.expenseType) newErrors.expenseType = 'Please select an expense type';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (receiptRequiredTypes.includes(formData.expenseType) && !formData.receipt) {
      newErrors.receipt = 'Receipt is required for this expense type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        id: Date.now(),
        status: 'Draft',
        createdAt: new Date().toISOString()
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-[70vh] bg-gray-50">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.expenseType ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select expense type</option>
                    {expenseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.expenseType && <p className="text-red-500 text-sm mt-1">{errors.expenseType}</p>}
                </div>
            {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
                  </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>
          {/* Project Name */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                  className={`w-full pl-8 pr-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
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
                </div>
                {/* Description */}
          <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
              className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Describe the expense..."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
          {/* Attachments Section */}
          <div className="md:col-span-2 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Receipt Upload */}
              <div>
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
                      onChange={(e) => handleFileChange(e, 'receipt')}
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
                        onClick={() => removeAttachment('receipt')}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                      {receiptPreview && (
                        <div className="mt-3">
                        <img src={receiptPreview} alt="Receipt preview" className="max-w-xs rounded border" />
                        </div>
                      )}
                    </div>
                  )}
                  {errors.receipt && <p className="text-red-500 text-sm mt-1">{errors.receipt}</p>}
                  {receiptRequiredTypes.includes(formData.expenseType) && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ Receipt is required for {formData.expenseType} expenses</p>
                  )}
            </div>

              {/* Payment Proof Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Payment Proof
                  <FaInfoCircle className="inline ml-1 text-gray-400 cursor-help" title="Upload payment proof image or PDF" />
                </label>
                {!formData.paymentProof ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'paymentProof')}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="payment-proof-upload"
                    />
                    <label htmlFor="payment-proof-upload" className="cursor-pointer">
                      <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">Upload Proof</p>
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FaFileAlt className="text-blue-600 text-xl" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formData.paymentProof.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.paymentProof.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment('paymentProof')}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                    {paymentProofPreview && (
                      <div className="mt-3">
                        <img src={paymentProofPreview} alt="Payment proof preview" className="max-w-xs rounded border" />
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm border-t border-gray-200 px-6 py-4 z-20">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
            Cancel
                  </button>
                  <button
                    type="submit"
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg flex items-center space-x-2 hover:bg-green-700"
                  >
                    <FaSave className="w-4 h-4" />
                    <span>Save Expense</span>
                  </button>
            </div>
          </div>
        </form>
  );
};

export default AddExpenseForm;