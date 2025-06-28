// Vendor page implementation based on PRD
import { useState, useEffect } from 'react';
import { FaFileInvoice, FaUndoAlt, FaCreditCard, FaBuilding, FaPlus, FaSearch, FaArrowLeft } from 'react-icons/fa';
import Modal from '../../components/Modal';
import { AddBillForm, BulkPaymentForm, AddVendorForm } from '../../components/Forms';
import Sidebar from "../../components/Sidebar";
import HradminNavbar from "../../components/HradminNavbar";
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors } from '../../redux/slices/vendorSlice';
import { toast } from 'sonner';
import SearchBarWithFilter from '../../components/SearchBarWithFilter';

const Vendor = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dispatch = useDispatch();
  const { vendors, loading, error } = useSelector((state) => state.vendors);

    useEffect(() => {
      dispatch(fetchVendors());
    }, []);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const [activeTab, setActiveTab] = useState('bills'); // Default to bills tab
  const [showAddForm, setShowAddForm] = useState(null); // 'bill' | 'refund' | 'payment' | 'vendor' | null
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
      paymentStatus: 'Pending',
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
      amount: 20500,
      currency: 'INR',
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
      amount: 8000,
      currency: 'INR',
      tdsApplied: 'Yes',
      company: 'ABC Pvt Ltd',
      paymentReference: 'CHQ001234',
      attachments: 'No'
    }
  ]);

  const [vendorsList, setVendorsList] = useState(vendors);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Context-aware Add button handler
  const handleAddClick = () => {
    if (activeTab === 'bills') {
      setShowAddForm('bill');
    } else if (activeTab === 'refunds') {
      setShowAddForm('refund');
    } else if (activeTab === 'payments') {
      setShowAddForm('payment');
    } else if (activeTab === 'vendors') {
      setShowAddForm('vendor');
    }
  };

  // Back button handler for forms
  const handleBackFromForm = () => {
    setShowAddForm(null);
  };

  const handlePaymentSubmit = (paymentData) => {
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
    setShowAddForm(null);
    console.log('Payment added successfully:', paymentData);
  };

  const handleBillSubmit = (billData) => {
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
    setShowAddForm(null);
    console.log('Bill added successfully:', billData);
  };

  const handleVendorSubmit = (vendorData) => {
    setVendorsList(prev => [...prev, {
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
    toast.success('Vendor added successfully!');
    dispatch(fetchVendors());
    setShowAddForm(null);
    console.log('Vendor added successfully:', vendorData);
  };

  const tabs = [
    { id: 'bills', label: 'Bills', icon: FaFileInvoice },
    { id: 'refunds', label: 'Refunds', icon: FaUndoAlt },
    { id: 'payments', label: 'Payments', icon: FaCreditCard },
    { id: 'vendors', label: 'Vendors List', icon: FaBuilding },
  ];

  // Context-aware Add button label
  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'bills': return 'Add Bill';
      case 'refunds': return 'Add Refund';
      case 'payments': return 'Add Payment';
      case 'vendors': return 'Add Vendor';
      default: return 'Add';
    }
  };

  // Context-aware Add button icon
  const getAddButtonIcon = () => <FaPlus className="w-4 h-4" />;

  // Inline Add Form renderers
  const renderAddForm = () => {
    switch (showAddForm) {
      case 'bill':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
              </button>
              <h2 className="text-xl font-bold text-gray-900">Add New Bill</h2>
            </div>
            <AddBillForm
              onSubmit={handleBillSubmit}
              onCancel={handleBackFromForm}
            />
          </div>
        );
      case 'payment':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
              </button>
              <h2 className="text-xl font-bold text-gray-900">Add Vendor Payment</h2>
            </div>
            <BulkPaymentForm
              onSubmit={handlePaymentSubmit}
              onCancel={handleBackFromForm}
            />
          </div>
        );
      case 'vendor':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
              </button>
              <h2 className="text-xl font-bold text-gray-900">Add New Vendor</h2>
            </div>
            <AddVendorForm
              onSubmit={handleVendorSubmit}
              onSuccess={() => {
                toast.success('Vendor added successfully!');
              }}
              onCancel={handleBackFromForm}
            />
          </div>
        );
      case 'refund':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
              </button>
              <h2 className="text-xl font-bold text-gray-900">Add Refund</h2>
            </div>
            <div className="text-center text-gray-500 py-12">
              <div className="text-5xl mb-4">⏳</div>
              <p className="text-lg font-medium">Refund form coming soon...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (showAddForm) {
      return renderAddForm();
    }
    switch (activeTab) {
      case 'bills':
        return (
          <div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GSTIN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reference/PO No.</th>
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">₹{bill.totalAmount.toLocaleString()}</span>
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${bill.referencePo ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                          {bill.referencePo || '-'}
                        </span>
                      </td>
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
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GSTIN (Vendor)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</span>
                      </td>
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
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GSTIN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">City</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">State</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{vendor.vendorName}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-800">{vendor.contactName || '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{vendor.gstin}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.phone}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-blue-600 hover:text-blue-800">{vendor.email}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.city}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.state}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {vendor.vendorTags?.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              {tag}
                            </span>
                          ))}
                          {vendor.vendorTags?.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                              +{vendor.vendorTags?.length - 2}
                            </span>
                          )}
                        </div>
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

        {/* Main Content Area */}
        <div className="mt-20 p-6">
          {/* Vendors heading and Add Button + Tabs as a single block, pushed down together */}
          <div className="mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendors</h1>
            <div className="flex justify-between items-center mb-6 bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center">
                {/* Add Button */}
                <button
                  onClick={handleAddClick}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm mr-6 text-sm"
                  style={{ minWidth: 120 }}
                >
                  {getAddButtonIcon()} <span>{getAddButtonLabel()}</span>
                </button>
                {/* Tabs */}
                <nav className="flex space-x-6">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowAddForm(null); // Always reset form on tab switch
                      }}
                      className={`flex items-center space-x-2 whitespace-nowrap pb-1 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none py-1 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      style={{ minWidth: 110 }}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
              <SearchBarWithFilter />
            </div>
          </div>

          {/* Main Content Area */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Vendor;
