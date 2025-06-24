import React, { useState, useEffect } from 'react';
import { FiFileText, FiEdit2, FiEye, FiImage, FiChevronDown } from 'react-icons/fi';
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
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: "'Inter', sans-serif",
  },
  th: {
    padding: '16px 12px',
    textAlign: 'left',
    fontWeight: 700,
    color: '#1f2937',
    borderBottom: '2px solid #e5e7eb',
    background: '#f9fafb',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '14px 12px',
    borderBottom: '1px solid #f3f4f6',
    color: '#374151',
    fontSize: '0.875rem',
    transition: 'background 0.2s',
    lineHeight: '1.5',
    verticalAlign: 'top',
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
    cursor: 'pointer',
    '&:hover': {
      color: '#1d4ed8',
    }
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
    color: '#1f2937',
  },
  clientNameCell: {
    fontWeight: 500,
    color: '#374151',
  },
  descriptionCell: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  imagePreview: {
    width: '40px',
    height: '40px',
    borderRadius: '4px',
    objectFit: 'cover',
    cursor: 'pointer',
    border: '1px solid #e5e7eb',
  },
  imageModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: '8px',
  },
  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '2rem',
    cursor: 'pointer',
  },
  groupRow: {
    cursor: 'pointer',
    background: '#f8fafc',
    fontWeight: 700,
    color: '#1f2937',
    transition: 'background 0.2s',
    '&:hover': {
      background: '#eef2ff',
    }
  },
  expandedGroupRow: {
    background: '#f1f6fd'
  },
  subTableContainer: {
    padding: '16px 24px',
    background: '#fff',
  },
  subTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  subTh: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '0.7rem',
    color: '#2563eb',
    background: '#f1f6fd',
    textTransform: 'uppercase',
  },
};

const getExpenseId = (id) => `EXP-${id.slice(-4)}`;

const formatCurrency = (amount) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short'
  });
};

const groupExpenses = (expenses, groupBy) => {
    if (!groupBy) return null;
  
    const groups = expenses.reduce((acc, expense) => {
      const key = expense[groupBy] || 'Unassigned';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(expense);
      return acc;
    }, {});
  
    return Object.entries(groups).map(([key, values]) => ({
      groupKey: key,
      expenses: values
    }));
};

