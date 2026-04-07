import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import resourceApi from '../../api/resourceApi';

const AddResourcePage = () => {
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [resource, setResource] = useState({
        name: '',
        type: 'LAB', // Default value
        location: '',
        capacity: '',
        status: 'ACTIVE', // Default value
        availability_Windows: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setResource(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await resourceApi.createResource(resource);
            setMessage({ type: 'success', text: 'New resource added to EduTrack!' });
            // Redirect to inventory after a short delay
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error("Create error:", err);
            setMessage({ type: 'error', text: 'Failed to add resource. Check backend connection.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* Navigation Header */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#003366] font-bold text-sm mb-8 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to Inventory
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                    {/* Header Section */}
                    <div style={{ backgroundColor: '#003366' }} className="p-10 text-white">
                        <h1 className="text-3xl font-black tracking-tight">Add New <span className="text-[#F39200]">Resource</span></h1>
                        <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest mt-2">Registration Form</p>
                    </div>

                    <form onSubmit={handleCreate} className="p-10 space-y-8">
                        {/* Status Messages */}
                        {message.text && (
                            <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Resource Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Name</label>
                                <input
                                    name="name"
                                    placeholder="e.g. Computing Lab 01"
                                    value={resource.name}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 transition-all"
                                    required
                                />
                            </div>

                            {/* Resource Type */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select
                                    name="type"
                                    value={resource.type}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 appearance-none transition-all cursor-pointer"
                                >
                                    <option value="LAB">Laboratory</option>
                                    <option value="LECTURE_HALL">Lecture Hall</option>
                                    <option value="MEETING_ROOM">Meeting Room</option>
                                    <option value="EQUIPMENT">Equipment</option>
                                </select>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location (Block/Floor)</label>
                                <input
                                    name="location"
                                    placeholder="e.g. Block D, Level 3"
                                    value={resource.location}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 transition-all"
                                    required
                                />
                            </div>

                            {/* Capacity */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Capacity</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    placeholder="Number of seats or units"
                                    value={resource.capacity}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 transition-all"
                                    required
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Status</label>
                                <select
                                    name="status"
                                    value={resource.status}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 appearance-none transition-all cursor-pointer"
                                >
                                    <option value="ACTIVE">Available</option>
                                    <option value="BUSY">Busy</option>
                                    <option value="OUT_OF_SERVICE">Out of Service</option>
                                </select>
                            </div>

                            {/* Availability Windows */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operating Hours</label>
                                <input
                                    name="availability_Windows"
                                    placeholder="e.g. 08:30 AM - 05:30 PM"
                                    value={resource.availability_Windows}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                style={{ backgroundColor: '#F39200' }}
                                className="w-full flex items-center justify-center gap-2 py-4 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
                                Create Resource
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddResourcePage;