import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash, FaChevronDown, FaChevronRight, FaBuilding, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaCreditCard, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import HradminNavbar from '../HradminNavbar';
import { useDispatch, useSelector } from 'react-redux';
import { addVendor } from '../../redux/slices/vendorSlice';
import { toast } from 'sonner';

const steps = [
  { label: 'Basic Details' },
  { label: 'Contact & Address' },
  { label: 'Compliance & Banking' },
];

const AddVendorForm = ({ onSubmit, onCancel }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.vendors);
  const [step, setStep] = useState(1);

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
    notes: '',

    // Compliance & Banking
    accountHolderName: '',
    branchName: '',
    accountType: '',
    confirmAccountNumber: '',
    upiId: ''
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
    // console.log('Submit button clicked');
    console.log(validateForm());
    
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
    } else {
      toast.error('Please fill all the required fields');
      // toast.error(errors);
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

  // --- Step Content Renderers ---
  const renderStepContent = () => {
    switch (step) {
      case 1:
  return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaBuilding className="text-gray-400" /> Basic Details
                </h2>
              </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter vendor name"
              />
            </div>
              {/* Vendor Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Type <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-6 h-full">
                  <label className="inline-flex items-center">
                    <input type="radio" name="companyType" value="Company" checked={formData.companyType === 'Company'} onChange={handleChange} className="form-radio text-blue-600" />
                    <span className="ml-2">Company</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="companyType" value="Individual" checked={formData.companyType === 'Individual'} onChange={handleChange} className="form-radio text-blue-600" />
                    <span className="ml-2">Individual</span>
              </label>
                </div>
              </div>
              {/* Vendor Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Category <span className="text-red-500">*</span></label>
              <select
                  name="vendorCategory"
                  value={formData.vendorCategory || ''}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                  <option value="">Select vendor category</option>
                  <option value="Goods">Goods</option>
                  <option value="Services">Services</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Contractor">Contractor</option>
                  {/* Add more categories as needed */}
              </select>
            </div>
            {/* GSTIN */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">GSTIN <span className="text-gray-400 ml-1"><FaInfoCircle title="15-digit Goods and Services Tax Identification Number" /></span></label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter GSTIN"
                  maxLength={15}
              />
                <div className="text-xs text-gray-400 mt-1">15-digit Goods and Services Tax Identification Number</div>
            </div>
            {/* PAN */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter PAN"
                  maxLength={10}
              />
                <div className="text-xs text-gray-400 mt-1">10-character Permanent Account Number</div>
            </div>
              {/* Tax Treatment */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Treatment</label>
              <select
                  name="taxTreatment"
                  value={formData.taxTreatment || ''}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select tax treatment</option>
                  <option value="Registered">Registered</option>
                  <option value="Unregistered">Unregistered</option>
                  <option value="Composition">Composition</option>
                  <option value="Consumer">Consumer</option>
                  {/* Add more as needed */}
              </select>
              </div>
            </div>
            </div>
            </div>
        );
      case 2:
        return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaUser className="text-gray-400" /> Contact & Address Information
                </h2>
              </div>

              {/* Contact Information Section */}
              <div className="flex items-center mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Contact Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name <span className="text-red-500">*</span></label>
              <input
                  type="text"
                  name="contactName"
                  value={formData.contactName || ''}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter full name"
              />
            </div>
              {/* Email Address */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                  name="contactEmail"
                  value={formData.contactEmail || ''}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="contact@vendor.com"
              />
              </div>
              {/* Phone Number */}
              <div className="flex gap-2 items-end">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <select className="border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled>
                      <option>+91</option>
                    </select>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-base border-t border-b border-r border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
              {/* Mobile Number */}
              <div className="flex gap-2 items-end">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <div className="flex">
                    <select className="border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled>
                      <option>+91</option>
                    </select>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-base border-t border-b border-r border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="flex items-center mb-4 mt-8">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1 || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Building name, street address"
                />
              </div>
              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2 || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
          </div>
              {/* City */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
              <input
                type="text"
                  name="city"
                  value={formData.city || ''}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter city"
              />
            </div>
              {/* State/Province */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province <span className="text-red-500">*</span></label>
              <input
                type="text"
                  name="state"
                  value={formData.state || ''}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter state or province"
              />
            </div>
              {/* PIN/ZIP Code */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PIN/ZIP Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                  name="pinCode"
                  value={formData.pinCode || ''}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter PIN or ZIP code"
              />
              </div>
            </div>
            </div>
            </div>
        );
      case 3:
        return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaCreditCard className="text-gray-400" /> Compliance & Banking
                </h2>
              </div>
              <p className="text-gray-500 mb-6">
                Please provide the vendor's banking information for payments and transactions.
              </p>
              {/* Bank Account Information Section */}
              <div className="flex items-center mb-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Bank Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Holder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter account holder name"
                />
              </div>
              {/* Branch Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter branch name"
                />
              </div>
              {/* Bank Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name <span className="text-red-500">*</span></label>
              <select
                  name="bankName"
                  value={formData.bankName || ''}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                  <option value="">Select bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="Axis">Axis Bank</option>
                  <option value="PNB">Punjab National Bank</option>
                  {/* Add more banks as needed */}
              </select>
            </div>
              {/* Account Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type <span className="text-red-500">*</span></label>
              <select
                  name="accountType"
                  value={formData.accountType || ''}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                  <option value="">Select account type</option>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="OD">Overdraft</option>
                  {/* Add more types as needed */}
              </select>
            </div>
              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter account number"
                />
              </div>
              {/* Confirm Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Account Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Re-enter account number"
                />
              </div>
              {/* IFSC Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ENTER IFSC CODE"
                  maxLength={11}
                />
                <div className="text-xs text-gray-400 mt-1">11-character alphanumeric code</div>
              </div>
              {/* UPI ID */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID <span className="text-xs text-gray-400 font-normal ml-1">(Optional)</span></label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="example@paytm or example@upi"
                />
                <div className="text-xs text-gray-400 mt-1">For quick digital payments</div>
              </div>
            </div>
            </div>
            </div>
        );
      default:
        return null;
    }
  };

  // --- Progress Bar ---
  const renderProgressBar = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((s, idx) => {
          const isActive = step === idx + 1;
          const isCompleted = step > idx + 1;
          return (
            <div key={s.label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center w-[60%]"> 
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-blue-600 border-blue-600 text-white' : isCompleted ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                  <span className="font-bold text-sm">{idx + 1}</span>
              </div>
                <span className={`mt-2 text-xs font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded ${step > idx + 1 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // --- Navigation Buttons ---
  const renderNavButtons = () => (
    <div className="border-t border-gray-200 bg-white px-6 py-4 sticky bottom-0 z-10">
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          disabled={step === 1}
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            className="px-6 py-2 border border-blue-300 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            Save Draft
          </button>
          {step < steps.length ? (
              <button
                type="button"
              onClick={() => setStep((s) => Math.min(steps.length, s + 1))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
              Next
              </button>
          ) : (
              <button
                type="button"
                onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
              Submit
              </button>
          )}
        </div>
      </div>
    </div>
  );

  console.log(steps)
  console.log(step)

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
        <div className="min-h-screen bg-gray-50">
          {/* Fixed Header */}
          <div className="sticky top-16 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FaBuilding className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Add New Vendor</h1>
                    <p className="text-sm text-gray-500">Register vendor with GST and compliance details</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">Draft</span>
              </div>
            </div>
          </div>
          
          {/* Form Content */}
          <div className="px-4 py-8 max-w-7xl mx-auto pb-24">
            {/* Progress Bar */}
            {renderProgressBar()}
            {/* Step Content */}
            {renderStepContent()}
          </div>
          
          {/* Navigation Buttons - Sticky Bottom */}
          {renderNavButtons()}
        </div>
      </div>
    </div>
  );
};

export default AddVendorForm;