const AccountantExpenseTable = ({ expenses, onEdit, loading = false, error = null, groupBy = '' }) => {
  const [hoverRow, setHoverRow] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  // Reset open groups when groupBy changes
  useEffect(() => {
    setOpenGroups({});
  }, [groupBy]);

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

  const groupedData = groupExpenses(processedExpenses, groupBy);

  const handleImageClick = (imageUrl) => {
    setPreviewImage(imageUrl);
    setShowImageModal(true);
  };

  const renderCell = (expense, column) => {
    switch (column) {
      case 'projectId':
        return <span style={styles.projectIdCell}>{expense.projectId}</span>;
      case 'clientName':
        return <span style={styles.clientNameCell}>{expense.clientName}</span>;
      case 'date':
        return formatDate(expense.date);
      case 'description':
        return (
          <Tooltip text={expense.description}>
            <div style={styles.descriptionCell}>{expense.description}</div>
          </Tooltip>
        );
      case 'amount':
        return <span style={styles.amountCell}>{formatCurrency(expense.amount)}</span>;
      case 'status':
        return (
          <Tooltip text={expense.status === 'Rejected' ? expense.rejectionComment : ''}>
            <span style={styles.statusBadge(expense.status)}>{expense.status}</span>
          </Tooltip>
        );
      case 'invoiceAttachment':
        const invoiceAttachment = expense.invoiceAttachment || '/path/to/invoice.jpg';
        return (
          <img
            src={invoiceAttachment}
            alt="Invoice"
            style={styles.imagePreview}
            onClick={(e) => { e.stopPropagation(); handleImageClick(invoiceAttachment); }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        );
      case 'paymentProof':
        if (!expense.paymentProof) return 'N/A';
        return (
          <a href={expense.paymentProof} target="_blank" rel="noopener noreferrer" style={styles.proofLink} onClick={e => e.stopPropagation()}>
            <FiFileText /> View Proof
          </a>
        );
      default:
        return expense[column];
    }
  };

  const allColumns = [
    { key: 'projectId', label: 'Project ID' },
    { key: 'clientName', label: 'Client Name' },
    { key: 'projectManager', label: 'Project Manager' },
    { key: 'date', label: 'Date' },
    { key: 'description', label: 'Description' },
    { key: 'createdBy', label: 'Created by' },
    { key: 'category', label: 'Category' },
    { key: 'vendorName', label: 'Vendor Name' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'invoiceAttachment', label: 'Invoice Est.' },
    { key: 'paymentProof', label: 'Payment Proof' },
  ];
  
  if (!groupBy) {
    // Render flat table
    return (
      <>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                {allColumns.map(col => <th key={col.key} style={styles.th}>{col.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {processedExpenses.map((expense, index) => (
                <tr
                  key={expense.id}
                  style={{
                    ...(index % 2 === 1 && styles.zebraRow),
                    ...(hoverRow === expense.id && { background: '#f3f4f6' }),
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoverRow(expense.id)}
                  onMouseLeave={() => setHoverRow(null)}
                  onClick={() => onEdit(expense)}
                >
                  {allColumns.map(col => <td key={col.key} style={styles.td}>{renderCell(expense, col.key)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Image Preview Modal */}
        {showImageModal && previewImage && (
          <div 
            style={styles.imageModal}
            onClick={() => setShowImageModal(false)}
          >
            <button 
              style={styles.closeButton}
              onClick={() => setShowImageModal(false)}
            >
              ×
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              style={styles.modalImage}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      </>
    );
  }

  // Render grouped table
  return (
    <>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <tbody>
            {groupedData.map(({ groupKey, expenses: groupExpenses }) => {
              const isExpanded = openGroups[groupKey];
              return (
                <React.Fragment key={groupKey}>
                  <tr
                    style={{
                      ...styles.groupRow,
                      ...(isExpanded && styles.expandedGroupRow),
                      ...(hoverRow === groupKey && !isExpanded && { background: '#eef2ff' }),
                    }}
                    onMouseEnter={() => setHoverRow(groupKey)}
                    onMouseLeave={() => setHoverRow(null)}
                    onClick={() => setOpenGroups(p => ({ ...p, [groupKey]: !isExpanded }))}
                  >
                    <td style={{...styles.td, display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <FiChevronDown style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
                      {groupKey} ({groupExpenses.length})
                    </td>
                  </tr>
                  {isExpanded && (
                      <tr>
                          <td colSpan="1" style={{ padding: 0 }}>
                              <div style={styles.subTableContainer}>
                                  <table style={styles.subTable}>
                                      <thead>
                                          <tr>
                                            {allColumns.map(col => <th key={col.key} style={styles.subTh}>{col.label}</th>)}
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {groupExpenses.map((expense, expIndex) => (
                                              <tr
                                                  key={expense.id}
                                                  style={{
                                                      ...(expIndex % 2 === 1 && styles.zebraRow),
                                                      cursor: 'pointer',
                                                  }}
                                                  onClick={() => onEdit(expense)}
                                              >
                                                {allColumns.map(col => <td key={col.key} style={styles.td}>{renderCell(expense, col.key)}</td>)}
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

      {/* Image Preview Modal */}
      {showImageModal && previewImage && (
        <div 
          style={styles.imageModal}
          onClick={() => setShowImageModal(false)}
        >
          <button 
            style={styles.closeButton}
            onClick={() => setShowImageModal(false)}
          >
            ×
          </button>
          <img 
            src={previewImage} 
            alt="Preview" 
            style={styles.modalImage}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default AccountantExpenseTable;