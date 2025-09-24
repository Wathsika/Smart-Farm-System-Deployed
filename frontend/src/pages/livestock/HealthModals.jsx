// src/pages/health/HealthModals.jsx  (restyled + inline validation like MilkModal)
import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";

/* ---------- helpers ---------- */
const pad = (n) => String(n).padStart(2, "0");
const liso = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};
const todayISO = () => liso(new Date());

// typing-time: allow up to 2 decimals 
const allowTwoDp = (s) => /^\d{0,10}(?:\.\d{0,2})?$/.test(String(s));
// submit-time: number with up to 2 dp 
const twoDpStrict = (s) => /^\d+(?:\.\d{1,2})?$/.test(String(s));

/*  shared input styles  */
const INPUT ="w-full px-4 py-3 border rounded-xl placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition";
const SELECT ="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition";
const TEXTAREA ="w-full px-4 py-3 border rounded-xl resize-y min-h-[80px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition";

// allow only letters, numbers, space, and these symbols: . , " ' / ( )
const allowChars = /^[a-zA-Z0-9\s.,'"\/()]*$/;

const blockDisallowed = (e) => {
  if (!allowChars.test(e.key)) {
    e.preventDefault();
  }
};

/* ---------- Modal Shell ---------- */
function ModalFrame({
  title,
  onClose,
  onSubmit,
  submitText = "Save",
  children,
  large = false,
  noHeader = false,
  viewMode = false,
}) {
  return (
    <div className="fixed inset-0 z-[20000] bg-black/40 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className={`mx-auto w-full ${large ? "max-w-5xl" : "max-w-xl"} rounded-2xl overflow-hidden bg-white shadow-xl max-h-[90vh] flex flex-col`}
      >
      {/* Header */}
      {!noHeader && (
        <div
        className={`flex items-center justify-between px-5 py-4 rounded-t-2xl
          ${viewMode ? "bg-green-600 text-white" : "bg-white border-b text-gray-800"}`}
      >
        <h3 className="text-xl font-bold">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className={`text-xl leading-none hover:scale-110 transition
            ${viewMode ? "text-white hover:text-gray-100" : "text-gray-500 hover:text-gray-700"}`}
        >
          ×
        </button>
      </div>

      )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {onSubmit && (
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              {submitText}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

/* ---------- Shared Field Wrapper ---------- */
function Field({ label, error, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
      {error ? <p className="text-red-600 text-xs">{error}</p> : null}
    </label>
  );
}

/*  Shared Fields  */
function HealthFields({
  form,
  setForm,
  cows,
  errors = {},
  hideType,
  showNextDueDate = false,
  includeDosage = false,
}) {
  // helpers to limit typing to <= 2 dp and non-negative
  const numberOnChange = (key) => (e) => {
    const raw = e.target.value.replace(",", ".");
    if (raw === "" || (allowTwoDp(raw) && !raw.startsWith("-"))) {
      setForm({ ...form, [key]: raw });
    }
  };

  // helper: block unwanted chars
const blockInvalid = (e) => {
  if (["e", "E", "+", "-"].includes(e.key)) {
    e.preventDefault();
  }
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Cow */}
      <Field label="Cow" error={errors.cow}>
        <select
          value={form.cow}
          onChange={(e) => setForm({ ...form, cow: e.target.value })}
          className={`${SELECT} ${errors.cow ? "border-red-500" : "border-gray-300"}`}
        >
          <option value="">Select cow…</option>
          {cows.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name || "Cow"} {c.tagId ? `(${c.tagId})` : ""}
            </option>
          ))}
        </select>
      </Field>

      {/* Date */}
      <Field label="Date" error={errors.date}>
        <input
          type="date"
          max={todayISO()}
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className={`${INPUT} ${errors.date ? "border-red-500" : "border-gray-300"}`}
        />
      </Field>

      {/* Type */}
      {!hideType && (
        <Field label="Type" error={errors.type}>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={`${SELECT} ${errors.type ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="CHECKUP">CHECKUP</option>
            <option value="VACCINATION">VACCINATION</option>
            <option value="TREATMENT">TREATMENT</option>
            <option value="ILLNESS">ILLNESS</option>
            <option value="INJURY">INJURY</option>
            <option value="OTHER">OTHER</option>
          </select>
        </Field>
      )}

      {/* Temperature */}
      <Field label="Temperature (°C)" error={errors.temperatureC}>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"              // increment by 0.1
          min="0"
          max="100"               //  limit to 100
          value={form.temperatureC}
          onChange={(e) => {
            const raw = e.target.value.replace(",", ".");
            if (raw === "" || (allowTwoDp(raw) && !raw.startsWith("-"))) {
              if (Number(raw) <= 100) {
                setForm({ ...form, temperatureC: raw });
              }
            }
          }}
          onBlur={() => {
            if (form.temperatureC !== "") {
              let n = Math.min(100, Math.max(0, Number(form.temperatureC))); // clamp 0–100
              let formatted =
                Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
              setForm((f) => ({ ...f, temperatureC: formatted }));
            }
          }}
          onKeyDown={(e) => {
            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
          }}
          onWheel={(e) => e.currentTarget.blur()}
          placeholder="e.g., 38.5"
          className={`${INPUT} ${errors.temperatureC ? "border-red-500" : "border-gray-300"}`}
        />
      </Field>

      {/* Weight */}
      <Field label="Weight (kg)" error={errors.weightKg}>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          max="1000"   // clamp typing max
          value={form.weightKg}
          onChange={(e) => {
            const raw = e.target.value.replace(",", ".");
            if (raw === "" || (allowTwoDp(raw) && !raw.startsWith("-"))) {
              if (Number(raw) <= 1000) {
                setForm({ ...form, weightKg: raw });
              }
            }
          }}
          onBlur={() => {
            if (form.weightKg !== "") {
              let n = Math.min(1000, Math.max(0, Number(form.weightKg))); // clamp 0–1000
              let formatted =
                Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
              setForm((f) => ({ ...f, weightKg: formatted }));
            }
          }}
          onKeyDown={blockInvalid}
          onWheel={(e) => e.currentTarget.blur()}
          placeholder="e.g., 420.5"
          className={`${INPUT} ${errors.weightKg ? "border-red-500" : "border-gray-300"}`}
        />
      </Field>

      {/* Symptoms */}
      <Field label="Symptoms (comma separated)" className="md:col-span-2" error={errors.symptoms}>
        <input
          type="text"
          value={form.symptoms}
          onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
          onKeyDown={blockDisallowed}
          className={`${INPUT} ${errors.symptoms ? "border-red-500" : "border-gray-300"}`}
        />
      </Field>

      {/* Medication */}
      <Field label="Medication" error={errors.medication}>
        <input
          type="text"
          value={form.medication}
          onChange={(e) => setForm({ ...form, medication: e.target.value })}
          onKeyDown={blockDisallowed}
          className={`${INPUT} ${errors.medication ? "border-red-500" : "border-gray-300"}`}
        />
      </Field>

      {/* Dosage (numbers only, ml) */}
      {includeDosage && (
        <Field label="Dosage (ml)" error={errors.dosage}>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="50"   //  limit to 50 ml
            value={form.dosage}
            onChange={(e) => {
              const raw = e.target.value.replace(",", ".");
              if (raw === "" || (allowTwoDp(raw) && !raw.startsWith("-"))) {
                if (Number(raw) <= 50) {
                  setForm({ ...form, dosage: raw });
                }
              }
            }}
            onBlur={() => {
              if (form.dosage !== "") {
                let n = Math.min(50, Math.max(0, Number(form.dosage))); // clamp 0–50
                let formatted =
                  Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
                setForm((f) => ({ ...f, dosage: formatted }));
              }
            }}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
            }}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="e.g., 5.5"
            className={`${INPUT} ${errors.dosage ? "border-red-500" : "border-gray-300"}`}
          />
        </Field>
      )}

      {/* Vet */}
      <Field label="Vet" error={errors.vet}>
        <input
          type="text"
          value={form.vet}
          onChange={(e) => setForm({ ...form, vet: e.target.value })}
          onKeyDown={blockDisallowed}
          className={`${INPUT} ${errors.vet ? "border-red-500" : "border-gray-300"}`}
        />
      </Field>

      {/* Next Due Date  */}
      {showNextDueDate && (
        <Field label="Next Due Date" error={errors.nextDueDate}>
          <input
            type="date"
            min={todayISO()}
            value={form.nextDueDate || ""}
            onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
            className={`${INPUT} ${errors.nextDueDate ? "border-red-500" : "border-gray-300"}`}
          />
        </Field>
      )}

      {/* Notes */}
      <Field label="Notes" className="md:col-span-2" error={errors.notes}>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          onKeyDown={blockDisallowed}
          className={`${TEXTAREA} ${errors.notes ? "border-red-500" : "border-gray-300"}`}
        />
      </Field>
    </div>
  );
}

/*  common validation  */
function validateHealth(form, { 
  requireDosage = false,
  requireSymptoms = false,
  requireMedication = false,
  requireNextDueDate = false,
} = {}) {
  const e = {};

  // cow
  if (!form.cow) e.cow = "Please choose a cow";

  // date (not future)
  if (!form.date) e.date = "Date is required";
  else {
    const d = new Date(form.date + "T00:00:00");
    const t = new Date(); t.setHours(0, 0, 0, 0);
    if (isNaN(+d)) e.date = "Invalid date";
    else if (d > t) e.date = "Date cannot be in the future";
  }

  // symptoms
  if (requireSymptoms && !form.symptoms?.trim()) {
    e.symptoms = "Symptoms are required";
  }

  // medication
  if (requireMedication && !form.medication?.trim()) {
    e.medication = "Medication is required";
  }

  // dosage (if required)
  const checkNum = (val, key, label, required = false) => {
    const s = String(val ?? "").trim();
    if (s === "") {
      if (required) e[key] = `${label} is required`;
      return;
    }
    if (s.startsWith("-")) e[key] = `${label} cannot be negative`;
    else if (!/^\d+(\.\d{1,2})?$/.test(s)) e[key] = `${label} must have up to 2 decimals`;
  };
  if (requireDosage) checkNum(form.dosage, "dosage", "Dosage (ml)", true);

  // nextDueDate
  if (requireNextDueDate) {
    if (!form.nextDueDate) {
      e.nextDueDate = "Next due date is required";
    } else {
      const nd = new Date(form.nextDueDate + "T00:00:00");
      const t = new Date(); t.setHours(0, 0, 0, 0);
      if (isNaN(+nd)) e.nextDueDate = "Invalid date";
      else if (nd < t) e.nextDueDate = "Next due date cannot be in the past";
    }
  }

  return e;
}


/* ---------- Health Modals ---------- */
export function AddHealthModal({ open, onClose, cows, onSaved }) {
  const [form, setForm] = useState({
    cow: "",
    date: todayISO(),
    type: "CHECKUP",
    temperatureC: "",
    weightKg: "",
    symptoms: "",
    medication: "",
    dosage: "",
    vet: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, cow: cows?.[0]?._id || "", date: todayISO() }));
      setErrors({});
      setFormError("");
    }
  }, [open, cows]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    const v = validateHealth(form, { requireSymptoms: true }); 
    setErrors(v);
    if (Object.keys(v).length) return;

    const payload = {
      ...form,
      temperatureC: form.temperatureC === "" ? undefined : Number(form.temperatureC),
      weightKg: form.weightKg === "" ? undefined : Number(form.weightKg),
      symptoms: form.symptoms ? form.symptoms.split(",").map((s) => s.trim()) : [],
    };

    try {
      const { data } = await api.post("health", payload);
      onSaved?.(data);
      onClose();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Could not save record");
    }
  };

  return (
    <ModalFrame title="Add Health Record" onClose={onClose} onSubmit={submit} large>
      {formError && <div className="mb-4 text-sm text-red-600">{formError}</div>}
      <HealthFields form={form} setForm={setForm} cows={cows} errors={errors} />
    </ModalFrame>
  );
}

export function EditHealthModal({ open, onClose, cows, record, onSaved }) {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open && record) {
      setForm({
        ...record,
        cow: record.cow?._id || record.cow,
        date: liso(record.date),
        symptoms: Array.isArray(record.symptoms) ? record.symptoms.join(", ") : record.symptoms || "",
        temperatureC: record.temperatureC ?? "",
        weightKg: record.weightKg ?? "",
      });
      setErrors({});
      setFormError("");
    }
  }, [open, record]);

  if (!open || !form) return null;

  const submit = async (e) => {
    e.preventDefault();
    const v = validateHealth(form, { requireSymptoms: true }); 
    setErrors(v);
    if (Object.keys(v).length) return;

    const payload = {
      ...form,
      temperatureC: form.temperatureC === "" ? undefined : Number(form.temperatureC),
      weightKg: form.weightKg === "" ? undefined : Number(form.weightKg),
      symptoms: form.symptoms ? form.symptoms.split(",").map((s) => s.trim()) : [],
    };

    try {
      const { data } = await api.put(`health/${form._id}`, payload);
      onSaved?.(data);
      onClose();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Could not update record");
    }
  };

  return (
    <ModalFrame title="Edit Health Record" onClose={onClose} onSubmit={submit} large>
      {formError && <div className="mb-4 text-sm text-red-600">{formError}</div>}
      <HealthFields form={form} setForm={setForm} cows={cows} errors={errors} />
    </ModalFrame>
  );
}

/* ---------- Read-only rows ---------- */
function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b last:border-none">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

export function ViewHealthModal({ open, onClose, record }) {
  if (!open || !record) return null;

  return (
    <ModalFrame title="Health Details" onClose={onClose} large viewMode>
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <h4 className="text-lg font-semibold text-green-700 mb-3">General Info</h4>
            <dl className="space-y-2">
              <DetailRow label="Cow" value={record.cow?.name || "N/A"} />
              <DetailRow label="Date" value={new Date(record.date).toLocaleDateString()} />
              <DetailRow label="Type" value={record.type} />
              <DetailRow label="Vet" value={record.vet} />
            </dl>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <h4 className="text-lg font-semibold text-green-700 mb-3">Measurements</h4>
            <dl className="space-y-2">
              <DetailRow label="Temperature" value={record.temperatureC ? `${record.temperatureC}°C` : null} />
              <DetailRow label="Weight" value={record.weightKg ? `${record.weightKg} kg` : null} />
            </dl>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
          <h4 className="text-lg font-semibold text-green-700 mb-3">Health Notes</h4>
          <dl className="space-y-2">
            <DetailRow label="Symptoms" value={record.symptoms?.join(", ")} />
            <DetailRow label="Diagnosis" value={record.diagnosis} />
            <DetailRow label="Medication" value={record.medication} />
            <DetailRow label="Dosage" value={record.dosage} />
            <DetailRow label="Notes" value={record.notes} />
          </dl>
        </div>
      </div>
    </ModalFrame>
  );
}


/* ---------- Vaccination Modals ---------- */
export function AddVaccModal({ open, onClose, cows, onSaved }) {
  const [form, setForm] = useState({
    cow: "",
    date: todayISO(),          
    type: "VACCINATION",
    medication: "",
    dosage: "",
    vet: "",
    notes: "",
    nextDueDate: "",          
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, cow: cows?.[0]?._id || "", date: todayISO() }));
      setErrors({});
      setFormError("");
    }
  }, [open, cows]);

  if (!open) return null;

   const submit = async (e) => {
    e.preventDefault();
    const v = validateHealth(form, { 
      requireDosage: true,
      requireMedication: true,
      requireNextDueDate: true,
    }); 
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      const { data } = await api.post("health", {
        ...form,
        dosage: Number(form.dosage),
      });
      onSaved?.(data);
      onClose();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Could not save vaccination");
    }
  };

  return (
    <ModalFrame title="Add Vaccination" onClose={onClose} onSubmit={submit} large>
      {formError && <div className="mb-4 text-sm text-red-600">{formError}</div>}
      <HealthFields
        form={form}
        setForm={setForm}
        cows={cows}
        hideType
        showNextDueDate
        includeDosage
        errors={errors}
      />
    </ModalFrame>
  );
}

export function EditVaccModal({ open, onClose, cows, record, onSaved }) {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open && record) {
      setForm({
        ...record,
        cow: record.cow?._id || record.cow,
        date: liso(record.date),
        nextDueDate: liso(record.nextDueDate),
        dosage: record.dosage ?? "",
      });
      setErrors({});
      setFormError("");
    }
  }, [open, record]);

  if (!open || !form) return null;

   const submit = async (e) => {
    e.preventDefault();
    const v = validateHealth(form, { 
      requireDosage: true,
      requireMedication: true,
      requireNextDueDate: true,
    }); 
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      const { data } = await api.put(`health/${form._id}`, {
        ...form,
        dosage: Number(form.dosage),
      });
      onSaved?.(data);
      onClose();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Could not update vaccination");
    }
  };

  return (
    <ModalFrame title="Edit Vaccination" onClose={onClose} onSubmit={submit} large>
      {formError && <div className="mb-4 text-sm text-red-600">{formError}</div>}
      <HealthFields
        form={form}
        setForm={setForm}
        cows={cows}
        hideType
        showNextDueDate
        includeDosage
        errors={errors}
      />
    </ModalFrame>
  );
}

export function ViewVaccModal({ open, onClose, record }) {
  if (!open || !record) return null;

  return (
    <ModalFrame title="Vaccination Details" onClose={onClose} large viewMode>
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* General Info */}
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <h4 className="text-lg font-semibold text-green-700 mb-3">General Info</h4>
            <dl className="space-y-2">
              <DetailRow
                label="Cow"
                value={`${record.cow?.name || "Cow"} ${
                  record.cow?.tagId ? `(${record.cow.tagId})` : ""
                }`}
              />
              <DetailRow
                label="Date Administered"
                value={new Date(record.date).toLocaleDateString()}
              />
              <DetailRow
                label="Next Due Date"
                value={
                  record.nextDueDate
                    ? new Date(record.nextDueDate).toLocaleDateString()
                    : "N/A"
                }
              />
              <DetailRow label="Vet" value={record.vet} />
            </dl>
          </div>

          {/* Measurements */}
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <h4 className="text-lg font-semibold text-green-700 mb-3">Measurements</h4>
            <dl className="space-y-2">
              <DetailRow
                label="Temperature"
                value={record.temperatureC ? `${record.temperatureC}°C` : null}
              />
              <DetailRow
                label="Weight"
                value={record.weightKg ? `${record.weightKg} kg` : null}
              />
            </dl>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
          <h4 className="text-lg font-semibold text-green-700 mb-3">Vaccination Info</h4>
          <dl className="space-y-2">
            <DetailRow label="Medication" value={record.medication} />
            <DetailRow
              label="Dosage"
              value={record.dosage ? `${record.dosage} ml` : null}
            />
            <DetailRow label="Notes" value={record.notes || "No additional notes"} />
          </dl>
        </div>
      </div>
    </ModalFrame>
  );
}