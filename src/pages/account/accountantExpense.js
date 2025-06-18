import React, { useState, useMemo } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import AccountantExpenseTable from "@/components/Accountant/AccountantExpenseTable";
import Modal from "@/components/Modal";
import AccountantExpenseForm from "@/components/Accountant/AccountantExpenseForm";
import { FiSearch } from 'react-icons/fi';
const mockExpenses = [
  {
    id: "EXP-001",
    createdBy: "John Doe",
    projectId: "PROJ-001",
    clientName: "Client Alpha",
    projectManager: "John Doe",
    budget: 100000,
    date: "2023-10-01",
    description: "Server rack for new office",
    category: "Hardware",
    vendorName: "Premium Hardware Supplies",
    amount: "50000",
    status: "Paid",
    paymentProof: "/path/to/proof1.pdf",
    rejectionComment: "",
  },
  {
    id: "EXP-002",
    createdBy: "Jane Smith",
    projectId: "PROJ-002",
    clientName: "Client Beta",
    projectManager: "Jane Smith",
    budget: 150000,
    date: "2023-10-03",
    description: "Graphic design services for marketing campaign",
    category: "Services",
    vendorName: "Creative Solutions LLC",
    amount: "75000",
    status: "Yet to be Paid",
    paymentProof: null,
    rejectionComment: "",
  },
  {
    id: "EXP-003",
    createdBy: "John Doe",
    projectId: "PROJ-001",
    clientName: "Client Alpha",
    projectManager: "John Doe",
    budget: 100000,
    date: "2023-10-05",
    description: "Office stationery supplies",
    category: "Stationary",
    vendorName: "Office Essentials Co.",
    amount: "5000",
    status: "Rejected",
    paymentProof: null,
    rejectionComment: "Incorrect invoice attached. Please revise and resubmit.",
  },
];

const styles = {
  pageContainer: (isCollapsed) => ({
    marginLeft: isCollapsed ? "80px" : "280px",
    marginTop: "80px",
    padding: "32px",
    background: "#f9fafb",
    minHeight: "100vh",
    transition: "margin-left 0.3s ease",
    fontFamily: "'Inter', sans-serif",
  }),
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { fontWeight: 700, fontSize: "2rem", marginBottom: 4, color: "#111827" },
  subtitle: { color: "#6b7280", fontSize: "1rem" },
  createButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(37,99,235,0.2)",
    transition: "all 0.2s ease-in-out",
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    background: '#ffffff',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  filters: {
    display: 'flex',
    gap: '12px',
  },
  filterButton: (isActive) => ({
    padding: '8px 16px',
    borderRadius: 8,
    border: `1px solid ${isActive ? '#2563eb' : '#e5e7eb'}`,
    background: isActive ? '#eff6ff' : '#fff',
    color: isActive ? '#2563eb' : '#374151',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    fontSize: '0.875rem',
  }),
  searchContainer: {
    position: 'relative',
    width: '320px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 16px 10px 40px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    fontSize: '1rem',
    background: '#f9fafb'
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
};

const AccountantExpensesPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Load user preferences from localStorage
  const [userPreferences, setUserPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accountantExpensePreferences');
      return saved ? JSON.parse(saved) : { statusFilter: 'All', searchQuery: '' };
    }
    return { statusFilter: 'All', searchQuery: '' };
  });

  // Save user preferences to localStorage
  const saveUserPreferences = (newPreferences) => {
    setUserPreferences(newPreferences);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accountantExpensePreferences', JSON.stringify(newPreferences));
    }
  };

  // Initialize filters from user preferences
  React.useEffect(() => {
    setStatusFilter(userPreferences.statusFilter);
    setSearchQuery(userPreferences.searchQuery);
  }, []);

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    saveUserPreferences({ ...userPreferences, statusFilter: newStatus });
  };

  const handleSearchChange = (newQuery) => {
    setSearchQuery(newQuery);
    saveUserPreferences({ ...userPreferences, searchQuery: newQuery });
  };

  // Simulate loading state for demo
  const simulateLoading = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (err) {
      setError('Failed to load expenses. Please try again.');
      setLoading(false);
    }
  };

  // Show success message
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filteredExpenses = useMemo(() => {
    return mockExpenses.filter(expense => {
      const statusMatch = statusFilter === 'All' || (statusFilter === 'Pending' ? expense.status === 'Yet to be Paid' : expense.status === statusFilter);
      const searchMatch = !searchQuery ||
        expense.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [statusFilter, searchQuery]);

  return (
    <>
      <HradminNavbar />
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div style={styles.pageContainer(isSidebarCollapsed)}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Accountant Expense Panel</h1>
            <div style={styles.subtitle}>Create, manage, and track all project-related expenses.</div>
          </div>
          <button style={styles.createButton} onClick={handleCreateExpense}>
            + Create New Expense
          </button>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.filters}>
            {['All', 'Paid', 'Pending', 'Rejected'].map(status => (
              <button key={status} style={styles.filterButton(statusFilter === status)} onClick={() => handleStatusFilterChange(status)}>
                {status}
              </button>
            ))}
          </div>
          <div style={styles.searchContainer}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by ID, project, client..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: 500 }}>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#166534',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        <AccountantExpenseTable
          expenses={filteredExpenses}
          onEdit={handleEditExpense}
          loading={loading}
          error={error}
          preferencesKey="accountantExpenseColumns"
          showProjectManager={true}
        />
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <AccountantExpenseForm
            expense={editingExpense}
            onClose={handleCloseModal}
          />
      </Modal>
    </>
  );
};

export default withAuth(AccountantExpensesPage); 