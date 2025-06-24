import React, { useState, useEffect, useMemo, useRef } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { fetchIncomeByEmployeeId } from "@/redux/slices/incomesSlice";
import { FaFilePdf, FaFileImage, FaLink, FaFilter, FaCalendarAlt, FaSearch } from "react-icons/fa";
import { FiChevronDown, FiChevronRight, FiX, FiSearch, FiColumns, FiFilter } from "react-icons/fi";

// Mock data to simulate what's coming from Redux for development
const mockIncomes = [
  {
    incomeId: 'INC-001',
    projectId: 'PROJ-001',
    clientName: 'Client Alpha',
    amount: 50000,
    paymentDate: '2023-10-15T10:00:00Z',
    paymentMethod: 'Bank Transfer/NEFT/RTGS',
    file: 'proof_alpha.pdf',
    comments: 'Final settlement for Q3 services.',
    status: 'Approved',
  },
  {
    incomeId: 'INC-002',
    projectId: 'PROJ-002',
    clientName: 'Client Beta',
    amount: 25000,
    paymentDate: '2023-10-20T14:30:00Z',
    paymentMethod: 'UPI (GPay, PhonePe, Paytm)',
    file: 'proof_beta.jpg',
    comments: 'Advance payment for project kickoff.',
    status: 'Pending',
  },
  {
    incomeId: 'INC-004',
    projectId: 'PROJ-001',
    clientName: 'Client Alpha',
    amount: 15000,
    paymentDate: '2023-09-01T10:00:00Z',
    paymentMethod: 'Credit Card',
    file: 'proof_alpha_2.png',
    comments: 'Initial project advance.',
    status: 'Approved',
  },
  {
    incomeId: 'INC-003',
    projectId: 'PROJ-003',
    clientName: 'Client Gamma',
    amount: 75000,
    paymentDate: '2023-10-22T11:00:00Z',
    paymentMethod: 'Cheque',
    file: 'proof_gamma.png',
    comments: 'Mid-project milestone payment. Cheque number #12345.',
    status: 'Approved',
  },
];

const styles = {
    pageContainer: { background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    contentArea: (isCollapsed) => ({ marginLeft: isCollapsed ? 80 : 250, paddingTop: 80, paddingLeft: 32, paddingRight: 32, paddingBottom: 32, transition: 'margin-left 0.3s' }),
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 700, color: '#111827' },
    subtitle: { color: '#6b7280', fontSize: "1rem", marginTop: 4 },
    addButton: { background: '#2563eb', color: 'white', fontWeight: 600, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
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
        transition: 'background 0.2s',
        lineHeight: '1.5',
    },
    fileLink: { color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 },
    emptyState: { textAlign: 'center', padding: '64px 32px', background: 'white', borderRadius: 12 },
    expandableRow: {
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    expandedContent: { padding: '0' },
    subTableContainer: { padding: '16px 24px' },
    subTable: { width: '100%', borderCollapse: 'collapse' },
    subTh: {
        padding: '12px 24px',
        textAlign: 'left',
        fontSize: '0.7rem',
        color: '#2563eb',
        background: '#f1f6fd',
        borderBottom: '1px solid #e0e7ff',
        textTransform: 'uppercase',
    },
    subTd: {
        padding: '14px 24px',
        borderBottom: '1px solid #f3f4f6',
        fontSize: '0.875rem'
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
};

const formatCurrency = (amount) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount)}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const ProofOfPaymentLink = ({ file }) => {
    const getFileIcon = (fileName) => {
        if (!fileName) return <FaLink />;
        const extension = fileName.split('.').pop().toLowerCase();
        if (extension === 'pdf') return <FaFilePdf color="#ef4444" />;
        if (['jpg', 'jpeg', 'png'].includes(extension)) return <FaFileImage color="#2563eb" />;
        return <FaLink />;
    };

    return (
        <a href={`/path/to/proofs/${file}`} target="_blank" rel="noopener noreferrer" style={styles.fileLink}>
            {getFileIcon(file)} View File
        </a>
    );
};

