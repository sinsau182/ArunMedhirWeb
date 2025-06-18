import React, { useState, useEffect } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  createExpense,
  updateExpense,
  fetchExpenseByEmployeeId,
} from "@/redux/slices/expensesSlice";
import { toast } from "sonner";

const DropdownArrow = () => (
  <span
    style={{
      position: "absolute",
      right: 16,
      top: 22,
      pointerEvents: "none",
    }}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 8l3 3 3-3"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const selectContainerStyle = { flex: 1, position: "relative" };

const selectStyle = (hasError) => ({
  width: "100%",
  marginTop: 6,
  padding: "12px 14px",
  borderRadius: 10,
  border: hasError ? "1px solid #ef4444" : "1px solid #e5e7eb",
  background: "#f8fafc",
  boxShadow: "0 2px 8px rgba(37,99,235,0.07)",
  cursor: "pointer",
  fontSize: 16,
  appearance: "none",
});

const inputStyle = (hasError) => ({
  width: "100%",
  marginTop: 6,
  padding: 10,
  borderRadius: 6,
  border: hasError ? "1px solid #ef4444" : "1px solid #e5e7eb",
  background: "#f3f4f6",
});

const errorStyle = {
  color: "#ef4444",
  fontSize: 14,
  marginTop: 4,
};

const AddExpense = () => {
  const employee = sessionStorage.getItem("employeeId");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const router = useRouter();
  const dispatch = useDispatch();
  const { expenses, loading, error } = useSelector((state) => state.expenses);
  const { id } = router.query;

  const [formErrors, setFormErrors] = useState({});
  const isEdit = Boolean(id);
  const editExpense = expenses.find((e) => e.expenseId === id);

  const [form, setForm] = useState({
    submittedBy: employee,
    mainHead: "",
    expenseHead: "",
    category: "",
    vendor: "",
    gstCredit: "No",
    file: "",
    totalAmount: "",
    amountRequested: "",
    comments: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, file: e.target.files[0]?.name || "" }));
    if (formErrors.file) {
      setFormErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.mainHead) errors.mainHead = "Main head is required";
    if (!form.expenseHead) errors.expenseHead = "Expense head is required";
    if (!form.category) errors.category = "Category is required";
    if (!form.vendor) errors.vendor = "Vendor is required";
    if (!form.file) errors.file = "File is required";
    if (!form.totalAmount) errors.totalAmount = "Total amount is required";
    if (!form.amountRequested)
      errors.amountRequested = "Amount requested is required";

    if (form.totalAmount && isNaN(form.totalAmount)) {
      errors.totalAmount = "Total amount must be a number";
    }
    if (form.amountRequested && isNaN(form.amountRequested)) {
      errors.amountRequested = "Amount requested must be a number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    dispatch(fetchExpenseByEmployeeId());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && editExpense) {
      setForm({
        submittedBy: employee,
        mainHead: editExpense.mainHead || "",
        expenseHead: editExpense.expenseHead || "",
        category: editExpense.category || "",
        vendor: editExpense.vendor || "",
        gstCredit: editExpense.gstCredit || "No",
        file: editExpense.file || "",
        totalAmount: editExpense.totalAmount || "",
        amountRequested: editExpense.amountRequested || "",
        comments: editExpense.comments || "",
      });
    }
  }, [isEdit, editExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const today = new Date();
      const formattedDate = today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const expenseData = {
        submittedBy: employee,
        companyId: sessionStorage.getItem("employeeCompanyId"),
        mainHead: form.mainHead,
        expenseHead: form.expenseHead,
        category: form.category,
        vendor: form.vendor,
        gstCredit: form.gstCredit,
        file: form.file,
        totalAmount: parseFloat(form.totalAmount),
        amountRequested: form.amountRequested
          ? parseFloat(form.amountRequested)
          : null,
        comments: form.comments,
        status: isEdit ? editExpense?.status : "Pending",
        initiated: isEdit ? editExpense?.initiated : formattedDate,
      };

      if (isEdit) {
        await dispatch(updateExpense({ ...expenseData, id })).unwrap();
      } else {
        await dispatch(createExpense(expenseData)).unwrap();
      }

      router.push("/employee/expenses");
    } catch (error) {
      toast.error(error || "Failed to save expense. Please try again.");
    }
  };

  return (
    <>
      <HradminNavbar />
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div
        style={{
          maxWidth: 800,
          margin: isSidebarCollapsed ? "80px 0 0 120px" : "80px 0 0 290px",
          background: "#f8fafc",
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: 36,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 28 }}>
          {isEdit ? "Edit Expense" : "Create New Expense"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
            <div style={selectContainerStyle}>
              <label style={{ fontWeight: 500 }}>Expense Type *</label>
              <div style={{ position: "relative" }}>
                <select
                  name="mainHead"
                  style={selectStyle(formErrors.mainHead)}
                  value={form.mainHead}
                  onChange={handleChange}
                >
                  <option value="">Select expense type</option>
                  <option>Project</option>
                  <option>Branch</option>
                  <option>Company</option>
                </select>
                {formErrors.mainHead && (
                  <div style={errorStyle}>{formErrors.mainHead}</div>
                )}
                <DropdownArrow />
              </div>
            </div>
            <div style={selectContainerStyle}>
              <label style={{ fontWeight: 500 }}>
                Client / Project Name *
              </label>
              <div style={{ position: "relative" }}>
                <select
                  name="expenseHead"
                  style={selectStyle(formErrors.expenseHead)}
                  value={form.expenseHead}
                  onChange={handleChange}
                >
                  <option value="">Select client/project</option>
                  <option>Client A</option>
                  <option>North Office</option>
                  <option>Admin</option>
                </select>
                {formErrors.expenseHead && (
                  <div style={errorStyle}>{formErrors.expenseHead}</div>
                )}
                <DropdownArrow />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
            <div style={selectContainerStyle}>
              <label style={{ fontWeight: 500 }}>Expense Category *</label>
              <div style={{ position: "relative" }}>
                <select
                  name="category"
                  style={selectStyle(formErrors.category)}
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  <option>Materials & Supplies</option>
                  <option>Subcontractor & Labor Fees</option>
                  <option>Office Expenses & Supplies</option>
                  <option>Travel & Meetings</option>
                  <option>Software & Technology</option>
                  <option>Marketing & Advertising</option>
                  <option>Rent & Utilities</option>
                  <option>Miscellaneous</option>
                </select>
                {formErrors.category && (
                  <div style={errorStyle}>{formErrors.category}</div>
                )}
                <DropdownArrow />
              </div>
            </div>
            <div style={selectContainerStyle}>
              <label style={{ fontWeight: 500 }}>Vendor Name *</label>
              <div style={{ position: "relative" }}>
                <select
                  name="vendor"
                  style={selectStyle(formErrors.vendor)}
                  value={form.vendor}
                  onChange={handleChange}
                >
                  <option value="">Select vendor</option>
                  <option>Premium Hardware Supplies</option>
                  <option>Office Essentials Co.</option>
                </select>
                {formErrors.vendor && (
                  <div style={errorStyle}>{formErrors.vendor}</div>
                )}
                <DropdownArrow />
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500 }}>GST Credit Available *</label>
            <div style={{ display: "flex", gap: 18, marginTop: 6 }}>
              <label>
                <input
                  type="radio"
                  name="gstCredit"
                  value="Yes"
                  checked={form.gstCredit === "Yes"}
                  onChange={handleChange}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="gstCredit"
                  value="No"
                  checked={form.gstCredit === "No"}
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500 }}>
              Receipt / Invoice Attachment *
            </label>
            <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
              <input
                id="file-upload"
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                  marginRight: 16,
                  boxShadow: "0 1px 4px rgba(37,99,235,0.07)",
                }}
              >
                {form.file ? "Change File" : "Choose File"}
              </label>
              <span style={{ color: "#374151", fontSize: 15, fontWeight: 400 }}>
                {form.file ? form.file : "No file chosen"}
              </span>
              {formErrors.file && (
                <div style={{ color: "#ef4444", fontSize: 14, marginLeft: 8 }}>
                  {formErrors.file}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Total Expense Amount *</label>
              <input
                type="text"
                name="totalAmount"
                style={inputStyle(formErrors.totalAmount)}
                value={form.totalAmount}
                onChange={handleChange}
              />
              {formErrors.totalAmount && (
                <div style={errorStyle}>{formErrors.totalAmount}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Reimbursement Amount *</label>
              <input
                type="text"
                name="amountRequested"
                style={inputStyle(formErrors.amountRequested)}
                value={form.amountRequested}
                onChange={handleChange}
              />
              {formErrors.amountRequested && (
                <div style={errorStyle}>{formErrors.amountRequested}</div>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 500 }}>Notes / Description</label>
            <textarea
              name="comments"
              style={{
                width: "100%",
                marginTop: 6,
                padding: 10,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: "#f3f4f6",
              }}
              rows={3}
              value={form.comments}
              onChange={handleChange}
            />
          </div>
          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 16,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={() => router.push("/employee/expenses")}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#374151",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {isEdit ? "Update Expense" : "Create Expense"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default withAuth(AddExpense);
