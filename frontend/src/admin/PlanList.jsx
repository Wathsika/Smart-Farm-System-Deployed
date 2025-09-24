// ✅ FINAL Corrected file: frontend/src/admin/PlanList.jsx
// With professional-level action button alignments and styling

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const formatScheduleDetails = (schedule) => {
  if (!schedule || !schedule.type) {
    return { title: 'Schedule not set', subtitle: null };
  }

  const repeatEvery = Math.max(1, Number(schedule.repeatEvery) || 1);
  const startDate = schedule.startDate
    ? new Date(schedule.startDate).toLocaleDateString()
    : 'No start date';

  let title = '';
  switch (schedule.type) {
    case 'once':
      title = `Once on ${startDate}`;
      break;
    case 'daily':
      title = repeatEvery === 1 ? 'Daily' : `Every ${repeatEvery} day(s)`;
      break;
    case 'weekly':
      title = repeatEvery === 1 ? 'Weekly' : `Every ${repeatEvery} week(s)`;
      break;
    case 'monthly':
      title = repeatEvery === 1 ? 'Monthly' : `Every ${repeatEvery} month(s)`;
      break;
    default:
      title = schedule.type;
  }

  const segments = [];
  if (schedule.type !== 'once') {
    segments.push(`Starts ${startDate}`);
  }
  if (typeof schedule.occurrences === 'number' && schedule.occurrences > 0) {
    segments.push(
      `${schedule.occurrences} occurrence${schedule.occurrences > 1 ? 's' : ''}`,
    );
  }

  return { title, subtitle: segments.length ? segments.join(' • ') : null };
};

const formatDosage = (dosage) => {
  if (!dosage) return '—';
  const amount = dosage.amount ?? dosage.value;
  if (amount === undefined || amount === null || amount === '') return '—';

  const numericAmount = Number(amount);
  const formattedAmount = Number.isNaN(numericAmount)
    ? amount
    : numericAmount.toString();

  return `${formattedAmount}${dosage.unit ? ` ${dosage.unit}` : ''}`;
};

const extractId = (value) => (typeof value === 'object' && value ? value._id : value);

