import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Modal from '../Modal';

const styles = {
  form: { fontFamily: "'Inter', sans-serif" },
  title: { fontWeight: 700, fontSize: 28, marginBottom: 28, color: '#111827' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '18px' },
  field: { marginBottom: '18px' },
  label: { fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' },
  input: ({ isReadOnly = false, hasError = false } = {}) => ({
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: hasError ? '1px solid #ef4444' : '1px solid #e5e7eb',
    background: isReadOnly ? '#eef2ff' : '#f8fafc',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    fontSize: '1rem',
    color: isReadOnly ? '#4f46e5' : '#111827',
  }),
  select: ({ isReadOnly = false } = {}) => ({ ...styles.input({ isReadOnly }), appearance: 'none' }),
  textarea: ({ hasError = false } = {}) => ({ ...styles.input({ hasError }), height: 'auto' }),
  buttonContainer: { marginTop: 32, display: 'flex', gap: 16, justifyContent: 'flex-end' },
  button: (variant, disabled = false) => ({
    padding: '12px 24px', borderRadius: 8, fontWeight: 500, cursor: 'pointer', border: 'none',
    transition: 'background-color 0.2s',
    ...(variant === 'primary' && { background: '#2563eb', color: '#fff' }),
    ...(variant === 'secondary' && { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }),
    ...(variant === 'danger' && { background: '#ef4444', color: '#fff' }),
    ...(disabled && { background: '#d1d5db', cursor: 'not-allowed' }),
  }),
  rejectionModalContent: { display: 'flex', flexDirection: 'column', gap: '16px' },
  dropdownContainer: { position: 'relative' },
  dropdownArrow: {
    position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
  }
};

const DropdownArrow = () => (
    <span style={styles.dropdownArrow}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 8l3 3 3-3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
);

const getClientCode = (clientName) => (clientName || "").split(' ').map(w => w[0]).join('').toUpperCase();

const AccountantExpenseForm = ({ expense, onClose }) => {
  const [form, setForm] = useState({
    mainHead: '', expenseHead: '', category: '', vendor: '', gstCredit: 'No',
    totalAmount: '', amountRequested: '', comments: '', paymentProof: null, rejectionComment: '',
  });
  const [generatedExpenseId, setGeneratedExpenseId] = useState('');
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        mainHead: expense.mainHead || 'Project',
        expenseHead: expense.clientName || '',
        category: expense.category || '',
        vendor: expense.vendorName || '',
        gstCredit: expense.gstCredit || 'No',
        totalAmount: expense.amount || '',
        amountRequested: expense.amountRequested || '',
        comments: expense.description || '',
        paymentProof: expense.paymentProof || null,
        rejectionComment: expense.rejectionComment || '',
      });
    }
  }, [expense]);

  useEffect(() => {
    if (form.mainHead === 'Project' && form.expenseHead) {
      const projectId = expense?.projectId || 'PROJ-XXX';
      setGeneratedExpenseId(`${projectId}_${getClientCode(form.expenseHead)}`);
    } else {
      setGeneratedExpenseId('');
    }
  }, [form.mainHead, form.expenseHead, expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, paymentProof: e.target.files[0] }));
  };

  const handleSubmit = (status) => {
    if(status === 'Rejected') {
        setIsRejectionModalOpen(true);
        return;
    }
    console.log({ ...form, status, expenseId: generatedExpenseId });
    toast.success(`Expense has been marked as ${status}.`);
    onClose();
  };

  const handleConfirmRejection = () => {
    if(!form.rejectionComment) {
        toast.error("Rejection comment is required.");
        return;
    }
    setIsRejectionModalOpen(false);
    console.log({ ...form, status: 'Rejected', expenseId: generatedExpenseId });
    toast.success(`Expense has been marked as Rejected.`);
    onClose();
  };

  return (
    <>
      <div style={styles.form}>
        <h2 style={styles.title}>{expense ? 'Edit Expense' : 'Create New Expense'}</h2>
        <div style={styles.grid}>
          <div style={styles.dropdownContainer}>
            <label style={styles.label}>Expense Type *</label>
            <select name="mainHead" style={styles.select()} value={form.mainHead} onChange={handleChange}>
                <option value="">Select... </option><option>Project</option><option>Branch</option><option>Company</option>
            </select><DropdownArrow />
          </div>
          <div style={styles.dropdownContainer}>
            <label style={styles.label}>Client / Project Name *</label>
            <select name="expenseHead" style={styles.select()} value={form.expenseHead} onChange={handleChange}>
                <option value="">Select...</option><option>Client Alpha</option><option>Client Beta</option><option>North Office</option>
            </select><DropdownArrow />
          </div>
          {generatedExpenseId && (
            <div><label style={styles.label}>Generated Expense ID</label><input style={styles.input({ isReadOnly: true })} value={generatedExpenseId} readOnly /></div>
          )}
          <div style={styles.dropdownContainer}>
            <label style={styles.label}>Expense Category *</label>
            <select name="category" style={styles.select()} value={form.category} onChange={handleChange}>
                <option value="">Select...</option><option>Hardware</option><option>Services</option><option>Stationary</option><option>Miscellaneous</option>
            </select><DropdownArrow />
          </div>
          <div style={styles.dropdownContainer}>
            <label style={styles.label}>Vendor Name *</label>
            <select name="vendor" style={styles.select()} value={form.vendor} onChange={handleChange}>
                <option value="">Select...</option><option>Premium Hardware Supplies</option><option>Creative Solutions LLC</option>
            </select><DropdownArrow />
          </div>
          <div><label style={styles.label}>Total Expense Amount *</label><input type="number" style={styles.input()} name="totalAmount" value={form.totalAmount} onChange={handleChange} /></div>
          <div><label style={styles.label}>Reimbursement Amount *</label><input type="number" style={styles.input()} name="amountRequested" value={form.amountRequested} onChange={handleChange} /></div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>GST Credit Available *</label>
          <div style={{ display: "flex", gap: 18, marginTop: 6 }}>
            <label><input type="radio" name="gstCredit" value="Yes" checked={form.gstCredit === "Yes"} onChange={handleChange}/> Yes</label>
            <label><input type="radio" name="gstCredit" value="No" checked={form.gstCredit === "No"} onChange={handleChange}/> No</label>
          </div>
        </div>
        <div style={styles.field}><label style={styles.label}>Payment Proof</label><input type="file" style={styles.input()} name="paymentProof" onChange={handleFileChange} /></div>
        <div style={styles.field}><label style={styles.label}>Notes / Description</label><textarea style={styles.textarea()} rows="3" name="comments" value={form.comments} onChange={handleChange}></textarea></div>
        <hr style={{margin: '24px 0'}} />
        <div style={styles.field}><label style={styles.label}>Rejection Comment</label><textarea style={styles.textarea()} rows="2" name="rejectionComment" value={form.rejectionComment} onChange={handleChange}></textarea></div>
        <div style={styles.buttonContainer}>
          <button style={styles.button('secondary')} onClick={onClose}>Cancel</button>
          <button style={styles.button('primary', !!form.paymentProof)} onClick={() => handleSubmit('Pending')} disabled={!!form.paymentProof}>Save as Pending</button>
          <button style={styles.button('primary', !form.paymentProof)} onClick={() => handleSubmit('Paid')} disabled={!form.paymentProof}>Mark as Paid</button>
          <button style={styles.button('danger', !form.rejectionComment)} onClick={() => handleSubmit('Rejected')} disabled={!form.rejectionComment}>Reject Expense</button>
        </div>
      </div>
      <Modal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)}>
        <div style={styles.rejectionModalContent}>
          <h3 style={{...styles.title, fontSize: 24}}>Rejection Comment</h3>
          <p style={{color: '#6b7280'}}>Please provide a reason for rejecting this expense. This will override any comment in the main form.</p>
          <textarea style={styles.textarea()} rows="3" name="rejectionComment" value={form.rejectionComment} onChange={handleChange} placeholder="e.g., Incorrect invoice attached..."/>
          <div style={styles.buttonContainer}>
            <button style={styles.button('secondary')} onClick={() => setIsRejectionModalOpen(false)}>Cancel</button>
            <button style={styles.button('danger', !form.rejectionComment)} onClick={handleConfirmRejection} disabled={!form.rejectionComment}>Confirm Rejection</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AccountantExpenseForm;