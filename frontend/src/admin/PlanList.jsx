import { useEffect, useState } from 'react';
import { api } from '../lib/api'; // or default import

export default function PlanList(){
  const [plans, setPlans] = useState([]);
  const [due, setDue] = useState([]);

  const load = async ()=>{
    const today = new Date().toISOString().slice(0,10);
    const [all, dueList] = await Promise.all([
      api.get('/plans', { params:{ active:true }}),
      api.get('/plans/due', { params:{ date: today }})
    ]);
    setPlans(all.data);
    setDue(dueList.data);
  };
  useEffect(()=>{ load(); },[]);

  const markApplied = async (p)=>{
    const amountStr = prompt('Quantity used (number)?', '0');
    if (amountStr === null) return;
    const amount = Number(amountStr) || 0;
    await api.post('/applications', {
      plan: p._id, crop: p.crop._id, field: p.field._id, product: p.product._id,
      quantityUsed: { amount, unit: p.product.unit || 'ml' },
      remarks: 'Recorded from Plan list'
    });
    alert('Recorded');
    load();
  };

  const toggle = async (id)=>{
    await api.patch(`/plans/${id}/toggle`);
    load();
  };

  const remove = async (id)=>{
    if(!confirm('Delete this plan?')) return;
    await api.delete(`/plans/${id}`);
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Application Plans</h1>

      <div className="bg-white rounded-2xl p-4 shadow mb-6">
        <div className="font-semibold mb-2">Due Today</div>
        <ul className="space-y-2">
          {due.map(p=>(
            <li key={p._id} className="flex justify-between border rounded p-2">
              <span>{p.crop?.name} → {p.field?.name} • {p.product?.name} • {p.dosage?.amount} {p.dosage?.unit}</span>
              <div className="space-x-3">
                <button className="text-green-700" onClick={()=>markApplied(p)}>Mark Applied</button>
                <button className="text-gray-600" onClick={()=>toggle(p._id)}>{p.active?'Disable':'Enable'}</button>
                <button className="text-red-600" onClick={()=>remove(p._id)}>Delete</button>
              </div>
            </li>
          ))}
          {!due.length && <div className="text-gray-400">Nothing due today</div>}
        </ul>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="font-semibold mb-2">All Active Plans</div>
        <table className="w-full">
          <thead><tr className="text-left text-gray-500">
            <th className="py-2">Crop/Field</th><th>Product</th><th>Schedule</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {plans.map(p=>(
              <tr key={p._id} className="border-t">
                <td className="py-2">{p.crop?.name} • {p.field?.name}</td>
                <td>{p.product?.name}</td>
                <td>
                  {p.schedule.type} every {p.schedule.repeatEvery}{' '}
                  {p.schedule.type==='weekly'?'week(s)':p.schedule.type==='daily'?'day(s)':p.schedule.type==='monthly'?'month(s)':''}
                  {' '}from {new Date(p.schedule.startDate).toLocaleDateString()}
                </td>
                <td className="space-x-3">
                  <button className="text-green-700" onClick={()=>markApplied(p)}>Mark Applied</button>
                  <button className="text-gray-600" onClick={()=>toggle(p._id)}>{p.active?'Disable':'Enable'}</button>
                  <button className="text-red-600" onClick={()=>remove(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!plans.length && <tr><td colSpan={4} className="text-center py-6 text-gray-400">No plans</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
