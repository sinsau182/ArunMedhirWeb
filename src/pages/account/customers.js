// Updated customers page with PRD implementation
import { useState } from 'react';
import { FaFileInvoiceDollar, FaReceipt, FaUsers, FaPlus, FaSearch, FaArrowLeft } from 'react-icons/fa';
import Sidebar from "../../components/Sidebar";
import HradminNavbar from "../../components/HradminNavbar";
import { AddInvoiceForm, AddReceiptForm, AddClientForm } from '../../components/Forms';
import { toast } from 'sonner';
import SearchBarWithFilter from '../../components/SearchBarWithFilter';

const Customers = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('invoice');
  const [showAddForm, setShowAddForm] = useState(null);
  const [invoiceForReceipt, setInvoiceForReceipt] = useState(null);

  const [invoices, setInvoices] = useState([
    { id: 'INV-001', projectName: 'Project Medhit', client: 'Client A', date: '2024-07-29', amount: 1200.00, status: 'Received', receiptGenerated: 'Yes' },
    { id: 'INV-002', projectName: 'Internal HRMS', client: 'Client B', date: '2024-07-28', amount: 800.00, status: 'Due', receiptGenerated: 'No' },
    { id: 'INV-003', projectName: 'Marketing Website', client: 'Client A', date: '2024-07-27', amount: 1500.00, status: 'Partial received', receiptGenerated: 'Yes' },
  ]);
  const [receipts, setReceipts] = useState([
    { id: 'REC-001', projectName: 'Project Medhit', client: 'Client A', refInvoice: 'INV-001', date: '2024-07-29', amount: 1200.00, method: 'Credit Card', paymentTransId: 'TXN12345', status: 'Received' },
    { id: 'REC-002', projectName: 'Marketing Website', client: 'Client A', refInvoice: 'INV-003', date: '2024-07-28', amount: 1000.00, method: 'Bank Transfer', paymentTransId: 'TXN67890', status: 'Partial received' }
  ]);
  const [clients, setClients] = useState([
    { id: 1, name: 'Client A', company: 'Tech Corp', email: 'client.a@example.com', phone: '555-1234', status: 'Active' }
  ]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const handleTabClick = (tab) => { setActiveTab(tab); setShowAddForm(null); };
  const handleAddClick = () => {
    if (activeTab === 'invoice') setShowAddForm('invoice');
    else if (activeTab === 'receipts') setShowAddForm('receipt');
    else if (activeTab === 'clients') setShowAddForm('client');
  };
  const handleBackFromForm = () => {
    setShowAddForm(null);
    setInvoiceForReceipt(null);
  };

  const handleGenerateReceiptClick = (invoice) => {
    setInvoiceForReceipt(invoice);
    setShowAddForm('receipt');
  };

  const handleInvoiceSubmit = (data) => {
    setInvoices(prev => [...prev, { 
      id: data.invoiceNumber, 
      projectName: data.projectName,
      client: data.customerName, 
      date: data.invoiceDate, 
      amount: data.totalAmount, 
      status: 'Due',
      receiptGenerated: 'No'
    }]);
    toast.success('Invoice added!');
    setShowAddForm(null);
  };
  const handleReceiptSubmit = (data) => {
    // A more complex logic would be needed to determine the status based on allocation
    setReceipts(prev => [...prev, { 
      id: data.receiptNumber, 
      projectName: data.projectName,
      client: data.customerName, 
      refInvoice: data.linkedInvoices.map(i => i.number).join(', '),
      date: data.receiptDate, 
      amount: data.amount, 
      method: data.paymentMethod,
      paymentTransId: data.reference,
      status: 'Received' // Placeholder status
    }]);
    toast.success('Receipt added!');
    setShowAddForm(null);
    setInvoiceForReceipt(null);
  };
  const handleClientSubmit = (data) => {
    setClients(prev => [...prev, { id: data.id, name: data.clientName, company: data.companyName, email: data.email, phone: data.phone, status: data.status }]);
    toast.success('Client added!');
    setShowAddForm(null);
  };

  const tabs = [
    { id: 'invoice', label: 'Invoice', icon: FaFileInvoiceDollar },
    { id: 'receipts', label: 'Receipts', icon: FaReceipt },
    { id: 'clients', label: 'Clients', icon: FaUsers },
  ];
  
  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'invoice': return 'Add Invoice';
      case 'receipts': return 'Add Receipt';
      case 'clients': return 'Add Client';
      default: return 'Add';
    }
  };

  const renderAddForm = () => {
    const commonProps = { onCancel: handleBackFromForm };
    const formTitle = `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}`;

    let formComponent;
    switch (showAddForm) {
      case 'invoice': formComponent = <AddInvoiceForm {...commonProps} onSubmit={handleInvoiceSubmit} />; break;
      case 'receipt': formComponent = <AddReceiptForm {...commonProps} onSubmit={handleReceiptSubmit} initialData={invoiceForReceipt} />; break;
      case 'client': formComponent = <AddClientForm {...commonProps} onSubmit={handleClientSubmit} />; break;
      default: return null;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
            <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
          </button>
          <h2 className="text-xl font-bold text-gray-900">{formTitle}</h2>
        </div>
        {formComponent}
      </div>
    );
  };

  const renderContent = () => {
    if (showAddForm) return renderAddForm();

    let table;
    switch (activeTab) {
      case 'invoice':
        table = (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice no.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm">{invoice.projectName}</td>
                  <td className="px-6 py-4 text-sm">{invoice.client}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === 'Received' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'Partial received' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {invoice.receiptGenerated === 'Yes' ? (
                      <span className="text-gray-500">Yes</span>
                    ) : (
                      <button
                        onClick={() => handleGenerateReceiptClick(invoice)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold py-1 px-3 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <FaReceipt />
                        <span>Generate</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
        break;
      case 'receipts':
        table = (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Received</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment trans. Id</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {receipts.map(r => (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{r.id}</td>
                  <td className="px-6 py-4 text-sm">{r.projectName}</td>
                  <td className="px-6 py-4 text-sm">{r.client}</td>
                  <td className="px-6 py-4 text-sm text-blue-600">{r.refInvoice}</td>
                  <td className="px-6 py-4 text-sm">{r.date}</td>
                  <td className="px-6 py-4 text-sm font-semibold">${r.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">{r.method}</td>
                  <td className="px-6 py-4 text-sm font-mono">{r.paymentTransId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      r.status === 'Received' ? 'bg-green-100 text-green-800' :
                      r.status === 'Partial received' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
        break;
      case 'clients':
        table = (
          <table className="min-w-full bg-white">
             <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map(c => (
                <tr key={c.id}>
                  <td className="px-6 py-4 text-sm">{c.name}</td>
                  <td className="px-6 py-4 text-sm">{c.company}</td>
                  <td className="px-6 py-4 text-sm">{c.email}</td>
                  <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        );
        break;
      default: return null;
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">{table}</div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} currentRole={"employee"} />
      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-56"} transition-all duration-300 overflow-x-auto`}>
        <HradminNavbar />
        <div className="p-6 pt-24">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
            <p className="text-gray-600">Manage customer relationships and transactions</p>
          </div>
          <div className="flex justify-between items-center mb-6 bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex items-center">
              <button onClick={handleAddClick} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 font-semibold shadow-sm mr-6 text-sm" style={{ minWidth: 120 }}>
                <FaPlus className="w-4 h-4" /> <span>{getAddButtonLabel()}</span>
              </button>
              <nav className="flex space-x-6">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-2 whitespace-nowrap pb-1 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Customers; 