import React, { useState, useMemo, useEffect, useRef } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import Modal from "@/components/Modal";
import CreateExpenseForm from "@/components/ProjectManager/CreateExpenseForm";
import { FiSearch, FiFilter, FiChevronDown, FiX, FiColumns, FiEdit } from 'react-icons/fi';
import { FaRegTrashAlt, FaPaperPlane } from 'react-icons/fa';

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
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
      padding: '16px 24px',
      textAlign: 'left',
      fontWeight: 700,
      color: '#1f2937',
      borderBottom: '2px solid #e5e7eb',
      background: '#f9fafb',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
  },
  td: {
      padding: '14px 24px',
      borderBottom: '1px solid #f3f4f6',
      color: '#374151',
      fontSize: '0.875rem',
      lineHeight: '1.5',
  },
  groupHeaderRow: {
      background: '#f9fafb',
      cursor: 'pointer',
  },
  groupHeaderCell: {
      padding: '12px 24px',
      fontWeight: 600,
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '2px solid #e5e7eb',
  },
  emptyState: { 
    textAlign: 'center', padding: '64px 32px', background: 'white', 
    borderRadius: 12, border: '2px dashed #e5e7eb' 
  },
  statusBadge: (status) => {
    const baseStyle = { padding: '4px 12px', borderRadius: '9999px', fontWeight: 600, fontSize: '0.8rem' };
    switch(status) {
        case 'Paid': return { ...baseStyle, background: '#dcfce7', color: '#16a34a' };
        case 'Pending': return { ...baseStyle, background: '#fef9c3', color: '#ca8a04' };
        case 'Rejected': return { ...baseStyle, background: '#fee2e2', color: '#ef4444' };
        default: return { ...baseStyle, background: '#f3f4f6', color: '#4b5563' };
    }
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px'
  }
};

const PMExpensesPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [filters, setFilters] = useState({
    searchQuery: '',
    status: 'All',
    vendor: '',
    dateFrom: '',
    dateTo: '',
  });
  const [groupBy, setGroupBy] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  const dropdownRef = useRef(null);
  const tagsContainerRef = useRef(null);
  const [inputPaddingLeft, setInputPaddingLeft] = useState(48);

  const loggedInUser = "Test Name";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAdvancedSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const activeFilters = useMemo(() => {
    const active = [];
    if (filters.status && filters.status !== 'All') active.push({ key: 'status', label: `Status: ${filters.status}` });
    if (filters.vendor) active.push({ key: 'vendor', label: `Vendor: ${filters.vendor}` });
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRemoveFilter = (key) => {
    if (key === 'groupBy') {
      setGroupBy('');
    } else if (key === 'dateRange') {
      setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
    } else if (key === 'vendor') {
      setFilters(prev => ({ ...prev, vendor: '' }));
    } else {
      setFilters(prev => ({ ...prev, [key]: 'All' }));
    }
  };
  
  const clearAllFilters = () => {
    setFilters(prev => ({
      searchQuery: prev.searchQuery,
      status: 'All',
      vendor: '',
      dateFrom: '',
      dateTo: '',
    }));
    setGroupBy('');
    setShowAdvancedSearch(false);
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({...prev, [groupKey]: !prev[groupKey]}));
  };

  const filteredExpenses = useMemo(() => {
    return mockExpenses
      .filter(expense => expense.createdBy === loggedInUser)
      .filter(expense => {
        const { searchQuery, status, vendor, dateFrom, dateTo } = filters;
        const statusMatch = status === 'All' || expense.status === status;

        const date = new Date(expense.date);
        const startDate = dateFrom ? new Date(dateFrom) : null;
        const endDate = dateTo ? new Date(dateTo) : null;
        if (startDate) startDate.setHours(0,0,0,0);
        if (endDate) endDate.setHours(23,59,59,999);

        const dateMatch = (!startDate || date >= startDate) && (!endDate || date <= endDate);
        const vendorMatch = !vendor || expense.vendorName === vendor;

        const searchMatch = !searchQuery ||
          Object.values(expense).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
          );

        return statusMatch && searchMatch && dateMatch && vendorMatch;
    });
  }, [filters, loggedInUser]);

  const groupedExpenses = useMemo(() => {
    if (!groupBy) return null;
    return filteredExpenses.reduce((acc, expense) => {
        const key = expense[groupBy] || 'N/A';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(expense);
        return acc;
    }, {});
  }, [filteredExpenses, groupBy]);

  const uniqueVendors = [...new Set(mockExpenses.map(e => e.vendorName))];

  const ExpenseRow = ({ expense, index }) => (
    <tr key={expense.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
        <td style={styles.td}>{expense.id}</td>
        <td style={styles.td}>{expense.projectId}</td>
        <td style={styles.td}>{expense.clientName}</td>
        <td style={styles.td}>{new Date(expense.date).toLocaleDateString()}</td>
        <td style={styles.td}>{expense.category}</td>
        <td style={styles.td}>{expense.vendorName}</td>
        <td style={{...styles.td, textAlign: 'right'}}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(expense.amount)}</td>
        <td style={styles.td}><span style={styles.statusBadge(expense.status)}>{expense.status}</span></td>
        <td style={styles.td}>
            <button onClick={() => handleEditExpense(expense)} style={styles.actionButton}>
                <FiEdit size={16} />
            </button>
        </td>
    </tr>
  );

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

        <div style={styles.toolbar} ref={dropdownRef}>
          <div style={styles.searchFilterContainer}>
            <FiSearch size={20} style={styles.searchIcon} />

            <div ref={tagsContainerRef} style={styles.tagsContainer}>
              {activeFilters.map(f => (
                <span key={f.key} style={styles.filterTag}>
                  {f.label}
                  <button onClick={() => handleRemoveFilter(f.key)} style={styles.removeTagButton}>
                    <FiX size={14} />
                  </button>
                </span>
              ))}
              {activeFilters.length > 0 && (
                <button onClick={clearAllFilters} style={styles.clearAllButton}>Clear All</button>
              )}
            </div>

            <input
              type="text"
              placeholder={activeFilters.length > 0 ? '' : "Search expenses..."}
              style={{ ...styles.searchInput, paddingLeft: inputPaddingLeft }}
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            />
            <button style={styles.filterTriggerButton} onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
              <FiFilter size={16} />
              <span>Filters</span>
            </button>
          </div>

          {showAdvancedSearch && (
            <div style={styles.advancedSearchDropdown}>
              {/* Filters Section */}
              <div style={styles.dropdownSection}>
                <h3 style={styles.dropdownSectionTitle}><FiFilter /> Filters</h3>
                
                <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} style={styles.dropdownFormControl}>
                  {['All', 'Paid', 'Pending', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select value={filters.vendor} onChange={e => handleFilterChange('vendor', e.target.value)} style={styles.dropdownFormControl}>
                  <option value="">All Vendors</option>
                  {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                
                <div style={styles.dateFilterContainer}>
                  <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} style={styles.dropdownFormControl}/>
                  <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} style={styles.dropdownFormControl}/>
                </div>
              </div>
              
              {/* Group By Section */}
              <div style={{...styles.dropdownSection, borderRight: 'none', paddingRight: 0}}>
                <h3 style={styles.dropdownSectionTitle}><FiColumns /> Group By</h3>
                {['None', 'projectId', 'clientName', 'category', 'status'].map(group => (
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

        <div style={styles.tableContainer}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Project ID</th>
                        <th style={styles.th}>Client</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Vendor</th>
                        <th style={{...styles.th, textAlign: 'right'}}>Amount</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                  {!groupBy && filteredExpenses.length > 0 ? (
                      filteredExpenses.map((expense, index) => <ExpenseRow key={expense.id} expense={expense} index={index} />)
                  ) : groupBy && groupedExpenses && Object.keys(groupedExpenses).length > 0 ? (
                      Object.keys(groupedExpenses).sort().map(groupKey => (
                          <React.Fragment key={groupKey}>
                              <tr style={styles.groupHeaderRow} onClick={() => toggleGroup(groupKey)}>
                                  <td colSpan="9" style={styles.groupHeaderCell}>
                                      {expandedGroups[groupKey] ? <FiChevronDown size={20} /> : <FiChevronDown size={20} style={{transform: 'rotate(-90deg)'}}/>}
                                      <span>{groupKey}</span>
                                      <span style={{color: '#6b7280', fontWeight: 500}}>({groupedExpenses[groupKey].length} expenses)</span>
                                  </td>
                              </tr>
                              {expandedGroups[groupKey] && groupedExpenses[groupKey].map((expense, index) => <ExpenseRow key={expense.id} expense={expense} index={index} />)}
                          </React.Fragment>
                      ))
                  ) : (
                      <tr>
                          <td colSpan="9">
                              <div style={styles.emptyState}>
                                  <FiSearch size={48} color="#d1d5db" style={{ marginBottom: 16 }}/>
                                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>No matching expenses found</h3>
                                  <p style={{ color: '#6b7280', marginBottom: 24 }}>Try adjusting your filters or create a new expense.</p>
                              </div>
                          </td>
                      </tr>
                  )}
                </tbody>
            </table>
        </div>
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