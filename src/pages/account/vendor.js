// Vendor page implementation based on PRD
import { useState, useEffect } from 'react';
import { FaFileInvoice, FaUndoAlt, FaCreditCard, FaBuilding, FaPlus, FaSearch, FaArrowLeft } from 'react-icons/fa';
import Modal from '../../components/Modal';
import { AddBillForm, BulkPaymentForm, AddVendorForm, AddRefundForm } from '../../components/Forms';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors } from '../../redux/slices/vendorSlice';
import { toast } from 'sonner';
import SearchBarWithFilter from '../../components/SearchBarWithFilter';
import MainLayout from '@/components/MainLayout'; // Import MainLayout

const Vendor = () => {
  const dispatch = useDispatch();
  const { vendors, loading, error } = useSelector((state) => state.vendors);

    useEffect(() => {
      dispatch(fetchVendors());
    }, []);
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

  const [vendorCredits, setVendorCredits] = useState([
    {
      id: 'RTRN-001',
      referencedBill: 'BILL-12345',
      vendor: 'WoodWorks',
      date: '2025-06-28',
      itemsReturned: 'Oak Tabletop',
      totalCredit: 10000,
      type: 'Vendor Credit',
      status: 'Open (not used yet)'
    },
    {
      id: 'RTRN-002',
      referencedBill: 'BILL-12346',
      vendor: 'MetalCo',
      date: '2025-06-28',
      itemsReturned: 'Chair Legs',
      totalCredit: 2000,
      type: 'Refund',
      status: 'Paid (Bank Transfer)'
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
    } else if (activeTab === 'vendorCredits') {
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

  const handleRefundSubmit = (refundData) => {
    const newCredit = {
      id: `RTRN-${String(vendorCredits.length + 1).padStart(3, '0')}`,
      referencedBill: refundData.referencedBill,
      poReference: refundData.poReference,
      vendor: refundData.vendorName,
      date: refundData.refundDate,
      itemsReturned: refundData.itemsToReturn.filter(i => i.qtyToReturn > 0).map(i => i.name).join(', ') || 'N/A',
      totalCredit: refundData.totalCredit,
      type: refundData.refundType === 'credit' ? 'Vendor Credit' : 'Refund',
      status: refundData.refundType === 'credit' ? 'Open (not used yet)' : 'Pending Payment'
    };
    setVendorCredits(prev => [...prev, newCredit]);
    toast.success('Refund request submitted successfully!');
    setShowAddForm(null);
  };

  const tabs = [
    { id: 'bills', label: 'Bills', icon: FaFileInvoice },
    { id: 'payments', label: 'Payments', icon: FaCreditCard },
    { id: 'vendorCredits', label: 'Vendor Credit', icon: FaUndoAlt },
    { id: 'vendors', label: 'Vendors List', icon: FaBuilding },
  ];

  // Context-aware Add button label
  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'bills': return 'New Bill';
      case 'vendorCredits': return 'New Credit';
      case 'payments': return 'New Payment';
      case 'vendors': return 'New Vendor';
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
              <h2 className="text-xl font-bold text-gray-900">Add Refund Request</h2>
            </div>
            <AddRefundForm
              onSubmit={handleRefundSubmit}
              onCancel={handleBackFromForm}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    let data, columns;
    switch (activeTab) {
      case 'bills':
        data = bills;
        columns = [
          { id: 'billNo', label: 'Bill No.', accessor: 'billNo' },
          { id: 'vendorName', label: 'Vendor Name', accessor: 'vendorName' },
          { id: 'billDate', label: 'Bill Date', accessor: 'billDate' },
          { id: 'dueDate', label: 'Due Date', accessor: 'dueDate' },
          { id: 'gstin', label: 'GSTIN', accessor: 'gstin' },
          { id: 'totalAmount', label: 'Total Amount', accessor: 'totalAmount' },
          { id: 'paymentStatus', label: 'Payment Status', accessor: 'paymentStatus' },
          { id: 'referencePo', label: 'Reference/PO No.', accessor: 'referencePo' },
          { id: 'attachments', label: 'Attachments', accessor: 'attachments' }
        ];
        break;
      case 'vendorCredits':
        data = vendorCredits;
        columns = [
          { id: 'referencedBill', label: 'Referenced Bill', accessor: 'referencedBill' },
          { id: 'poReference', label: 'PO Reference', accessor: 'poReference' },
          { id: 'vendor', label: 'Vendor', accessor: 'vendor' },
          { id: 'date', label: 'Date', accessor: 'date' },
          { id: 'itemsReturned', label: 'Items Returned', accessor: 'itemsReturned' },
          { id: 'totalCredit', label: 'Total Credit', accessor: 'totalCredit' },
          { id: 'type', label: 'Type', accessor: 'type' },
          { id: 'status', label: 'Status/Applied', accessor: 'status' }
        ];
        break;
      case 'payments':
        data = payments;
        columns = [
          { id: 'vendorName', label: 'Vendor Name', accessor: 'vendorName' },
          { id: 'billReference', label: 'Bill Reference', accessor: 'billReference' },
          { id: 'gstin', label: 'GSTIN (Vendor)', accessor: 'gstin' },
          { id: 'paymentMethod', label: 'Payment Method', accessor: 'paymentMethod' },
          { id: 'amount', label: 'Amount', accessor: 'amount' },
          { id: 'paymentReference', label: 'Payment Reference', accessor: 'paymentReference' },
          { id: 'attachments', label: 'Payment Proof', accessor: 'attachments' }
        ];
        break;
      case 'vendors':
        data = vendors;
        columns = [
          { id: 'vendorName', label: 'Vendor Name', accessor: 'vendorName' },
          { id: 'contactName', label: 'Contact Name', accessor: 'contactName' },
          { id: 'gstin', label: 'GSTIN', accessor: 'gstin' },
          { id: 'phone', label: 'Phone', accessor: 'phone' },
          { id: 'email', label: 'Email', accessor: 'email' },
          { id: 'city', label: 'City', accessor: 'city' },
          { id: 'state', label: 'State', accessor: 'state' },
          { id: 'vendorTags', label: 'Vendor Tags', accessor: 'vendorTags' }
        ];
        break;
      default:
        return null;
    }

    const table = (
          <div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                {columns.map((column) => (
                  <th key={column.id} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {column.label}
                  </th>
                ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-4 whitespace-nowrap">
                      {column.accessor ? (
                        <span className="text-sm font-medium text-gray-900">{item[column.accessor]}</span>
                      ) : (
                        <span className="text-sm text-gray-900">{item[column.id]}</span>
                      )}
                      </td>
                  ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">{table}</div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendors</h1>
        </div>
        <div className="flex justify-between items-center mb-6 bg-gray-50 rounded-lg px-4 py-3">
          <div className="flex items-center">
              <button
                onClick={handleAddClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 font-semibold shadow-sm mr-6 text-sm"
                style={{ minWidth: 120 }}
              >
                {getAddButtonIcon()} <span>{getAddButtonLabel()}</span>
              </button>
            <nav className="flex space-x-4">
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
          <div className="w-96">
            <SearchBarWithFilter />
          </div>
        </div>
        {showAddForm ? renderAddForm() : renderContent()}
      </div>
    </MainLayout>
  );
};

export default Vendor;
