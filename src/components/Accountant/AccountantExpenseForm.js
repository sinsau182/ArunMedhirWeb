import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Modal from '../Modal';

const styles = {
  form: { 
    fontFamily: "'Inter', sans-serif",
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  title: { 
    fontWeight: 700, 
    fontSize: 24, 
    marginBottom: 24, 
    color: '#111827' 
  },
  formContent: {
    flex: 1,
    overflow: 'auto',
    paddingRight: '8px'
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '16px 20px', 
    marginBottom: '16px' 
  },
  field: { 
    marginBottom: '14px' 
  },
  label: {
    display: 'block',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
    fontSize: '0.875rem'
  },
  input: ({ isReadOnly = false, hasError = false } = {}) => ({
    width: '100%', 
    padding: '9px 12px', 
    borderRadius: 6,
    border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
    background: isReadOnly ? '#eef2ff' : '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    fontSize: '1rem',
    color: isReadOnly ? '#4f46e5' : '#111827',
    transition: 'all 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#2563eb',
      boxShadow: '0 0 0 2px rgba(37,99,235,0.1)'
    },
    '::placeholder': {
      color: '#9ca3af',
    }
  }),
  select: ({ isReadOnly = false } = {}) => ({ 
    ...styles.input({ isReadOnly }), 
    appearance: 'none',
    cursor: 'pointer'
  }),
  textarea: ({ hasError = false } = {}) => ({ 
    ...styles.input({ hasError }), 
    minHeight: '80px',
    resize: 'vertical'
  }),
  rupeeInput: ({ isReadOnly = false, hasError = false } = {}) => ({
    ...styles.input({ isReadOnly, hasError }),
    paddingLeft: '28px'
  }),
  rupeeSymbol: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: 500,
    pointerEvents: 'none'
  },
  buttonContainer: { 
    marginTop: 24, 
    display: 'flex', 
    gap: 12, 
    justifyContent: 'flex-end',
    flexShrink: 0
  },
  button: (variant, disabled = false) => ({
    padding: '9px 18px', 
    borderRadius: 6, 
    fontWeight: 500, 
    cursor: disabled ? 'not-allowed' : 'pointer', 
    border: 'none',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    ...(variant === 'primary' && { 
      background: disabled ? '#d1d5db' : '#2563eb', 
      color: '#fff',
      '&:hover': disabled ? {} : { background: '#1d4ed8' }
    }),
    ...(variant === 'secondary' && { 
      background: '#fff', 
      color: '#374151', 
      border: '1px solid #e5e7eb',
      '&:hover': { background: '#f9fafb' }
    }),
    ...(variant === 'danger' && { 
      background: disabled ? '#d1d5db' : '#ef4444', 
      color: '#fff',
      '&:hover': disabled ? {} : { background: '#dc2626' }
    }),
  }),
  rejectionModalContent: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
  },
  inputContainer: { 
    position: 'relative' 
  },
  dropdownArrow: {
    position: 'absolute', 
    right: 12, 
    top: '50%', 
    transform: 'translateY(-50%)', 
    pointerEvents: 'none',
    zIndex: 2
  },
  radioGroup: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#374151'
  },
  radioInput: {
    cursor: 'pointer'
  },
  gstNumberField: {
    marginTop: '16px',
    animation: 'slideDown 0.3s ease'
  },
  fileInput: {
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer',
    width: '100%'
  },
  fileInputButton: {
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '0.875rem',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: '#e5e7eb'
    }
  },
  fileInputText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '4px'
  }
};

const DropdownArrow = () => (
    <span style={styles.dropdownArrow}>
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 8l3 3 3-3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
);

const getClientCode = (clientName) => (clientName || "").split(' ').map(w => w[0]).join('').toUpperCase();

