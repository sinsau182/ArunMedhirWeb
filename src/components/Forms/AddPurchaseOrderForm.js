import { useState, useRef } from 'react';
import { FaBuilding, FaPaperclip, FaPlus, FaTrash, FaShippingFast, FaFilePdf, FaFileImage, FaTimes } from 'react-icons/fa';
import PurchaseOrderPreview from '../Previews/PurchaseOrderPreview';

const AddPurchaseOrderForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    vendor: null,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    notes: '',
    company: null,
    shippingAddress: '',
    items: [{
      id: 1,
      itemName: 'Sample Item',
      description: 'A sample item for this PO.',
      hsnCode: '998877',
      gstRate: 18,
      quantity: 2,
      rate: 150,
      unit: 'PCS'
    }],
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [showDeleteIdx, setShowDeleteIdx] = useState(null);
  const [activeTab, setActiveTab] = useState('poItems');
  const [previewFile, setPreviewFile] = useState(null);
  const inputRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  // In a real app, this would come from an API
  const [vendors] = useState([
    { id: 1, name: 'Acme Ltd.', gstin: '27ABCDE1234F1Z5', address: '123 Business Park, Mumbai' },
    { id: 2, name: 'XYZ India', gstin: '29XYZE5678K9Z2', address: '456 Tech Park, Pune' },
    { id: 3, name: 'Tech Solutions', gstin: '29TECH5678K9Z3', address: '789 Innovation Hub, Bangalore' },
  ]);

  const [companies] = useState([
    { id: 1, name: 'ABC Pvt Ltd', gstin: '27AABCU9876A1Z5', address: '1st Floor, Innovation Tower,\nCybercity, Ebene,\nMauritius' },
    { id: 2, name: 'DEF Solutions', gstin: '29AABCD1234A1Z5', address: 'Global Village Tech Park,\nRR Nagar, Bangalore,\nIndia - 560098' },
  ]);

  const unitOptions = ['PCS', 'KG', 'LTR', 'MTR', 'NOS', 'BOX', 'SET'];
  const gstRates = [0, 5, 12, 18, 28];
  
  const handleVendorChange = (e) => {
    const vendorId = e.target.value;
    const selected = vendors.find(v => v.id === Number(vendorId));
    setFormData(prev => ({...prev, vendor: selected}));
    if (errors.vendor) setErrors(prev => ({...prev, vendor: null}));
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    const selected = companies.find(c => c.id === Number(companyId));
    setFormData(prev => ({
        ...prev,
        company: selected,
        shippingAddress: selected ? selected.address : ''
    }));
    if (errors.company) setErrors(prev => ({...prev, company: null}));
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleItemChange = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
    }));
  };
  
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      itemName: '',
      description: '',
      hsnCode: '',
      gstRate: 18,
      quantity: 1,
      rate: 0,
      unit: 'PCS'
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };
  
  const handleDeleteLine = (idx) => setShowDeleteIdx(idx);
  const confirmDeleteLine = () => {
    setFormData(prev => ({...prev, items: prev.items.filter((_, i) => i !== showDeleteIdx)}));
    setShowDeleteIdx(null);
  };
  const cancelDeleteLine = () => setShowDeleteIdx(null);

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = files.filter(f => /pdf|jpg|jpeg|png/i.test(f.type));
    setFormData(prev => ({...prev, attachments: [...prev.attachments, ...allowed]}));
  };

  const handleRemoveAttachment = (idx) => {
    setFormData(prev => ({...prev, attachments: prev.attachments.filter((_, i) => i !== idx)}));
  };

  const handlePreviewAttachment = (file) => {
    setPreviewFile(file);
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const totalGst = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate * (item.gstRate / 100)), 0);
    const grandTotal = subtotal + totalGst;
    return { subtotal, totalGst, grandTotal };
  };
  
  const { subtotal, totalGst, grandTotal } = calculateTotals();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vendor) newErrors.vendor = 'Vendor is required.';
    if (!formData.orderDate) newErrors.orderDate = 'Order date is required.';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required.';
    if (!formData.company) newErrors.company = 'Company is required.';
    if (!formData.shippingAddress) newErrors.shippingAddress = 'Shipping address is required.';
    if (new Date(formData.deliveryDate) < new Date(formData.orderDate)) {
      newErrors.deliveryDate = 'Delivery date cannot be before order date.';
    }
    formData.items.forEach((item, index) => {
      if (!item.itemName) newErrors[`itemName_${index}`] = 'Item name is required.';
      if (item.quantity <= 0) newErrors[`quantity_${index}`] = 'Qty must be > 0.';
      if (item.rate <= 0) newErrors[`rate_${index}`] = 'Rate must be > 0.';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const poData = {
        ...formData,
        ...calculateTotals(),
        vendorName: formData.vendor.name,
        vendorGstin: formData.vendor.gstin,
        companyName: formData.company.name,
        status: 'Draft'
      };
      onSubmit(poData);
    }
  };

  return (
    <div className="w-full relative pb-20">
      {/* Form Content */}
      <div className="space-y-6">
        {/* Top Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Vendor Details */}
          <div className="space-y-4">
             <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBuilding className="text-gray-400" /> Vendor Details
              </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name <span className="text-red-500">*</span></label>
              <select
                className={`w-full border rounded-lg px-3 py-2 ${errors.vendor ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.vendor?.id || ''}
                onChange={handleVendorChange}
              >
                <option value="">Select Vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              {errors.vendor && <p className="text-xs text-red-500 mt-1">{errors.vendor}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
              <input type="text" readOnly value={formData.vendor?.gstin || ''} className="w-full bg-gray-50 border-gray-300 rounded-lg px-3 py-2"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea readOnly value={formData.vendor?.address || ''} className="w-full bg-gray-50 border-gray-300 rounded-lg px-3 py-2" rows="3"/>
            </div>
          </div>
          
          {/* PO Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaPaperclip className="text-gray-400" /> PO Details
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PO Number</label>
              <input type="text" readOnly value={formData.poNumber} className="w-full bg-gray-50 border-gray-300 rounded-lg px-3 py-2"/>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Date <span className="text-red-500">*</span></label>
                <input 
                  type="date"
                  className={`w-full border rounded-lg px-3 py-2 ${errors.orderDate ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.orderDate}
                  onChange={(e) => handleChange('orderDate', e.target.value)}
                />
                {errors.orderDate && <p className="text-xs text-red-500 mt-1">{errors.orderDate}</p>}
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  className={`w-full border rounded-lg px-3 py-2 ${errors.deliveryDate ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.deliveryDate}
                  min={formData.orderDate}
                  onChange={(e) => handleChange('deliveryDate', e.target.value)}
                />
                {errors.deliveryDate && <p className="text-xs text-red-500 mt-1">{errors.deliveryDate}</p>}
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  placeholder="Notes or terms for the PO"
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-2"
                ></textarea>
            </div>
          </div>

          {/* Ship To Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaShippingFast className="text-gray-400" /> Ship To
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company <span className="text-red-500">*</span></label>
              <select
                className={`w-full border rounded-lg px-3 py-2 ${errors.company ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.company?.id || ''}
                onChange={handleCompanyChange}
              >
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address <span className="text-red-500">*</span></label>
              <textarea
                rows="5"
                className={`w-full border rounded-lg px-3 py-2 ${errors.shippingAddress ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.shippingAddress}
                onChange={(e) => handleChange('shippingAddress', e.target.value)}
                placeholder="Enter shipping address"
              />
              {errors.shippingAddress && <p className="text-xs text-red-500 mt-1">{errors.shippingAddress}</p>}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
            <div className="flex">
                <button 
                  type="button" 
                  className={`px-6 py-3 border-b-2 font-semibold transition-colors ${
                    activeTab === 'poItems' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`} 
                  onClick={() => setActiveTab('poItems')}
                >
                  PO Items
                </button>
                <button 
                  type="button" 
                  className={`px-6 py-3 border-b-2 font-semibold transition-colors ${
                    activeTab === 'attachments' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`} 
                  onClick={() => setActiveTab('attachments')}
                >
                  Attachments
                </button>
            </div>
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'poItems' && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Items</h3>
                <button type="button" onClick={addItem} className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700">
                  <FaPlus size={12} /> Add New Item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr className="text-left text-gray-600 font-medium">
                      <th className="p-3 w-1/4">Item</th>
                      <th className="p-3 w-1/3">Description</th>
                      <th className="p-3">HSN</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Rate</th>
                      <th className="p-3">GST%</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2"><input type="text" placeholder="Item Name" value={item.itemName} onChange={e => handleItemChange(item.id, 'itemName', e.target.value)} className={`w-full border rounded-md p-2 ${errors[`itemName_${index}`] ? 'border-red-400' : 'border-gray-200'}`} /></td>
                          <td className="p-2"><input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="w-full border-gray-200 rounded-md p-2" /></td>
                          <td className="p-2"><input type="text" placeholder="HSN" value={item.hsnCode} onChange={e => handleItemChange(item.id, 'hsnCode', e.target.value)} className="w-full border-gray-200 rounded-md p-2" /></td>
                          <td className="p-2"><input type="number" placeholder="1" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} className={`w-20 border rounded-md p-2 ${errors[`quantity_${index}`] ? 'border-red-400' : 'border-gray-200'}`} /></td>
                          <td className="p-2">
                            <select value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} className="w-full border-gray-200 rounded-md p-2">
                              {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td className="p-2"><input type="number" placeholder="0.00" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} className={`w-24 border rounded-md p-2 ${errors[`rate_${index}`] ? 'border-red-400' : 'border-gray-200'}`} /></td>
                          <td className="p-2">
                            <select value={item.gstRate} onChange={e => handleItemChange(item.id, 'gstRate', parseFloat(e.target.value))} className="w-full border-gray-200 rounded-md p-2">
                              {gstRates.map(r => <option key={r} value={r}>{r}%</option>)}
                            </select>
                          </td>
                          <td className="p-2 text-center"><button type="button" onClick={() => handleDeleteLine(index)} className="text-gray-400 hover:text-red-500"><FaTrash /></button></td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 p-4 flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>GST</span><span>{totalGst.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total</span><span>{grandTotal.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <label htmlFor="attachment-upload" className="flex flex-col items-center justify-center cursor-pointer">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-2">
                        <FaPaperclip className="text-2xl text-blue-500" />
                    </div>
                    <button
                        type="button"
                        className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                        onClick={e => {
                            e.preventDefault();
                            if (inputRef.current) inputRef.current.click();
                        }}
                    >
                        Add Attachment
                    </button>
                    <input
                        id="attachment-upload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
                        onChange={handleAttachmentChange}
                        ref={inputRef}
                    />
                </label>
                <div className="text-sm text-gray-400 mt-2 mb-6">PDF, JPG, PNG allowed</div>
                
                {formData.attachments.length > 0 && (
                  <div className="w-full max-w-2xl">
                      <ul className="divide-y divide-gray-200 bg-gray-50 rounded-lg shadow-inner p-4">
                          {formData.attachments.map((file, idx) => (
                              <li key={idx} className="flex items-center justify-between py-2">
                                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => handlePreviewAttachment(file)}>
                                      {/pdf/i.test(file.type) ? (
                                          <FaFilePdf className="text-red-500 text-lg" />
                                      ) : (
                                          <FaFileImage className="text-blue-500 text-lg" />
                                      )}
                                      <span className="text-gray-800 font-medium text-sm truncate max-w-xs">{file.name}</span>
                                  </div>
                                  <button type="button" className="text-gray-500 hover:text-red-700 ml-4" onClick={() => handleRemoveAttachment(idx)}>
                                      <FaTimes />
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
      
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="text-lg font-bold">
                    Grand Total: <span className="text-blue-600">₹{grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                   <button type="button" onClick={() => setShowPreview(true)} className="bg-white border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-100">Preview</button>
                   <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                   <button type="button" onClick={handleSubmit} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Save PO</button>
                </div>
            </div>
        </div>
      </div>

      {/* PO Preview Modal */}
      {showPreview && (
        <PurchaseOrderPreview 
            poData={{...formData, subtotal, totalGst, grandTotal}}
            onClose={() => setShowPreview(false)}
        />
      )}

      {/* Attachment Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={() => setPreviewFile(null)}><FaTimes size={20} /></button>
            <div className="flex flex-col items-center">
              <div className="mb-4 text-lg font-semibold text-gray-800">{previewFile.name}</div>
              {/pdf/i.test(previewFile.type) ? (
                <iframe src={URL.createObjectURL(previewFile)} className="w-full h-96 border rounded" title="PDF Preview"></iframe>
              ) : (
                <img src={URL.createObjectURL(previewFile)} alt="Preview" className="max-h-96 rounded border" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteIdx !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 text-center">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to remove this item?</p>
            <div className="flex justify-center gap-4">
              <button onClick={cancelDeleteLine} className="bg-gray-200 py-2 px-6 rounded-lg">Cancel</button>
              <button onClick={confirmDeleteLine} className="bg-red-600 text-white py-2 px-6 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPurchaseOrderForm;
