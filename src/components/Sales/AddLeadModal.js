import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { FaEdit, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';

const projectTypes = [
  'Residential',
  'Commercial',
  'Modular Kitchen',
  'Office Interior',
  'Retail Space',
  'Other'
];

const propertyTypes = [
  'Apartment',
  'Villa',
  'Independent House',
  'Duplex',
  'Penthouse',
  'Studio',
  'Office',
  'Shop',
  'Warehouse',
  'Plot',
  'Other'
];

const sources = [
  'Website',
  'Facebook',
  'Instagram',
  'Google Ads',
  'Referral',
  'Walk-in',
  'Phone Call',
  'Email',
  'Other'
];

const statuses = ['New', 'Contacted', 'Qualified', 'Quoted', 'Converted', 'Lost'];

const AddLeadModal = ({ isOpen, onClose, onSubmit, initialData, isManagerView = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    projectType: '',
    propertyType: '',
    address: '',
    budget: '',
    designStyle: '',
    leadSource: '',
    notes: [],
    status: 'New',
    rating: 0,
    salesRep: null,
    designer: null,
    callDescription: null,
    callHistory: [],
    nextCall: null,
    quotedAmount: null,
    finalQuotation: null,
    signupAmount: null,
    paymentDate: null,
    paymentMode: null,
    panNumber: null,
    discount: null,
    reasonForLost: null,
    reasonForJunk: null,
    submittedBy: null,
    paymentDetailsFileName: null,
    bookingFormFileName: null,
    newNote: '',
  });

  const [errors, setErrors] = useState({});

  // Mock data for sales persons and designers - in real app, this would come from API
  const salesPersons = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Mike Davis' },
    { id: 4, name: 'Lisa Wilson' },
  ];

  const designers = [
    { id: 1, name: 'Alex Chen' },
    { id: 2, name: 'Maria Garcia' },
    { id: 3, name: 'David Kim' },
    { id: 4, name: 'Emma Thompson' },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        contactNumber: '',
        email: '',
        projectType: '',
        propertyType: '',
        address: '',
        budget: '',
        designStyle: '',
        leadSource: '',
        notes: [],
        status: 'New',
        rating: 0,
        salesRep: null,
        designer: null,
        callDescription: null,
        callHistory: [],
        nextCall: null,
        quotedAmount: null,
        finalQuotation: null,
        signupAmount: null,
        paymentDate: null,
        paymentMode: null,
        panNumber: null,
        discount: null,
        reasonForLost: null,
        reasonForJunk: null,
        submittedBy: null,
        paymentDetailsFileName: null,
        bookingFormFileName: null,
        newNote: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      newErrors.contactNumber = 'Contact number must be 10 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.projectType) {
      newErrors.projectType = 'Project type is required';
    }

    if (!formData.leadSource) {
      newErrors.leadSource = 'Lead source is required';
    }

    // Additional validation for manager view
    if (isManagerView) {
      if (!formData.salesRep) {
        newErrors.salesRep = 'Sales person assignment is required';
      }
      if (!formData.designer) {
        newErrors.designer = 'Designer assignment is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAddNote = () => {
    if (formData.newNote && formData.newNote.trim() !== '') {
      const newNote = {
        text: formData.newNote,
        timestamp: new Date().toISOString(),
      };
      setFormData(prev => ({
        ...prev,
        notes: [...(prev.notes || []), newNote],
        newNote: '' // Clear the input field
      }));
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl max-h-[90vh] h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {initialData?.leadId ? 'Edit Lead' : 'Add New Lead'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable form content with extra bottom padding */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto pb-32">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Contact Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                placeholder="Enter contact number"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Project Type and Property Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type *
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.projectType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select project type</option>
                  {projectTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.projectType && <p className="text-red-500 text-sm mt-1">{errors.projectType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            {/* Area and Budget Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </label>
              <input
                type="text"
                placeholder="Enter budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Lead Source and Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Source *
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => handleInputChange('leadSource', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.leadSource ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select source</option>
                  {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                {errors.leadSource && <p className="text-red-500 text-sm mt-1">{errors.leadSource}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Design Style Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Design Style
              </label>
              <input
                type="text"
                placeholder="Enter design style preference"
                value={formData.designStyle}
                onChange={(e) => handleInputChange('designStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Sales Person and Designer Assignment Fields - Show in both views */}
            {isManagerView && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Sales Person *
                  </label>
                  <select
                    value={formData.salesRep || ''}
                    onChange={(e) => handleInputChange('salesRep', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.salesRep ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select sales person</option>
                    {salesPersons.map(person => (
                      <option key={person.id} value={person.name}>{person.name}</option>
                    ))}
                  </select>
                  {errors.salesRep && <p className="text-red-500 text-sm mt-1">{errors.salesRep}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Designer *
                  </label>
                  <select
                    value={formData.designer || ''}
                    onChange={(e) => handleInputChange('designer', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.designer ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select designer</option>
                    {designers.map(designer => (
                      <option key={designer.id} value={designer.name}>{designer.name}</option>
                    ))}
                  </select>
                  {errors.designer && <p className="text-red-500 text-sm mt-1">{errors.designer}</p>}
                </div>
              </div>
            )}

            {/* Notes Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new note..."
                  value={formData.newNote || ''}
                  onChange={(e) => handleInputChange('newNote', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border-gray-300"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300"
                  disabled={!formData.newNote || formData.newNote.trim() === ''}
                >
                  <FaPlus />
                </button>
              </div>

              {/* Display existing notes */}
              <div className="mt-2 space-y-2">
                {(formData.notes || []).map((note, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded-md text-sm">
                    <p>{note.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky footer for action buttons, outside scrollable area */}
          <div className="bg-white border-t shadow-lg flex items-center justify-end gap-3 p-6 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {initialData?.leadId ? 'Update Lead' : 'Add Lead'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddLeadModal;