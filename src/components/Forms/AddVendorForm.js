import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash, FaChevronDown, FaChevronRight, FaBuilding, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaCreditCard, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import HradminNavbar from '../HradminNavbar';
import { useDispatch, useSelector } from 'react-redux';
import { addVendor } from '../../redux/slices/vendorSlice';
import { toast } from 'sonner';

const AddVendorForm = ({ onSubmit, onCancel }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.vendors);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const [formData, setFormData] = useState({
    // Basic Information
    vendorName: '',
    companyId: 'CID101',
    companyType: 'Company', // Company or Individual
    gstin: '',
    pan: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    phone: '',
    mobile: '',
    email: '',
    website: '',
    vendorTags: [],
    
    // Contacts & Addresses
    contactAddresses: [],
    
    // Banking Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    
    // Sales & Purchase Info
    paymentTerms: '',
    priceList: '',
    fiscalPosition: '',
    productsServices: [],
    
    // Accounting Info
    accountPayable: '',
    accountReceivable: '',
    
    // Internal Notes
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({
    contactAddresses: true,
    banking: true,
    salesPurchase: true,
    accounting: true,
    notes: true
  });

  // Static data - in real app, these would come from APIs
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Puducherry', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
    'Lakshadweep', 'Andaman and Nicobar Islands', 'Jammu and Kashmir', 'Ladakh'
  ];

  const paymentTermsOptions = [
    '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', 'Immediate', 'Net 10', 'Net 15', 'Net 30'
  ];

  const priceListOptions = [
    'Standard Price List', 'Wholesale Price List', 'Retail Price List', 'Special Rate'
  ];

  const fiscalPositionOptions = [
    'Domestic', 'Export', 'Import', 'SEZ', 'Interstate', 'Intrastate'
  ];

  const productsServicesOptions = [
    'Office Supplies', 'Computer Equipment', 'Software Services', 'Consulting Services',
    'Transportation Services', 'Maintenance Services', 'Raw Materials', 'Finished Goods'
  ];

  const accountOptions = [
    'Account Payable - Domestic', 'Account Payable - Import', 'Account Receivable - Domestic',
    'Account Receivable - Export', 'Sundry Creditors', 'Sundry Debtors'
  ];

  const vendorTagOptions = [
    'Critical Supplier', 'Preferred Vendor', 'Local Supplier', 'International Supplier',
    'Service Provider', 'Raw Material Supplier', 'Equipment Supplier', 'Contractor'
  ];

  const contactTypes = ['Billing', 'Shipping', 'Finance', 'Technical', 'Sales', 'Support'];

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

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value) 
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const handleContactChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      contactAddresses: prev.contactAddresses.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contactAddresses: [...prev.contactAddresses, {
        id: Date.now(),
        name: '',
        phone: '',
        email: '',
        type: 'Billing'
      }]
    }));
  };

  const removeContact = (index) => {
    setFormData(prev => ({
      ...prev,
      contactAddresses: prev.contactAddresses.filter((_, i) => i !== index)
    }));
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic Information validations
    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    }

    if (!formData.gstin.trim()) {
      newErrors.gstin = 'GSTIN is required';
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format';
    }

    if (!formData.pan.trim()) {
      newErrors.pan = 'PAN is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = 'Invalid PAN format';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN Code is required';
    } else if (!/^[0-9]{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Invalid PIN Code format';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Banking details validation (if provided)
    if (formData.accountNumber && !formData.bankName) {
      newErrors.bankName = 'Bank name is required when account number is provided';
    }

    if (formData.accountNumber && !formData.ifscCode) {
      newErrors.ifscCode = 'IFSC code is required when account number is provided';
    }

    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        id: Date.now(),
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      try {
        const result = await dispatch(addVendor(submitData)).unwrap();
        if (result) {
          toast.success('Vendor added successfully!');
          onCancel();
        }
      } catch (err) {
        toast.error(err);
      }
    }
  };

  const renderCollapsibleSection = (title, section, icon, children) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {collapsedSections[section] ? (
          <FaChevronRight className="w-5 h-5 text-gray-400" />
        ) : (
          <FaChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {!collapsedSections[section] && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {children}
        </div>
      )}
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FaBuilding className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Vendor</h1>
            <p className="text-sm text-gray-500">Register vendor with GST and compliance details</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Basic Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Basic Information
            <span className="ml-2 text-red-500">*</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.vendorName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter vendor name"
              />
              {errors.vendorName && <p className="text-red-500 text-sm mt-1">{errors.vendorName}</p>}
            </div>

            {/* Company Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company/Individual <span className="text-red-500">*</span>
              </label>
              <select
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Company">Company</option>
                <option value="Individual">Individual</option>
              </select>
            </div>

            {/* GSTIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GSTIN <span className="text-red-500">*</span>
                <FaInfoCircle className="inline ml-1 text-gray-400 cursor-help" title="GST Identification Number (15 characters)" />
              </label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.gstin ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="22AAAAA0000A1Z5"
                maxLength="15"
              />
              {errors.gstin && <p className="text-red-500 text-sm mt-1">{errors.gstin}</p>}
            </div>

            {/* PAN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN <span className="text-red-500">*</span>
                <FaInfoCircle className="inline ml-1 text-gray-400 cursor-help" title="Permanent Account Number (10 characters)" />
              </label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.pan ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="AAAPL1234C"
                maxLength="10"
              />
              {errors.pan && <p className="text-red-500 text-sm mt-1">{errors.pan}</p>}
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter address line 1"
              />
              {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter address line 2 (optional)"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select state</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.pinCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="560001"
                maxLength="6"
              />
              {errors.pinCode && <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="080-12345678"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91-9876543210"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="vendor@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.example.com"
              />
            </div>

            {/* Vendor Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {vendorTagOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleMultiSelect('vendorTags', tag)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.vendorTags.includes(tag)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">Click tags to select/deselect</p>
            </div>
          </div>
        </div>
        

        {/* Contacts & Addresses Section */}
        {renderCollapsibleSection(
          'Contacts & Addresses',
          'contacts',
          <FaPhone className="text-blue-600" />,
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Add multiple contacts or addresses</p>
              <button
                type="button"
                onClick={addContact}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <FaPlus className="w-3 h-3" />
                <span>Add Contact</span>
              </button>
            </div>
            
            {formData.contactAddresses.map((contact, index) => (
              <div key={contact.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Contact #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contact name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={contact.type}
                      onChange={(e) => handleContactChange(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {contactTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email address"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {formData.contactAddresses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FaPhone className="mx-auto text-4xl mb-2 text-gray-300" />
                <p>No contacts added yet</p>
                <p className="text-sm">Click "Add Contact" to add contact information</p>
              </div>
            )}
          </div>
        )}

        {/* Banking Details Section */}
        {renderCollapsibleSection(
          'Banking Details',
          'banking',
          <FaCreditCard className="text-blue-600" />,
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.bankName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="State Bank of India"
              />
              {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1234567890"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code
                <FaInfoCircle className="inline ml-1 text-gray-400 cursor-help" title="Indian Financial System Code" />
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.ifscCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="SBIN0001234"
                maxLength="11"
              />
              {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}
            </div>
          </div>
        )}

        {/* Sales & Purchase Info Section */}
        {renderCollapsibleSection(
          'Sales & Purchase Info',
          'salesPurchase',
          <FaFileAlt className="text-blue-600" />,
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select payment terms</option>
                {paymentTermsOptions.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price List</label>
              <select
                name="priceList"
                value={formData.priceList}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select price list</option>
                {priceListOptions.map(list => (
                  <option key={list} value={list}>{list}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fiscal Position</label>
              <select
                name="fiscalPosition"
                value={formData.fiscalPosition}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select fiscal position</option>
                {fiscalPositionOptions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Products/Services</label>
              <div className="flex flex-wrap gap-2">
                {productsServicesOptions.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleMultiSelect('productsServices', item)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.productsServices.includes(item)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Accounting Info Section */}
        {renderCollapsibleSection(
          'Accounting Info',
          'accounting',
          <FaFileAlt className="text-blue-600" />,
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Payable</label>
              <select
                name="accountPayable"
                value={formData.accountPayable}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select account payable</option>
                {accountOptions.filter(acc => acc.includes('Payable') || acc.includes('Creditors')).map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Receivable</label>
              <select
                name="accountReceivable"
                value={formData.accountReceivable}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select account receivable</option>
                {accountOptions.filter(acc => acc.includes('Receivable') || acc.includes('Debtors')).map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Internal Notes Section */}
        {renderCollapsibleSection(
          'Internal Notes',
          'notes',
          <FaFileAlt className="text-blue-600" />,
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Internal notes about the vendor..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
              className="px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaSave className="w-4 h-4" />
              <span>Save Vendor</span>
            </button>
          </div>
        </div>
      </div>
    </form>
    </div>
    </div>
  );
};

export default AddVendorForm;