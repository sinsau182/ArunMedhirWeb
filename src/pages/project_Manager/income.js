import React, { useState, useEffect, useMemo } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { fetchIncomeByEmployeeId } from "@/redux/slices/incomesSlice";
import { FaFilePdf, FaFileImage, FaLink, FaFilter, FaCalendarAlt, FaSearch } from "react-icons/fa";
import { FiChevronDown, FiChevronRight, FiX } from "react-icons/fi";

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
    contentArea: (isCollapsed) => ({ marginLeft: isCollapsed ? 80 : 250, paddingTop: 64, transition: 'margin-left 0.3s' }),
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', background: '#fff', borderBottom: '1px solid #e5e7eb' },
    title: { fontSize: 28, fontWeight: 700, color: '#111827' },
    addButton: { background: '#2563eb', color: 'white', fontWeight: 600, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
    mainContent: { padding: '24px 32px' },
    filterBar: { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
    filterDropdown: { position: 'relative' },
    filterButton: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 500 },
    filterMenu: { position: 'absolute', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, top: '110%', width: 280, padding: 16 },
    tableContainer: { background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '16px 20px', textAlign: 'left', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', textTransform: 'uppercase', fontSize: 12, fontWeight: 600 },
    td: { padding: '16px 20px', borderBottom: '1px solid #e5e7eb', color: '#374151', fontSize: 14 },
    tr: { '&:hover': { background: '#f9fafb' } },
    fileLink: { color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 },
    emptyState: { textAlign: 'center', padding: '64px 32px', background: 'white', borderRadius: 12 },
    expandableRow: { cursor: 'pointer' },
    expandedContent: { background: '#f9fafb', padding: '0' },
    subTable: { width: '100%', borderCollapse: 'collapse' },
    subTh: { padding: '12px 16px', textAlign: 'left', background: '#eef2ff', color: '#4338ca', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #e5e7eb' },
    subTd: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#374151', fontSize: 14 },
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

    const [filters, setFilters] = useState({ clientName: '', paymentMethod: '', startDate: '', endDate: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);

    // useEffect(() => {
    //   dispatch(fetchIncomeByEmployeeId());
    // }, [dispatch]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ clientName: '', paymentMethod: '', startDate: '', endDate: '' });
        setShowFilters(false);
    }

    const toggleRowExpansion = (projectId) => {
        setExpandedRows(prev =>
            prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
        );
    }

    const filteredIncomes = useMemo(() => {
        return incomes.filter(income => {
            const paymentDate = new Date(income.paymentDate);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            if (startDate) startDate.setHours(0, 0, 0, 0);
            if (endDate) endDate.setHours(23, 59, 59, 999);

            return (
                (!filters.clientName || income.clientName === filters.clientName) &&
                (!filters.paymentMethod || income.paymentMethod === filters.paymentMethod) &&
                (!startDate || paymentDate >= startDate) &&
                (!endDate || paymentDate <= endDate)
            );
        });
    }, [incomes, filters]);

    const groupedIncomes = useMemo(() => {
        const groups = filteredIncomes.reduce((acc, income) => {
            const { projectId } = income;
            if (!acc[projectId]) {
                acc[projectId] = {
                    ...income,
                    totalAmount: 0,
                    paymentCount: 0,
                    payments: [],
                };
            }
            acc[projectId].totalAmount += income.amount;
            acc[projectId].paymentCount += 1;
            acc[projectId].payments.push(income);
            // Sort payments by date, most recent first
            acc[projectId].payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
            return acc;
        }, {});
        return Object.values(groups).sort((a, b) => a.projectId.localeCompare(b.projectId));
    }, [filteredIncomes]);

    const uniqueClients = [...new Set(incomes.map(i => i.clientName))];
    const uniquePaymentMethods = [...new Set(incomes.map(i => i.paymentMethod))];

    return (
        <>
            <HradminNavbar />
            <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
            <div style={styles.pageContainer}>
                <div style={styles.contentArea(isSidebarCollapsed)}>
                    <header style={styles.header}>
                        <h1 style={styles.title}>Payment Records</h1>
                        <button style={styles.addButton} onClick={() => router.push('/employee/add-income')}>
                           + Record New Payment
                        </button>
                    </header>
                    <main style={styles.mainContent}>
                        <div style={styles.filterBar}>
                            <div style={styles.filterDropdown}>
                                <button style={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
                                    <FaFilter size={14} color="#6b7280" />
                                    <span>Filters</span>
                                    <FiChevronDown size={16} />
                                </button>
                                {showFilters && (
                                    <div style={styles.filterMenu}>
                                        <h4 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>Filter by</h4>
                                        <select value={filters.clientName} onChange={e => handleFilterChange('clientName', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', marginBottom: 12 }}>
                                            <option value="">All Clients</option>
                                            {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <select value={filters.paymentMethod} onChange={e => handleFilterChange('paymentMethod', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', marginBottom: 16 }}>
                                            <option value="">All Payment Methods</option>
                                            {uniquePaymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                            <div>
                                                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>From</label>
                                                <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', marginTop: 4 }}/>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>To</label>
                                                <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', marginTop: 4 }}/>
                                            </div>
                                        </div>
                                        <button onClick={clearFilters} style={{ width: '100%', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textAlign: 'right' }}>Clear all</button>
                                    </div>
                                )}
                            </div>
                        </div>
                       <div style={styles.tableContainer}>
                                                <table style={styles.table}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{...styles.th, width: 40}}></th>
                                                            <th style={styles.th}>Project ID</th>
                                                            <th style={styles.th}>Client Name</th>
                                                            <th style={styles.th}>Total Amount Received</th>
                                                            <th style={styles.th}>Payments</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading...</td></tr>
                                                        ) : error ? (
                                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: 48, color: '#ef4444' }}>Error: {error}</td></tr>
                                                        ) : groupedIncomes.length > 0 ? (
                                                            groupedIncomes.map((group, index) => (
                                                              <React.Fragment key={group.projectId}>
                                                                <tr
                                                                  style={{ ...styles.expandableRow, backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}
                                                                  onClick={() => toggleRowExpansion(group.projectId)}
                                                                >
                                                                    <td style={styles.td}>
                                                                      {expandedRows.includes(group.projectId) ? <FiChevronDown/> : <FiChevronRight/>}
                                                                    </td>
                                                                    <td style={styles.td}>{group.projectId}</td>
                                                                    <td style={styles.td}>{group.clientName}</td>
                                                                    <td style={styles.td}>{formatCurrency(group.totalAmount)}</td>
                                                                    <td style={styles.td}>{group.paymentCount}</td>
                                                                </tr>
                                                                {expandedRows.includes(group.projectId) && (
                                                                    <tr>
                                                                        <td colSpan="5" style={styles.expandedContent}>
                                                                            <div style={{ padding: '16px 24px' }}>
                                                                                <table style={styles.subTable}>
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th style={styles.subTh}>Payment Date</th>
                                                                                            <th style={styles.subTh}>Amount</th>
                                                                                            <th style={styles.subTh}>Payment Method</th>
                                                                                            <th style={styles.subTh}>Proof</th>
                                                                                            <th style={styles.subTh}>Notes</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                    {group.payments.map(payment => (
                                                                                        <tr key={payment.incomeId}>
                                                                                            <td style={styles.subTd}>{formatDate(payment.paymentDate)}</td>
                                                                                            <td style={styles.subTd}>{formatCurrency(payment.amount)}</td>
                                                                                            <td style={styles.subTd}>{payment.paymentMethod}</td>
                                                                                            <td style={styles.subTd}><ProofOfPaymentLink file={payment.file} /></td>
                                                                                            <td style={styles.subTd}>{payment.comments}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                              </React.Fragment>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="5">
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
                                        </main>
                                    </div>
                                </div>
                            </>
                        );
                    };

                    export default withAuth(Income);
