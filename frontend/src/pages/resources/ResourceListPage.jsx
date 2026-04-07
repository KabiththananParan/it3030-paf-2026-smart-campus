import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Users, Building2, Laptop, Presentation, XCircle, Briefcase, ChevronRight, X, Clock, Info, Settings, CalendarDays } from 'lucide-react';
import resourceApi from '../../api/resourceApi';

const ResourceListPage = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState(null);

    // MOCK AUTH: Change this to 'USER' to see the student view
    const [userRole, setUserRole] = useState('ADMIN');

    const [filters, setFilters] = useState({
        name: '', type: '', location: '', minCapacity: '', status: ''
    });

    useEffect(() => {
        resourceApi.getAllResources()
            .then(res => setResources(res.data))
            .catch(err => console.error("Backend connection failed:", err));
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ name: '', type: '', location: '', minCapacity: '', status: '' });
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'LAB': return 'bg-blue-50/70 border-blue-200 text-blue-700 border-t-4 border-t-blue-500';
            case 'EQUIPMENT': return 'bg-orange-50/70 border-orange-200 text-orange-700 border-t-4 border-t-orange-500';
            case 'LECTURE_HALL': return 'bg-emerald-50/70 border-emerald-200 text-emerald-700 border-t-4 border-t-emerald-500';
            case 'MEETING_ROOM': return 'bg-violet-50/70 border-violet-200 text-violet-700 border-t-4 border-t-violet-500';
            default: return 'bg-slate-50 border-slate-200 text-slate-700 border-t-4 border-t-slate-400';
        }
    };

    const filteredResources = resources.filter(item => {
        return (
            item.name.toLowerCase().includes(filters.name.toLowerCase()) &&
            item.type.toLowerCase().includes(filters.type.toLowerCase()) &&
            item.location.toLowerCase().includes(filters.location.toLowerCase()) &&
            item.status.toLowerCase().includes(filters.status.toLowerCase()) &&
            (filters.minCapacity === '' || item.capacity >= parseInt(filters.minCapacity))
        );
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans relative">

            {/* --- ROLE SWITCHER (DEV ONLY) --- */}
            <div className="fixed bottom-6 right-6 z-[100] bg-white shadow-2xl border border-slate-200 p-2 rounded-2xl flex gap-2">
                <button
                    onClick={() => setUserRole('ADMIN')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${userRole === 'ADMIN' ? 'bg-[#003366] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                    ADMIN VIEW
                </button>
                <button
                    onClick={() => setUserRole('USER')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${userRole === 'USER' ? 'bg-[#003366] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                    STUDENT VIEW
                </button>
            </div>

            {/* HEADER */}
            <header style={{ backgroundColor: '#003366' }} className="relative text-white py-14 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-1">EduTrack <span className="text-[#008080]">Inventory</span></h1>
                        <p className="text-blue-100/70 text-sm font-medium tracking-wide">SLIIT RESOURCE MANAGEMENT SYSTEM</p>
                    </div>

                    {/* Only Admins can see "Add Resource" */}
                    {userRole === 'ADMIN' && (
                        <button
                            onClick={() => navigate('/admin/resource/add')}
                            style={{ backgroundColor: '#F39200' }}
                            className="flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:brightness-110 transition-all text-sm"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Add New Resource
                        </button>
                    )}
                </div>
            </header>

            {/* FILTER RIBBON */}
            <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    {[
                        { label: 'Name', name: 'name', type: 'text', placeholder: 'Search...', icon: Search },
                        { label: 'Category', name: 'type', type: 'select', options: ['LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'EQUIPMENT'] },
                        { label: 'Status', name: 'status', type: 'select', options: ['ACTIVE', 'BUSY', 'OUT_OF_SERVICE'] },
                        { label: 'Location', name: 'location', type: 'text', placeholder: 'Block...', icon: Building2 },
                        { label: 'Min Capacity', name: 'minCapacity', type: 'number', placeholder: 'Qty', icon: Users }
                    ].map((f) => (
                        <div key={f.name} className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                            <div className="relative">
                                {f.icon && <f.icon className="absolute left-3 top-2.5 text-slate-400" size={14} />}
                                {f.type === 'select' ? (
                                    <select name={f.name} value={filters[f.name]} onChange={handleFilterChange} className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#008080] outline-none font-semibold text-slate-700 text-xs appearance-none">
                                        <option value="">All</option>
                                        {f.options.map(opt => (
                                            <option key={opt} value={opt}>{opt === 'ACTIVE' ? 'Available' : opt.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input type={f.type} name={f.name} value={filters[f.name]} onChange={handleFilterChange} placeholder={f.placeholder} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#008080] outline-none text-xs font-semibold" />
                                )}
                            </div>
                        </div>
                    ))}
                    <button onClick={clearFilters} className="text-slate-400 hover:text-red-500 font-bold text-xs pb-2 transition-colors">Reset</button>
                </div>
            </div>

            {/* CARDS GRID */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredResources.map((item) => (
                        <div key={item.id} className={`group ${getTypeStyles(item.type)} border rounded-[2rem] p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-full`}>
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-white/80 rounded-xl shadow-sm text-slate-700">
                                        {item.type === 'LAB' ? <Laptop size={22} /> : item.type === 'EQUIPMENT' ? <Briefcase size={22} /> : <Presentation size={22} />}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border bg-white ${item.status === 'ACTIVE' ? 'border-emerald-200 text-emerald-600' : item.status === 'BUSY' ? 'border-amber-200 text-amber-600' : 'border-rose-200 text-rose-600'}`}>
                                        {item.status === 'ACTIVE' ? 'Available' : item.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{item.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-6">{item.type.replace('_', ' ')}</p>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs bg-white/40 p-2 rounded-lg inline-flex mr-2">
                                        <MapPin size={14} className="text-[#008080]" /> {item.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs bg-white/40 p-2 rounded-lg inline-flex">
                                        <Users size={14} className="text-[#F39200]" /> {item.capacity}
                                    </div>
                                </div>
                            </div>

                            {/* --- UPDATED BUTTON LAYOUT --- */}
                            {/* Flex container groups buttons side-by-side with equal weight */}
                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">

                                {/* ADMIN ONLY: Manage Button */}
                                {userRole === 'ADMIN' && (
                                    <button
                                        onClick={() => navigate(`/admin/resource/manage/${item.id}`)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#008080] text-white shadow-md hover:shadow-teal-900/20 hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <Settings size={15} />
                                        <span className="font-bold text-[10px] uppercase tracking-widest">Manage</span>
                                    </button>
                                )}

                                {/* VIEW DETAILS (Visible to all) */}
                                <button
                                    onClick={() => setSelectedResource(item)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <Info size={15} />
                                    <span className="font-bold text-[10px] uppercase tracking-widest">Details</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* --- DETAILS MODAL --- */}
            {selectedResource && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedResource(null)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className={`h-3 w-full ${getTypeStyles(selectedResource.type).split(' ')[3]}`}></div>
                        <button onClick={() => setSelectedResource(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <X size={20} />
                        </button>

                        <div className="p-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-slate-50 rounded-2xl text-slate-700">
                                    {selectedResource.type === 'LAB' ? <Laptop size={24} /> : <Presentation size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedResource.name}</h2>
                                    <p className="text-xs font-bold text-[#008080] uppercase tracking-widest">{selectedResource.type.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <hr className="border-slate-100 my-6" />
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                    <p className="font-bold text-slate-700 flex items-center gap-2"><MapPin size={16} className="text-slate-300" /> {selectedResource.location}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Capacity</p>
                                    <p className="font-bold text-slate-700 flex items-center gap-2"><Users size={16} className="text-slate-300" /> {selectedResource.capacity} Seats</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                    <p className="font-bold text-slate-700 flex items-center gap-2 capitalize"><Info size={16} className="text-slate-300" /> {selectedResource.status.toLowerCase()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</p>
                                    <p className="font-bold text-slate-700 flex items-center gap-2"><Clock size={16} className="text-slate-300" /> {selectedResource.availability_Windows || "Always Open"}</p>
                                </div>
                            </div>

                            {/* --- UPDATED MODAL BUTTON --- */}
                            {/* Both Admin and Student see only "Reserve" here */}
                            <div className="mt-10 pt-6 border-t border-slate-50">
                                <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#003366] text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all duration-300">
                                    <CalendarDays size={16} />
                                    Reserve this Resource
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceListPage;