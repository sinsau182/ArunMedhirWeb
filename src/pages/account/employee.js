// Employee page implementation based on PRD
import { useState } from 'react';
import { FaReceipt, FaPlus, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { AddExpenseForm } from '../../components/Forms';
import Sidebar from "../../components/Sidebar";
import HradminNavbar from "../../components/HradminNavbar";
import { toast } from 'sonner';
import SearchBarWithFilter from '../../components/SearchBarWithFilter';

const Employee = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddForm, setShowAddForm] = useState(null);
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      date: '22-06-25',
      expenseType: 'Travel',
      category: 'Business',
      amount: 2500,
      vendor: 'Uber India',
      projectJob: 'Project A',
      description: 'Airport taxi from airport to office',
      status: 'Paid',
      receipt: 'Yes',
      paymentProof: 'Yes',
    },
    {
      id: 2,
      date: '21-06-25',
      expenseType: 'Meals',
      category: 'Client',
      amount: 1200,
      vendor: 'Café Coffee Day',
      projectJob: 'Project B',
      description: 'Client lunch meeting',
      status: 'Pending',
      receipt: 'No',
      paymentProof: 'No',
    },
    {
      id: 3,
      date: '20-06-25',
      expenseType: 'Office Supplies',
      category: 'Admin',
      amount: 850,
      vendor: 'Amazon India',
      projectJob: 'Internal Development',
      description: 'Printer cartridges and paper',
      status: 'Paid',
      receipt: 'Yes',
      paymentProof: 'No',
    },
    {
      id: 4,
      date: '19-06-25',
      expenseType: 'Software',
      category: 'Business',
      amount: 5000,
      vendor: 'Adobe Systems',
      projectJob: 'Marketing Campaign',
      description: 'Adobe Creative Suite license',
      status: 'Paid',
      receipt: 'Yes',
      paymentProof: 'Yes',
    }
  ]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const handleTabClick = (tab) => setActiveTab(tab);
  const handleAddClick = () => setShowAddForm('expense');
  const handleBackFromForm = () => setShowAddForm(null);

  const handleExpenseSubmit = (expenseData) => {
    setExpenses(prev => [...prev, {
      id: prev.length + 1,
      date: expenseData.date,
      expenseType: expenseData.expenseType,
      category: expenseData.category,
      amount: expenseData.amount,
      vendor: expenseData.vendor || '-',
      projectJob: expenseData.projectJob || '-',
      description: expenseData.description,
      status: 'Pending',
      receipt: expenseData.receipt ? 'Yes' : 'No',
      paymentProof: expenseData.paymentProof ? 'Yes' : 'No',
    }]);
    toast.success('Expense added successfully!');
    setShowAddForm(null);
  };

  const tabs = [
    { id: 'expenses', label: 'Reimbursements', icon: FaReceipt },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAddForm = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
            <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
          </button>
          <h2 className="text-xl font-bold text-gray-900">Add New Expense</h2>
        </div>
        <AddExpenseForm
          onSubmit={handleExpenseSubmit}
          onCancel={handleBackFromForm}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (showAddForm) {
      return renderAddForm();
    }

    switch (activeTab) {
      case 'expenses':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Expense Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Project/Job</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Receipt</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{expense.date}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{expense.expenseType}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{expense.category}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${expense.vendor !== '-' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                          {expense.vendor}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${expense.projectJob !== '-' ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                          {expense.projectJob}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate" title={expense.description}>
                        {expense.description}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          expense.receipt === 'Yes'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {expense.receipt === 'Yes' ? '📎' : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          expense.paymentProof === 'Yes'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {expense.paymentProof === 'Yes' ? '📎' : '-'}
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
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentRole={"employee"}
      />
      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-56"} transition-all duration-300 overflow-x-auto`}>
        <HradminNavbar />
        <div className="p-6 pt-24">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employees</h1>
          </div>
          <div className="flex justify-between items-center mb-6 bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 font-semibold shadow-sm mr-6 text-sm"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Reimb.</span>
              </button>
              <nav className="flex space-x-6">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-2 whitespace-nowrap pb-1 px-1 border-b-2 font-medium text-sm ${
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
            <SearchBarWithFilter />
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Employee;
