import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import resourceApi from '../../api/resourceApi';

// Import Modular Components
import InputField from '../../components/common/InputField';
import ActionButton from '../../components/common/ActionButton';
import StatusAlert from '../../components/common/StatusAlert';
import ResourceForm from '../../components/forms/ResourceForm';

// Import Custom Hook
import { useResourceData } from '../../hooks/useResourceData';

const ManageResourcePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Custom Hook handles fetching logic, initial state, and loading state
    const { resource, loading, error, handleChange } = useResourceData(id);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleUpdate = async (e) => {
        e.preventDefault();

        // 1. Client-side Logic Validation
        if (resource.capacity < 0) {
            setMessage({ type: 'error', text: 'Validation Failed: Capacity cannot be negative.' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await resourceApi.updateResource(id, resource);
            setMessage({ type: 'success', text: 'Resource updated successfully!' });

            // Seamless navigation back to inventory
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error("Update error:", err);

            // 2. REST Status Code Handling
            if (err.response && err.response.status === 400) {
                setMessage({ type: 'error', text: 'Invalid Input: Please check your data values.' });
            } else if (err.response && err.response.status === 403) {
                setMessage({ type: 'error', text: 'Access Denied: Admin permissions required.' });
            } else {
                setMessage({ type: 'error', text: 'Server Error: Could not connect to API.' });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("CRITICAL: Are you sure you want to delete this resource?")) {
            try {
                await resourceApi.deleteResource(id);
                navigate('/');
            } catch (err) {
                setMessage({ type: 'error', text: 'Could not delete resource.' });
            }
        }
    };

    // Show specialized loader during initial data fetch
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-[#003366]" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#003366] font-bold text-sm mb-8 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to Inventory
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="bg-[#003366] p-10 text-white">
                        <h1 className="text-3xl font-black tracking-tight">Manage <span className="text-[#008080]">Resource</span></h1>
                        <p className="text-blue-100/60 text-xs font-bold uppercase tracking-widest mt-2">ID: {id}</p>
                    </div>

                    <form onSubmit={handleUpdate} className="p-10 space-y-8">
                        {/* Status Message Display */}
                        <StatusAlert message={message} />

                        {/* ResourceForm Molecule (Contains all InputField atoms) */}
                        <ResourceForm resource={resource} handleChange={handleChange}>

                            {/* Action Buttons passed as children to the form for flexible layout */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <ActionButton
                                    type="submit"
                                    disabled={saving}
                                    variant="primary"
                                    icon={saving ? Loader2 : Save}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </ActionButton>

                                <ActionButton
                                    type="button"
                                    variant="danger"
                                    onClick={handleDelete}
                                    icon={Trash2}
                                >
                                    Delete Resource
                                </ActionButton>
                            </div>

                        </ResourceForm>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageResourcePage;