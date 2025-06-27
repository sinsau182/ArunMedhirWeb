import { useState } from 'react';
import { FaSave, FaTimes, FaUsers, FaInfoCircle } from 'react-icons/fa';

const AddClientForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    addressLine1: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});
  const indianStates = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ ...formData, id: Date.now() });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information<span className="text-red-500">*</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label>Client Name <span className="text-red-500">*</span></label>
                    <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.clientName ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                <div>
                    <label>Company Name</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full mt-2 px-4 py-2 border rounded-lg" />
                </div>
                 <div>
                    <label>Email <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                 <div>
                    <label>Phone <span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
            </div>
        </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label>Address</label>
                    <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="w-full mt-2 px-4 py-2 border rounded-lg" />
                </div>
                 <div>
                    <label>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full mt-2 px-4 py-2 border rounded-lg" />
                </div>
                <div>
                    <label>State</label>
                    <select name="state" value={formData.state} onChange={handleChange} className="w-full mt-2 px-4 py-2 border rounded-lg">
                        <option value="">Select State</option>
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
        </div>
        <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg">Save Client</button>
        </div>
      </div>
    </form>
  );
};
export default AddClientForm; 