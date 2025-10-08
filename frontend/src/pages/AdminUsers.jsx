// src/pages/AdminUsers.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Edit, 
  Trash2, 
  UserPlus, 
  Eye, 
  EyeOff, 
  XCircle, 
  Search, 
  Filter, 
  Users, 
  DollarSign, 
  Clock, 
  Mail, 
  Briefcase, 
  Plus,
  UserCheck, 
  Coffee, 
  AlertCircle,
  Zap, // Added for 'No Data' status fallback
  IdCard,
  UserCircle,
  Calendar,
  CalendarDays,
  MapPin,
  Phone,
  PhoneCall,
  Building2,
  Landmark,
  Hash,
  UserCog
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";

const createInitialFormState = () => ({
  fullName: "",
  email: "",
  password: "",
  role: "Employee",
  jobTitle: "",
  status: "active",
  basicSalary: "",
  workingHours: "",
  allowance: "",
  loan: "",
  nationalId: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  phoneNumber: "",
  department: "",
  startDate: "",
  employmentType: "",
  bankName: "",
  bankAccountNumber: "",
  contactPhoneNumber: "",
});

const NAME_REGEX = /^[a-zA-Z\s-]+$/;
const DEPARTMENT_REGEX = /^[a-zA-Z&\s-]+$/;
const PHONE_REGEX = /^\+?\d{9,15}$/;
const NATIONAL_ID_REGEX = /^[A-Z0-9-]{5,20}$/;
const BANK_ACCOUNT_REGEX = /^\d{6,20}$/;
const GENDERS = ["Male", "Female", "Other"];
const EMPLOYMENT_TYPES = ["Permanent", "Contract", "Intern"];
const MINIMUM_EMPLOYEE_AGE = 18;