const Income = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const router = useRouter();
    // const dispatch = useDispatch();
    // const { incomes, loading, error } = useSelector((state) => state.incomes);

    // Using mock data for now
    const incomes = mockIncomes;
    const loading = false;
    const error = null;

    const [filters, setFilters] = useState({ 
      searchQuery: '', 
      clientName: 'All', 
      paymentMethod: 'All', 
      dateFrom: '', 
      dateTo: '' 
    });
    const [groupBy, setGroupBy] = useState('');
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({});
    
    const dropdownRef = useRef(null);
    const tagsContainerRef = useRef(null);
    const [inputPaddingLeft, setInputPaddingLeft] = useState(48);

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
        if (filters.clientName && filters.clientName !== 'All') active.push({ key: 'clientName', label: `Client: ${filters.clientName}` });
        if (filters.paymentMethod && filters.paymentMethod !== 'All') active.push({ key: 'paymentMethod', label: `Method: ${filters.paymentMethod}` });
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

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
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
          clientName: 'All',
          paymentMethod: 'All',
          dateFrom: '',
          dateTo: '',
        }));
        setGroupBy('');
    };

    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => ({...prev, [groupKey]: !prev[groupKey]}));
    }

    const filteredIncomes = useMemo(() => {
        return incomes.filter(income => {
            const { searchQuery, clientName, paymentMethod, dateFrom, dateTo } = filters;
            const paymentDate = new Date(income.paymentDate);
            const startDate = dateFrom ? new Date(dateFrom) : null;
            const endDate = dateTo ? new Date(dateTo) : null;

            if (startDate) startDate.setHours(0, 0, 0, 0);
            if (endDate) endDate.setHours(23, 59, 59, 999);

            const searchMatch = !searchQuery ||
                income.incomeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                income.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                income.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                income.comments.toLowerCase().includes(searchQuery.toLowerCase());

            return (
                searchMatch &&
                (clientName === 'All' || income.clientName === clientName) &&
                (paymentMethod === 'All' || income.paymentMethod === paymentMethod) &&
                (!startDate || paymentDate >= startDate) &&
                (!endDate || paymentDate <= endDate)
            );
        }).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    }, [incomes, filters]);

    const groupedIncomes = useMemo(() => {
        if (!groupBy) return null;
        return filteredIncomes.reduce((acc, income) => {
            const key = income[groupBy] || 'N/A';
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(income);
            return acc;
        }, {});
    }, [filteredIncomes, groupBy]);

    const uniqueClients = [...new Set(incomes.map(i => i.clientName))];
    const uniquePaymentMethods = [...new Set(incomes.map(i => i.paymentMethod))];

    return (
        <>
            <HradminNavbar />
            <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
            <div style={styles.pageContainer}>
                <div style={styles.contentArea(isSidebarCollapsed)}>
                    <div style={{
                        background: 'white',
                        borderRadius: 12,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        padding: '24px 32px'
                    }}>
                    <header style={styles.header}>
                            <div>
                        <h1 style={styles.title}>Payment Records</h1>
                                <div style={styles.subtitle}>Track all incoming payments and view transaction history.</div>
                            </div>
                        <button style={styles.addButton} onClick={() => router.push('/employee/add-income')}>
                           + Record New Payment
                        </button>
                    </header>
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
                                placeholder={activeFilters.length > 0 ? '' : "Search by ID, project, client, or notes..."}
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
                                    
                                    <select value={filters.clientName} onChange={e => handleFilterChange('clientName', e.target.value)} style={styles.dropdownFormControl}>
                                        <option value="All">All Clients</option>
                                            {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>

                                    <select value={filters.paymentMethod} onChange={e => handleFilterChange('paymentMethod', e.target.value)} style={styles.dropdownFormControl}>
                                        <option value="All">All Payment Methods</option>
                                            {uniquePaymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    
                                    <div style={styles.dateFilterContainer}>
                                        <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} style={styles.dropdownFormControl}/>
                                        <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} style={styles.dropdownFormControl}/>
                                            </div>
                                        </div>
                                
                                {/* Group By Section */}
                                <div style={{...styles.dropdownSection, borderRight: 'none', paddingRight: 0}}>
                                    <h3 style={styles.dropdownSectionTitle}><FiColumns /> Group By</h3>
                                    {['None', 'projectId', 'clientName', 'paymentMethod'].map(group => (
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
                                                            <th style={styles.th}>Project ID</th>
                                                            <th style={styles.th}>Client Name</th>
                                        <th style={styles.th}>Payment Date</th>
                                        <th style={styles.th}>Amount</th>
                                        <th style={styles.th}>Payment Method</th>
                                        <th style={styles.th}>Proof</th>
                                        <th style={styles.th}>Notes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading...</td></tr>
                                                        ) : error ? (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: 48, color: '#ef4444' }}>Error: {error}</td></tr>
                                    ) : !groupBy && filteredIncomes.length > 0 ? (
                                        filteredIncomes.map((income, index) => (
                                          <tr
                                            key={income.incomeId}
                                            style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}
                                          >
                                              <td style={styles.td}>{income.projectId}</td>
                                              <td style={styles.td}>{income.clientName}</td>
                                              <td style={styles.td}>{formatDate(income.paymentDate)}</td>
                                              <td style={styles.td}>{formatCurrency(income.amount)}</td>
                                              <td style={styles.td}>{income.paymentMethod}</td>
                                              <td style={styles.td}><ProofOfPaymentLink file={income.file} /></td>
                                              <td style={{...styles.td, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{income.comments}</td>
                                          </tr>
                                        ))
                                    ) : groupBy && groupedIncomes && Object.keys(groupedIncomes).length > 0 ? (
                                        Object.keys(groupedIncomes).sort().map(groupKey => (
                                            <React.Fragment key={groupKey}>
                                                <tr style={styles.groupHeaderRow} onClick={() => toggleGroup(groupKey)}>
                                                    <td colSpan="7" style={styles.groupHeaderCell}>
                                                        {expandedGroups[groupKey] ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                                                        <span>{groupKey}</span>
                                                        <span style={{color: '#6b7280', fontWeight: 500}}>({groupedIncomes[groupKey].length} records)</span>
                                                                    </td>
                                                                </tr>
                                                {expandedGroups[groupKey] && groupedIncomes[groupKey].map((income, index) => (
                                                    <tr key={income.incomeId} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                                                        <td style={styles.td}>{income.projectId}</td>
                                                        <td style={styles.td}>{income.clientName}</td>
                                                        <td style={styles.td}>{formatDate(income.paymentDate)}</td>
                                                        <td style={styles.td}>{formatCurrency(income.amount)}</td>
                                                        <td style={styles.td}>{income.paymentMethod}</td>
                                                        <td style={styles.td}><ProofOfPaymentLink file={income.file} /></td>
                                                        <td style={{...styles.td, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{income.comments}</td>
                                                                                        </tr>
                                                                                    ))}
                                                              </React.Fragment>
                                                            ))
                                                        ) : (
                                                            <tr>
                                            <td colSpan="7">
                                                                    <div style={styles.emptyState}>
                                                                        <FaSearch size={48} color="#d1d5db" style={{ marginBottom: 16 }}/>
                                                                        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>No matching records found</h3>
                                                                        <p style={{ color: '#6b7280', marginBottom: 24 }}>Try adjusting your filters or add a new payment record.</p>
                                                                         <button style={styles.addButton} onClick={() => router.push('/employee/add-income')}>
                                                                            + Record New Payment
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                    </div>
                                    </div>
                                </div>
                            </>
                        );
                    };

                    export default withAuth(Income);
