import React, { useState, useMemo } from "react";
import withAuth from "@/components/withAuth";
import Modal from "@/components/Modal";
import CreateExpenseForm from "@/components/ProjectManager/CreateExpenseForm";
import { FiSearch, FiFilter, FiChevronDown, FiX } from "react-icons/fi";
import { FaRegTrashAlt, FaPaperPlane } from "react-icons/fa";
import AccountantExpenseTable from "@/components/Accountant/AccountantExpenseTable";
import MainLayout from "@/components/MainLayout";

const mockExpenses = [
  {
    id: "EXP-001",
    createdBy: "Test Name",
    projectId: "PROJ-001",
    clientName: "Client Alpha",
    date: "2023-10-10",
    description: "Server rack for new office",
    category: "Hardware",
    vendorName: "Premium Hardware Supplies",
    amount: "50000",
    status: "Paid",
    paymentProof: "/path/to/proof1.pdf",
    rejectionComment: "",
  },
  {
    id: "EXP-002",
    createdBy: "Test Name",
    projectId: "PROJ-002",
    clientName: "Client Beta",
    date: "2023-10-12",
    description: "Graphic design services for the new campaign launch",
    category: "Services",
    vendorName: "Creative Solutions LLC",
    amount: "75000",
    status: "Pending",
    paymentProof: null,
    rejectionComment: "",
  },
  {
    id: "EXP-003",
    createdBy: "Test Name",
    projectId: "PROJ-001",
    clientName: "Client Alpha",
    date: "2023-10-05",
    description: "Office stationery supplies for the entire team",
    category: "Stationary",
    vendorName: "Office Essentials Co.",
    amount: "5000",
    status: "Rejected",
    paymentProof: null,
    rejectionComment:
      "Incorrect invoice attached. Please re-upload with the correct document.",
  },
  {
    id: "EXP-004",
    createdBy: "Another User",
    projectId: "PROJ-003",
    clientName: "Client Gamma",
    date: "2023-10-11",
    description: "Team Lunch",
    category: "Miscellaneous",
    vendorName: "The Grand Restaurant",
    amount: "8000",
    status: "Paid",
    paymentProof: "/path/to/proof2.pdf",
    rejectionComment: "",
  },
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
  title: {
    fontWeight: 700,
    fontSize: "2rem",
    marginBottom: 4,
    color: "#111827",
  },
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  filters: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  filterButton: (isActive) => ({
    padding: "8px 16px",
    borderRadius: 8,
    border: `1px solid ${isActive ? "#2563eb" : "#e5e7eb"}`,
    background: isActive ? "#eff6ff" : "#fff",
    color: isActive ? "#2563eb" : "#374151",
    fontWeight: isActive ? 600 : 500,
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    textDecoration: isActive ? "underline" : "none",
  }),
  searchContainer: {
    position: "relative",
    width: "320px",
  },
  searchInput: {
    width: "100%",
    padding: "10px 16px 10px 40px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: "1rem",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },
  advancedFilterButton: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  filterMenu: {
    position: "absolute",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    zIndex: 10,
    top: "110%",
    width: 300,
    padding: 16,
  },
  bulkActionBar: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "8px 16px",
    background: "#eef2ff",
    borderRadius: 8,
    border: "1px solid #c7d2fe",
  },
};

const PMExpensesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    dateFrom: "",
    dateTo: "",
    vendor: "",
  });

  const loggedInUser = "Test Name";

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

  const handleAdvFilterChange = (e) => {
    setAdvFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearAdvFilters = () => {
    setAdvFilters({ dateFrom: "", dateTo: "", vendor: "" });
    setShowAdvancedFilters(false);
  };

  const filteredExpenses = useMemo(() => {
    return mockExpenses
      .filter((expense) => expense.createdBy === loggedInUser)
      .filter((expense) => {
        const statusMatch =
          statusFilter === "All" || expense.status === statusFilter;

        const date = new Date(expense.date);
        const dateFrom = advFilters.dateFrom
          ? new Date(advFilters.dateFrom)
          : null;
        const dateTo = advFilters.dateTo ? new Date(advFilters.dateTo) : null;
        if (dateFrom) dateFrom.setHours(0, 0, 0, 0);
        if (dateTo) dateTo.setHours(23, 59, 59, 999);

        const dateMatch =
          (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
        const vendorMatch =
          !advFilters.vendor || expense.vendorName === advFilters.vendor;

        const searchMatch =
          !searchQuery ||
          Object.values(expense).some((val) =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
          );

        return statusMatch && searchMatch && dateMatch && vendorMatch;
      });
  }, [statusFilter, searchQuery, loggedInUser, advFilters]);

  // Bulk actions logic
  const [selectedRows, setSelectedRows] = useState([]);
  const allRowsSelected =
    filteredExpenses.length > 0 &&
    selectedRows.length === filteredExpenses.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredExpenses.map((exp) => exp.id));
    } else {
      setSelectedRows([]);
    }
  };
  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 p-6">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Expenses</h1>
            <p style={styles.subtitle}>
              Track, submit, and manage all your project-related expenses.
            </p>
          </div>
          <button onClick={handleCreateExpense} style={styles.createButton}>
            + Create New Expense
          </button>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.filters}>
            {["All", "Pending", "Paid", "Rejected"].map((status) => (
              <button
                key={status}
                style={styles.filterButton(statusFilter === status)}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={styles.filters}>
            <div style={styles.searchContainer}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by any field..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ position: "relative" }}>
              <button
                style={styles.advancedFilterButton}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <FiFilter />
                <span>Advanced</span>
                <FiChevronDown />
              </button>
              {showAdvancedFilters && (
                <div style={styles.filterMenu}>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label
                        htmlFor="dateFrom"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date From
                      </label>
                      <input
                        type="date"
                        id="dateFrom"
                        name="dateFrom"
                        value={advFilters.dateFrom}
                        onChange={handleAdvFilterChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dateTo"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date To
                      </label>
                      <input
                        type="date"
                        id="dateTo"
                        name="dateTo"
                        value={advFilters.dateTo}
                        onChange={handleAdvFilterChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="vendor"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Vendor Name
                      </label>
                      <input
                        type="text"
                        id="vendor"
                        name="vendor"
                        value={advFilters.vendor}
                        onChange={handleAdvFilterChange}
                        placeholder="e.g., Amazon"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 pt-4 border-t">
                    <button
                      onClick={clearAdvFilters}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <FiX /> Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {selectedRows.length > 0 && (
          <div style={styles.bulkActionBar} className="mb-4">
            <span className="font-semibold">{selectedRows.length} selected</span>
            <div className="flex-grow" />
            <button className="flex items-center gap-2 text-red-600 hover:text-red-800">
              <FaRegTrashAlt /> Delete Selected
            </button>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <FaPaperPlane /> Submit Selected
            </button>
          </div>
        )}

        <AccountantExpenseTable
          expenses={filteredExpenses}
          onEdit={handleEditExpense}
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          allRowsSelected={allRowsSelected}
        />

        {isModalOpen && (
          <Modal onClose={handleCloseModal} title={editingExpense ? "Edit Expense" : "Create New Expense"}>
            <CreateExpenseForm
              expenseData={editingExpense}
              onClose={handleCloseModal}
              onSubmit={(data) => {
                console.log("Form submitted:", data);
                handleCloseModal();
              }}
            />
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

export default withAuth(PMExpensesPage);
