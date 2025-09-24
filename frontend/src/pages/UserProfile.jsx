// src/pages/UserProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Settings,
  ShoppingBag,
  ShieldCheck,
  User2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Trophy,
  Calendar,
  Mail,
  UserCheck,
} from "lucide-react";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";
import { updateProfile, updateProfilePassword } from "../lib/api";

/* ---------------- Animation Variants ---------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const floatingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const avatarVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 150, damping: 12 },
  },
};

/* ---------------- Utility ---------------- */
const inputClasses = (hasError, isFocused) =>
  `w-full rounded-2xl border-2 bg-white/90 px-5 py-4 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-4 backdrop-blur-sm ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100/80"
      : isFocused
      ? "border-emerald-400 shadow-lg shadow-emerald-200/50 focus:border-emerald-500 focus:ring-emerald-100/80"
      : "border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:ring-emerald-100/80"
  }`;

const normaliseFieldErrors = (errors) => {
  if (!errors || typeof errors !== "object") return {};
  return Object.entries(errors).reduce((acc, [field, value]) => {
    if (!value) return acc;
    acc[field] = Array.isArray(value) ? value.join(" ") : value;
    return acc;
  }, {});
};

/* ---------------- Reusable Components ---------------- */
const StatusMessage = ({ status }) => (
  <AnimatePresence>
    {status && (
      <motion.div
        variants={floatingVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`mt-6 rounded-2xl border-2 px-6 py-4 shadow-lg backdrop-blur-sm ${
          status.type === "success"
            ? "border-emerald-300 bg-emerald-50/90 text-emerald-800"
            : "border-red-300 bg-red-50/90 text-red-800"
        }`}
      >
        <div className="flex items-center gap-3">
          {status.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-semibold">{status.message}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const EnhancedInput = ({
  label,
  error,
  icon: Icon,
  type = "text",
  showPasswordToggle = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="relative">
      <label className="mb-3 block text-sm font-bold text-gray-800">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-emerald-600" />}
          {label}
        </div>
      </label>
      <div className="relative">
        <input
          {...props}
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={inputClasses(Boolean(error), isFocused)}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm font-medium text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- Main Component ---------------- */
export default function UserProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const [profileStatus, setProfileStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  /* Auto-dismiss success messages */
  useEffect(() => {
    if (profileStatus?.type === "success") {
      const timer = setTimeout(() => setProfileStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [profileStatus]);
  useEffect(() => {
    if (passwordStatus?.type === "success") {
      const timer = setTimeout(() => setPasswordStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordStatus]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName ?? "",
        email: user.email ?? "",
      });
    }
  }, [user]);

  const initials = useMemo(() => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [user?.fullName]);

  if (!user) {
    return (
      <>
        <Header />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500"></div>
            <p className="text-gray-600 font-medium">Loading profile...</p>
          </div>
        </motion.div>
        <Footer />
      </>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  /* ---------------- Handlers ---------------- */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateProfile = () => {
    const errors = {};
    if (!profileForm.fullName.trim()) errors.fullName = "Full name is required.";
    if (!profileForm.email.trim()) errors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(profileForm.email))
      errors.email = "Enter a valid email address.";
    return errors;
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword.trim())
      errors.currentPassword = "Current password is required.";
    if (!passwordForm.newPassword.trim())
      errors.newPassword = "New password is required.";
    else if (passwordForm.newPassword.length < 8)
      errors.newPassword = "Use at least 8 characters.";
    if (!passwordForm.confirmPassword.trim())
      errors.confirmPassword = "Please confirm new password.";
    else if (passwordForm.confirmPassword !== passwordForm.newPassword)
      errors.confirmPassword = "Passwords do not match.";
    return errors;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus(null);

    const validationErrors = validateProfile();
    if (Object.keys(validationErrors).length > 0) {
      setProfileErrors(validationErrors);
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const response = await updateProfile({
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
      });
      const nextUser = response?.user ?? response?.data?.user ?? null;

      updateUser((prev) => ({
        ...(prev ?? {}),
        ...(nextUser && typeof nextUser === "object" ? nextUser : profileForm),
      }));

      setProfileStatus({ type: "success", message: "Profile updated successfully!" });
    } catch (error) {
      const errors = normaliseFieldErrors(error?.errors);
      if (Object.keys(errors).length > 0) setProfileErrors(errors);
      setProfileStatus({ type: "error", message: error?.message ?? "Update failed." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    const validationErrors = validatePassword();
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await updateProfilePassword({ ...passwordForm });
      setPasswordStatus({ type: "success", message: "Password updated successfully!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const errors = normaliseFieldErrors(error?.errors);
      if (Object.keys(errors).length > 0) setPasswordErrors(errors);
      setPasswordStatus({ type: "error", message: error?.message ?? "Update failed." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 py-16 relative z-10">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Profile Header */}
            <motion.section
              variants={cardVariants}
              className="mb-12 rounded-3xl border-2 border-emerald-200/50 bg-white/80 p-8 shadow-2xl shadow-emerald-100/30 backdrop-blur-xl relative overflow-hidden"
            >
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-6">
                  <motion.div variants={avatarVariants} className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 text-4xl font-bold text-white shadow-2xl shadow-emerald-300/50 ring-4 ring-white">
                      {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1 shadow-lg ring-2 ring-white">
                      <UserCheck className="h-4 w-4 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-600">
                      <Sparkles className="h-4 w-4" /> Welcome Back
                    </p>
                    <h1 className="text-4xl font-bold text-gray-900">
                      {user.fullName || "there"}!
                    </h1>
                    <p className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" /> {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    to="/my-orders"
                    className="rounded-2xl border-2 border-emerald-200 bg-white/90 px-6 py-3 text-sm font-bold text-emerald-600 shadow hover:bg-emerald-50"
                  >
                    <ShoppingBag className="mr-2 inline h-4 w-4" /> My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-3 text-sm font-bold text-white shadow hover:bg-red-600"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Content Grid */}
            <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
              {/* Sidebar */}
              <motion.aside variants={cardVariants} className="space-y-6">
                <div className="rounded-3xl border-2 bg-white/90 p-6 shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-emerald-600" /> Account Summary
                  </h2>
                  <dl className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <dt className="font-bold text-gray-700">Full Name</dt>
                      <dd>{user.fullName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-bold text-gray-700">Email</dt>
                      <dd>{user.email}</dd>
                    </div>
                    {user.role && (
                      <div className="flex justify-between">
                        <dt className="font-bold text-gray-700">Role</dt>
                        <dd className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                          {user.role}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </motion.aside>

              {/* Forms */}
              <div className="space-y-8">
                {/* Profile Form */}
                <motion.form
                  variants={cardVariants}
                  onSubmit={handleProfileSubmit}
                  className="rounded-3xl border-2 bg-white/90 p-8 shadow"
                >
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    Update Your Details
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <EnhancedInput
                        label="Full Name"
                        id="fullName"
                        name="fullName"
                        icon={User2}
                        value={profileForm.fullName}
                        onChange={handleProfileChange}
                        placeholder="e.g. Alex Fernando"
                        disabled={isUpdatingProfile}
                        error={profileErrors.fullName}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <EnhancedInput
                        label="Email Address"
                        id="email"
                        name="email"
                        type="email"
                        icon={Mail}
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        placeholder="you@example.com"
                        disabled={isUpdatingProfile}
                        error={profileErrors.email}
                      />
                    </div>
                  </div>
                  <StatusMessage status={profileStatus} />
                  <div className="mt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {isUpdatingProfile ? "Saving Changes..." : "Save Changes"}
                    </motion.button>
                  </div>
                </motion.form>

                {/* Password Form */}
                <motion.form
                  variants={cardVariants}
                  onSubmit={handlePasswordSubmit}
                  className="rounded-3xl border-2 bg-white/90 p-8 shadow"
                >
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    Password & Security
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <EnhancedInput
                        label="Current Password"
                        id="currentPassword"
                        name="currentPassword"
                        icon={ShieldCheck}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        disabled={isUpdatingPassword}
                        error={passwordErrors.currentPassword}
                        showPasswordToggle
                      />
                    </div>
                    <div>
                      <EnhancedInput
                        label="New Password"
                        id="newPassword"
                        name="newPassword"
                        icon={ShieldCheck}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="At least 8 characters"
                        disabled={isUpdatingPassword}
                        error={passwordErrors.newPassword}
                        showPasswordToggle
                      />
                    </div>
                    <div>
                      <EnhancedInput
                        label="Confirm Password"
                        id="confirmPassword"
                        name="confirmPassword"
                        icon={ShieldCheck}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Re-enter new password"
                        disabled={isUpdatingPassword}
                        error={passwordErrors.confirmPassword}
                        showPasswordToggle
                      />
                    </div>
                  </div>
                  <StatusMessage status={passwordStatus} />
                  <div className="mt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {isUpdatingPassword ? "Updating Password..." : "Update Password"}
                    </motion.button>
                  </div>
                </motion.form>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
