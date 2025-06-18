import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFileText, FiEdit2, FiEye } from 'react-icons/fi';
import Tooltip from '../ui/ToolTip';

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div style={styles.tableContainer}>
    <div style={{ padding: '20px' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          height: '60px',
          background: '#f3f4f6',
          marginBottom: '8px',
          borderRadius: '8px',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }} />
      ))}
    </div>
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
    `}</style>
  </div>
);

const statusColors = {
  Paid: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
  Pending: { background: '#fefce8', color: '#a16207', border: '1px solid #fef08a' },
  Rejected: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
};

const styles = {
  tableContainer: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    overflowX: 'auto',
    padding: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: "'Inter', sans-serif",
  },
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
  zebraRow: {
    background: '#fafafa',
  },
  statusBadge: (status) => ({
    ...statusColors[status],
    borderRadius: '9999px',
    padding: '6px 14px',
    fontWeight: 600,
    fontSize: '0.8rem',
    display: 'inline-block',
    whiteSpace: 'nowrap',
  }),
  proofLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#1d4ed8',
    }
  },
  groupRow: {
    cursor: 'pointer',
    background: '#f8fafc',
    fontWeight: 700,
    color: '#1f2937',
    '&:hover': {
      background: '#eef2ff',
    }
  },
  childRow: {
    background: '#fff'
  },
  subTableContainer: {
    padding: '16px 24px',
    background: '#fff',
  },
  actionButton: {
    background: 'none',
    border: 'none',
    padding: '6px',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s ease',
    marginRight: '8px',
    '&:hover': {
      background: '#f3f4f6',
      color: '#374151',
    }
  },
  amountCell: {
    fontWeight: 600,
    color: '#1f2937',
  },
  projectIdCell: {
    fontWeight: 600,
    color: '#2563eb',
  },
  clientNameCell: {
    fontWeight: 500,
    color: '#374151',
  }
};

const getExpenseId = (id) => `EXP-${id.slice(-4)}`;

const formatCurrency = (amount) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;

function getGroupStatus(payments) {
  if (payments.some(p => p.status === 'Rejected')) return 'Rejected';
  if (payments.some(p => p.status === 'Pending')) return 'Pending';
  return 'Paid';
}

function getGroupStatusSummary(payments) {
  const total = payments.length;
  const paidCount = payments.filter(p => p.status === 'Paid').length;
  const rejectedCount = payments.filter(p => p.status === 'Rejected').length;

  if (paidCount === total) {
    return "All Paid";
  }
  if (rejectedCount === total) {
    return "All Rejected";
  }
  const remainingCount = total - paidCount;
  return `${remainingCount} Remaining`;
}

const groupExpenses = (expenses) => {
  const groups = {};
  expenses.forEach((exp) => {
    const groupKey = `${exp.projectId}__${exp.clientName}`;
    if (!groups[groupKey]) {
        groups[groupKey] = {
            projectId: exp.projectId,
            projectManager: exp.projectManager,
            clientName: exp.clientName,
            budget: exp.budget,
            totalExpense: 0,
            payments: [],
        };
    }
    groups[groupKey].totalExpense += parseFloat(exp.amount);
    groups[groupKey].payments.push(exp);
  });
  Object.values(groups).forEach((group) => {
    group.payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    group.expenseStatus = getGroupStatus(group.payments);
    group.expenseStatusSummary = getGroupStatusSummary(group.payments);
  });
  return groups;
};

const AccountantExpenseTable = ({ expenses, onEdit, loading = false, error = null, preferencesKey = 'defaultExpenseColumns', showProjectManager = false }) => {
  const [openGroups, setOpenGroups] = useState({});
  const [hoverRow, setHoverRow] = useState(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const defaultColumns = {
      projectId: true,
      projectManager: true,
      clientName: true,
      totalExpense: true,
      budget: true,
      paymentCount: true,
      date: true,
      description: true,
      createdBy: true,
      category: true,
      vendorName: true,
      amount: true,
      status: true,
      paymentProof: true,
      expenseStatus: true,
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(preferencesKey);
      if (saved) {
        const savedColumns = JSON.parse(saved);
        // Merge defaults with saved to ensure new columns are added for existing users
        return { ...defaultColumns, ...savedColumns };
      }
    }
    return defaultColumns;
  });

  // Save column preferences
  const saveColumnPreferences = (newColumns) => {
    setVisibleColumns(newColumns);
    if (typeof window !== 'undefined') {
      localStorage.setItem(preferencesKey, JSON.stringify(newColumns));
    }
  };

  // Toggle column visibility
  const toggleColumn = (columnKey) => {
    const newColumns = { ...visibleColumns, [columnKey]: !visibleColumns[columnKey] };
    saveColumnPreferences(newColumns);
  };

  // Close column settings when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnSettings && !event.target.closest('.column-settings')) {
        setShowColumnSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnSettings]);

  // Show loading skeleton if loading
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div style={styles.tableContainer}>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#dc2626',
          background: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
            Error Loading Expenses
          </div>
          <div style={{ fontSize: '0.9rem', color: '#991b1b' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no expenses
  if (!expenses || expenses.length === 0) {
    return (
      <div style={styles.tableContainer}>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
            No Expenses Found
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            Create your first expense to get started.
          </div>
        </div>
      </div>
    );
  }

  const processedExpenses = expenses.map(e => ({
    ...e,
    status: e.status === 'Yet to be Paid' ? 'Pending' : e.status,
    displayId: getExpenseId(e.id),
  }));

  const groups = groupExpenses(processedExpenses);

  const summaryColumns = [
    { key: 'projectId', label: 'Project ID' },
    { key: 'clientName', label: 'Client Name' },
    showProjectManager && { key: 'projectManager', label: 'Project Manager' },
    { key: 'totalExpense', label: 'Total Expense', align: 'right' },
    { key: 'budget', label: 'Budget', align: 'right' },
    { key: 'paymentCount', label: 'No. of Payments', align: 'center' },
    { key: 'expenseStatus', label: 'Expense Status' },
  ].filter(Boolean).sort((a, b) => {
    const order = ['projectId', 'clientName', 'projectManager', 'totalExpense', 'budget', 'paymentCount', 'expenseStatus'];
    return order.indexOf(a.key) - order.indexOf(b.key);
  }).filter(col => visibleColumns[col.key]);

  const detailColumns = [
    { key: 'date', label: 'Date' },
    { key: 'description', label: 'Description' },
    { key: 'createdBy', label: 'Created by' },
    { key: 'category', label: 'Category' },
    { key: 'vendorName', label: 'Vendor Name' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'status', label: 'Status' },
    { key: 'paymentProof', label: 'Payment Proof' },
  ].filter(col => visibleColumns[col.key]);

  const renderSummaryCell = (group, colKey) => {
    switch(colKey) {
        case 'totalExpense':
        case 'budget':
            return <span style={styles.amountCell}>{formatCurrency(group[colKey])}</span>;
        case 'paymentCount':
            return <span style={{ fontWeight: 600, color: '#6b7280' }}>{group.payments.length}</span>;
        case 'projectId':
            return <span style={styles.projectIdCell}>{group[colKey]}</span>;
        case 'clientName':
            return <span style={styles.clientNameCell}>{group[colKey]}</span>;
        case 'expenseStatus':
            return (
              <div>
                <span style={styles.statusBadge(group.expenseStatus)}>{group.expenseStatus}</span>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                  {group.expenseStatusSummary}
                </div>
              </div>
            );
        default:
            return <span style={{ fontWeight: 500 }}>{group[colKey]}</span>;
    }
  }

  const renderDetailCell = (exp, colKey) => {
    const value = exp[colKey];
    switch (colKey) {
        case 'amount':
            return <span style={styles.amountCell}>{formatCurrency(value)}</span>;
        case 'status':
            return (
                <Tooltip text={exp.status === 'Rejected' ? exp.rejectionComment : ''}>
                    <span style={styles.statusBadge(value)}>{value}</span>
                </Tooltip>
            );
        case 'paymentProof':
            return value ? (
                <a href={value} target="_blank" rel="noopener noreferrer" style={styles.proofLink} onClick={e => e.stopPropagation()}>
                    <FiFileText /> View Proof
                </a>
            ) : 'N/A';
        default:
            return value;
    }
  };

  return (
    <div style={styles.tableContainer}>
      {/* Column Settings */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <button
          onClick={() => setShowColumnSettings(!showColumnSettings)}
          style={{
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '0.875rem',
            color: '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Columns</span>
          <FiChevronDown style={{
            transform: showColumnSettings ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }} />
        </button>

        {showColumnSettings && (
          <div className="column-settings" style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '12px',
            zIndex: 10,
            minWidth: '200px'
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
              Visible Columns
            </div>
            {Object.entries(visibleColumns).map(([key, visible]) => (
              <label key={key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px 0'
              }}>
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => toggleColumn(key)}
                  style={{ cursor: 'pointer' }}
                />
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
            ))}
          </div>
        )}
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '40px' }}></th>
            {summaryColumns.map(col =>
              <th key={col.key} style={{ ...styles.th, textAlign: col.align || 'left' }}>
                {col.label}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {Object.entries(groups).map(([groupKey, group], groupIndex) => {
            const isExpanded = openGroups[groupKey];

            return (
              <React.Fragment key={groupKey}>
                <tr
                  style={{
                    ...styles.groupRow,
                    ...(hoverRow === groupKey && { background: '#eef2ff' }),
                    ...(groupIndex % 2 === 1 && styles.zebraRow)
                  }}
                  onMouseEnter={() => setHoverRow(groupKey)}
                  onMouseLeave={() => setHoverRow(null)}
                  onClick={() => setOpenGroups(p => ({ ...p, [groupKey]: !isExpanded }))}
                >
                  <td style={styles.td}>
                    <FiChevronDown style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </td>
                  {summaryColumns.map(col => <td key={col.key} style={{...styles.td, textAlign: col.align || 'left'}}>{renderSummaryCell(group, col.key)}</td>)}
                </tr>
                {isExpanded && (
                    <tr>
                        <td colSpan={summaryColumns.length + 1} style={{ padding: 0 }}>
                                 <div style={styles.subTableContainer}>
                                     <table style={{ ...styles.table, border: 'none' }}>
                                         <thead>
                                             <tr>
                                                 {detailColumns.map(col =>
                                                   <th key={col.key} style={{ ...styles.th, textAlign: col.align || 'left', fontSize: '0.7rem' }}>
                                                     {col.label}
                                                   </th>
                                                 )}
                                             </tr>
                                         </thead>
                                         <tbody>
                                             {group.payments.map((exp, expIndex) => (
                                                 <tr
                                                     key={exp.id}
                                                     style={{
                                                         ...(expIndex % 2 === 1 && styles.zebraRow),
                                                         cursor: 'pointer',
                                                         '&:hover': { background: '#f9fafb' }
                                                     }}
                                                     onClick={() => onEdit(exp)}
                                                 >
                                                     {detailColumns.map(col =>
                                                       <td key={col.key} style={{...styles.td, textAlign: col.align || 'left', fontSize: '0.8rem'}}>
                                                         {renderDetailCell(exp, col.key)}
                                                       </td>
                                                     )}
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             </td>
                         </tr>
                     )}
                   </React.Fragment>
                 );
               })}
             </tbody>
           </table>
         </div>
       );
     };

     export default AccountantExpenseTable;