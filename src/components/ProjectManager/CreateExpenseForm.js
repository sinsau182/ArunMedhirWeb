import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDispatch } from "react-redux";
import { createExpense } from "@/redux/slices/expensesSlice";

const styles = {
  form: { fontFamily: "'Inter', sans-serif" },
  title: { fontWeight: 700, fontSize: 28, marginBottom: 28, color: '#111827' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '18px' },
  field: { marginBottom: '18px' },
  label: { fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' },
  input: (isReadOnly = false) => ({
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: isReadOnly ? '#eef2ff' : '#f8fafc',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    fontSize: '1rem',
    color: isReadOnly ? '#4f46e5' : '#111827',
  }),
  select: (isReadOnly = false) => ({
    ...styles.input(isReadOnly),
    appearance: 'none',
  }),
  buttonContainer: { marginTop: 32, display: 'flex', gap: 16, justifyContent: 'flex-end' },
  button: (variant, disabled = false) => ({
    padding: '12px 24px', borderRadius: 8, fontWeight: 500, cursor: 'pointer', border: 'none',
    transition: 'background-color 0.2s',
    ...(variant === 'primary' && { background: '#2563eb', color: '#fff' }),
    ...(variant === 'secondary' && { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }),
    ...(disabled && { background: '#d1d5db', cursor: 'not-allowed' }),
  }),
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

const CreateExpenseForm = ({ expense, onClose }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    mainHead: '', expenseHead: '', category: '', vendor: '', gstCredit: 'No',
    file: null, totalAmount: '', amountRequested: '', comments: '',
  });
  const [generatedExpenseId, setGeneratedExpenseId] = useState('');
  
  const isPaid = expense?.status === 'Paid';

  useEffect(() => {
    if (expense) {
      setForm({
        mainHead: expense.mainHead || 'Project', // Defaulting for consistency
        expenseHead: expense.clientName || '', // Mapping clientName to expenseHead
        category: expense.category || '',
        vendor: expense.vendorName || '',
        gstCredit: expense.gstCredit || 'No',
        file: expense.paymentProof || null,
        totalAmount: expense.amount || '',
        amountRequested: expense.amountRequested || '',
        comments: expense.description || '',
      });
    }
  }, [expense]);

  useEffect(() => {
    if (form.mainHead === 'Project' && form.expenseHead) {
        // Assuming expenseHead is clientName for ID generation
      setGeneratedExpenseId(`PROJ-XXX_${getClientCode(form.expenseHead)}`);
    } else {
      setGeneratedExpenseId('');
    }
  }, [form.mainHead, form.expenseHead]);

  const handleChange = (e) => {
    if (isPaid) return;
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (isPaid) return;
    setForm(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPaid) return;
    
    try {
        const employeeId = sessionStorage.getItem("employeeId");
        const companyId = sessionStorage.getItem("employeeCompanyId");
        
        const expenseData = {
          ...form,
          submittedBy: employeeId,
          companyId: companyId,
          totalAmount: parseFloat(form.totalAmount),
          status: "Pending",
          initiated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          file: form.file?.name || '',
        };
        
        await dispatch(createExpense(expenseData)).unwrap();
        toast.success("Expense created successfully!");
        onClose();
    } catch (error) {
        toast.error(error.message || "Failed to create expense.");
    }
  };

  return (
    <div style={styles.form}>
      <h2 style={styles.title}>{expense ? 'Edit Expense' : 'Create New Expense'}</h2>
      <div style={styles.grid}>
        <div style={styles.dropdownContainer}>
            <label style={styles.label}>Expense Type *</label>
            <select name="mainHead" style={styles.select(isPaid)} value={form.mainHead} onChange={handleChange} disabled={isPaid}>
                <option value="">Select expense type</option>
                <option>Project</option><option>Branch</option><option>Company</option>
            </select>
            <DropdownArrow />
        </div>
        <div style={styles.dropdownContainer}>
            <label style={styles.label}>Client / Project Name *</label>
            <select name="expenseHead" style={styles.select(isPaid)} value={form.expenseHead} onChange={handleChange} disabled={isPaid}>
                <option value="">Select client/project</option>
                <option>Client Alpha</option><option>Client Beta</option><option>North Office</option>
            </select>
            <DropdownArrow />
        </div>
        {generatedExpenseId && (
            <div><label style={styles.label}>Generated Expense ID</label><input style={styles.input(true)} value={generatedExpenseId} readOnly /></div>
        )}
        <div style={styles.dropdownContainer}>
            <label style={styles.label}>Expense Category *</label>
            <select name="category" style={styles.select(isPaid)} value={form.category} onChange={handleChange} disabled={isPaid}>
                <option value="">Select category</option>
                <option>Hardware</option><option>Services</option><option>Stationary</option><option>Miscellaneous</option>
            </select>
            <DropdownArrow />
        </div>
        <div style={styles.dropdownContainer}>
            <label style={styles.label}>Vendor Name *</label>
            <select name="vendor" style={styles.select(isPaid)} value={form.vendor} onChange={handleChange} disabled={isPaid}>
                <option value="">Select vendor</option>
                <option>Premium Hardware Supplies</option><option>Creative Solutions LLC</option><option>Office Essentials Co.</option>
            </select>
            <DropdownArrow />
        </div>
        <div><label style={styles.label}>Total Expense Amount *</label><input type="number" style={styles.input(isPaid)} name="totalAmount" value={form.totalAmount} onChange={handleChange} disabled={isPaid} /></div>
        <div><label style={styles.label}>Reimbursement Amount *</label><input type="number" style={styles.input(isPaid)} name="amountRequested" value={form.amountRequested} onChange={handleChange} disabled={isPaid} /></div>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>GST Credit Available *</label>
        <div style={{ display: "flex", gap: 18, marginTop: 6 }}>
            <label><input type="radio" name="gstCredit" value="Yes" checked={form.gstCredit === "Yes"} onChange={handleChange} disabled={isPaid}/> Yes</label>
            <label><input type="radio" name="gstCredit" value="No" checked={form.gstCredit === "No"} onChange={handleChange} disabled={isPaid}/> No</label>
        </div>
      </div>
      <div style={styles.field}><label style={styles.label}>Receipt / Invoice Attachment *</label><input type="file" style={styles.input(isPaid)} onChange={handleFileChange} disabled={isPaid} /></div>
      <div style={styles.field}><label style={styles.label}>Notes / Description</label><textarea style={styles.input(isPaid)} rows="3" name="comments" value={form.comments} onChange={handleChange} disabled={isPaid}></textarea></div>
      <div style={styles.buttonContainer}>
        <button style={styles.button('secondary')} onClick={onClose}>Cancel</button>
        <button style={styles.button('primary', isPaid)} onClick={handleSubmit} disabled={isPaid}>
          {expense ? 'Update Expense' : 'Create Expense'}
        </button>
      </div>
    </div>
  );
};

export default CreateExpenseForm; 