export default function AdminUsers() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // search / filters
  const [searchTerm, setSearchTerm] = useState("");
  // This statusFilter is for the employee's permanent 'active' or 'inactive' status
  const [statusFilter, setStatusFilter] = useState("all"); 

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(() => createInitialFormState());
  const [formError, setFormError] = useState(""); // General error for form submission
  // FIX: Changed from {} to useState({})
  const [formValidationErrors, setFormValidationErrors] = useState({}); // Specific validation errors for each field
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateLimits = useMemo(() => {
    const today = new Date();
    const isoToday = today.toISOString().split("T")[0];
    const maxDobDate = new Date(today);
    maxDobDate.setFullYear(maxDobDate.getFullYear() - 18);
    return {
      today: isoToday,
      maxDob: maxDobDate.toISOString().split("T")[0],
    };
  }, []);

  // delete confirm modal
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Animations (unchanged)
  const containerVariants = { 
    hidden: { opacity: 0 }, 
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.6, 
        staggerChildren: 0.1 
      } 
    } 
  };
  const itemVariants = { 
    hidden: { opacity: 0, y: 20 }, 
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5 } 
    } 
  };
  const formVariants = { 
    hidden: { opacity: 0, scale: 0.9, y: -20 }, 
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.4 } 
    }, 
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: -20,
      transition: { duration: 0.3 }
    } 
  };
  const modalVariants = { 
    hidden: { opacity: 0, scale: 0.8 }, 
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.3 } 
    }, 
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      transition: { duration: 0.2 } 
    } 
  };

  // load employees
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/users");
      // Ensure data.items is an array, or default to an empty array
      setEmployees(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // filter employees
  // Add a defensive check to ensure 'employees' is an array before calling filter
  const filteredEmployees = Array.isArray(employees) ? employees.filter((emp) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      emp.fullName?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.jobTitle?.toLowerCase().includes(q);
    
    // This statusFilter is for the employee's permanent 'active' or 'inactive' status
    const matchesPermanentStatus = statusFilter === "all" || emp.status === statusFilter;

    // AdminUsers.jsx does not have a separate filter for currentAttendanceStatusFilter
    // The table will display currentAttendanceStatus, but filtering should be based on permanent status.
    return matchesSearch && matchesPermanentStatus;
  }) : []; // If employees is not an array, default to an empty array for filtering


  // --- Client-side validation logic ---
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    const trimmedFullName = form.fullName.trim();
    if (!trimmedFullName) {
      errors.fullName = "Full Name is required.";
      isValid = false;
    } else if (trimmedFullName.length < 2) {
      errors.fullName = "Full Name must be at least 2 characters.";
      isValid = false;
    } else if (trimmedFullName.length > 100) {
      errors.fullName = "Full Name cannot exceed 100 characters.";
      isValid = false;
    } else if (!NAME_REGEX.test(trimmedFullName)) {
      errors.fullName = "Full Name can only contain letters, spaces, and hyphens.";
      isValid = false;
    }

    const emailValue = form.email.trim();
    if (!emailValue) {
      errors.email = "Email Address is required.";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
      errors.email = "Please enter a valid email address.";
      isValid = false;
    } else if (emailValue.length > 255) {
      errors.email = "Email address cannot exceed 255 characters.";
      isValid = false;
    }

    // Password Validation (Required for new employee, optional for editing if left blank)
    if (!editingEmployee || (editingEmployee && form.password)) { // Only validate if new or if password field is filled during edit
      if (!form.password) {
        errors.password = "Password is required.";
        isValid = false;
      } else if (form.password.length < 8) {
        errors.password = "Password must be at least 8 characters long.";
        isValid = false;
      } else if (form.password.length > 50) {
        errors.password = "Password cannot exceed 50 characters.";
        isValid = false;
      }
      // Optional: Add complexity rules if desired (e.g., regex for uppercase, lowercase, number, special char)
      // else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password)) {
      //   errors.password = "Password must include uppercase, lowercase, number, and special character.";
      //   isValid = false;
      // }
    }

    const jobTitleValue = form.jobTitle.trim();
    if (!jobTitleValue) {
      errors.jobTitle = "Job Title is required.";
      isValid = false;
    } else if (jobTitleValue.length < 2) {
      errors.jobTitle = "Job Title must be at least 2 characters.";
      isValid = false;
    } else if (jobTitleValue.length > 100) {
      errors.jobTitle = "Job Title cannot exceed 100 characters.";
      isValid = false;
    } else if (!NAME_REGEX.test(jobTitleValue)) {
      errors.jobTitle = "Job Title can only contain letters, spaces, and hyphens.";
      isValid = false;
    }

    const nationalIdValue = form.nationalId.trim().toUpperCase();
    if (!nationalIdValue) {
      errors.nationalId = "National ID / Passport Number is required.";
      isValid = false;
    } else if (!NATIONAL_ID_REGEX.test(nationalIdValue)) {
      errors.nationalId = "National ID / Passport must be 5-20 characters (letters, numbers, or hyphen).";
      isValid = false;
    }

    if (!GENDERS.includes(form.gender)) {
      errors.gender = "Please select a gender.";
      isValid = false;
    }

    if (!form.dateOfBirth) {
      errors.dateOfBirth = "Date of Birth is required.";
      isValid = false;
    } else {
      const dobDate = new Date(form.dateOfBirth);
      if (Number.isNaN(dobDate.getTime())) {
        errors.dateOfBirth = "Please enter a valid date of birth.";
        isValid = false;
      } else {
        const today = new Date();
        if (dobDate > today) {
          errors.dateOfBirth = "Date of Birth cannot be in the future.";
          isValid = false;
        }
        const age = today.getFullYear() - dobDate.getFullYear() - (today < new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate()) ? 1 : 0);
        if (age < MINIMUM_EMPLOYEE_AGE) {
          errors.dateOfBirth = `Employee must be at least ${MINIMUM_EMPLOYEE_AGE} years old.`;
          isValid = false;
        }
      }
    }

    const addressValue = form.address.trim();
    if (!addressValue) {
      errors.address = "Address is required.";
      isValid = false;
    } else if (addressValue.length < 10) {
      errors.address = "Address must be at least 10 characters long.";
      isValid = false;
    } else if (addressValue.length > 250) {
      errors.address = "Address cannot exceed 250 characters.";
      isValid = false;
    }

    const phoneValue = form.phoneNumber.trim();
    if (!phoneValue) {
      errors.phoneNumber = "Phone Number is required.";
      isValid = false;
    } else if (!PHONE_REGEX.test(phoneValue)) {
      errors.phoneNumber = "Phone Number must contain 9 to 15 digits and may start with +.";
      isValid = false;
    }

    const contactPhoneValue = form.contactPhoneNumber.trim();
    if (!contactPhoneValue) {
      errors.contactPhoneNumber = "Contact Phone Number is required.";
      isValid = false;
    } else if (!PHONE_REGEX.test(contactPhoneValue)) {
      errors.contactPhoneNumber = "Contact Phone Number must contain 9 to 15 digits and may start with +.";
      isValid = false;
    }

    const departmentValue = form.department.trim();
    if (!departmentValue) {
      errors.department = "Department is required.";
      isValid = false;
    } else if (departmentValue.length < 2) {
      errors.department = "Department must be at least 2 characters.";
      isValid = false;
    } else if (departmentValue.length > 100) {
      errors.department = "Department cannot exceed 100 characters.";
      isValid = false;
    } else if (!DEPARTMENT_REGEX.test(departmentValue)) {
      errors.department = "Department can only contain letters, spaces, ampersands, and hyphens.";
      isValid = false;
    }

    if (!EMPLOYMENT_TYPES.includes(form.employmentType)) {
      errors.employmentType = "Please select an employment type.";
      isValid = false;
    }

    if (!form.startDate) {
      errors.startDate = "Start Date is required.";
      isValid = false;
    } else {
      const startDate = new Date(form.startDate);
      if (Number.isNaN(startDate.getTime())) {
        errors.startDate = "Please enter a valid start date.";
        isValid = false;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const normalizedStart = new Date(startDate);
        normalizedStart.setHours(0, 0, 0, 0);
        if (normalizedStart > today) {
          errors.startDate = "Start Date cannot be in the future.";
          isValid = false;
        }
      }
    }

    if (form.basicSalary === "" || form.basicSalary === null) {
      errors.basicSalary = "Basic Salary is required.";
      isValid = false;
    } else {
      const salary = parseFloat(form.basicSalary);
      if (isNaN(salary)) {
        errors.basicSalary = "Basic Salary must be a number.";
        isValid = false;
      } else if (salary < 0) {
        errors.basicSalary = "Basic Salary cannot be negative.";
        isValid = false;
      } else if (salary > 1000000) {
        errors.basicSalary = "Basic Salary cannot exceed Rs. 1,000,000.";
        isValid = false;
      } else if (/\.\d{3,}/.test(form.basicSalary)) {
        errors.basicSalary = "Basic Salary can have at most 2 decimal places.";
        isValid = false;
      }
    }

    // Working Hours Validation (Optional, validate if present)
    if (form.workingHours !== "" && form.workingHours !== null) {
      const hours = parseFloat(form.workingHours);
      if (isNaN(hours)) {
        errors.workingHours = "Working Hours must be a number.";
        isValid = false;
      } else if (hours < 1) {
        errors.workingHours = "Working Hours must be at least 1.";
        isValid = false;
      } else if (hours > 60) { // Example max working hours per week
        errors.workingHours = "Working Hours cannot exceed 60.";
        isValid = false;
      } else if (/\.\d{3,}/.test(form.workingHours)) { // Allow up to 2 decimal places (e.g., 8.5 hours)
        errors.workingHours = "Working Hours can have at most 2 decimal places.";
        isValid = false;
      }
    }

    // Allowance Validation (Optional, validate if present)
    if (form.allowance !== "" && form.allowance !== null) {
      const allowance = parseFloat(form.allowance);
      if (isNaN(allowance)) {
        errors.allowance = "Allowance must be a number.";
        isValid = false;
      } else if (allowance < 0) {
        errors.allowance = "Allowance cannot be negative.";
        isValid = false;
      } else if (allowance > 1000000) { // Max allowance check (10 Lakhs)
        errors.allowance = "Allowance cannot exceed Rs. 1,000,000."; 
        isValid = false;
      } else if (/\.\d{3,}/.test(form.allowance)) { // Allow up to 2 decimal places
        errors.allowance = "Allowance can have at most 2 decimal places.";
        isValid = false;
      }
    }

    // Loan Validation (Optional, validate if present)
    if (form.loan !== "" && form.loan !== null) {
      const loan = parseFloat(form.loan);
      if (isNaN(loan)) {
        errors.loan = "Loan must be a number.";
        isValid = false;
      } else if (loan < 0) {
        errors.loan = "Loan cannot be negative.";
        isValid = false;
      } else if (loan > 1000000) { // Max loan check (10 Lakhs)
        errors.loan = "Loan cannot exceed Rs. 1,000,000."; 
        isValid = false;
      } else if (/\.\d{3,}/.test(form.loan)) { // Allow up to 2 decimal places
        errors.loan = "Loan can have at most 2 decimal places.";
        isValid = false;
      }
    }

    const bankNameValue = form.bankName.trim();
    if (!bankNameValue) {
      errors.bankName = "Bank Name is required.";
      isValid = false;
    } else if (bankNameValue.length < 2) {
      errors.bankName = "Bank Name must be at least 2 characters.";
      isValid = false;
    } else if (bankNameValue.length > 100) {
      errors.bankName = "Bank Name cannot exceed 100 characters.";
      isValid = false;
    } else if (!DEPARTMENT_REGEX.test(bankNameValue)) {
      errors.bankName = "Bank Name can only contain letters, spaces, ampersands, and hyphens.";
      isValid = false;
    }

    const bankAccountValue = form.bankAccountNumber.trim();
    if (!bankAccountValue) {
      errors.bankAccountNumber = "Bank Account Number is required.";
      isValid = false;
    } else if (!BANK_ACCOUNT_REGEX.test(bankAccountValue)) {
      errors.bankAccountNumber = "Bank Account Number must be 6 to 20 digits.";
      isValid = false;
    }

    // Status Validation (should always be valid due to select options, but a fallback check is good)
    if (!['active', 'inactive'].includes(form.status)) {
        errors.status = "Invalid status selected.";
        isValid = false;
    }

    setFormValidationErrors(errors);
    return isValid;
  };

  // submit (create/update)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError(""); // Clear general form error
    setFormValidationErrors({}); // Clear previous validation errors

    if (!validateForm()) {
      // If client-side validation fails, scroll to the top of the form or show a general error
      setFormError("Please correct the errors in the form.");
      setIsSubmitting(false); // Ensure button is re-enabled
      return;
    }

    setIsSubmitting(true);
    try {
      const basePayload = { ...form };
      const fieldsToTrim = [
        "fullName",
        "email",
        "jobTitle",
        "nationalId",
        "address",
        "phoneNumber",
        "department",
        "employmentType",
        "bankName",
        "bankAccountNumber",
        "contactPhoneNumber",
      ];

      fieldsToTrim.forEach((field) => {
        if (typeof basePayload[field] === "string") {
          basePayload[field] = basePayload[field].trim();
        }
      });

      basePayload.nationalId = basePayload.nationalId.toUpperCase();
      basePayload.role = "Employee";

      if (editingEmployee) {
        const payload = { ...basePayload };
        if (!payload.password) delete payload.password; // Don't send empty password if not changed
        await api.patch(`/admin/users/${editingEmployee._id}`, payload);
      } else {
        const payload = { ...basePayload };
        await api.post("/admin/users", payload);
      }
      resetForm();
      await loadEmployees();
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          `Failed to ${editingEmployee ? "update" : "create"} employee.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // delete employee (unchanged)
  const deleteEmployee = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      await loadEmployees();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete employee.");
    }
  };

  const resetFormState = () => {
    setForm(createInitialFormState());
    setFormError("");
    setFormValidationErrors({});
    setShowPassword(false);
  };

  const resetForm = () => {
    resetFormState();
    setShowForm(false);
    setShowDetailModal(false);
    setEditingEmployee(null);
    setSelectedEmployee(null);
  };

  const openAddForm = () => {
    resetFormState();
    setEditingEmployee(null);
    setSelectedEmployee(null);
    setShowDetailModal(false);
    setShowForm(true);
  };

  // edit employee
  const editEmployee = (emp) => {
    if (!emp) return;

    const formatNumber = (value) =>
      value !== undefined && value !== null && value !== ""
        ? String(value)
        : "";

    const formatDate = (value) => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    };

    setEditingEmployee(emp);
    setSelectedEmployee(emp);
    setShowForm(false);
    setForm({
      ...createInitialFormState(),
      fullName: emp.fullName || "",
      email: emp.email || "",
      password: "",
      role: "Employee",
      jobTitle: emp.jobTitle || "",
      status: emp.status || "active",
      basicSalary: formatNumber(emp.basicSalary),
      workingHours: formatNumber(emp.workingHours),
      allowance: formatNumber(emp.allowance),
      loan: formatNumber(emp.loan),
      nationalId: (emp.nationalId || "").toString().toUpperCase(),
      gender: emp.gender || "",
      dateOfBirth: formatDate(emp.dateOfBirth),
      address: emp.address || "",
      phoneNumber: emp.phoneNumber || "",
      department: emp.department || "",
      startDate: formatDate(emp.startDate),
      employmentType: emp.employmentType || "",
      bankName: emp.bankName || "",
      bankAccountNumber: emp.bankAccountNumber ? emp.bankAccountNumber.toString() : "",
      contactPhoneNumber: emp.contactPhoneNumber || "",
    });
    setShowPassword(false);
    setFormError("");
    setFormValidationErrors({});
    setShowDetailModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Prevent numbers and most symbols in Full Name and Job Title
    if (name === 'fullName' || name === 'jobTitle') {
        // Allow letters, spaces, and hyphens. Remove anything else (including periods).
        newValue = value.replace(/[^a-zA-Z\s-]/g, '');
    }
    else if (name === 'nationalId') {
        const upperValue = value.toUpperCase();

        // Keep only digits and enforce a maximum of 12 numeric characters
        const digitsOnly = upperValue.replace(/[^0-9]/g, '').slice(0, 12);

        // Determine if the latest valid character is a trailing V (or v) after 12 digits
        const sanitized = upperValue.replace(/[^0-9V]/g, '');
        const lastChar = sanitized[sanitized.length - 1];

        newValue = digitsOnly;

        if (digitsOnly.length === 12 && lastChar === 'V') {
            newValue += 'V';
        }
    }
    else if (['phoneNumber', 'contactPhoneNumber'].includes(name)) {
        let cleanedValue = value.replace(/[^0-9+]/g, '');
        if (cleanedValue.startsWith('+')) {
            cleanedValue = '+' + cleanedValue.slice(1).replace(/\+/g, '');
        } else {
            cleanedValue = cleanedValue.replace(/\+/g, '');
        }
        if (cleanedValue.length > 16) {
            cleanedValue = cleanedValue.slice(0, 16);
        }
        newValue = cleanedValue;
    }
    else if (name === 'bankAccountNumber') {
        newValue = value.replace(/[^0-9]/g, '').slice(0, 20);
    }
    else if (name === 'department' || name === 'bankName') {
        newValue = value.replace(/[^a-zA-Z&\s-]/g, '').slice(0, 100);
    }
    else if (name === 'address') {
        newValue = value.slice(0, 250);
    }
    // Special handling for number inputs to ensure only valid numbers are typed and respect length limits
    else if (['basicSalary', 'workingHours', 'allowance', 'loan'].includes(name)) {
        // 1. Remove non-numeric characters except for a single decimal point
        let cleanedValue = value.replace(/[^0-9.]/g, '');

        // 2. Ensure only one decimal point
        const parts = cleanedValue.split('.');
        if (parts.length > 2) {
            // If more than one decimal point, take the first part and the first decimal part
            cleanedValue = parts[0] + '.' + parts.slice(1).join('');
        }

        // 3. Ensure maximum two decimal places
        if (parts[1] && parts[1].length > 2) {
            cleanedValue = parts[0] + '.' + parts[1].substring(0, 2);
        }

        let integerPart = cleanedValue.split('.')[0];
        let decimalPart = cleanedValue.includes('.') ? cleanedValue.split('.')[1] : '';
            
        let maxIntegerLength;
        if (name === 'workingHours') {
            maxIntegerLength = 2; // Max value 60. Max integer part length 2 (e.g., "60")
        } else {
            maxIntegerLength = 7; // For basicSalary, allowance, loan: Max value 1,000,000. Max integer part length 7 (e.g., "1000000")
        }

        // 4. Enforce max integer part length
        if (integerPart.length > maxIntegerLength) {
            integerPart = integerPart.substring(0, maxIntegerLength);
            // Reconstruct the value with the truncated integer part
            cleanedValue = integerPart + (decimalPart ? `.${decimalPart}` : (value.includes('.') ? '.' : ''));
        }

        newValue = cleanedValue;
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));

    // Clear the specific error for this field as the user types
    if (formValidationErrors[name]) {
      setFormValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const renderEmployeeFormFields = () => (
    <div className="space-y-10">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 mr-2 text-gray-500" />
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter full name"
              required
            />
            {formValidationErrors.fullName && <p className="text-red-500 text-xs mt-1">{formValidationErrors.fullName}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter email address"
              required
            />
            {formValidationErrors.email && <p className="text-red-500 text-xs mt-1">{formValidationErrors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Eye className="w-4 h-4 mr-2 text-gray-500" />
              Password {!editingEmployee && <span className="text-red-500 ml-1">*</span>} {editingEmployee && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleInputChange}
                className={`w-full p-4 bg-white border ${formValidationErrors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-12`}
                placeholder="Enter password"
                required={!editingEmployee}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formValidationErrors.password && <p className="text-red-500 text-xs mt-1">{formValidationErrors.password}</p>}
          </div>

          {/* National ID */}
          <div className="space-y-2">
            <label htmlFor="nationalId" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <IdCard className="w-4 h-4 mr-2 text-gray-500" />
              National ID / Passport Number *
            </label>
            <input
              id="nationalId"
              name="nationalId"
              value={form.nationalId}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.nationalId ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 uppercase`}
              placeholder="Enter ID or passport number"
              required
            />
            {formValidationErrors.nationalId && <p className="text-red-500 text-xs mt-1">{formValidationErrors.nationalId}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label htmlFor="gender" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <UserCircle className="w-4 h-4 mr-2 text-gray-500" />
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.gender ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
              required
            >
              <option value="">Select Gender</option>
              {GENDERS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {formValidationErrors.gender && <p className="text-red-500 text-xs mt-1">{formValidationErrors.gender}</p>}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              Date of Birth *
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleInputChange}
              max={dateLimits.maxDob}
              className={`w-full p-4 bg-white border ${formValidationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              required
            />
            {formValidationErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{formValidationErrors.dateOfBirth}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 mr-2 text-gray-500" />
              Phone Number *
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              inputMode="tel"
              value={form.phoneNumber}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.phoneNumber ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter phone number"
              required
            />
            {formValidationErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formValidationErrors.phoneNumber}</p>}
          </div>

          {/* Contact Phone Number */}
          <div className="space-y-2">
            <label htmlFor="contactPhoneNumber" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <PhoneCall className="w-4 h-4 mr-2 text-gray-500" />
              Contact Phone Number *
            </label>
            <input
              id="contactPhoneNumber"
              name="contactPhoneNumber"
              inputMode="tel"
              value={form.contactPhoneNumber}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.contactPhoneNumber ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter emergency contact number"
              required
            />
            {formValidationErrors.contactPhoneNumber && <p className="text-red-500 text-xs mt-1">{formValidationErrors.contactPhoneNumber}</p>}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2 mt-6">
          <label htmlFor="address" className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            value={form.address}
            onChange={handleInputChange}
            className={`w-full p-4 bg-white border ${formValidationErrors.address ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
            placeholder="Enter residential address"
            required
          />
          {formValidationErrors.address && <p className="text-red-500 text-xs mt-1">{formValidationErrors.address}</p>}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Employment Details</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Title */}
          <div className="space-y-2">
            <label htmlFor="jobTitle" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
              Job Title *
            </label>
            <input
              id="jobTitle"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.jobTitle ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter job title"
              required
            />
            {formValidationErrors.jobTitle && <p className="text-red-500 text-xs mt-1">{formValidationErrors.jobTitle}</p>}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label htmlFor="department" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 mr-2 text-gray-500" />
              Department *
            </label>
            <input
              id="department"
              name="department"
              value={form.department}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.department ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter department"
              required
            />
            {formValidationErrors.department && <p className="text-red-500 text-xs mt-1">{formValidationErrors.department}</p>}
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <label htmlFor="employmentType" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <UserCog className="w-4 h-4 mr-2 text-gray-500" />
              Employment Type *
            </label>
            <select
              id="employmentType"
              name="employmentType"
              value={form.employmentType}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.employmentType ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
              required
            >
              <option value="">Select employment type</option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {formValidationErrors.employmentType && <p className="text-red-500 text-xs mt-1">{formValidationErrors.employmentType}</p>}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label htmlFor="startDate" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
              Start Date *
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleInputChange}
              max={dateLimits.today}
              className={`w-full p-4 bg-white border ${formValidationErrors.startDate ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              required
            />
            {formValidationErrors.startDate && <p className="text-red-500 text-xs mt-1">{formValidationErrors.startDate}</p>}
          </div>

          {/* Employment Status */}
          <div className="space-y-2">
            <label htmlFor="status" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              Employment Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.status ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200`}
            >
              <option value="active">Active Employee</option>
              <option value="inactive">Inactive Employee</option>
            </select>
            {formValidationErrors.status && <p className="text-red-500 text-xs mt-1">{formValidationErrors.status}</p>}
          </div>

          {/* Working Hours */}
          <div className="space-y-2">
            <label htmlFor="workingHours" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              Working Hours (Standard)
            </label>
            <input
              id="workingHours"
              name="workingHours"
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d{0,2}$"
              value={form.workingHours}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.workingHours ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Hours per week (max 60.00)"
            />
            {formValidationErrors.workingHours && <p className="text-red-500 text-xs mt-1">{formValidationErrors.workingHours}</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Compensation &amp; Banking</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Salary */}
          <div className="space-y-2">
            <label htmlFor="basicSalary" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
              Basic Salary *
            </label>
            <input
              id="basicSalary"
              name="basicSalary"
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d{0,2}$"
              value={form.basicSalary}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.basicSalary ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter salary amount"
              required
            />
            {formValidationErrors.basicSalary && <p className="text-red-500 text-xs mt-1">{formValidationErrors.basicSalary}</p>}
          </div>

          {/* Allowance */}
          <div className="space-y-2">
            <label htmlFor="allowance" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
              Allowance
            </label>
            <input
              id="allowance"
              name="allowance"
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d{0,2}$"
              value={form.allowance}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.allowance ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter allowance amount"
            />
            {formValidationErrors.allowance && <p className="text-red-500 text-xs mt-1">{formValidationErrors.allowance}</p>}
          </div>

          {/* Loan */}
          <div className="space-y-2">
            <label htmlFor="loan" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
              Loan
            </label>
            <input
              id="loan"
              name="loan"
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d{0,2}$"
              value={form.loan}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.loan ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter outstanding loan amount"
            />
            {formValidationErrors.loan && <p className="text-red-500 text-xs mt-1">{formValidationErrors.loan}</p>}
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <label htmlFor="bankName" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Landmark className="w-4 h-4 mr-2 text-gray-500" />
              Bank Name *
            </label>
            <input
              id="bankName"
              name="bankName"
              value={form.bankName}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.bankName ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter bank name"
              required
            />
            {formValidationErrors.bankName && <p className="text-red-500 text-xs mt-1">{formValidationErrors.bankName}</p>}
          </div>

          {/* Bank Account Number */}
          <div className="space-y-2">
            <label htmlFor="bankAccountNumber" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 mr-2 text-gray-500" />
              Bank Account Number *
            </label>
            <input
              id="bankAccountNumber"
              name="bankAccountNumber"
              inputMode="numeric"
              value={form.bankAccountNumber}
              onChange={handleInputChange}
              className={`w-full p-4 bg-white border ${formValidationErrors.bankAccountNumber ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
              placeholder="Enter bank account number"
              required
            />
            {formValidationErrors.bankAccountNumber && <p className="text-red-500 text-xs mt-1">{formValidationErrors.bankAccountNumber}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  // Calculate active employees based on current attendance status (Present or Late) and if they haven't clocked out.
  // An employee is "currently clocked in" if their currentAttendanceStatus is 'Present' or 'Late' AND their 'todayLastCheckOut' is null.
  const currentlyClockedInEmployees = Array.isArray(employees) ? employees.filter(
    emp => (emp.currentAttendanceStatus === 'Present' || emp.currentAttendanceStatus === 'Late') && !emp.todayLastCheckOut
  ).length : 0;

  // NEW: Calculate Total Basic Salary
  const totalBasicSalary = Array.isArray(employees) ? employees.reduce((sum, emp) =>
    sum + (parseFloat(emp.basicSalary) || 0), 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading employees...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-4 sm:p-6 lg:p-8" 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with gradient */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 rounded-3xl shadow-2xl mb-8"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="text-white mb-6 lg:mb-0">
                <motion.h1 
                  className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Employee Management
                </motion.h1>
                <motion.p 
                  className="text-green-100 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Manage your team with powerful tools and insights
                </motion.p>
              </div>
              
              <motion.button
                onClick={() => {
                  if (showForm) {
                    resetForm();
                  } else {
                    openAddForm();
                  }
                }}
                className="group relative overflow-hidden bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-4 rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center space-x-2">
                  {showForm ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  <span>{showForm ? "Cancel" : "Add Employee"}</span>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {/* Adjusted grid to 3 columns since one card was removed */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={itemVariants}
        >
          {/* Total Employees (unchanged) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold text-green-600">{employees.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          {/* Currently Clocked In Employees (Updated to reflect current clock-in status) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Currently Clocked In</p>
                <p className="text-3xl font-bold text-green-600">{currentlyClockedInEmployees}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* NEW: Total Basic Salary Card (Styled with green) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Basic Salary</p>
                <p className="text-3xl font-bold text-green-600">Rs.{totalBasicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          {/* Removed: Total Payroll Card */}
        </motion.div>

        {/* Search and Filter Bar (unchanged) */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/50 shadow-lg"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error Message (unchanged) */}
        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Form (Employment Status text changed to be more explicit) */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8" 
              variants={formVariants} 
              initial="hidden" 
              animate="visible" 
              exit="exit"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mr-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {editingEmployee ? "Edit Employee" : "Add New Employee"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingEmployee ? "Update employee information" : "Fill in the details below"}
                  </p>
                </div>
              </div>

              {/* General Form Error Display */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {renderEmployeeFormFields()}

                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting} 
                    className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? "Processing..." : editingEmployee ? "Update Employee" : "Create Employee"}
                  </motion.button>
                  <motion.button 
                    type="button"
                    onClick={resetForm} 
                    className="flex-1 sm:flex-none px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDetailModal && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              onClick={resetForm}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8"
                onClick={(e) => e.stopPropagation()}
                variants={modalVariants}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-semibold">
                      {(form.fullName || selectedEmployee?.fullName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{form.fullName || selectedEmployee?.fullName || "Employee"}</h2>
                      <p className="text-sm text-gray-500">
                        {selectedEmployee?.empId ? `Employee ID: ${selectedEmployee.empId}` : "Employee details"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {[form.jobTitle || selectedEmployee?.jobTitle, form.department || selectedEmployee?.department]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {renderEmployeeFormFields()}

                  <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? "Processing..." : "Save Changes"}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 sm:flex-none px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Table */}
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden" 
          variants={itemVariants}
        >
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-green-50 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Employee Directory ({filteredEmployees.length} employees)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compensation</th>
                  {/* RE-ADDED: Status column header as per the image and latest request clarification */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> 
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No employees found</p>
                        <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => (
                    <motion.tr 
                      key={emp._id} 
                      className="hover:bg-green-50 transition-colors duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                              {emp.fullName?.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <button
                              type="button"
                              onClick={() => editEmployee(emp)}
                              className="text-sm font-semibold text-gray-900 hover:text-green-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 rounded"
                            >
                              {emp.fullName}
                            </button>
                            {/* Removed ID line as per previous request */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{emp.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{emp.jobTitle || "—"}</div>
                        {emp.workingHours > 0 && (
                          <div className="text-sm text-gray-500">{emp.workingHours} hrs/week (Std)</div>
                        )}
                        {emp.accumulatedWorkingHours > 0 && ( // Display accumulated hours if available
                          <div className="text-sm text-gray-500">Accumulated: {parseFloat(emp.accumulatedWorkingHours).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} hrs</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {emp.basicSalary ? `Rs.${parseFloat(emp.basicSalary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                        </div>
                        {emp.allowance > 0 && (
                          <div className="text-xs text-gray-500">Allowance: Rs.{parseFloat(emp.allowance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        )}
                        {emp.loan > 0 && (
                          <div className="text-xs text-red-500">Loan: Rs.{parseFloat(emp.loan).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        )}
                      </td>
                      
                      {/* NEW/RE-ADDED: Status column content as per the image and latest request */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {emp.currentAttendanceStatus === "Present" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <UserCheck className="w-3 h-3 mr-1" /> Present (Clocked In)
                          </span>
                        )}
                        {emp.currentAttendanceStatus === "Late" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <AlertCircle className="w-3 h-3 mr-1" /> Late (Clocked In)
                          </span>
                        )}
                        {emp.currentAttendanceStatus === "On Leave" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            <Coffee className="w-3 h-3 mr-1" /> On Leave
                          </span>
                        )}
                        {emp.currentAttendanceStatus === "Absent" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <XCircle className="w-3 h-3 mr-1" /> Absent
                          </span>
                        )}
                        {/* Fallback for any unexpected/missing status */}
                        {(!["Present", "Late", "On Leave", "Absent"].includes(emp.currentAttendanceStatus)) && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <Zap className="w-3 h-3 mr-1" /> No Data
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium"> {/* Adjusted text-align if needed */}
                        <div className="flex items-center gap-2"> {/* Moved Edit/Delete here and adjusted layout */}
                          <motion.button 
                            onClick={() => editEmployee(emp)} 
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-100 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            onClick={() => setDeleteConfirm(emp)} 
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-100 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Enhanced Delete Confirmation Modal (unchanged) */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial="hidden" 
              animate="visible" 
              exit="exit" 
              variants={modalVariants}
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div 
                className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
                variants={modalVariants}
              >
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">Delete Employee</h3>
                    <p className="text-gray-600 mt-1">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {deleteConfirm.fullName?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{deleteConfirm.fullName}</p>
                      <p className="text-sm text-gray-500">{deleteConfirm.jobTitle && (
                        <span>{deleteConfirm.jobTitle} &bull; </span>
                      )}{deleteConfirm.email}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 text-center">
                  Are you sure you want to permanently delete <strong>{deleteConfirm.fullName}</strong> from the system?
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button 
                    onClick={() => setDeleteConfirm(null)} 
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    onClick={() => deleteEmployee(deleteConfirm._id)} 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete Employee
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}