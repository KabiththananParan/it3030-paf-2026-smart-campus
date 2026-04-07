import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import resourceApi from '../../api/resourceApi';

const ManageResourcePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [resource, setResource] = useState({
        name: '',
        type: '',
        location: '',
        capacity: '',
        status: '',
        availability_Windows: ''
    });

    useEffect(() => {
        resourceApi.getResourceById(id)
            .then(res => {
                setResource(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setMessage({ type: 'error', text: 'Failed to load resource data.' });
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setResource(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await resourceApi.updateResource(id, resource);
            setMessage({ type: 'success', text: 'Resource updated successfully!' });
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: 'Update failed. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("CRITICAL: Are you sure you want to delete this resource? This action cannot be undone.")) {
            try {
                await resourceApi.deleteResource(id);
                navigate('/');
            } catch (err) {
                setMessage({ type: 'error', text: 'Could not delete resource.' });
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-[#003366]" size={40} />
        </div>
    );

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
                    {/* Page Title Section */}
                    <div className="bg-[#003366] p-10 text-white">
                        <h1 className="text-3xl font-black tracking-tight">Manage <span className="text-[#008080]">Resource</span></h1>
                        <p className="text-blue-100/60 text-xs font-bold uppercase tracking-widest mt-2">Resource ID: {id}</p>
                    </div>

                    <form onSubmit={handleUpdate} className="p-10 space-y-8">
                        {/* Status Messages */}
                        {message.text && (
                            <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
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
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 appearance-none transition-all"
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
                                    value={resource.location}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 transition-all"
                                />
                            </div>

                            {/* Capacity */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity (Seats/Qty)</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={resource.capacity}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 transition-all"
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
                                <select
                                    name="status"
                                    value={resource.status}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 appearance-none transition-all"
                                >
                                    <option value="ACTIVE">Available</option>
                                    <option value="BUSY">Busy</option>
                                    <option value="OUT_OF_SERVICE">Out of Service</option>
                                </select>
                            </div>

                            {/* Availability Windows */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability (e.g. 8AM - 5PM)</label>
                                <input
                                    name="availability_Windows"
                                    value={resource.availability_Windows}
                                    onChange={handleChange}
                                    placeholder="Always Open"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 transition-all"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#008080] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-teal-900/20 hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Save Changes
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border-2 border-rose-100 text-rose-500 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-50 transition-all"
                            >
                                <Trash2 size={18} />
                                Delete Resource
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageResourcePage;