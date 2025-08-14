// src/pages/employee/MyLeaveRequests.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api'; // path එක වෙනස් වුණා

// Reusable Modal Component
const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          {children}
        </div>
      </div>
    );
};

export default function MyLeaveRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formState, setFormState] = useState({
        leaveType: 'Casual', startDate: '', endDate: '', reason: ''
    });

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/leave-requests');
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch leave requests", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleFormChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leave-requests', formState);
            setShowForm(false);
            setFormState({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
            fetchRequests();
        } catch (error) {
            alert('Failed to submit leave request.');
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-md border h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">My Leave Requests</h2>
                    <button onClick={() => setShowForm(true)} className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">+</button>
                </div>
                {loading ? <p>Loading...</p> : (
                    <div className="space-y-3">
                        {requests.map(req => (
                            <div key={req._id} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>{req.status}</span>
                                </div>
                                <p className="text-xs text-gray-500">{req.reason}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Modal show={showForm} onClose={() => setShowForm(false)} title="Submit a New Leave Request">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label>Leave Type</label>
                        <select name="leaveType" value={formState.leaveType} onChange={handleFormChange} className="w-full p-2 border rounded-md">
                            <option>Casual</option><option>Sick</option><option>Annual</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Start Date</label><input type="date" name="startDate" value={formState.startDate} onChange={handleFormChange} className="w-full p-2 border rounded-md" required/></div>
                        <div><label>End Date</label><input type="date" name="endDate" value={formState.endDate} onChange={handleFormChange} className="w-full p-2 border rounded-md" required/></div>
                    </div>
                    <div>
                        <label>Reason</label>
                        <textarea name="reason" value={formState.reason} onChange={handleFormChange} rows="3" className="w-full p-2 border rounded-md" required></textarea>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">Submit Request</button>
                    </div>
                </form>
            </Modal>
        </>
    );
}