const AccountantExpenseForm = ({ expense, onClose }) => {
  const [form, setForm] = useState({
    mainHead: '', 
    expenseHead: '', 
    category: '', 
    vendor: '', 
    gstCredit: 'No',
    gstNumber: '',
    totalAmount: '', 
    amountRequested: '', 
    comments: '', 
    paymentProof: null, 
    rejectionComment: '',
  });
  const [generatedExpenseId, setGeneratedExpenseId] = useState('');
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [receiptAttachment, setReceiptAttachment] = useState(null);
  const rejectionDisabled = !!form.paymentProof || !!receiptAttachment;
  const [showRejectionTooltip, setShowRejectionTooltip] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        mainHead: expense.mainHead || 'Project',
        expenseHead: expense.clientName || '',
        category: expense.category || '',
        vendor: expense.vendorName || '',
        gstCredit: expense.gstCredit || 'No',
        gstNumber: expense.gstNumber || '',
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

  const handleRemovePaymentProof = () => {
    setForm(prev => ({ ...prev, paymentProof: null }));
  };

  const handleReceiptFileChange = (e) => {
    setReceiptAttachment(e.target.files[0]);
  };

  const handleRemoveReceiptAttachment = () => {
    setReceiptAttachment(null);
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
        
        <div style={styles.formContent}>
        <div style={styles.grid}>
            
            <div style={styles.field}>
            <label style={styles.label}>Expense Type *</label>
              <div style={styles.inputContainer}>
                <select name="mainHead" value={form.mainHead} onChange={handleChange} style={styles.select()}>
                    <option value="" disabled>Select expense type</option>
                    <option value="Project">Project</option>
                    <option value="Branch">Branch</option>
                    <option value="Company">Company</option>
                </select>
                <DropdownArrow />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Client / Project Name *</label>
              <div style={styles.inputContainer}>
                <select name="expenseHead" value={form.expenseHead} onChange={handleChange} style={styles.select()}>
                    <option value="" disabled>Select client/project</option>
                    <option value="Client Alpha">Client Alpha</option>
                    <option value="Client Beta">Client Beta</option>
                    <option value="North Office">North Office</option>
                </select>
                <DropdownArrow />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Expense Category *</label>
              <div style={styles.inputContainer}>
                <select name="category" value={form.category} onChange={handleChange} style={styles.select()}>
                    <option value="" disabled>Select category</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Services">Services</option>
                    <option value="Stationary">Stationary</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                </select>
                <DropdownArrow />
              </div>
            </div>
            
            <div style={styles.field}>
              <label style={styles.label}>Vendor Name *</label>
              <div style={styles.inputContainer}>
                <select name="vendor" value={form.vendor} onChange={handleChange} style={styles.select()}>
                    <option value="" disabled>Select vendor</option>
                    <option value="Premium Hardware Supplies">Premium Hardware Supplies</option>
                    <option value="Creative Solutions LLC">Creative Solutions LLC</option>
                </select>
                <DropdownArrow />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Total Expense Amount *</label>
              <div style={styles.inputContainer}>
                <span style={styles.rupeeSymbol}>₹</span>
                <input type="number" style={styles.rupeeInput()} name="totalAmount" value={form.totalAmount} onChange={handleChange} placeholder="0.00"/>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Reimbursement Amount *</label>
              <div style={styles.inputContainer}>
                <span style={styles.rupeeSymbol}>₹</span>
                <input type="number" style={styles.rupeeInput()} name="amountRequested" value={form.amountRequested} onChange={handleChange} placeholder="0.00"/>
              </div>
            </div>

          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              GST Credit Available *
            </label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="gstCredit"
                  value="Yes"
                  checked={form.gstCredit === "Yes"}
                  onChange={handleChange}
                  style={styles.radioInput}
                />
                Yes
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="gstCredit"
                  value="No"
                  checked={form.gstCredit === "No"}
                  onChange={handleChange}
                  style={styles.radioInput}
                />
                No
              </label>
            </div>
            
            {form.gstCredit === 'Yes' && (
              <div style={styles.gstNumberField}>
                 <div style={styles.field}>
                  <label style={styles.label}>GST Number *</label>
                  <input name="gstNumber" value={form.gstNumber} onChange={handleChange} placeholder="Enter GST number" style={styles.input()} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'end', marginBottom: 0 }}>
            <div style={styles.field}>
              <label style={styles.label}>Payment Proof</label>
              <div style={styles.fileInput}>
                {!form.paymentProof && (
                  <>
                    <input
                      type="file"
                      name="paymentProof"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="paymentProof"
                      disabled={!!form.rejectionComment}
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                    <label htmlFor="paymentProof" style={{...styles.fileInputButton, opacity: form.rejectionComment ? 0.6 : 1, pointerEvents: form.rejectionComment ? 'none' : 'auto'}}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 4v12m0-12l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Choose File
                    </label>
                  </>
                )}
                {form.paymentProof && (
                  <button
                    type="button"
                    style={{
                      ...styles.fileInputButton,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      justifyContent: 'space-between',
                      background: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      color: '#2563eb',
                      fontWeight: 500,
                      fontSize: '0.95em',
                      cursor: 'default',
                      paddingRight: 12
                    }}
                    tabIndex={-1}
                  >
                    <span
                      style={{ cursor: 'pointer', textDecoration: 'underline', flex: 1, textAlign: 'left', color: '#2563eb', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={form.paymentProof.name}
                      onClick={() => {
                        const file = form.paymentProof;
                        if (file && file.type.startsWith('image/')) {
                          setPreviewImage(URL.createObjectURL(file));
                          setPreviewOpen(true);
                        } else {
                          window.open(URL.createObjectURL(file), '_blank');
                        }
                      }}
                    >
                      {form.paymentProof.name}
                    </span>
                    <span
                      onClick={handleRemovePaymentProof}
                      style={{ color: '#dc2626', fontSize: '1.1em', cursor: 'pointer', marginLeft: 8 }}
                      aria-label="Remove file"
                    >
                      ×
                    </span>
                  </button>
                )}
              </div>
              <div style={{ fontSize: '0.82em', color: '#6b7280', marginTop: 4, marginLeft: 2 }}>Accepted formats: JPG, PNG, PDF</div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Invoice Estimate Attachment *</label>
              <div style={styles.fileInput}>
                {!receiptAttachment && (
                  <>
                    <input
                      type="file"
                      name="receiptAttachment"
                      onChange={handleReceiptFileChange}
                      style={{ display: 'none' }}
                      id="receiptAttachment"
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                    <label htmlFor="receiptAttachment" style={styles.fileInputButton}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 4v12m0-12l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Choose File
                    </label>
                  </>
                )}
                {receiptAttachment && (
                  <button
                    type="button"
                    style={{
                      ...styles.fileInputButton,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      justifyContent: 'space-between',
                      background: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      color: '#2563eb',
                      fontWeight: 500,
                      fontSize: '0.95em',
                      cursor: 'default',
                      paddingRight: 12
                    }}
                    tabIndex={-1}
                  >
                    <span
                      style={{ cursor: 'pointer', textDecoration: 'underline', flex: 1, textAlign: 'left', color: '#2563eb', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={receiptAttachment.name}
                      onClick={() => {
                        const file = receiptAttachment;
                        if (file && file.type.startsWith('image/')) {
                          setPreviewImage(URL.createObjectURL(file));
                          setPreviewOpen(true);
                        } else {
                          window.open(URL.createObjectURL(file), '_blank');
                        }
                      }}
                    >
                      {receiptAttachment.name}
                    </span>
                    <span
                      onClick={handleRemoveReceiptAttachment}
                      style={{ color: '#dc2626', fontSize: '1.1em', cursor: 'pointer', marginLeft: 8 }}
                      aria-label="Remove file"
                    >
                      ×
                    </span>
                  </button>
                )}
              </div>
              <div style={{ fontSize: '0.82em', color: '#6b7280', marginTop: 4, marginLeft: 2 }}>Accepted formats: JPG, PNG, PDF</div>
            </div>
          </div>

          <div style={{ ...styles.field, marginTop: 24 }}>
            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea()} rows="3" name="comments" value={form.comments} onChange={handleChange} placeholder="Enter description..."></textarea>
          </div>

          <hr style={{margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb'}} />
          
          <div style={styles.field}>
            <label style={styles.label}>Rejection Comment</label>
            <div style={{position: 'relative'}}>
              <textarea
                style={styles.textarea()}
                rows="2"
                name="rejectionComment"
                value={form.rejectionComment}
                onChange={handleChange}
                placeholder="Enter rejection reason..."
                disabled={rejectionDisabled}
                onMouseEnter={() => { if (rejectionDisabled) setShowRejectionTooltip(true); }}
                onMouseLeave={() => setShowRejectionTooltip(false)}
                onFocus={() => { if (rejectionDisabled) setShowRejectionTooltip(true); }}
                onBlur={() => setShowRejectionTooltip(false)}
              />
              {rejectionDisabled && showRejectionTooltip && (
                <div style={{
                  position: 'absolute',
                  top: '-44px',
                  left: 0,
                  background: '#fff',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  padding: '10px 16px',
                  fontSize: '0.95em',
                  zIndex: 10,
                  minWidth: '260px',
                  maxWidth: '320px',
                  pointerEvents: 'none',
                  fontWeight: 500
                }}>
                  Since slips are uploaded, you cannot put a rejection comment.
                </div>
              )}
        </div>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button style={styles.button('secondary')} onClick={onClose}>
            Discard
          </button>
          <button 
            style={styles.button('danger', !form.rejectionComment)} 
            onClick={() => handleSubmit('Rejected')} 
            disabled={!form.rejectionComment}
          >
            Reject Expense
          </button>
          <button 
            style={styles.button('primary', !form.paymentProof)} 
            onClick={() => handleSubmit('Paid')} 
            disabled={!form.paymentProof}
          >
            Mark as Paid
          </button>
          <button 
            style={styles.button('primary', !!form.paymentProof)} 
            onClick={() => handleSubmit('Pending')} 
            disabled={!!form.paymentProof}
          >
            Save as Pending
          </button>
        </div>
      </div>

      <Modal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)}>
        <div style={styles.rejectionModalContent}>
          <h3 style={{...styles.title, fontSize: 20}}>Rejection Comment</h3>
          <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
            Please provide a reason for rejecting this expense. This will override any comment in the main form.
          </p>
          <div style={styles.field}>
            <label style={styles.label}>Rejection Comment *</label>
            <textarea style={styles.textarea()} rows="3" name="rejectionComment" value={form.rejectionComment} onChange={handleChange} placeholder="e.g., Incorrect invoice attached..."></textarea>
          </div>
          <div style={styles.buttonContainer}>
            <button style={styles.button('secondary')} onClick={() => setIsRejectionModalOpen(false)}>
              Cancel
            </button>
            <button 
              style={styles.button('danger', !form.rejectionComment)} 
              onClick={handleConfirmRejection} 
              disabled={!form.rejectionComment}
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      {previewOpen && previewImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => { setPreviewOpen(false); setPreviewImage(null); }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            padding: 16,
            maxWidth: 800,
            maxHeight: 800,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
            onClick={e => e.stopPropagation()}
          >
            <img src={previewImage} alt="Preview" style={{ maxWidth: 750, maxHeight: 750, borderRadius: 8, marginBottom: 8 }} />
            <button
              onClick={() => { setPreviewOpen(false); setPreviewImage(null); }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontSize: '1.3em',
                cursor: 'pointer',
                fontWeight: 700
              }}
              aria-label="Close preview"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        select:invalid {
          color: #9ca3af;
        }
      `}</style>
    </>
  );
};

export default AccountantExpenseForm;