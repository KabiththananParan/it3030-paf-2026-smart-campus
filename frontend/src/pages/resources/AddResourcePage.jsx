import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Loader2 } from 'lucide-react';
import resourceApi from '../../api/resourceApi';

// Component Imports
import { useResourceData } from '../../hooks/useResourceData';
import ResourceForm from '../../components/forms/ResourceForm';
import StatusAlert from '../../components/common/StatusAlert';
import ActionButton from '../../components/common/ActionButton';

const AddResourcePage = () => {
    const navigate = useNavigate();
    const { resource, handleChange } = useResourceData();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await resourceApi.createResource(resource);
            setMessage({ type: 'success', text: 'New resource added successfully!' });
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.status === 400
                    ? 'Invalid Data: Please check all fields.'
                    : 'Server Error: Could not save resource.'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-[#003366] mb-8 font-bold">
                    <ArrowLeft size={18} /> Back to Inventory
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                    <div className="bg-[#003366] p-10 text-white">
                        <h1 className="text-3xl font-black">Add New <span className="text-[#F39200]">Resource</span></h1>
                    </div>

                    <form onSubmit={handleCreate} className="p-10 space-y-8">
                        <StatusAlert message={message} />

                        <ResourceForm resource={resource} handleChange={handleChange}>
                            <div className="pt-6">
                                <ActionButton
                                    type="submit"
                                    variant="secondary"
                                    disabled={saving}
                                    icon={saving ? Loader2 : PlusCircle}
                                >
                                    {saving ? "Creating..." : "Create Resource"}
                                </ActionButton>
                            </div>
                        </ResourceForm>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddResourcePage;