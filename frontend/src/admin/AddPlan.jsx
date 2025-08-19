import { useEffect, useState } from 'react';
import { api } from '../lib/api'; // or default import

export default function AddPlan(){
  const [fertilizers, setFertilizers] = useState([]);
  const [pesticides, setPesticides]   = useState([]);
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);

  const [form, setForm] = useState({
    crop:'', field:'', product:'',
    dosage:{ amount:0, unit:'ml/L' },
    schedule:{ type:'weekly', startDate: new Date().toISOString().slice(0,10), repeatEvery:1, occurrences:4 },
    notes:''
  });

  useEffect(()=>{
    (async ()=>{
      const [fz, ps, cs, fs] = await Promise.all([
        api.get('/inputs', { params:{ category:'fertilizer' }}),
        api.get('/inputs', { params:{ category:'pesticide' }}),
        api.get('/crops'),
        api.get('/fields'),
      ]);
      setFertilizers(fz.data);
      setPesticides(ps.data);
      setCrops(cs.data);
      setFields(fs.data);
    })();
  },[]);

  const submit = async (e)=>{
    e.preventDefault();
    await api.post('/plans', form);
    alert('Plan saved');
    setForm({ crop:'', field:'', product:'', dosage:{amount:0, unit:'ml/L'}, schedule:{ type:'weekly', startDate:new Date().toISOString().slice(0,10), repeatEvery:1, occurrences:4 }, notes:'' });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Add Application Plan</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl p-4 shadow grid grid-cols-2 gap-3">
        <select className="border p-2 rounded" value={form.crop} onChange={e=>setForm({...form, crop:e.target.value})}>
          <option value="">Select Crop</option>
          {crops.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="border p-2 rounded" value={form.field} onChange={e=>setForm({...form, field:e.target.value})}>
          <option value="">Select Field</option>
          {fields.map(f=><option key={f._id} value={f._id}>{f.name}</option>)}
        </select>

        <select className="border p-2 rounded" value={form.product} onChange={e=>setForm({...form, product:e.target.value})}>
          <option value="">Select Product</option>
          <optgroup label="Fertilizers">
            {fertilizers.map(p=><option key={p._id} value={p._id}>{p.name} {p.npk?`(${p.npk})`:''}</option>)}
          </optgroup>
          <optgroup label="Pesticides">
            {pesticides.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
          </optgroup>
        </select>

        <div className="flex gap-2">
          <input className="border p-2 rounded w-1/2" type="number" placeholder="Dosage amount" value={form.dosage.amount}
                 onChange={e=>setForm({...form, dosage:{...form.dosage, amount:Number(e.target.value)}})} />
          <input className="border p-2 rounded w-1/2" placeholder="Unit (e.g. ml/L)" value={form.dosage.unit}
                 onChange={e=>setForm({...form, dosage:{...form.dosage, unit:e.target.value}})} />
        </div>

        <div className="border rounded p-3 col-span-2 grid grid-cols-4 gap-3">
          <select className="border p-2 rounded" value={form.schedule.type} onChange={e=>setForm({...form, schedule:{...form.schedule, type:e.target.value}})}>
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input className="border p-2 rounded" type="date" value={form.schedule.startDate}
                 onChange={e=>setForm({...form, schedule:{...form.schedule, startDate:e.target.value}})} />
          <input className="border p-2 rounded" type="number" min="1" value={form.schedule.repeatEvery}
                 onChange={e=>setForm({...form, schedule:{...form.schedule, repeatEvery:Number(e.target.value)}})} />
          <input className="border p-2 rounded" type="number" placeholder="Occurrences (optional)" value={form.schedule.occurrences || ''}
                 onChange={e=>setForm({...form, schedule:{...form.schedule, occurrences:e.target.value?Number(e.target.value):undefined}})} />
        </div>

        <textarea className="border p-2 rounded col-span-2" rows={3} placeholder="Notes" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}/>
        <div className="col-span-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded">Save Plan</button>
        </div>
      </form>
    </div>
  );
}
