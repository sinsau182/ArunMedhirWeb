// Updated customers page with PRD implementation
import { useState } from 'react';
import { FaFileInvoiceDollar, FaReceipt, FaUsers, FaPlus, FaSearch } from 'react-icons/fa';
import Sidebar from "../../components/Sidebar";
import HradminNavbar from "../../components/HradminNavbar";

const Customers = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('invoice'); // Default to invoice tab
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const tabs = [
    { id: 'invoice', label: 'Invoice', icon: FaFileInvoiceDollar },
    { id: 'receipts', label: 'Receipts', icon: FaReceipt },
    { id: 'clients', label: 'Clients', icon: FaUsers },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'invoice':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <FaPlus className="w-4 h-4" />
                <span>Add Invoice</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">INV-001</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Client A</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">2024-07-29</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">$1,200.00</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">INV-002</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Client B</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">2024-07-28</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">$800.00</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Overdue</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'receipts':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search receipts..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <FaPlus className="w-4 h-4" />
                <span>Add Receipt</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                   <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">REC-001</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Client A</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">2024-07-29</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">$1,200.00</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Credit Card</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'clients':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <FaPlus className="w-4 h-4" />
                <span>Add Client</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                   <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Client A</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Tech Corp</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">client.a@example.com</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">555-1234</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Active</span></td>
                  </tr>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
        <p className="text-gray-600">Manage your customer relationships and transactions</p>
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
    </div>
    </div>
    </div>
  );
};

export default Customers; 