import React, { useState, useEffect } from "react";
import Select from "react-select";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createDesignation, fetchDesignations } from "@/redux/slices/designationSlice";
import { fetchDepartments } from "@/redux/slices/departmentSlice";
import { toast } from "sonner";

export default function DesignationFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialValues = {},
  companyId,
  defaultDepartment,
}) {
  const dispatch = useDispatch();
  const { departments } = useSelector((state) => state.department);
  const departmentOptions = (departments || []).map((dept) => ({
    value: dept.departmentId,
    label: dept.name,
  }));
  // Helper to get department option from value or object
  const getDepartmentOption = (input) => {
    if (!input) return "";
    if (typeof input === "object" && input.value && input.label) return input;
    return departmentOptions.find((opt) => opt.value === (input.departmentId || input.value || input)) || "";
  };
  const [form, setForm] = useState({
    name: initialValues.name || "",
    description: initialValues.description || "",
    department: getDepartmentOption(initialValues.department) || getDepartmentOption(defaultDepartment) || "",
    manager: initialValues.manager || false,
    overtimeEligible: initialValues.overtimeEligible || false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const prevIsOpen = React.useRef(false);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      setForm({
        name: initialValues.name || "",
        description: initialValues.description || "",
        department: getDepartmentOption(initialValues.department) || getDepartmentOption(defaultDepartment) || "",
        manager: initialValues.manager || false,
        overtimeEligible: initialValues.overtimeEligible || false,
      });
      setErrors({});
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, initialValues, defaultDepartment, departments]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (selectedOption) => {
    setForm((prev) => ({ ...prev, department: selectedOption }));
    if (errors.department) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.department;
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Designation name is required";
    if (!form.department) newErrors.department = "Department is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const designationData = {
        name: form.name,
        description: form.description || "",
        department: form.department.value,
        manager: form.manager,
        overtimeEligible: form.overtimeEligible,
        companyId,
      };
      await dispatch(createDesignation(designationData)).unwrap();
      toast.success("Designation added successfully!");
      dispatch(fetchDesignations());
      setForm({
        name: "",
        description: "",
        department: "",
        manager: false,
        overtimeEligible: false,
      });
      setErrors({});
      setLoading(false);
      if (onSuccess) onSuccess({ ...designationData, department: form.department });
      if (onClose) onClose();
    } catch (error) {
      setLoading(false);
      if (error?.message?.includes("already exists")) {
        setErrors({ name: "Designation already exists" });
        toast.error("A designation with this name already exists.");
      } else {
        toast.error(error?.message || "Failed to add designation. Please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[600px]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add Designation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter designation name"
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter designation description"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <Select
              name="department"
              options={departmentOptions}
              className="react-select"
              classNamePrefix="select"
              placeholder="Select department"
              value={form.department}
              onChange={handleSelectChange}
            />
            {errors.department && <div className="text-red-500 text-xs mt-1">{errors.department}</div>}
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="manager"
                checked={form.manager}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              Is Manager
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="overtimeEligible"
                checked={form.overtimeEligible}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              Overtime Eligible
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 