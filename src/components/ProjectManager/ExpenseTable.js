import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiFileText } from 'react-icons/fi';
import Tooltip from './Tooltip';

const statusColors = {
  Paid: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
  Pending: { background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' },
  Rejected: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
};

const styles = {
  tableWrapper: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  tableContainer: {
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: "'Inter', sans-serif",
  },
  th: {
    padding: '12px 24px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#4b5563',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  td: {
    padding: '20px 24px',
    borderBottom: '1px solid #f3f4f6',
    color: '#111827',
    fontSize: '0.875rem',
    background: '#fff',
    transition: 'background 0.2s',
  },
  statusBadge: (status) => ({
    ...statusColors[status],
    borderRadius: '9999px',
    padding: '5px 12px',
    fontWeight: 500,
    fontSize: '0.8rem',
    display: 'inline-block',
    whiteSpace: 'nowrap',
  }),
  proofLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  groupRow: {
    background: '#f8fafc',
    fontWeight: 600,
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
  }
};

const getClientCode = (clientName) => clientName.split(' ').map(w => w[0]).join('').toUpperCase();
const getExpenseId = (projectId, clientName) => `${projectId}_${getClientCode(clientName)}`;

const groupExpenses = (expenses) => {
  const groups = {};
  expenses.forEach((exp) => {
    const groupKey = `${exp.projectId}__${exp.clientName}`;
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(exp);
  });
  Object.values(groups).forEach((arr) => arr.sort((a, b) => new Date(b.date) - new Date(a.date)));
  return groups;
};

const ExpenseTable = ({ expenses, onEdit, selectedRows, setSelectedRows }) => {
  const [openGroups, setOpenGroups] = useState({});
  const [hoverRow, setHoverRow] = useState(null);

  const groups = groupExpenses(
    expenses.map(e => ({
      ...e,
      expenseId: getExpenseId(e.projectId, e.clientName),
    }))
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(expenses.map(exp => exp.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const columns = [
    { key: 'id', label: 'Expense ID' },
    { key: 'date', label: 'Date' },
    { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' },
    { key: 'vendorName', label: 'Vendor Name' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
  ];

  const renderCell = (exp, col) => {
    switch (col.key) {
      case 'amount': return `₹${parseFloat(exp.amount).toLocaleString('en-IN')}`;
      case 'status':
        return (
          <Tooltip text={exp.status === 'Rejected' ? exp.rejectionComment : ''}>
            <span style={styles.statusBadge(exp.status)}>{exp.status}</span>
          </Tooltip>
        );
      case 'description':
        return (
          <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <Tooltip text={exp.description}>
              {exp.description}
            </Tooltip>
          </div>
        );
      default: return exp[col.key];
    }
  };

  return (
    <div style={styles.tableWrapper}>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{...styles.th, width: 60, paddingRight: 0 }}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={selectedRows.length === expenses.length && expenses.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all expenses"
                />
              </th>
              {columns.map(col => <th key={col.key} style={styles.th}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? expenses.map((exp, index) => {
              const isSelected = selectedRows.includes(exp.id);
              return (
                <tr
                  key={exp.id}
                  style={{ background: isSelected ? '#eff6ff' : '#fff' }}
                >
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={isSelected}
                      onChange={() => handleSelectRow(exp.id)}
                      aria-label={`Select expense ${exp.id}`}
                    />
                  </td>
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{...styles.td, cursor: 'pointer'}}
                      onClick={() => onEdit(exp)}
                    >
                      {renderCell(exp, col)}
                    </td>
                  ))}
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '64px', color: '#6b7280' }}>
                  No expenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;