import React, { useState, useRef, useEffect } from "react";
import { FaBuilding, FaUser, FaPlus, FaTrash, FaPaperclip, FaFilePdf, FaFileImage, FaTimes } from "react-icons/fa";

// Mock data for vendors and companies
const mockVendors = [
  {
    id: 1,
    name: "Acme Ltd.",
    gstin: "27ABCDE1234F1Z5",
    address: "123 Business Park, Mumbai, MH 40 dsgdsfhgfjdgfj fdhfdh fsdhgfjgfsjgfjgjfdhhd fh fdh fdhfdjfsj",
  },
  {
    id: 2,
    name: "XYZ India",
    gstin: "29XYZE5678K9Z2",
    address: "456 Tech Park, Pune, MH 411001",
  },
];
const mockCompanies = [
  {
    id: 1,
    name: "ABC Pvt Ltd",
    gstin: "27DEFGH5678I2A6",
    departments: ["IT Department", "Finance", "HR"],
  },
  {
    id: 2,
    name: "DEF Solutions",
    gstin: "29LMNOP1234Q5Z6",
    departments: ["Operations", "Sales"],
  },
];

const BillForm = () => {
  // State for form fields
  const [vendors] = useState(mockVendors);
  const [companies] = useState(mockCompanies);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [reference, setReference] = useState("");
  const [billLines, setBillLines] = useState([
    {
      item: "Office Supplies",
      description: "Stationery items",
      qty: 10,
      rate: 500,
      gst: 18,
    },
    {
      item: "Software License",
      description: "Annual subscription",
      qty: 1,
      rate: 25000,
      gst: 18,
    },
  ]);
  const [showDeleteIdx, setShowDeleteIdx] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('billLines');
  const [attachments, setAttachments] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const inputRef = useRef(null);
  const mainCardRef = useRef(null);

  // Calculate totals
  const subtotal = billLines.reduce((sum, l) => sum + l.qty * l.rate, 0);
  const totalGST = billLines.reduce((sum, l) => sum + l.qty * l.rate * (l.gst / 100), 0);
  const total = subtotal + totalGST;

  // Validation helpers
  const validate = () => {
    const errs = {};
    if (!selectedVendor) errs.vendor = "Vendor is required";
    if (!billNumber) errs.billNumber = "Bill Number is required";
    if (!billDate) errs.billDate = "Bill Date is required";
    if (!selectedCompany) errs.company = "Company is required";
    if (!selectedDepartment) errs.department = "Department is required";
    if (!billLines.length) errs.billLines = "At least one line item required";
    billLines.forEach((l, i) => {
      if (!l.item) errs[`item${i}`] = "Item required";
      if (!l.qty || l.qty <= 0) errs[`qty${i}`] = "Qty must be positive";
      if (!l.rate || l.rate <= 0) errs[`rate${i}`] = "Rate must be positive";
      if (l.gst === undefined || l.gst === null) errs[`gst${i}`] = "GST required";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handlers
  const handleVendorChange = (e) => {
    const v = vendors.find((v) => v.id === Number(e.target.value));
    setSelectedVendor(v);
  };
  const handleCompanyChange = (e) => {
    const c = companies.find((c) => c.id === Number(e.target.value));
    setSelectedCompany(c);
    setSelectedDepartment("");
  };
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };
  const handleLineChange = (idx, field, value) => {
    setBillLines((prev) => prev.map((line, i) => i === idx ? { ...line, [field]: value } : line));
  };
  const handleAddLine = () => {
    setBillLines((prev) => [...prev, { item: '', description: '', qty: 1, rate: 0, gst: 18 }]);
  };
  const handleDeleteLine = (idx) => {
    setShowDeleteIdx(idx);
  };
  const confirmDeleteLine = () => {
    setBillLines((lines) => lines.filter((_, i) => i !== showDeleteIdx));
    setShowDeleteIdx(null);
  };
  const cancelDeleteLine = () => setShowDeleteIdx(null);
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = files.filter(f => /pdf|jpg|jpeg|png/i.test(f.type));
    setAttachments(prev => [...prev, ...allowed]);
  };
  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };
  const handlePreviewAttachment = (file) => {
    setPreviewFile(file);
  };

  // Render
  return (
    <div className="w-full px-0">
      {/* Form Content */}
      <div className="space-y-6" ref={mainCardRef}>
        {/* Top Section - Vendor, Bill, and Company Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Vendor Details */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaUser className="text-gray-400" /> Vendor Details
              </h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                value={selectedVendor?.id || ""} 
                onChange={handleVendorChange}
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {errors.vendor && <div className="text-xs text-red-500 mt-1">{errors.vendor}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none" 
                value={selectedVendor?.gstin || ""} 
                placeholder="Auto-filled from vendor"
                readOnly 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none" 
                value={selectedVendor?.address || ""} 
                placeholder="Auto-filled from vendor"
                rows={3}
                readOnly 
              />
            </div>
          </div>

          {/* Bill Details */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaPaperclip className="text-gray-400" /> Bill Details
              </h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Number <span className="text-red-500">*</span>
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Enter bill number" 
                value={billNumber} 
                onChange={e => setBillNumber(e.target.value)} 
              />
              {errors.billNumber && <div className="text-xs text-red-500 mt-1">{errors.billNumber}</div>}
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bill Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  value={billDate} 
                  onChange={e => setBillDate(e.target.value)} 
                />
                {errors.billDate && <div className="text-xs text-red-500 mt-1">{errors.billDate}</div>}
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  min={billDate} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="PO/Reference number" 
                value={reference} 
                onChange={e => setReference(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button 
              type="button" 
              className={`px-6 py-3 border-b-2 font-semibold transition-colors ${
                activeTab === 'billLines' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`} 
              onClick={() => setActiveTab('billLines')}
            >
              Bill Lines
            </button>
            <button 
              type="button" 
              className={`px-6 py-3 border-b-2 font-semibold transition-colors ${
                activeTab === 'otherInfo' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`} 
              onClick={() => setActiveTab('otherInfo')}
            >
              Other Info
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
        <div className="min-h-[400px]">
          {activeTab === 'billLines' && (
            <div className="space-y-6">
              <button 
                type="button" 
                className="flex items-center gap-2 border border-blue-300 bg-blue-50 text-blue-600 rounded-lg px-4 py-2 font-medium hover:bg-gray-50 transition-colors" 
                onClick={handleAddLine}
              >
                <FaPlus className="text-sm text-blue-600" /> Add Line Item
              </button>
              
              {errors.billLines && <div className="text-xs text-red-500">{errors.billLines}</div>}
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">GST %</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">GST Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {billLines.map((line, idx) => {
                      const qty = Number(line.qty) || 0;
                      const rate = Number(line.rate) || 0;
                      const gst = Number(line.gst) || 0;
                      const amount = qty * rate;
                      const gstAmount = amount * (gst / 100);
                      const total = amount + gstAmount;
                      return (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <input 
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                              value={line.item} 
                              onChange={e => handleLineChange(idx, 'item', e.target.value)} 
                              placeholder="Enter item"
                            />
                            {errors[`item${idx}`] && <div className="text-xs text-red-500 mt-1">{errors[`item${idx}`]}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                              value={line.description} 
                              onChange={e => handleLineChange(idx, 'description', e.target.value)} 
                              placeholder="Description"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="number" 
                              min="1" 
                              className="w-20 border border-gray-300 rounded px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                              value={line.qty} 
                              onChange={e => handleLineChange(idx, 'qty', e.target.value)} 
                            />
                            {errors[`qty${idx}`] && <div className="text-xs text-red-500 mt-1">{errors[`qty${idx}`]}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <span className="text-gray-500 mr-1">₹</span>
                              <input 
                                type="number" 
                                min="0" 
                                className="w-24 border border-gray-300 rounded px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                value={line.rate} 
                                onChange={e => handleLineChange(idx, 'rate', e.target.value)} 
                              />
                            </div>
                            {errors[`rate${idx}`] && <div className="text-xs text-red-500 mt-1">{errors[`rate${idx}`]}</div>}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                className="w-16 border border-gray-300 rounded px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                value={line.gst} 
                                onChange={e => handleLineChange(idx, 'gst', e.target.value)} 
                              />
                              <span className="text-gray-500 ml-1">%</span>
                            </div>
                            {errors[`gst${idx}`] && <div className="text-xs text-red-500 mt-1">{errors[`gst${idx}`]}</div>}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            ₹{gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold">
                            ₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button 
                              type="button" 
                              className="text-red-500 hover:text-red-700 transition-colors" 
                              onClick={() => handleDeleteLine(idx)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-lg mt-6 p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Subtotal (before GST):</span>
                  <span className="text-gray-900 font-medium">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Total GST:</span>
                  <span className="text-gray-900 font-medium">₹{totalGST.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-lg">Final Amount:</span>
                  <span className="font-bold text-lg">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'otherInfo' && (
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-4">⚙️</div>
              <p className="text-lg font-medium">Other Info</p>
              <p className="text-sm mt-2">Additional fields coming soon...</p>
            </div>
          )}
          
          {activeTab === 'attachments' && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <label htmlFor="attachment-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-2">
                  <FaPaperclip className="text-2xl text-blue-500" />
                </div>
                <button
                  type="button"
                  className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium flex items-center gap-2 mb-2 hover:bg-blue-200 transition-colors"
                  onClick={e => {
                    e.preventDefault();
                    if (inputRef.current) inputRef.current.click();
                  }}
                >
                  <FaPlus className="text-2xl" /> <span className="text-base">Add Attachment</span>
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
              <div className="text-sm text-gray-400 mb-6">PDF, JPG, PNG allowed</div>
              <div className="w-full max-w-xl">
                {attachments.length > 0 && (
                  <ul className="divide-y divide-gray-200 bg-gray-50 rounded-lg shadow p-4">
                    {attachments.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handlePreviewAttachment(file)}>
                          {/pdf/i.test(file.type) ? (
                            <span className="text-red-500"><FaFilePdf /></span>
                          ) : (
                            <span className="text-blue-500"><FaFileImage /></span>
                          )}
                          <span className="text-gray-800 font-medium text-sm truncate max-w-xs">{file.name}</span>
                        </div>
                        <button type="button" className="text-red-500 hover:text-red-700 ml-4" onClick={() => handleRemoveAttachment(idx)}>
                          <FaTimes />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Preview Modal */}
              {previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                  <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
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
            </div>
          )}
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 sticky bottom-0 z-20">
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold">
            Total Bill Amount: <span className="text-blue-600">₹{total.toLocaleString()}</span>
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Discard
            </button>
            <button 
              type="button" 
              className="px-6 py-2 border border-blue-300 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors" 
              onClick={validate}
            >
              Save Bill
            </button>
            <button 
              type="button" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium" 
              onClick={validate}
            >
              Confirm & Validate
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteIdx !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Line Item</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this line item? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button 
                  type="button" 
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" 
                  onClick={cancelDeleteLine}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" 
                  onClick={confirmDeleteLine}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillForm;
