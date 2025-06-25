// Vendor page implementation based on PRD
import { useState } from 'react';
import { FaFileInvoice, FaUndoAlt, FaCreditCard, FaBuilding, FaPlus, FaSearch } from 'react-icons/fa';
import Modal from '../../components/Modal';
import { AddBillForm, BulkPaymentForm, AddVendorForm } from '../../components/Forms';
import Sidebar from "../../components/Sidebar";
import HradminNavbar from "../../components/HradminNavbar";

const Vendor = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const [activeTab, setActiveTab] = useState('bills'); // Default to bills tab
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [bills, setBills] = useState([
    {
      id: 1,
      billNo: 'VB-1001',
      vendorName: 'Acme Ltd.',
      billDate: '12-06-25',
      dueDate: '22-06-25',
      gstin: '29ABCDE1234F1Z5',
      gstTreatment: 'Registered',
      totalAmount: 12500,
      status: 'Posted',
      paymentStatus: 'Paid',
      company: 'ABC Pvt Ltd',
      journal: 'Purchases',
      referencePo: 'PO-2025-001',
      reverseCharge: 'No',
      attachments: 'Yes'
    },
    {
      id: 2,
      billNo: 'VB-1002',
      vendorName: 'XYZ India',
      billDate: '13-06-25',
      dueDate: '23-06-25',
      gstin: '29XYZE5678K9Z2',
      gstTreatment: 'Unregistered',
      totalAmount: 8000,
      status: 'Draft',
      paymentStatus: 'Unpaid',
      company: 'ABC Pvt Ltd',
      journal: 'Purchases',
      referencePo: '',
      reverseCharge: 'Yes',
      attachments: 'No'
    }
  ]);

  const [payments, setPayments] = useState([
    {
      id: 1,
      paymentNo: 'PAY-1001',
      paymentDate: '15-06-25',
      vendorName: 'Acme Ltd.',
      billReference: 'VB-1001, VB-1002',
      gstin: '29ABCDE1234F1Z5',
      paymentMethod: 'Bank Transfer',
      journal: 'Bank',
      amount: 20500,
      currency: 'INR',
      status: 'Posted',
      tdsApplied: 'No',
      company: 'ABC Pvt Ltd',
      paymentReference: 'TXN123456789',
      attachments: 'Yes'
    },
    {
      id: 2,
      paymentNo: 'PAY-1002',
      paymentDate: '16-06-25',
      vendorName: 'XYZ India',
      billReference: 'VB-1003',
      gstin: '29XYZE5678K9Z2',
      paymentMethod: 'Cheque',
      journal: 'Cheque',
      amount: 8000,
      currency: 'INR',
      status: 'Draft',
      tdsApplied: 'Yes',
      company: 'ABC Pvt Ltd',
      paymentReference: 'CHQ001234',
      attachments: 'No'
    }
  ]);

  const [vendors, setVendors] = useState([
    {
      id: 1,
      vendorName: 'Acme Ltd.',
      companyType: 'Company',
      gstin: '29ABCDE1234F1Z5',
      pan: 'AAAPL1234C',
      phone: '080-123456',
      email: 'info@acme.com',
      city: 'Bengaluru',
      state: 'Karnataka',
      paymentTerms: '30 Days',
      vendorTags: ['Critical Supplier', 'Preferred Vendor'],
      status: 'Active'
    },
    {
      id: 2,
      vendorName: 'XYZ Traders',
      companyType: 'Individual',
      gstin: '27XYZE5678K9Z2',
      pan: 'AAAAA9999A',
      phone: '022-987654',
      email: 'xyz@traders.com',
      city: 'Mumbai',
      state: 'Maharashtra',
      paymentTerms: '15 Days',
      vendorTags: ['Local Supplier'],
      status: 'Active'
    },
    {
      id: 3,
      vendorName: 'Tech Solutions Inc',
      companyType: 'Company',
      gstin: '29TECH5678K9Z3',
      pan: 'AAAPL5678D',
      phone: '080-555123',
      email: 'contact@techsolutions.com',
      city: 'Bengaluru',
      state: 'Karnataka',
      paymentTerms: '45 Days',
      vendorTags: ['Service Provider', 'International Supplier'],
      status: 'Active'
    }
  ]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleAddBill = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handleAddVendor = () => {
    setIsVendorModalOpen(true);
  };

  const handleCloseVendorModal = () => {
    setIsVendorModalOpen(false);
  };

  const handlePaymentSubmit = (paymentData) => {
    // Add the new payment to the payments array
    setPayments(prev => [...prev, {
      id: prev.length + 1,
      paymentNo: `PAY-${String(prev.length + 1001).padStart(4, '0')}`,
      paymentDate: paymentData.paymentDate,
      vendorName: paymentData.vendor,
      billReference: paymentData.selectedBills.map(bill => bill.billNo).join(', '),
      gstin: paymentData.gstin,
      paymentMethod: paymentData.paymentMethod,
      journal: paymentData.journal,
      amount: paymentData.totalAmount,
      currency: paymentData.currency,
      status: 'Draft',
      tdsApplied: paymentData.tdsApplied ? 'Yes' : 'No',
      company: paymentData.company,
      paymentReference: paymentData.reference,
      attachments: 'No'
    }]);
    
    // Close the modal
    setIsPaymentModalOpen(false);
    
    // You could also show a success message here
    console.log('Payment added successfully:', paymentData);
  };

  const handleBillSubmit = (billData) => {
    // Add the new bill to the bills array
    setBills(prev => [...prev, {
      id: prev.length + 1,
      billNo: billData.billReference || `VB-${String(prev.length + 1001).padStart(4, '0')}`,
      vendorName: billData.vendor,
      billDate: billData.billDate,
      dueDate: billData.dueDate,
      gstin: billData.gstin,
      gstTreatment: billData.gstTreatment,
      totalAmount: billData.billLines.reduce((sum, line) => sum + line.total, 0),
      status: billData.status || 'Draft',
      paymentStatus: 'Unpaid',
      company: billData.company,
      journal: billData.journal,
      referencePo: billData.billReference,
      reverseCharge: billData.reverseCharge ? 'Yes' : 'No',
      attachments: 'No'
    }]);
    
    // Close the modal
    setIsModalOpen(false);
    
    // You could also show a success message here
    console.log('Bill added successfully:', billData);
  };

  const handleVendorSubmit = (vendorData) => {
    // Add the new vendor to the vendors array
    setVendors(prev => [...prev, {
      id: prev.length + 1,
      vendorName: vendorData.vendorName,
      companyType: vendorData.companyType,
      gstin: vendorData.gstin,
      pan: vendorData.pan,
      phone: vendorData.phone,
      email: vendorData.email,
      city: vendorData.city,
      state: vendorData.state,
      paymentTerms: vendorData.paymentTerms,
      vendorTags: vendorData.vendorTags,
      status: vendorData.status
    }]);
    
    // Close the modal
    setIsVendorModalOpen(false);
    
    // You could also show a success message here
    console.log('Vendor added successfully:', vendorData);
  };

  const tabs = [
    { id: 'bills', label: 'Bills', icon: FaFileInvoice },
    { id: 'refunds', label: 'Refunds', icon: FaUndoAlt },
    { id: 'payments', label: 'Payments', icon: FaCreditCard },
    { id: 'vendors', label: 'Vendors List', icon: FaBuilding },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'bills':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button 
                onClick={handleAddBill}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Bill</span>
              </button>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GSTIN</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GST Treatment</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Status</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th> */}
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Journal</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reference/PO No.</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reverse Charge</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Attachments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">{bill.billNo}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{bill.vendorName}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{bill.billDate}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{bill.dueDate}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{bill.gstin}</span>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bill.gstTreatment === 'Registered' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {bill.gstTreatment}
                        </span>
                      </td> */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">₹{bill.totalAmount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bill.status === 'Posted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bill.paymentStatus === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.paymentStatus}
                        </span>
                      </td>
                        {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{bill.company}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{bill.journal}</td> */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${bill.referencePo ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                          {bill.referencePo || '-'}
                        </span>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bill.reverseCharge === 'Yes' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {bill.reverseCharge}
                        </span>
                      </td> */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          bill.attachments === 'Yes' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {bill.attachments === 'Yes' ? '📎' : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'refunds':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search refunds..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <FaPlus className="w-4 h-4" />
                <span>Add Refund</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                   <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">REF-001</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">ABC Supplies</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">2024-07-25</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">$500.00</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Damaged goods</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button 
                onClick={handleAddPayment}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Payment</span>
              </button>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment No.</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GSTIN (Vendor)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Journal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Currency</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">TDS/TCS Applied</th> */}
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Attachments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">{payment.paymentNo}</span>
                      </td> */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{payment.paymentDate}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{payment.vendorName}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-blue-600 font-medium">{payment.billReference}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{payment.gstin}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.paymentMethod === 'Bank Transfer' 
                            ? 'bg-blue-100 text-blue-800' 
                            : payment.paymentMethod === 'Cheque'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{payment.journal}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</span>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{payment.currency}</td> */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === 'Posted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.tdsApplied === 'Yes' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.tdsApplied}
                        </span>
                      </td> */}
                      {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{payment.company}</td> */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-mono">{payment.paymentReference}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          payment.attachments === 'Yes' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {payment.attachments === 'Yes' ? '📎' : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'vendors':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button 
                onClick={handleAddVendor}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Vendor</span>
              </button>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company/Individual</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GSTIN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PAN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">City</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">State</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Terms</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Tags</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{vendor.vendorName}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          vendor.companyType === 'Company' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {vendor.companyType}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{vendor.gstin}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{vendor.pan}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.phone}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-blue-600 hover:text-blue-800">{vendor.email}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.city}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.state}</td>
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {vendor.paymentTerms}
                        </span>
                      </td> */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {vendor.vendorTags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              {tag}
                            </span>
                          ))}
                          {vendor.vendorTags.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                              +{vendor.vendorTags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          vendor.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vendor.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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

    <div className="p-6 pt-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendors</h1>
        <p className="text-gray-600">Manage your vendor relationships and transactions</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-2 whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderContent()}
      </div>

      {/* Add Bill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add New Bill"
        size="full"
      >
        <AddBillForm
          onSubmit={handleBillSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        title="Add Vendor Payment"
        size="full"
      >
        <BulkPaymentForm
          onSubmit={handlePaymentSubmit}
          onCancel={handleClosePaymentModal}
        />
      </Modal>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isVendorModalOpen}
        onClose={handleCloseVendorModal}
        title="Add New Vendor"
        size="full"
      >
        <AddVendorForm
          onSubmit={handleVendorSubmit}
          onCancel={handleCloseVendorModal}
        />
      </Modal>
    </div>
    </div>
    </div>
  );
};

export default Vendor;