const PlanList = () => {
  const [dueToday, setDueToday] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlans = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);

    try {
      setError(null);
      const todayIso = new Date().toISOString().split('T')[0];

      const [dueResponse, planResponse] = await Promise.all([
        api.get('/plans/due', { params: { date: todayIso } }),
        api.get('/plans'),
      ]);

      setDueToday(Array.isArray(dueResponse.data) ? dueResponse.data : []);
      setPlans(Array.isArray(planResponse.data) ? planResponse.data : []);
    } catch (err) {
      console.error('Failed to load application plans:', err);
      setError('Failed to load application plans. Please try again.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleMarkApplied = useCallback(
    async (plan) => {
      if (!plan?._id || !plan?.active) return;

      try {
        const payload = {
          plan: plan._id,
          product: extractId(plan.product),
          crop: extractId(plan.crop),
          field: extractId(plan.field),
          date: new Date().toISOString(),
          ...(plan.assignedTo ? { worker: extractId(plan.assignedTo) } : {}),
        };

        const amount = plan.dosage?.amount ?? plan.dosage?.value;
        if (amount && plan.dosage?.unit) {
          const numericAmount = Number(amount);
          if (!Number.isNaN(numericAmount)) {
            payload.quantityUsed = { amount: numericAmount, unit: plan.dosage.unit };
          }
        }

        if (plan.notes) payload.notes = plan.notes;

        await api.post('/applications', payload);
        await loadPlans(false);
        window.alert('Application recorded successfully.');
      } catch (err) {
        console.error('Failed to mark plan as applied:', err);
        window.alert(
          err.response?.data?.message ||
            'Failed to record application. Please try again.',
        );
      }
    },
    [loadPlans],
  );

  const handleTogglePlan = useCallback(
    async (planId) => {
      try {
        await api.patch(`/plans/${planId}/toggle`);
        await loadPlans(false);
      } catch (err) {
        console.error('Failed to toggle plan status:', err);
        window.alert(err.response?.data?.message || 'Failed to update plan status.');
      }
    },
    [loadPlans],
  );

  const handleDeletePlan = useCallback(
    async (planId) => {
      const confirmed = window.confirm(
        'Delete this plan? This action cannot be undone.',
      );
      if (!confirmed) return;

      try {
        await api.delete(`/plans/${planId}`);
        await loadPlans(false);
        window.alert('Plan deleted successfully.');
      } catch (err) {
        console.error('Failed to delete plan:', err);
        window.alert(err.response?.data?.message || 'Failed to delete plan.');
      }
    },
    [loadPlans],
  );

  const renderActions = (plan, { compact = false } = {}) => {
    const containerClass = compact
      ? 'flex items-center gap-1 justify-end min-w-0'
      : 'flex items-center gap-2 justify-end';

    const buttonBaseClass = compact
      ? 'inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'
      : 'inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap min-w-[68px] disabled:opacity-50 disabled:cursor-not-allowed';

    const planId = plan?._id ?? plan?.id ?? null;
    const fieldId = extractId(plan?.field);
    const editDisabled = !fieldId;
    const editDestination = fieldId
      ? `/admin/fields/edit/${fieldId}` // ✅ Fixed: navigate to EditField.jsx
      : '/admin/crop/plans';

    const editButtonClass = `${buttonBaseClass} text-slate-700 bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-200${
      editDisabled ? ' opacity-50 cursor-not-allowed pointer-events-none' : ''
    }`;

    const editButtonContent = compact ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ) : (
      'Edit'
    );

    return (
      <div className={containerClass}>
        {editDisabled ? (
          <span
            className={editButtonClass}
            role="button"
            aria-disabled="true"
            title="Cannot edit field because this plan does not have an associated field."
          >
            {editButtonContent}
          </span>
        ) : (
          <Link to={editDestination} className={editButtonClass}>
            {editButtonContent}
          </Link>
        )}
        <button
          type="button"
          onClick={() => handleMarkApplied(plan)}
          disabled={!plan.active}
          className={`${buttonBaseClass} ${
            plan.active
              ? 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 focus:ring-emerald-200'
              : 'text-emerald-400 bg-emerald-25 border-emerald-200 cursor-not-allowed opacity-50'
          }`}
        >
          {compact ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            'Apply'
          )}
        </button>
        
        <button
          type="button"
          onClick={() => planId && handleTogglePlan(planId)}
          disabled={!planId}
          className={`${buttonBaseClass} text-amber-700 bg-amber-50 border-amber-300 hover:bg-amber-100 hover:border-amber-400 focus:ring-amber-200`}
        >
          {compact ? (
            plan.active ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )
          ) : (
            plan.active ? 'Disable' : 'Enable'
          )}
        </button>
        
        <button
          type="button"
          onClick={() => planId && handleDeletePlan(planId)}
          disabled={!planId}
          className={`${buttonBaseClass} text-rose-700 bg-rose-50 border-rose-300 hover:bg-rose-100 hover:border-rose-400 focus:ring-rose-200`}
        >
          {compact ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            'Delete'
          )}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-6 border border-slate-200 flex items-center space-x-4">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-slate-200 border-t-emerald-500" />
          <span className="text-slate-700 font-medium">Loading plans…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-6 border border-rose-200 max-w-md text-center space-y-4">
          <h2 className="text-xl font-semibold text-rose-600">Unable to load plans</h2>
          <p className="text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => loadPlans()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeCount = plans.filter((plan) => plan.active).length;
  const inactiveCount = plans.length - activeCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Application Plans</h1>
            <p className="text-slate-600 mt-2">
              Track scheduled fertilizer and pesticide applications across all fields.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadPlans(false)}
              className="inline-flex items-center px-5 py-3 border border-transparent rounded-xl bg-white text-slate-700 font-semibold shadow-sm hover:shadow-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 104.582 9" />
              </svg>
              Refresh
            </button>
            <Link
              to="/admin/crop/plan/new"
              className="inline-flex items-center px-5 py-3 border border-transparent rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Plan
            </Link>
          </div>
        </header>

        {/* Summary cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Total Plans</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{plans.length}</p>
            <p className="text-xs text-slate-500 mt-2">
              {activeCount} active • {inactiveCount} inactive
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Due Today</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{dueToday.length}</p>
            <p className="text-xs text-slate-500 mt-2">
              Plans scheduled for {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Next Actions</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{activeCount}</p>
            <p className="text-xs text-slate-500 mt-2">Active plans ready to be applied</p>
          </div>
        </section>

        {/* Due Today */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Due Today</h2>
              <p className="text-sm text-slate-500">Plans that are scheduled to be applied today.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
              {dueToday.length} due
            </span>
          </div>

          {dueToday.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500">
              No applications due today.
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {dueToday.map((plan) => {
                const cropName = plan.crop?.cropName || plan.crop?.name || 'Unknown crop';
                const fieldName = plan.field?.fieldName || plan.field?.name || 'Unknown field';
                const fieldCode = plan.field?.fieldCode;
                const productName = plan.product?.name || 'Unknown input';
                const dosage = formatDosage(plan.dosage);
                const { title, subtitle } = formatScheduleDetails(plan.schedule);

                return (
                  <li
                    key={plan._id}
                    className="px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                  >
                    <div className="lg:flex-shrink-0">
                      <p className="text-lg font-semibold text-slate-900">{cropName}</p>
                      <p className="text-sm text-slate-500">
                        {fieldName}
                        {fieldCode ? ` • ${fieldCode}` : ''}
                      </p>
                    </div>
                    <div className="lg:flex-1 lg:px-6 space-y-1">
                      <p className="text-sm font-medium text-slate-700">
                        {productName}
                        {dosage !== '—' ? ` • ${dosage}` : ''}
                      </p>
                      <p className="text-sm text-slate-500">{title}</p>
                      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                    </div>
                    <div className="lg:flex-shrink-0 lg:w-auto min-w-0">
                      {renderActions(plan, { compact: true })}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* All Plans */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">All Plans</h2>
              <p className="text-sm text-slate-500">
                Review every application plan and manage their schedules.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold">
              {plans.length} total
            </span>
          </div>

          {plans.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500">
              No plans created yet. Create one to start scheduling field applications.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th scope="col" className="px-6 py-3">Crop & Field</th>
                    <th scope="col" className="px-6 py-3">Input</th>
                    <th scope="col" className="px-6 py-3">Schedule</th>
                    <th scope="col" className="px-6 py-3">Dosage</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3 text-right w-80">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {plans.map((plan) => {
                    const cropName = plan.crop?.cropName || plan.crop?.name || 'Unknown crop';
                    const fieldName = plan.field?.fieldName || plan.field?.name || 'Unknown field';
                    const fieldCode = plan.field?.fieldCode;
                    const productName = plan.product?.name || 'Unknown input';
                    const productCategory = plan.product?.category
                      ? plan.product.category.charAt(0).toUpperCase() +
                        plan.product.category.slice(1)
                      : null;
                    const dosage = formatDosage(plan.dosage);
                    const { title, subtitle } = formatScheduleDetails(plan.schedule);

                    return (
                      <tr key={plan._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 align-top">
                          <div className="font-semibold text-slate-900">{cropName}</div>
                          <div className="text-sm text-slate-500">
                            {fieldName}
                            {fieldCode ? ` • ${fieldCode}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="font-medium text-slate-800">{productName}</div>
                          {productCategory && (
                            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                              {productCategory}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="text-sm font-medium text-slate-700">{title}</div>
                          {subtitle && (
                            <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-slate-700">{dosage}</td>
                        <td className="px-6 py-4 align-top">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              plan.active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {plan.active ? 'Active' : 'Inactive'}
                          </span>
                          {plan.assignedTo?.name && (
                            <div className="text-xs text-slate-500 mt-2">
                              Assigned to {plan.assignedTo.name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top">
                          {renderActions(plan)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PlanList;
