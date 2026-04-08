import React from 'react';
import InputField from '../common/InputField';

const ResourceForm = ({ resource, handleChange, children }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Resource Name"
                    name="name"
                    value={resource.name}
                    onChange={handleChange}
                    placeholder="e.g. Computing Lab 01"
                    required
                />

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

                <InputField
                    label="Location (Block/Floor)"
                    name="location"
                    value={resource.location}
                    onChange={handleChange}
                    placeholder="e.g. Block D, Level 3"
                    required
                />

                <InputField
                    label="Total Capacity"
                    name="capacity"
                    type="number"
                    value={resource.capacity}
                    onChange={handleChange}
                    placeholder="Number of units"
                    required
                />

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

                <InputField
                    label="Operating Hours"
                    name="availability_Windows"
                    value={resource.availability_Windows}
                    onChange={handleChange}
                    placeholder="e.g. 08:30 AM - 05:30 PM"
                />
            </div>
            {children}
        </div>
    );
};

export default ResourceForm;