// HealthModals.jsx (Updated and Fixed Code)
import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
const pad = (n) => String(n).padStart(2, "0");
const liso = (d) => { 
  if (!d) return "";
  const dt = new Date(d); 
  dt.setHours(0,0,0,0); 
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`; 
};

/* ---------- Modal Shell ---------- */
function ModalFrame({ title, onClose, onSubmit, submitText = "Save", children }) {
  return (
    <div className="fixed inset-0 z-[20000] bg-black/40 p-4 overflow-y-auto flex items-center justify-center">
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-black text-2xl font-light leading-none">×</button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
        <div className="flex items-center justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Close</button>
          {onSubmit && <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold">{submitText}</button>}
        </div>
      </form>
    </div>
  );
}

/* ---------- Shared Fields ---------- */
// **** FIX: Added `showNextDueDate` prop ****
function HealthFields({ form, setForm, cows, hideType, showNextDueDate = false }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="flex flex-col gap-1">
        Cow
        <select value={form.cow} onChange={(e) => setForm({ ...form, cow: e.target.value })} required className="border rounded px-2 py-1">
          <option value="">--Select--</option>
          {cows.map(c => <option key={c._id} value={c._id}>{c.name || "Cow"} ({c.tagId})</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Date
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="border rounded px-2 py-1" />
      </label>
      {!hideType && (
        <label className="flex flex-col gap-1">
          Type
          <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border rounded px-2 py-1" />
        </label>
      )}
      <label className="flex flex-col gap-1">
        Temperature (°C)
        <input type="number" step="0.1" value={form.temperatureC} onChange={(e) => setForm({ ...form, temperatureC: e.target.value })} className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1">
        Weight (kg)
        <input type="number" step="0.1" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1 md:col-span-2">
        Symptoms (comma separated)
        <input type="text" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1 md:col-span-2">
        Diagnosis
        <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1">
        Medication
        <input type="text" value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1">
        Dosage
        <input type="text" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="border rounded px-2 py-1" />
      </label>
      <label className="flex flex-col gap-1">
        Vet
        <input type="text" value={form.vet} onChange={(e) => setForm({ ...form, vet: e.target.value })} className="border rounded px-2 py-1" />
      </label>
      
      {/* **** FIX: Conditionally render Next Due Date field **** */}
      {showNextDueDate && (
        <label className="flex flex-col gap-1">
          Next Due Date
          <input type="date" value={form.nextDueDate || ""} onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })} className="border rounded px-2 py-1" />
        </label>
      )}

      <label className="flex flex-col gap-1 md:col-span-2">
        Notes
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border rounded px-2 py-1" />
      </label>
    </div>
  );
}

/* ---------- Health Modals ---------- */
export function AddHealthModal({ open, onClose, cows, onSaved }) {
  const [form, setForm] = useState({ cow: "", date: liso(new Date()), type: "CHECKUP", temperatureC: "", weightKg: "", symptoms: "", diagnosis: "", medication: "", dosage: "", vet: "", notes: "" });
  useEffect(() => { if (open) setForm(f => ({ ...f, cow: cows?.[0]?._id || "" })) }, [open, cows]);
  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, temperatureC: Number(form.temperatureC) || undefined, weightKg: Number(form.weightKg) || undefined, symptoms: form.symptoms ? form.symptoms.split(",").map(s => s.trim()) : [] };
    try {
      const { data } = await api.post("health", payload);
      onSaved?.(data);
    } catch {
      alert("Save failed");
    }
  };
  return <ModalFrame title="Add Health Record" onClose={onClose} onSubmit={submit}><HealthFields form={form} setForm={setForm} cows={cows} /></ModalFrame>;
}

export function EditHealthModal({ open, onClose, cows, record, onSaved }) {
  const [form, setForm] = useState(null);
  useEffect(() => { if (open && record) { setForm({ ...record, cow: record.cow?._id || record.cow, date: liso(record.date), symptoms: Array.isArray(record.symptoms) ? record.symptoms.join(', ') : record.symptoms || "" }); } }, [open, record]);
  if (!open || !form) return null;

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, temperatureC: Number(form.temperatureC) || undefined, weightKg: Number(form.weightKg) || undefined, symptoms: form.symptoms ? form.symptoms.split(",").map(s => s.trim()) : [] };
    try {
      const { data } = await api.put(`health/${form._id}`, payload);
      onSaved?.(data);
    } catch {
      alert("Update failed");
    }
  };
  return <ModalFrame title="Edit Health Record" onClose={onClose} onSubmit={submit}><HealthFields form={form} setForm={setForm} cows={cows} /></ModalFrame>;
}

// **** IMPROVEMENT: Better UI for View Modal ****
function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="py-2 grid grid-cols-3 gap-4 border-t first:border-t-0">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 col-span-2">{value}</dd>
    </div>
  );
}

export function ViewHealthModal({ open, onClose, record }) {
  if (!open || !record) return null;
  return (
    <ModalFrame title="Health Details" onClose={onClose}>
      <dl>
        <DetailRow label="Cow" value={`${record.cow?.name || "Cow"} (${record.cow?.tagId})`} />
        <DetailRow label="Date" value={new Date(record.date).toLocaleDateString()} />
        <DetailRow label="Type" value={record.type} />
        <DetailRow label="Temperature" value={record.temperatureC ? `${record.temperatureC}°C` : null} />
        <DetailRow label="Weight" value={record.weightKg ? `${record.weightKg} kg` : null} />
        <DetailRow label="Symptoms" value={record.symptoms?.join(', ')} />
        <DetailRow label="Diagnosis" value={record.diagnosis} />
        <DetailRow label="Medication" value={record.medication} />
        <DetailRow label="Dosage" value={record.dosage} />
        <DetailRow label="Vet" value={record.vet} />
        <DetailRow label="Notes" value={record.notes} />
      </dl>
    </ModalFrame>
  );
}


/* ---------- Vaccination Modals ---------- */
export function AddVaccModal({ open, onClose, cows, onSaved }) {
  const [form, setForm] = useState({ cow: "", date: liso(new Date()), type: "VACCINATION", medication: "", dosage: "", vet: "", notes: "", nextDueDate: "" });
  useEffect(() => { if (open) setForm(f => ({ ...f, cow: cows?.[0]?._id || "" })); }, [open, cows]);
  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("health", form);
      onSaved?.(data);
    } catch {
      alert("Save failed");
    }
  };
  // **** FIX: Pass `showNextDueDate` prop ****
  return <ModalFrame title="Add Vaccination" onClose={onClose} onSubmit={submit}><HealthFields form={form} setForm={setForm} cows={cows} hideType showNextDueDate /></ModalFrame>;
}

export function EditVaccModal({ open, onClose, cows, record, onSaved }) {
  const [form, setForm] = useState(null);
  useEffect(() => { if (open && record) { setForm({ ...record, cow: record.cow?._id || record.cow, date: liso(record.date), nextDueDate: liso(record.nextDueDate) }); } }, [open, record]);
  if (!open || !form) return null;

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`health/${form._id}`, form);
      onSaved?.(data);
    } catch {
      alert("Update failed");
    }
  };
  // **** FIX: Pass `showNextDueDate` prop ****
  return <ModalFrame title="Edit Vaccination" onClose={onClose} onSubmit={submit}><HealthFields form={form} setForm={setForm} cows={cows} hideType showNextDueDate /></ModalFrame>;
}

export function ViewVaccModal({ open, onClose, record }) {
  if (!open || !record) return null;
  return (
    <ModalFrame title="Vaccination Details" onClose={onClose}>
       <dl>
        <DetailRow label="Cow" value={`${record.cow?.name || "Cow"} (${record.cow?.tagId})`} />
        <DetailRow label="Date Administered" value={new Date(record.date).toLocaleDateString()} />
        <DetailRow label="Next Due Date" value={record.nextDueDate ? new Date(record.nextDueDate).toLocaleDateString() : 'N/A'} />
        <DetailRow label="Medication" value={record.medication} />
        <DetailRow label="Dosage" value={record.dosage} />
        <DetailRow label="Vet" value={record.vet} />
        <DetailRow label="Notes" value={record.notes} />
      </dl>
    </ModalFrame>
  );
}