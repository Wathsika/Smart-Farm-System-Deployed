// ✅ FINAL: frontend/src/admin/AddFieldPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api'; // keep your team's axios instance

// ---------------- Shared inline validators (no extra files) ----------------
const todayISO = () => {
  const off = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - off).toISOString().slice(0, 10);
};

const rules = {
  required: (msg = 'Required') => v =>
    v === undefined || v === null || String(v).trim() === '' ? msg : null,
  minLength: (n, msg = `Min ${n} chars`) => v =>
    String(v || '').length < n ? msg : null,
  maxLength: (n, msg = `Max ${n} chars`) => v =>
    String(v || '').length > n ? msg : null,
  number:  (msg = 'Must be a number') => v =>
    v === '' || v === null || v === undefined || isNaN(Number(v)) ? msg : null,
  gt: (n, msg = `Must be > ${n}`) => v => Number(v) > n ? null : msg,
  oneOf: (arr, msg = 'Invalid value') => v => arr.includes(v) ? null : msg,
  pattern: (re, msg = 'Invalid format') => v =>
    v == null || re.test(String(v)) ? null : msg,
  noSpaces: (msg = 'No spaces allowed') => v => /\s/.test(String(v || '')) ? msg : null,
};

// small helper to run schema (supports nested paths e.g. "area.value")
const validate = (schema, data) => {
  const read = (obj, path) => path.split('.').reduce((o, k) => (o ?? {})[k], data);
  const errors = {};
  for (const [path, fns] of Object.entries(schema)) {
    const val = read(data, path);
    for (const fn of fns) {
      const err = fn(val, data);
      if (err) { errors[path] = err; break; }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
};
// --------------------------------------------------------------------------

const AddFieldPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fieldName: '',
    fieldCode: '',
    locationDescription: '',
    area: { value: '', unit: 'acres' },
    soilType: 'Loamy',
    status: 'Available',
    irrigationSystem: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAreaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, area: { ...prev.area, [name]: value } }));
  };

  const validateForm = () => {
    const schema = {
      'fieldName': [rules.required(), rules.minLength(2), rules.maxLength(60)],
      'fieldCode': [
        rules.required(),
        rules.noSpaces(),
        rules.pattern(/^[A-Za-z0-9-]+$/, 'Use letters, numbers, hyphen only'),
        rules.maxLength(20),
      ],
      'locationDescription': [rules.required(), rules.minLength(3)],
      'area.value': [rules.required(), rules.number(), rules.gt(0)],
      'area.unit': [rules.oneOf(['acres','hectares','sqm'])],
      'soilType': [rules.oneOf(['Loamy','Clay','Sandy'])],
      'status': [rules.oneOf(['Available','Under Preparation'])],
      'irrigationSystem': [rules.maxLength(60)],
      'notes': [rules.maxLength(500)],
    };
    const { valid, errors: errs } = validate(schema, formData);
    setErrors(errs);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await api.post('/fields', formData);
      alert('Field added successfully!');
      navigate('/admin/fields');
    } catch (err) {
      const serverError = err.response?.data?.message || 'Failed to add the field.';
      setErrors({ submit: serverError });
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Add New Farm Field</h1>

      <form onSubmit={handleSubmit} noValidate className="bg-white p-8 rounded-2xl shadow-lg space-y-6 max-w-4xl mx-auto">
        {/* --- Field Name & Code --- */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label-style">Field Name</label>
            <input type="text" name="fieldName" onChange={handleChange} required className="input-style" />
            {errors['fieldName'] && <p className="error-text">{errors['fieldName']}</p>}
          </div>
          <div>
            <label className="label-style">Field Code (Unique)</label>
            <input type="text" name="fieldCode" onChange={handleChange} required className="input-style" />
            {errors['fieldCode'] && <p className="error-text">{errors['fieldCode']}</p>}
          </div>
        </div>

        <div>
          <label className="label-style">Location Description</label>
          <textarea name="locationDescription" onChange={handleChange} required className="input-style" rows="3"></textarea>
          {errors['locationDescription'] && <p className="error-text">{errors['locationDescription']}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label-style">Area Size</label>
            <input
              type="number"
              name="value"
              step="0.01"
              min="0.01"
              onChange={handleAreaChange}
              required
              className="input-style"
            />
            {errors['area.value'] && <p className="error-text">{errors['area.value']}</p>}
          </div>
          <div>
            <label className="label-style">Area Unit</label>
            <select name="unit" value={formData.area.unit} onChange={handleAreaChange} className="input-style">
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
              <option value="sqm">Square Meters (sqm)</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label-style">Soil Type</label>
            <select name="soilType" value={formData.soilType} onChange={handleChange} className="input-style">
              <option value="Loamy">Loamy</option>
              <option value="Clay">Clay</option>
              <option value="Sandy">Sandy</option>
            </select>
          </div>
          <div>
            <label className="label-style">Initial Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="input-style">
              <option value="Available">Available</option>
              <option value="Under Preparation">Under Preparation</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label-style">Irrigation System</label>
          <input type="text" name="irrigationSystem" onChange={handleChange} className="input-style"/>
          {errors['irrigationSystem'] && <p className="error-text">{errors['irrigationSystem']}</p>}
        </div>

        <div>
          <label className="label-style">Notes</label>
          <textarea name="notes" onChange={handleChange} className="input-style" rows="3"></textarea>
          {errors['notes'] && <p className="error-text">{errors['notes']}</p>}
        </div>

        <div className="pt-4 flex flex-col items-end">
          {errors.submit && <p className="error-text mb-4 w-full text-center font-semibold">{errors.submit}</p>}
          <button
            type="submit"
            disabled={hasErrors}
            className={`w-full md:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-700 ${hasErrors ? 'opacity-70 cursor-not-allowed' : ''}`}

          >
            Save New Field
          </button>
        </div>
      </form>

      <style>{`
        .label-style { display: block; margin-bottom: 0.5rem; }
        .input-style { width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
        .error-text { color: #EF4444; font-size: 0.875rem; margin-top: 0.25rem; }
      `}</style>
    </div>
  );
};

export default AddFieldPage;
