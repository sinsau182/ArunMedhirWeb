// Updated customers page with PRD implementation
import { useState } from 'react';
import { FaFileInvoiceDollar, FaReceipt, FaUsers, FaPlus, FaSearch, FaArrowLeft } from 'react-icons/fa';
import Sidebar from "../../components/Sidebar";
import HradminNavbar from "../../components/HradminNavbar";
import { AddInvoiceForm, AddReceiptForm, AddClientForm } from '../../components/Forms';
import { toast } from 'sonner';

const Customers = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('invoice');
  const [showAddForm, setShowAddForm] = useState(null);

  const [invoices, setInvoices] = useState([
    { id: 'INV-001', client: 'Client A', date: '2024-07-29', amount: 1200.00, status: 'Paid' },
    { id: 'INV-002', client: 'Client B', date: '2024-07-28', amount: 800.00, status: 'Overdue' }
  ]);
  const [receipts, setReceipts] = useState([
    { id: 'REC-001', client: 'Client A', date: '2024-07-29', amount: 1200.00, method: 'Credit Card' }
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
  const handleBackFromForm = () => setShowAddForm(null);

  const handleInvoiceSubmit = (data) => {
    setInvoices(prev => [...prev, { id: data.invoiceNumber, client: data.client, date: data.invoiceDate, amount: data.totalAmount, status: 'Draft' }]);
    toast.success('Invoice added!');
    setShowAddForm(null);
  };
  const handleReceiptSubmit = (data) => {
    setReceipts(prev => [...prev, { id: data.receiptNumber, client: data.client, date: data.receiptDate, amount: data.amount, method: data.paymentMethod }]);
    toast.success('Receipt added!');
    setShowAddForm(null);
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
      case 'receipt': formComponent = <AddReceiptForm {...commonProps} onSubmit={handleReceiptSubmit} />; break;
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 text-sm">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm">{invoice.client}</td>
                  <td className="px-6 py-4 text-sm">{invoice.date}</td>
                  <td className="px-6 py-4 text-sm">${invoice.amount.toFixed(2)}</td>
                  <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{invoice.status}</span></td>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {receipts.map(r => (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-sm">{r.id}</td>
                  <td className="px-6 py-4 text-sm">{r.client}</td>
                  <td className="px-6 py-4 text-sm">{r.date}</td>
                  <td className="px-6 py-4 text-sm">${r.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">{r.method}</td>
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
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={`Search ${activeTab}...`} className="pl-10 pr-4 py-2 border rounded-lg w-64" />
          </div>
        </div>
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
          <div className="flex items-center mb-6 bg-gray-50 rounded-lg px-4 py-3">
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Customers; 