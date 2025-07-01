import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { FaRupeeSign } from 'react-icons/fa';

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

const priorityOptions = [
  { value: 'Low', label: 'Low', stars: 1, color: 'text-gray-400' },
  { value: 'Medium', label: 'Medium', stars: 2, color: 'text-orange-400' },
  { value: 'High', label: 'High', stars: 3, color: 'text-yellow-400' },
];

const AddLeadModal = ({ isOpen, onClose, onSubmit, initialData, isManagerView = false, salesPersons = [], designers = [] }) => {
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
    notes: '',
    priority: 'Low',
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
    dateOfCreation: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, priority: initialData.priority || 'Low', dateOfCreation: initialData.dateOfCreation || new Date().toISOString().split('T')[0] });
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
        notes: '',
        priority: 'Low',
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
        dateOfCreation: new Date().toISOString().split('T')[0],
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg max-h-[70vh] h-auto flex flex-col border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              {initialData?.leadId ? 'Edit Lead' : 'Add New Lead'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable form content with extra bottom padding */}
          <div className="p-5 space-y-4 flex-1 overflow-y-auto bg-gray-50">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-blue-500 font-bold">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Contact Number Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contact Number <span className="text-blue-500 font-bold">*</span>
              </label>
              <Input
                type="tel"
                placeholder="Enter contact number"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.contactNumber ? 'border-red-500' : ''}`}
              />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email <span className="text-blue-500 font-bold">*</span>
              </label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Project Type and Property Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Project Type <span className="text-blue-500 font-bold">*</span>
                </label>
                <Select
                  value={formData.projectType}
                  onValueChange={value => handleInputChange('projectType', value)}
                >
                  <SelectTrigger className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.projectType ? 'border-red-500' : ''} hover:border-blue-400` }>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg">
                    {projectTypes.map(type => (
                      <SelectItem key={type} value={type} className="text-xs hover:bg-blue-50 focus:bg-blue-100 rounded-md">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectType && <p className="text-red-500 text-xs mt-1">{errors.projectType}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <Select
                  value={formData.propertyType}
                  onValueChange={value => handleInputChange('propertyType', value)}
                >
                  <SelectTrigger className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 hover:border-blue-400">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg">
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type} className="text-xs hover:bg-blue-50 focus:bg-blue-100 rounded-md">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input
                type="text"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150"
              />
            </div>

            {/* Budget Field with Rupee Icon */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <FaRupeeSign className="w-4 h-4" />
                </span>
                <Input
                  type="text"
                  placeholder="Enter budget"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 pl-8"
                />
              </div>
            </div>

            {/* Priority Row (replaces Status) */}
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Lead Source <span className="text-blue-500 font-bold">*</span>
                </label>
                <Select
                  value={formData.leadSource}
                  onValueChange={value => handleInputChange('leadSource', value)}
                >
                  <SelectTrigger className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.leadSource ? 'border-red-500' : ''} hover:border-blue-400`}>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg">
                    {sources.map(source => (
                      <SelectItem key={source} value={source} className="text-xs hover:bg-blue-50 focus:bg-blue-100 rounded-md">
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.leadSource && <p className="text-red-500 text-xs mt-1">{errors.leadSource}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Priority
                  <span className="flex items-center ml-1">
                    {(() => {
                      const selected = priorityOptions.find(p => p.value === formData.priority) || priorityOptions[0];
                      return Array.from({ length: 3 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < selected.stars ? selected.color : 'text-gray-200'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                        </svg>
                      ));
                    })()}
                  </span>
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={value => handleInputChange('priority', value)}
                >
                  <SelectTrigger className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 hover:border-blue-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg">
                    {priorityOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs hover:bg-blue-50 focus:bg-blue-100 rounded-md">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Design Style and Date of Creation Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Design Style
                </label>
                <Input
                  type="text"
                  placeholder="Enter design style preference"
                  value={formData.designStyle}
                  onChange={(e) => handleInputChange('designStyle', e.target.value)}
                  className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date of Creation
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.dateOfCreation}
                    onChange={e => handleInputChange('dateOfCreation', e.target.value)}
                    className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 pr-8"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Sales Person and Designer Assignment Fields - Show in manager view only, and only these two fields */}
            {isManagerView && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Assign Sales Person <span className="text-blue-500 font-bold">*</span>
                  </label>
                  <Select
                    value={formData.salesRep || ''}
                    onValueChange={value => handleInputChange('salesRep', value)}
                  >
                    <SelectTrigger className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.salesRep ? 'border-red-500' : ''} hover:border-blue-400`}>
                      <SelectValue placeholder="Select sales person" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg shadow-lg">
                      {salesPersons.map(person => (
                        <SelectItem key={person.id} value={person.name} className="text-xs hover:bg-blue-50 focus:bg-blue-100 rounded-md">
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.salesRep && <p className="text-red-500 text-xs mt-1">{errors.salesRep}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Assign Designer <span className="text-blue-500 font-bold">*</span>
                  </label>
                  <Select
                    value={formData.designer || ''}
                    onValueChange={value => handleInputChange('designer', value)}
                  >
                    <SelectTrigger className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.designer ? 'border-red-500' : ''} hover:border-blue-400`}>
                      <SelectValue placeholder="Select designer" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg shadow-lg">
                      {designers.map(designer => (
                        <SelectItem key={designer.id} value={designer.name} className="text-xs hover:bg-blue-50 focus:bg-blue-100 rounded-md">
                          {designer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.designer && <p className="text-red-500 text-xs mt-1">{errors.designer}</p>}
                </div>
              </div>
            )}

            {/* Notes Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes
              </label>
              <Input
                as="textarea"
                placeholder="Enter any additional notes or requirements"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 min-h-[36px]"
              />
            </div>
          </div>

          {/* Sticky footer for action buttons, outside scrollable area */}
          <div className="bg-white border-t shadow-lg flex items-center justify-end gap-2 p-4 z-10 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs transition-all duration-150"
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