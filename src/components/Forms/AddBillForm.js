import { useState } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash, FaUpload } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import HradminNavbar from '../HradminNavbar';

const AddBillForm = ({ onSubmit, onCancel }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const [activeTab, setActiveTab] = useState('billLines');
  const [formData, setFormData] = useState({
    // Header Fields
    vendor: '',
    gstin: '',
    billReference: '',
    billDate: '',
    dueDate: '',
    placeOfSupply: '',
    gstTreatment: 'regular',
    reverseCharge: false,
    currency: 'INR',
    company: '',
    journal: '',
    accountingDate: '',
    status: 'DRAFT',
    
    // Bill Lines
    billLines: [
      {
        id: 1,
        product: '',
        hsnSac: '',
        description: '',
        quantity: 1,
        uom: 'Nos',
        price: 0,
        gstPercent: 18,
        discount: 0,
        total: 0
      }
    ],
    
    // Other Info
    paymentTerms: '',
    recipientBank: '',
    ewayBillNo: '',
    transporter: '',
    vehicleNo: '',
    shippingAddress: '',
    billingAddress: '',
    vendorReference: '',
    purchaseRep: '',
    purchaseTeam: '',
    
    // Attachments/Notes
    attachments: [],
    internalNotes: ''
  });

  const [errors, setErrors] = useState({});

  // Sample data - in real app, this would come from APIs
  const vendors = [
    { id: 1, name: 'ABC Supplies Pvt Ltd', gstin: '27AABCS1234C1Z5' },
    { id: 2, name: 'XYZ Services Ltd', gstin: '27AABCS5678D2Z6' },
    { id: 3, name: 'Tech Solutions Inc', gstin: '27AABCS9012E3Z7' },
    { id: 4, name: 'Office Depot India', gstin: '27AABCS3456F4Z8' },
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Puducherry', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
    'Lakshadweep', 'Andaman and Nicobar Islands', 'Jammu and Kashmir', 'Ladakh'
  ];

  const gstTreatments = [
    { value: 'regular', label: 'Regular' },
    { value: 'composition', label: 'Composition' },
    { value: 'unregistered', label: 'Unregistered' },
    { value: 'import', label: 'Import' },
    { value: 'sez', label: 'SEZ' }
  ];

  const currencies = ['INR', 'USD', 'EUR', 'GBP'];
  
  const companies = ['Company A', 'Company B', 'Company C'];
  
  const journals = ['Purchase Journal', 'Expense Journal', 'Import Journal'];
  
  const uomOptions = ['Nos', 'Kg', 'Ltr', 'Mtr', 'Sqft', 'Box', 'Pcs'];
  
  const gstRates = [0, 5, 12, 18, 28];

  const products = [
    { id: 1, name: 'Office Supplies', hsnSac: '48239000' },
    { id: 2, name: 'Computer Equipment', hsnSac: '84713000' },
    { id: 3, name: 'Consulting Services', hsnSac: '998314' },
    { id: 4, name: 'Transportation Services', hsnSac: '996511' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Auto-fill GSTIN when vendor is selected
    if (name === 'vendor') {
      const selectedVendor = vendors.find(v => v.name === value);
      if (selectedVendor) {
        setFormData(prev => ({
          ...prev,
          vendor: value,
          gstin: selectedVendor.gstin
        }));
      }
    }

    // Auto-fill HSN/SAC when product is selected
    if (name.startsWith('billLines[') && name.includes('.product')) {
      const index = parseInt(name.match(/\[(\d+)\]/)[1]);
      const selectedProduct = products.find(p => p.name === value);
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          billLines: prev.billLines.map((line, i) => 
            i === index ? { ...line, product: value, hsnSac: selectedProduct.hsnSac } : line
          )
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBillLineChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      billLines: prev.billLines.map((line, i) => {
        if (i === index) {
          const updatedLine = { ...line, [field]: value };
          
          // Auto-calculate total when quantity, price, discount, or GST changes
          if (['quantity', 'price', 'discount', 'gstPercent'].includes(field)) {
            const qty = field === 'quantity' ? parseFloat(value) || 0 : line.quantity;
            const price = field === 'price' ? parseFloat(value) || 0 : line.price;
            const discount = field === 'discount' ? parseFloat(value) || 0 : line.discount;
            const gst = field === 'gstPercent' ? parseFloat(value) || 0 : line.gstPercent;
            
            const subtotal = qty * price;
            const discountAmount = subtotal * (discount / 100);
            const taxableAmount = subtotal - discountAmount;
            const gstAmount = taxableAmount * (gst / 100);
            const total = taxableAmount + gstAmount;
            
            updatedLine.total = parseFloat(total.toFixed(2));
          }
          
          return updatedLine;
        }
        return line;
      })
    }));
  };

  const addBillLine = () => {
    setFormData(prev => ({
      ...prev,
      billLines: [...prev.billLines, {
        id: Date.now(),
        product: '',
        hsnSac: '',
        description: '',
        quantity: 1,
        uom: 'Nos',
        price: 0,
        gstPercent: 18,
        discount: 0,
        total: 0
      }]
    }));
  };

  const removeBillLine = (index) => {
    if (formData.billLines.length > 1) {
      setFormData(prev => ({
        ...prev,
        billLines: prev.billLines.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Header validations
    if (!formData.vendor) {
      newErrors.vendor = 'Please select a vendor';
    }

    if (!formData.billReference.trim()) {
      newErrors.billReference = 'Bill reference is required';
    }

    if (!formData.billDate) {
      newErrors.billDate = 'Bill date is required';
    }

    if (!formData.placeOfSupply) {
      newErrors.placeOfSupply = 'Place of supply is required';
    }

    if (!formData.company) {
      newErrors.company = 'Please select a company';
    }

    if (!formData.journal) {
      newErrors.journal = 'Please select a journal';
    }

    // Check if due date is after bill date
    if (formData.billDate && formData.dueDate && new Date(formData.dueDate) < new Date(formData.billDate)) {
      newErrors.dueDate = 'Due date must be after bill date';
    }

    // Bill lines validation
    formData.billLines.forEach((line, index) => {
      if (!line.product) {
        newErrors[`billLine_${index}_product`] = 'Product is required';
      }
      if (!line.quantity || line.quantity <= 0) {
        newErrors[`billLine_${index}_quantity`] = 'Valid quantity is required';
      }
      if (!line.price || line.price < 0) {
        newErrors[`billLine_${index}_price`] = 'Valid price is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Calculate total amount from bill lines
      const totalAmount = formData.billLines.reduce((sum, line) => sum + line.total, 0);
      
      // Format the data before submitting
      const submitData = {
        ...formData,
        totalAmount,
        id: Date.now(), // In real app, this would be generated by backend
        createdAt: new Date().toISOString()
      };
      
      onSubmit(submitData);
    }
  };

  const renderVendorDetails = () => (    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vendor <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
              errors.vendor ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">🔍 Search & select vendor</option>
            {vendors.map(vendor => (
              <option key={vendor.id} value={vendor.name}>{vendor.name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.vendor && <p className="text-red-500 text-sm mt-1">{errors.vendor}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
        <input
          type="text"
          name="gstin"
          value={formData.gstin}
          readOnly
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          placeholder="Auto-filled from vendor"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          GST Treatment
          <span className="ml-2 text-xs text-gray-500 cursor-help" title="Select appropriate GST treatment type">ℹ️</span>
        </label>
        <select
          name="gstTreatment"
          value={formData.gstTreatment}
          onChange={handleChange}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {gstTreatments.map(treatment => (
            <option key={treatment.value} value={treatment.value}>{treatment.label}</option>
          ))}
        </select>
      </div>

      <div className="pt-2">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="reverseCharge"
            checked={formData.reverseCharge}
            onChange={handleChange}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-base font-medium text-gray-700">
            Reverse Charge
            <span className="ml-2 text-xs text-gray-500 cursor-help" title="Check if reverse charge mechanism applies">ℹ️</span>
          </span>
        </label>
      </div>
    </div>
  );

  const renderBillDetails = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bill Reference <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="billReference"
          value={formData.billReference}
          onChange={handleChange}
          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.billReference ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter invoice number"
        />
        {errors.billReference && <p className="text-red-500 text-sm mt-1">{errors.billReference}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bill Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            name="billDate"
            value={formData.billDate}
            onChange={handleChange}
            className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.billDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        {errors.billDate && <p className="text-red-500 text-sm mt-1">{errors.billDate}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
        <div className="relative">
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.dueDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Place of Supply <span className="text-red-500">*</span>
        </label>
        <select
          name="placeOfSupply"
          value={formData.placeOfSupply}
          onChange={handleChange}
          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.placeOfSupply ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select state</option>
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {errors.placeOfSupply && <p className="text-red-500 text-sm mt-1">{errors.placeOfSupply}</p>}
      </div>
    </div>
  );

  const renderCompanyInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company <span className="text-red-500">*</span>
        </label>
        <select
          name="company"
          value={formData.company}
          onChange={handleChange}
          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.company ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select company</option>
          {companies.map(company => (
            <option key={company} value={company}>{company}</option>
          ))}
        </select>
        {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            📝 {formData.status}
          </span>
        </div>
      </div>
    </div>
  );

  const renderBillLines = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xl font-semibold text-gray-900">Bill Line Items</h4>
          <p className="text-sm text-gray-500 mt-1">Add products/services with GST calculations</p>
        </div>
        <button
          type="button"
          onClick={addBillLine}
          className="flex items-center space-x-2 px-6 py-3 text-base font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-md"
        >
          <span>➕</span>
          <span>Add Line Item</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 top-0">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Product/Service <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">HSN/SAC</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">Description</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">Qty</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">UOM</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">Rate (₹)</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">GST%</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">Disc%</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">Amount (₹)</th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.billLines.map((line, index) => (
                <tr key={line.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-4 py-4 border-r border-gray-100">
                    <div className="relative">
                      <select
                        value={line.product}
                        onChange={(e) => handleBillLineChange(index, 'product', e.target.value)}
                        className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                          errors[`billLine_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">🔍 Select product/service</option>
                        {products.map(product => (
                          <option key={product.id} value={product.name}>{product.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors[`billLine_${index}_product`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`billLine_${index}_product`]}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <input
                      type="text"
                      value={line.hsnSac}
                      onChange={(e) => handleBillLineChange(index, 'hsnSac', e.target.value)}
                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      placeholder="Auto-filled"
                      readOnly
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => handleBillLineChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <input
                      type="number"
                      value={line.quantity}
                      onChange={(e) => handleBillLineChange(index, 'quantity', e.target.value)}
                      className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center ${
                        errors[`billLine_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1"
                      min="0"
                      step="0.01"
                    />
                    {errors[`billLine_${index}_quantity`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`billLine_${index}_quantity`]}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <select
                      value={line.uom}
                      onChange={(e) => handleBillLineChange(index, 'uom', e.target.value)}
                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {uomOptions.map(uom => (
                        <option key={uom} value={uom}>{uom}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <input
                      type="number"
                      value={line.price}
                      onChange={(e) => handleBillLineChange(index, 'price', e.target.value)}
                      className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right ${
                        errors[`billLine_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors[`billLine_${index}_price`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`billLine_${index}_price`]}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <select
                      value={line.gstPercent}
                      onChange={(e) => handleBillLineChange(index, 'gstPercent', e.target.value)}
                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {gstRates.map(rate => (
                        <option key={rate} value={rate}>{rate}%</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <input
                      type="number"
                      value={line.discount}
                      onChange={(e) => handleBillLineChange(index, 'discount', e.target.value)}
                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </td>
                  <td className="px-4 py-4 border-r border-gray-100">
                    <div className="text-base font-bold text-gray-900 bg-green-50 px-3 py-2 rounded-lg text-right">
                      ₹{line.total.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => removeBillLine(index)}
                      disabled={formData.billLines.length === 1}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 disabled:text-gray-400 disabled:bg-gray-50"
                      title="Remove this line item"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {formData.billLines.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg font-medium">No line items added yet</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Line Item" to get started with your bill</p>
          </div>
        )}
      </div>

      {formData.billLines.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ₹{formData.billLines.reduce((sum, line) => sum + (line.quantity * line.price * (1 - line.discount / 100)), 0).toFixed(2)}
              </div>
              <div className="text-sm text-blue-700 font-medium">Subtotal (Before GST)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ₹{formData.billLines.reduce((sum, line) => {
                  const lineTotal = line.quantity * line.price * (1 - line.discount / 100);
                  return sum + (lineTotal * line.gstPercent / 100);
                }, 0).toFixed(2)}
              </div>
              <div className="text-sm text-orange-700 font-medium">Total GST</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ₹{formData.billLines.reduce((sum, line) => sum + line.total, 0).toFixed(2)}
              </div>
              <div className="text-sm text-green-700 font-medium">Final Amount</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOtherInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
          <input
            type="text"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter payment terms"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Bank</label>
          <input
            type="text"
            name="recipientBank"
            value={formData.recipientBank}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter bank details"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-way Bill No.</label>
          <input
            type="text"
            name="ewayBillNo"
            value={formData.ewayBillNo}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter e-way bill number"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transporter</label>
          <input
            type="text"
            name="transporter"
            value={formData.transporter}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter transporter name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle No.</label>
          <input
            type="text"
            name="vehicleNo"
            value={formData.vehicleNo}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter vehicle number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Reference</label>
          <input
            type="text"
            name="vendorReference"
            value={formData.vendorReference}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter vendor reference"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
          <textarea
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter complete shipping address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
          <textarea
            name="billingAddress"
            value={formData.billingAddress}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter complete billing address"
          />
        </div>
      </div>
    </div>
  );

  const renderAttachments = () => (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Attachments</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
          <FaUpload className="mx-auto h-16 w-16 text-gray-400" />
          <div className="mt-4">
            <button
              type="button"
              className="text-lg text-blue-600 hover:text-blue-500 font-medium"
            >
              Click to upload files
            </button>
            <span className="text-gray-500 text-lg"> or drag and drop</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">PNG, JPG, PDF up to 10MB each</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Internal Notes</label>
        <textarea
          name="internalNotes"
          value={formData.internalNotes}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Add any internal notes, comments, or special instructions here..."
        />
      </div>
    </div>
  );

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
      {/* Header with Logo/Brand */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Bill</h1>
            <p className="text-sm text-gray-500">Register vendor bill for GST compliance</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Form Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Vendor Details
            </h3>
            {renderVendorDetails()}
          </div>

          {/* Bill Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Bill Details
            </h3>
            {renderBillDetails()}
          </div>

          {/* Company Info Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              Company Info
            </h3>
            {renderCompanyInfo()}
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'billLines', label: 'Bill Lines', icon: '📋' },
                { id: 'otherInfo', label: 'Other Info', icon: 'ℹ️' },
                { id: 'attachments', label: 'Attachments/Notes', icon: '📎' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-3 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'billLines' && renderBillLines()}
            {activeTab === 'otherInfo' && renderOtherInfo()}
            {activeTab === 'attachments' && renderAttachments()}
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-gray-900">
                Total Amount: ₹{formData.billLines.reduce((sum, line) => sum + line.total, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                {formData.billLines.length} line item{formData.billLines.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-base font-medium bg-blue-600 text-white border-2 border-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
              >
                Save Bill
              </button>
              <button
                type="button"
                className="px-8 py-3 text-base font-bold bg-green-600 text-white border-2 border-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                Confirm & Validate
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

export default AddBillForm; 