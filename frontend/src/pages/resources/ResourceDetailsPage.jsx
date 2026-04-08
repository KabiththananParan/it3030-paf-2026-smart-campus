import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Clock, Info, Laptop, Presentation, Briefcase, ChevronLeft, CalendarDays } from 'lucide-react';
import resourceApi from '../../api/resourceApi';

const ResourceDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        resourceApi.getResourceById(id)
            .then(res => {
                setResource(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching resource:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading Resource Details...</div>;
    if (!resource) return <div className="min-h-screen flex items-center justify-center font-bold text-red-400">Resource not found.</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
            {/* Header / Back Navigation */}
            <div style={{ backgroundColor: '#003366' }} className="py-8 px-6 text-white mb-12">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-black tracking-tight">Resource Specification</h1>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
                    {/* Decorative Top Bar */}
                    <div className="h-4 bg-[#008080]"></div>

                    <div className="p-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="flex items-center gap-5">
                                <div className="p-5 bg-slate-50 rounded-3xl text-[#003366]">
                                    {resource.type === 'LAB' ? <Laptop size={40} /> : resource.type === 'EQUIPMENT' ? <Briefcase size={40} /> : <Presentation size={40} />}
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 leading-tight">{resource.name}</h2>
                                    <span className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                        {resource.status}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Category</p>
                                <p className="text-lg font-bold text-[#008080]">{resource.type.replace('_', ' ')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campus Location</p>
                                        <p className="text-lg font-bold text-slate-700">{resource.location}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-400"><Users size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seating Capacity</p>
                                        <p className="text-lg font-bold text-slate-700">{resource.capacity} Students</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-400"><Clock size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability Window</p>
                                        <p className="text-lg font-bold text-slate-700">{resource.availability_Windows || "Standard Hours"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-400"><Info size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Status</p>
                                        <p className="text-lg font-bold text-slate-700 capitalize">{resource.status.toLowerCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-16 pt-10 border-t border-slate-50">
                            <button className="w-full flex items-center justify-center gap-4 py-5 rounded-2xl bg-[#003366] text-white font-black text-sm uppercase tracking-[0.25em] shadow-2xl hover:brightness-110 hover:-translate-y-1 transition-all duration-300">
                                <CalendarDays size={20} />
                                Confirm Reservation
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResourceDetailsPage;