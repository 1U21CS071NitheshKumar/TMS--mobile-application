import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, Info, Loader2 } from 'lucide-react';

const RaiseTicket = () => {
    const [formData, setFormData] = useState({
        block: '',
        roomNumber: '',
        type: '',
        remarks: '',
        attachment: ''
    });
    const [blocks, setBlocks] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBlocks();
    }, []);

    const fetchBlocks = async () => {
        const res = await api.get('/master/blocks');
        setBlocks(res.data);
    };

    const handleBlockChange = async (blockId) => {
        setFormData({ ...formData, block: blockId, roomNumber: '' });
        const res = await api.get('/master/rooms');
        setRooms(res.data.filter(r => r.block?._id === blockId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/complaint/raise', formData);
            alert('Complaint raised successfully!');
            navigate('/tickets/list');
        } catch (err) {
            alert('Error raising complaint');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Raise a Complaint</h1>
                    <p className="text-slate-500 mt-2">Provide details about the issue you are facing.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-8 rounded-2xl space-y-6 col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Block Name</label>
                                <select
                                    className="input-field"
                                    required
                                    onChange={(e) => handleBlockChange(e.target.value)}
                                >
                                    <option value="">Select Block</option>
                                    {blocks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Room Number</label>
                                <select
                                    className="input-field"
                                    required
                                    disabled={!formData.block}
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                >
                                    <option value="">Select Room</option>
                                    {rooms.map(r => <option key={r._id} value={r._id}>{r.number}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Complaint Type</label>
                            <select
                                className="input-field"
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">Select Type</option>
                                <option value="PC Hardware">PC Hardware</option>
                                <option value="PC Software">PC Software</option>
                                <option value="Application Issues">Application Issues</option>
                                <option value="Network">Network</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Complaint Remarks</label>
                            <textarea
                                className="input-field h-32"
                                placeholder="Describe the issue in detail..."
                                required
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Attachment (Optional)</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary-400 transition-all cursor-pointer bg-slate-50/50">
                                <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                                <p className="text-sm text-slate-500 font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 flex justify-end gap-4">
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-8 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary px-12 py-3 flex items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                            Submit Complaint
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RaiseTicket;
