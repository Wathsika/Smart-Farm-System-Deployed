import { useEffect, useState } from 'react';
import { api } from '../lib/api'; // or: import api from '../lib/api';

export default function InputsPage(){
  const [tab, setTab] = useState('fertilizer');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    _id: undefined,
    name: '', npk: '', activeIngredient: '',
    dilutionRate: '', method: 'spray',
    stockQty: 0
  });

  const load = async ()=>{
    const { data } = await api.get('/inputs', { params: { category: tab }});
    setItems(data);
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [tab]);

  const submit = async (e)=>{
    e.preventDefault();
    if (form._id) {
      await api.put(`/inputs/${form._id}`, { ...form, category: tab });
    } else {
      await api.post('/inputs', { ...form, category: tab });
    }
    setForm({ _id: undefined, name:'', npk:'', activeIngredient:'', dilutionRate:'', method:'spray', stockQty:0 });
    load();
  };

  const edit = (it)=> setForm({
    _id: it._id, name: it.name, npk: it.npk || '', activeIngredient: it.activeIngredient || '',
    dilutionRate: it.dilutionRate || '', method: it.method || 'spray', stockQty: it.stockQty || 0
  });

  const removeIt = async (id)=>{
    if (!confirm('Delete this item?')) return;
    await api.delete(`/inputs/${id}`);
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Inputs</h1>

      <div className="flex gap-2 mb-4">
        <button className={`px-3 py-1 rounded ${tab==='fertilizer'?'bg-green-600 text-white':'bg-gray-200'}`} onClick={()=>setTab('fertilizer')}>Fertilizers</button>
        <button className={`px-3 py-1 rounded ${tab==='pesticide'?'bg-green-600 text-white':'bg-gray-200'}`} onClick={()=>setTab('pesticide')}>Pesticides</button>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl p-4 shadow mb-6 grid grid-cols-2 gap-3">
        <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <select className="border p-2 rounded" value={form.method} onChange={e=>setForm({...form, method:e.target.value})}>
          <option value="soil">Soil</option><option value="foliar">Foliar</option><option value="drip">Drip</option><option value="spray">Spray</option><option value="seed">Seed</option>
        </select>
        {tab==='fertilizer' && (
          <input className="border p-2 rounded" placeholder="NPK (e.g. 10-26-26)" value={form.npk} onChange={e=>setForm({...form, npk:e.target.value})}/>
        )}
        {tab==='pesticide' && (
          <input className="border p-2 rounded" placeholder="Active ingredient" value={form.activeIngredient} onChange={e=>setForm({...form, activeIngredient:e.target.value})}/>
        )}
        <input className="border p-2 rounded" placeholder="Dilution rate (e.g. 2 ml/L)" value={form.dilutionRate} onChange={e=>setForm({...form, dilutionRate:e.target.value})}/>
        <input className="border p-2 rounded" type="number" placeholder="Stock Qty" value={form.stockQty} onChange={e=>setForm({...form, stockQty:Number(e.target.value)})}/>
        <div className="col-span-2 flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded">{form._id?'Update':'Add'}</button>
          {form._id && <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={()=>setForm({ _id:undefined, name:'', npk:'', activeIngredient:'', dilutionRate:'', method:'spray', stockQty:0 })}>Clear</button>}
        </div>
      </form>

      <div className="bg-white rounded-2xl p-4 shadow">
        <table className="w-full">
          <thead><tr className="text-left text-gray-500"><th className="py-2">Name</th><th>Info</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
          {items.map(it=>(
            <tr key={it._id} className="border-t">
              <td className="py-2 font-medium">{it.name}</td>
              <td>{tab==='fertilizer'? it.npk : it.activeIngredient} · {it.dilutionRate} · {it.method}</td>
              <td>{it.stockQty}</td>
              <td className="space-x-3">
                <button className="text-blue-600" onClick={()=>edit(it)}>Edit</button>
                <button className="text-red-600" onClick={()=>removeIt(it._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={4} className="text-center py-6 text-gray-400">No items</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
