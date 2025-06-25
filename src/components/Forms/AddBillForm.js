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
    <div className="flex h-screen">
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
        } transition-all duration-300 overflow-x-auto`}
      >
        {/* Navbar */}
        <HradminNavbar />
        
    <form className="bg-gray-50 min-h-screen flex flex-col mt-16">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-4 border-b bg-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaUser className="text-gray-400" /> Add New Bill
        </h1>
        <span className="text-gray-500 text-sm">Draft</span>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-6">
        {/* Vendor Details */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <FaUser /> Vendor Details
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">Vendor Name *</label>
            <select className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" value={selectedVendor?.id || ""} onChange={handleVendorChange}>
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {errors.vendor && <div className="text-xs text-red-500">{errors.vendor}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GSTIN</label>
            <input className="w-full border rounded px-3 py-2 bg-gray-100 focus:outline-none" value={selectedVendor?.gstin || ""} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea className="w-full border rounded px-3 py-2 bg-gray-100 focus:outline-none" value={selectedVendor?.address || ""} readOnly />
          </div>
        </div>
        {/* Bill Details */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <FaPaperclip /> Bill Details
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">Bill Number *</label>
            <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Enter bill number" value={billNumber} onChange={e => setBillNumber(e.target.value)} />
            {errors.billNumber && <div className="text-xs text-red-500">{errors.billNumber}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bill Date *</label>
            <input type="date" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" value={billDate} onChange={e => setBillDate(e.target.value)} />
            {errors.billDate && <div className="text-xs text-red-500">{errors.billDate}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input type="date" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" value={dueDate} onChange={e => setDueDate(e.target.value)} min={billDate} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reference</label>
            <input className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="PO/Reference number" value={reference} onChange={e => setReference(e.target.value)} />
          </div>
        </div>
        {/* Company Info */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <FaBuilding /> Company Info
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">Company *</label>
            <select className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" value={selectedCompany?.id || ""} onChange={handleCompanyChange}>
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.company && <div className="text-xs text-red-500">{errors.company}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GSTIN</label>
            <input className="w-full border rounded px-3 py-2 bg-gray-100 focus:outline-none" value={selectedCompany?.gstin || ""} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" value={selectedDepartment} onChange={handleDepartmentChange}>
              <option value="">Select Department</option>
              {selectedCompany?.departments?.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
            {errors.department && <div className="text-xs text-red-500">{errors.department}</div>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8">
        <div className="flex border-b">
          <button type="button" className={`px-4 py-2 border-b-2 font-semibold transition-colors ${activeTab === 'billLines' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('billLines')}>Bill Lines</button>
          <button type="button" className={`px-4 py-2 border-b-2 font-semibold transition-colors ${activeTab === 'otherInfo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('otherInfo')}>Other Info</button>
          <button type="button" className={`px-4 py-2 border-b-2 font-semibold transition-colors ${activeTab === 'attachments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('attachments')}>Attachments</button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="px-8 py-4 pb-40"> {/* pb-40 for footer space */}
        {activeTab === 'billLines' && (
          <>
            <button type="button" className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 font-medium mb-4 hover:bg-gray-50" onClick={handleAddLine}>
              <FaPlus /> Add Line Item
            </button>
            {errors.billLines && <div className="text-xs text-red-500 mb-2">{errors.billLines}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b">
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-left">Rate</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">GST %</th>
                    <th className="px-4 py-3 text-left">GST Amount</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billLines.map((line, idx) => {
                    const qty = Number(line.qty) || 0;
                    const rate = Number(line.rate) || 0;
                    const gst = Number(line.gst) || 0;
                    const amount = qty * rate;
                    const gstAmount = amount * (gst / 100);
                    const total = amount + gstAmount;
                    return (
                      <tr key={idx} className="text-sm border-b last:border-b-0">
                        <td className="px-2 py-2">
                          <input className="border rounded px-2 py-1 w-full" value={line.item} onChange={e => handleLineChange(idx, 'item', e.target.value)} />
                        </td>
                        <td className="px-2 py-2">
                          <input className="border rounded px-2 py-1 w-full" value={line.description} onChange={e => handleLineChange(idx, 'description', e.target.value)} />
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min="1" className="border rounded px-2 py-1 w-16 text-right" value={line.qty} onChange={e => handleLineChange(idx, 'qty', e.target.value)} />
                        </td>
                        <td className="px-2 py-2 flex items-center gap-1">
                          <span className="text-gray-500">₹</span>
                          <input type="number" min="0" className="border rounded px-2 py-1 w-24 text-right" value={line.rate} onChange={e => handleLineChange(idx, 'rate', e.target.value)} />
                        </td>
                        <td className="px-2 py-2 text-right align-middle">
                          ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2 flex items-center gap-1">
                          <input type="number" min="0" max="100" className="border rounded px-2 py-1 w-14 text-right" value={line.gst} onChange={e => handleLineChange(idx, 'gst', e.target.value)} />
                          <span className="text-gray-500">%</span>
                        </td>
                        <td className="px-2 py-2 text-right align-middle">
                          ₹{gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2 text-right align-middle">
                          ₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteLine(idx)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Delete confirmation */}
            {showDeleteIdx !== null && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                <div className="bg-white p-6 rounded shadow-lg">
                  <div className="mb-4">Are you sure you want to delete this line item?</div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" className="px-4 py-2 bg-gray-100 rounded" onClick={cancelDeleteLine}>Cancel</button>
                    <button type="button" className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDeleteLine}>Delete</button>
                  </div>
                </div>
              </div>
            )}
            {/* Totals */}
            <div className="flex justify-between mt-4 text-lg font-semibold">
              <div>₹{subtotal.toLocaleString()} <span className="text-xs text-gray-500">Subtotal</span></div>
              <div>₹{totalGST.toLocaleString()} <span className="text-xs text-gray-500">Total GST</span></div>
              <div>₹0.00 <span className="text-xs text-gray-500">Other Charges</span></div>
              <div>₹{total.toLocaleString()} <span className="text-xs text-gray-500">Total Amount</span></div>
            </div>
          </>
        )}
        {activeTab === 'otherInfo' && (
          <div className="bg-white rounded-lg p-6 text-gray-600">Other Info fields coming soon...</div>
        )}
        {activeTab === 'attachments' && (
          <div className="bg-white rounded-lg p-6 text-gray-600">Attachment upload coming soon...</div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
        <div className="text-xl font-bold">
          Total Bill Amount: <span className="text-blue-600">₹{total.toLocaleString()}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" className="px-6 py-2 border rounded text-gray-700 bg-gray-100 hover:bg-gray-200">Discard</button>
          <button type="button" className="px-6 py-2 border rounded text-blue-700 bg-blue-100 hover:bg-blue-200" onClick={validate}>Save Bill</button>
          <button type="button" className="px-6 py-2 border rounded text-white bg-blue-700 hover:bg-blue-800" onClick={validate}>Confirm & Validate</button>
        </div>
      </div>
      </div>
      </div>
    </form>
    </div>
    </div>
  );
};

export default BillForm;
