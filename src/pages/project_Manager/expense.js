import React, { useState, useMemo } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import Modal from "@/components/Modal";
import CreateExpenseForm from "@/components/ProjectManager/CreateExpenseForm";
import { FiSearch, FiFilter, FiChevronDown, FiX } from 'react-icons/fi';
import { FaRegTrashAlt, FaPaperPlane } from 'react-icons/fa';
import AccountantExpenseTable from "@/components/Accountant/AccountantExpenseTable";

const mockExpenses = [
    { id: "EXP-001", createdBy: "Test Name", projectId: "PROJ-001", clientName: "Client Alpha", date: "2023-10-10", description: "Server rack for new office", category: "Hardware", vendorName: "Premium Hardware Supplies", amount: "50000", status: "Paid", paymentProof: "/path/to/proof1.pdf", rejectionComment: "" },
    { id: "EXP-002", createdBy: "Test Name", projectId: "PROJ-002", clientName: "Client Beta", date: "2023-10-12", description: "Graphic design services for the new campaign launch", category: "Services", vendorName: "Creative Solutions LLC", amount: "75000", status: "Pending", paymentProof: null, rejectionComment: "" },
    { id: "EXP-003", createdBy: "Test Name", projectId: "PROJ-001", clientName: "Client Alpha", date: "2023-10-05", description: "Office stationery supplies for the entire team", category: "Stationary", vendorName: "Office Essentials Co.", amount: "5000", status: "Rejected", paymentProof: null, rejectionComment: "Incorrect invoice attached. Please re-upload with the correct document." },
    { id: "EXP-004", createdBy: "Another User", projectId: "PROJ-003", clientName: "Client Gamma", date: "2023-10-11", description: "Team Lunch", category: "Miscellaneous", vendorName: "The Grand Restaurant", amount: "8000", status: "Paid", paymentProof: "/path/to/proof2.pdf", rejectionComment: "" },
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
  },
  filters: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  filterButton: (isActive) => ({
    padding: '8px 16px',
    borderRadius: 8,
    border: `1px solid ${isActive ? '#2563eb' : '#e5e7eb'}`,
    background: isActive ? '#eff6ff' : '#fff',
    color: isActive ? '#2563eb' : '#374151',
    fontWeight: isActive ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    textDecoration: isActive ? 'underline' : 'none',
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
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  advancedFilterButton: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#374151',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterMenu: {
    position: 'absolute', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10,
    top: '110%', width: 300, padding: 16
  },
  bulkActionBar: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '8px 16px', background: '#eef2ff', borderRadius: 8,
    border: '1px solid #c7d2fe'
  }
};

const PMExpensesPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advFilters, setAdvFilters] = useState({ dateFrom: '', dateTo: '', vendor: '' });

  const loggedInUser = "Test Name";

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
  }

  const handleAdvFilterChange = (e) => {
    setAdvFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const clearAdvFilters = () => {
    setAdvFilters({ dateFrom: '', dateTo: '', vendor: '' });
    setShowAdvancedFilters(false);
  }

  const filteredExpenses = useMemo(() => {
    return mockExpenses
      .filter(expense => expense.createdBy === loggedInUser)
      .filter(expense => {
        const statusMatch = statusFilter === 'All' || expense.status === statusFilter;

        const date = new Date(expense.date);
        const dateFrom = advFilters.dateFrom ? new Date(advFilters.dateFrom) : null;
        const dateTo = advFilters.dateTo ? new Date(advFilters.dateTo) : null;
        if (dateFrom) dateFrom.setHours(0,0,0,0);
        if (dateTo) dateTo.setHours(23,59,59,999);

        const dateMatch = (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
        const vendorMatch = !advFilters.vendor || expense.vendorName === advFilters.vendor;

        const searchMatch = !searchQuery ||
          Object.values(expense).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
          );

        return statusMatch && searchMatch && dateMatch && vendorMatch;
    });
  }, [statusFilter, searchQuery, loggedInUser, advFilters]);

  const uniqueVendors = [...new Set(mockExpenses.map(e => e.vendorName))];

  return (
    <>
      <HradminNavbar />
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div style={styles.pageContainer(isSidebarCollapsed)}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Expenses</h1>
            <div style={styles.subtitle}>Track and manage your expense submissions</div>
          </div>
          <button style={styles.createButton} onClick={handleCreateExpense}>
            + Create New Expense
          </button>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.filters}>
            {['All', 'Paid', 'Pending', 'Rejected'].map(status => (
              <button key={status} style={styles.filterButton(statusFilter === status)} onClick={() => setStatusFilter(status)}>
                {status}
              </button>
            ))}
            <div style={{position: 'relative'}}>
              <button style={styles.advancedFilterButton} onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                <FiFilter size={14} />
                <span>More Filters</span>
                <FiChevronDown size={16} />
              </button>
              {showAdvancedFilters && (
                <div style={styles.filterMenu}>
                  <h4 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>Filter by</h4>
                  <select name="vendor" value={advFilters.vendor} onChange={handleAdvFilterChange} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', marginBottom: 16 }}>
                      <option value="">All Vendors</option>
                      {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      <div>
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>From</label>
                          <input type="date" name="dateFrom" value={advFilters.dateFrom} onChange={handleAdvFilterChange} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', marginTop: 4 }}/>
                      </div>
                      <div>
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>To</label>
                          <input type="date" name="dateTo" value={advFilters.dateTo} onChange={handleAdvFilterChange} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', marginTop: 4 }}/>
                      </div>
                  </div>
                  <button onClick={clearAdvFilters} style={{ width: '100%', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textAlign: 'right' }}>Clear all</button>
                </div>
              )}
            </div>
          </div>
          <div style={styles.searchContainer}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search anything..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <AccountantExpenseTable
          expenses={filteredExpenses}
          onEdit={handleEditExpense}
          preferencesKey="pmExpenseColumns"
        />
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <CreateExpenseForm
            expense={editingExpense}
            onClose={handleCloseModal}
          />
      </Modal>
    </>
  );
};

export default withAuth(PMExpensesPage);