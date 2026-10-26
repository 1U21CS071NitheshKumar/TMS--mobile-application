import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';

const MasterScreen = ({ title, endpoint, fields, relations = [] }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [relationData, setRelationData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchData();
        fetchRelations();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(endpoint);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchRelations = async () => {
        const relData = {};
        for (const rel of relations) {
            try {
                const res = await api.get(rel.endpoint);
                relData[rel.name] = res.data;
            } catch (err) {
                console.error(err);
            }
        }
        setRelationData(relData);
    };

    const handleEdit = (item) => {
        setFormData(item);
        setCurrentId(item._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.delete(`${endpoint}/${id}`);
                fetchData();
            } catch (err) {
                console.error('Delete Error:', err.response || err);
                const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error deleting record';
                alert(errorMsg);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean data before submission
            const submissionData = { ...formData };
            delete submissionData._id;
            delete submissionData.__v;
            delete submissionData.createdAt;
            delete submissionData.updatedAt;

            // Normalize populated relations: if an object has _id, just send the _id
            Object.keys(submissionData).forEach(key => {
                if (submissionData[key] && typeof submissionData[key] === 'object' && submissionData[key]._id) {
                    submissionData[key] = submissionData[key]._id;
                }
            });

            if (isEditing) {
                await api.put(`${endpoint}/${currentId}`, submissionData);
            } else {
                await api.post(endpoint, submissionData);
            }
            setShowModal(false);
            setFormData({});
            setIsEditing(false);
            setCurrentId(null);
            fetchData();
        } catch (err) {
            console.error('Submit Error:', err.response || err);

            let errorMsg = 'Error saving data';
            if (err.response?.data) {
                const data = err.response.data;
                // Handle Mongoose duplicate key error
                if (data.code === 11000) {
                    const field = Object.keys(data.keyPattern || {})[0];
                    errorMsg = `Duplicate found: This ${field} is already in use.`;
                }
                // Handle Mongoose validation errors
                else if (data.errors) {
                    errorMsg = Object.values(data.errors).map(e => e.message).join(', ');
                }
                // Handle standard error/message fields
                else {
                    errorMsg = data.error || data.message || JSON.stringify(data);
                }
            } else if (err.message) {
                errorMsg = `Network Error: ${err.message}. Is the server running?`;
            }

            alert(errorMsg);
        }
    };

    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <button
                    onClick={() => {
                        setFormData({});
                        setIsEditing(false);
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Add New
                </button>
            </div>

            <div className="glass rounded-xl overflow-hidden px-6 py-4 flex items-center gap-3">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search records..."
                    className="bg-transparent border-none outline-none w-full text-slate-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            {fields.filter(f => !f.hideInTable).map(f => (
                                <th key={f.key} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{f.label}</th>
                            ))}
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={fields.length + 1} className="p-20 text-center">
                                    <Loader2 className="animate-spin mx-auto text-primary-500 mb-2" size={32} />
                                    <p className="text-slate-500 font-medium">Loading records...</p>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={fields.length + 1} className="p-20 text-center text-slate-400">
                                    No records found.
                                </td>
                            </tr>
                        ) : filteredData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                {fields.filter(f => !f.hideInTable).map(f => (
                                    <td key={f.key} className="px-6 py-4 text-slate-700 font-medium">
                                        {f.render ? f.render(item) : item[f.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit' : 'Add'} {title}</h3>
                                <p className="text-slate-500 text-sm mt-1">Please fill in the details below.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setIsEditing(false);
                                    setFormData({});
                                }}
                                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-xl transition-all"
                            >
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {fields.filter(f => !f.readOnly).map(f => (
                                    <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 px-1">{f.label}</label>
                                        {f.type === 'select' ? (
                                            <select
                                                className="input-field h-[46px]"
                                                required
                                                onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                                            >
                                                <option value="">Select {f.label}</option>
                                                {relationData[f.relation]?.map(rel => (
                                                    <option key={rel._id} value={rel._id}>{rel.name || rel.username || rel.number}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={f.type || "text"}
                                                className="input-field h-[46px]"
                                                placeholder={`Enter ${f.label.toLowerCase()}`}
                                                required
                                                value={formData[f.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setIsEditing(false);
                                        setFormData({});
                                    }}
                                    className="px-8 py-3 hover:bg-slate-100 rounded-xl font-bold text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary px-10 py-3 rounded-xl text-lg">
                                    {isEditing ? 'Update' : 'Save'} Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterScreen;
