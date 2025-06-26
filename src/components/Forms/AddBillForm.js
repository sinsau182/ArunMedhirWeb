import React, { useState } from "react";
import { FaBuilding, FaUser, FaPlus, FaTrash, FaPaperclip } from "react-icons/fa";
import Sidebar from '../Sidebar';
import HradminNavbar from '../HradminNavbar';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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

  // Render
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentRole={"employee"}
      />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300 overflow-auto`}
      >
        {/* Navbar */}
        <HradminNavbar />
        
        {/* Header with proper spacing and visual separation */}
        <div className="fixed top-0 left-56 right-0 z-50 bg- shadow-sm border border-gray-200 rounded-lg mx-4 mt-20 mb-4 px-6 py-4" 
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          background: '#f9fff9'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaUser className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Add New Bill</h1>
                <p className="text-sm text-gray-500">Create and manage vendor bills</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">Draft</span>
          </div>
        </div>

        {/* Main Content Container - This will contain the bottom bar */}
        <div className="max-w-7xl mx-auto px-4 mb-4 mt-48">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            
            {/* Form Content */}
            <div className="p-6 space-y-6">
              
              {/* Top Section - Vendor, Bill, and Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      value={dueDate} 
                      onChange={e => setDueDate(e.target.value)} 
                      min={billDate} 
                    />
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

                {/* Company Info */}
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FaBuilding className="text-gray-400" /> Company Info
                    </h2>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      value={selectedCompany?.id || ""} 
                      onChange={handleCompanyChange}
                    >
                      <option value="">Select Company</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.company && <div className="text-xs text-red-500 mt-1">{errors.company}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                    <input 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none" 
                      value={selectedCompany?.gstin || ""} 
                      placeholder="Auto-filled from company"
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      value={selectedDepartment} 
                      onChange={handleDepartmentChange}
                    >
                      <option value="">Select Department</option>
                      {selectedCompany?.departments?.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.department && <div className="text-xs text-red-500 mt-1">{errors.department}</div>}
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
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-4">📎</div>
                    <p className="text-lg font-medium">Attachments</p>
                    <p className="text-sm mt-2">File upload functionality coming soon...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Bar - Now part of the form container */}
            <div className="border-t border-gray-200 bg-white px-6 py-4">
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
    </div>
  );
};

export default BillForm;
