import React, { useState, useMemo, useEffect, useRef } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import AccountantExpenseTable from "@/components/Accountant/AccountantExpenseTable";
import Modal from "@/components/Modal";
import AccountantExpenseForm from "@/components/Accountant/AccountantExpenseForm";
import { FiSearch, FiFilter, FiChevronDown, FiStar, FiColumns } from 'react-icons/fi';
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
    marginTop: "40px",
    padding: "32px 32px 32px 16px",
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
    marginBottom: 24,
    position: 'relative',
  },
  searchFilterContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    width: '520px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 140px 12px 48px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    background: 'transparent',
    '&:focus': {
      outline: 'none',
    },
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  filterTriggerButton: {
    position: 'absolute',
    right: 1,
    top: 1,
    bottom: 1,
    background: '#f9fafb',
    border: 'none',
    borderLeft: '1px solid #e5e7eb',
    padding: '0 16px',
    borderTopRightRadius: '7px',
    borderBottomRightRadius: '7px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#374151',
    fontWeight: 500,
    transition: 'background 0.2s',
    '&:hover': {
      background: '#f3f4f6'
    }
  },
  advancedSearchDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '600px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    zIndex: 100,
    marginTop: '8px',
    border: '1px solid #e5e7eb',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    padding: '24px',
    gap: '32px',
  },
  dropdownSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRight: '1px solid #f3f4f6',
    paddingRight: '32px',
  },
  dropdownSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '8px'
  },
  dropdownItem: {
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    '&:hover': {
      background: '#f9fafb'
    },
    fontWeight: 500
  },
  dateFilterContainer: {
    display: 'flex',
    gap: '12px'
  },
  dropdownFormControl: {
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '0.875rem',
    width: '100%',
  },
  tagsContainer: {
    position: 'absolute',
    left: 48,
    top: '50%',
    transform: 'translateY(-50%)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    maxWidth: 'calc(100% - 150px)',
    overflow: 'hidden',
  },
  filterTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#eef2ff',
    color: '#4338ca',
    fontWeight: 500,
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
  },
  removeTagButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    lineHeight: 1,
    color: '#4338ca',
    '&:hover': {
      color: '#c4b5fd'
    }
  },
  clearAllButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontWeight: 600,
    textDecoration: 'underline',
    fontSize: '0.8rem',
    marginLeft: '4px',
    whiteSpace: 'nowrap'
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
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const dropdownRef = useRef(null);
  const tagsContainerRef = useRef(null);
  const [inputPaddingLeft, setInputPaddingLeft] = useState(48);

  const [filters, setFilters] = useState({
    status: 'All',
    searchQuery: '',
    clientName: 'All',
    projectManager: 'All',
    category: 'All',
    dateFrom: '',
    dateTo: '',
  });
  const [groupBy, setGroupBy] = useState('');

  const activeFilters = useMemo(() => {
    const active = [];
    if (filters.status && filters.status !== 'All') active.push({ key: 'status', label: `Status: ${filters.status}` });
    if (filters.clientName && filters.clientName !== 'All') active.push({ key: 'clientName', label: `Client: ${filters.clientName}` });
    if (filters.projectManager && filters.projectManager !== 'All') active.push({ key: 'projectManager', label: `Manager: ${filters.projectManager}` });
    if (filters.category && filters.category !== 'All') active.push({ key: 'category', label: `Category: ${filters.category}` });
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom;
      const to = filters.dateTo;
      let label = 'Date: ';
      if (from && to) label += `${from} to ${to}`;
      else if (from) label += `From ${from}`;
      else label += `Up to ${to}`;
      active.push({ key: 'dateRange', label });
    }
    if (groupBy) active.push({ key: 'groupBy', label: `Group by: ${groupBy}` });

    return active;
  }, [filters, groupBy]);

  useEffect(() => {
    const basePadding = 48;
    if (tagsContainerRef.current) {
      const tagsWidth = tagsContainerRef.current.offsetWidth;
      setInputPaddingLeft(basePadding + tagsWidth + (tagsWidth > 0 ? 8 : 0));
    } else {
      setInputPaddingLeft(basePadding);
    }
  }, [activeFilters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAdvancedSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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

  const handleRemoveFilter = (key) => {
    if (key === 'groupBy') {
      setGroupBy('');
    } else if (key === 'dateRange') {
      setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
    } else {
      setFilters(prev => ({ ...prev, [key]: 'All' }));
    }
  };

  const clearAllFilters = () => {
    setFilters(prev => ({
      searchQuery: prev.searchQuery,
      status: 'All',
      clientName: 'All',
      projectManager: 'All',
      category: 'All',
      dateFrom: '',
      dateTo: '',
    }));
    setGroupBy('');
  };

  const filteredExpenses = useMemo(() => {
    return mockExpenses.filter(expense => {
      const { status, searchQuery, clientName, projectManager, category, dateFrom, dateTo } = filters;
      
      const statusMatch = status === 'All' || (status === 'Pending' ? expense.status === 'Yet to be Paid' : expense.status === status);
      
      const searchMatch = !searchQuery ||
        expense.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.vendorName.toLowerCase().includes(searchQuery.toLowerCase());

      const clientMatch = clientName === 'All' || expense.clientName === clientName;
      const pmMatch = projectManager === 'All' || expense.projectManager === projectManager;
      const categoryMatch = category === 'All' || expense.category === category;
      
      const expenseDate = new Date(expense.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      if(fromDate) fromDate.setHours(0,0,0,0);
      if(toDate) toDate.setHours(23,59,59,999);

      const dateMatch = (!fromDate || expenseDate >= fromDate) && (!toDate || expenseDate <= toDate);

      return statusMatch && searchMatch && clientMatch && pmMatch && categoryMatch && dateMatch;
    });
  }, [filters]);

  const uniqueClients = [...new Set(mockExpenses.map(e => e.clientName))];
  const uniqueProjectManagers = [...new Set(mockExpenses.map(e => e.projectManager))];
  const uniqueCategories = [...new Set(mockExpenses.map(e => e.category))];

  return (
    <>
      <HradminNavbar />
      <div style={{ background: '#f9fafb', minHeight: '100vh', width: '100vw' }}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div style={styles.pageContainer(isSidebarCollapsed)}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            padding: '32px',
            marginBottom: 32,
          }}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Accountant Expense Panel</h1>
            <div style={styles.subtitle}>Create, manage, and track all project-related expenses.</div>
          </div>
          <button style={styles.createButton} onClick={handleCreateExpense}>
            + Create New Expense
          </button>
        </div>

            <div style={styles.toolbar} ref={dropdownRef}>
              <div style={styles.searchFilterContainer}>
                <FiSearch size={20} style={styles.searchIcon} />

                <div ref={tagsContainerRef} style={styles.tagsContainer}>
                  {activeFilters.map(f => (
                    <span key={f.key} style={styles.filterTag}>
                      {f.label}
                      <button onClick={() => handleRemoveFilter(f.key)} style={styles.removeTagButton}>
                        &times;
              </button>
                    </span>
            ))}
                  {activeFilters.length > 0 && (
                    <button onClick={clearAllFilters} style={styles.clearAllButton}>Clear All</button>
                  )}
          </div>

            <input
              type="text"
                  placeholder={activeFilters.length > 0 ? '' : "Search expenses by ID, project, client, or vendor..."}
                  style={{ ...styles.searchInput, paddingLeft: inputPaddingLeft }}
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                />
                <button 
                  style={styles.filterTriggerButton}
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                >
                  <FiFilter size={16} />
                  <span>Filters</span>
                </button>
              </div>

              {showAdvancedSearch && (
                <div style={styles.advancedSearchDropdown}>
                  {/* Filters Section */}
                  <div style={styles.dropdownSection}>
                    <h3 style={styles.dropdownSectionTitle}><FiFilter /> Filters</h3>
                    
                    {/* Status Filter */}
                    <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} style={styles.dropdownFormControl}>
                      {['All', 'Paid', 'Pending', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Client Filter */}
                    <select value={filters.clientName} onChange={e => handleFilterChange('clientName', e.target.value)} style={styles.dropdownFormControl}>
                      <option value="All">All Clients</option>
                      {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {/* Project Manager Filter */}
                    <select value={filters.projectManager} onChange={e => handleFilterChange('projectManager', e.target.value)} style={styles.dropdownFormControl}>
                      <option value="All">All Project Managers</option>
                      {uniqueProjectManagers.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                    </select>
                    
                    {/* Category Filter */}
                    <select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)} style={styles.dropdownFormControl}>
                      <option value="All">All Categories</option>
                      {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    
                    {/* Date Filter */}
                    <div style={styles.dateFilterContainer}>
                      <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} style={styles.dropdownFormControl}/>
                      <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} style={styles.dropdownFormControl}/>
          </div>
                  </div>
                  
                  {/* Group By Section */}
                  <div style={{...styles.dropdownSection, borderRight: 'none', paddingRight: 0}}>
                    <h3 style={styles.dropdownSectionTitle}><FiColumns /> Group By</h3>
                    {['None', 'projectId', 'clientName', 'projectManager', 'status'].map(group => (
                      <div 
                        key={group}
                        style={{...styles.dropdownItem, background: groupBy === group ? '#eff6ff' : 'none', color: groupBy === group ? '#2563eb' : 'inherit'}} 
                        onClick={() => setGroupBy(group === 'None' ? '' : group)}
                      >
                        {group.charAt(0).toUpperCase() + group.slice(1).replace('Id', ' ID')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              groupBy={groupBy}
        />
          </div>
        </div>
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