import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    MoreHorizontal,
    ExternalLink,
    RefreshCw,
    UserPlus
} from 'lucide-react';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchTickets();
        if (user?.role?.name === 'SuperAdmin') {
            fetchStaff();
        }
    }, [user]);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/complaint/list');
            setTickets(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchStaff = async () => {
        try {
            const res = await api.get('/master/users');
            // Filter for non-User role users (Staff/Technician)
            // Note: This logic depends on how roles are structured in your DB
            // Assuming we want anyone who isn't a regular 'User'
            setStaff(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            await api.patch(`/complaint/status/${ticketId}`, { status: newStatus });
            fetchTickets();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error updating status');
        }
    };

    const handleAssignment = async (ticketId, userId) => {
        try {
            await api.patch(`/complaint/assign/${ticketId}`, { assignedTo: userId });
            fetchTickets();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error assigning ticket');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Assigned': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'In-Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'OnHold': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const canUpdateStatus = (ticket) => {
        if (!user) return false;
        if (user.role?.name === 'SuperAdmin') return true;
        return ticket.assignedTo?._id === user._id;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Complaints List</h1>
                <button
                    onClick={fetchTickets}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 flex items-center gap-2 font-medium"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-20 text-center glass rounded-2xl">
                        <div className="animate-spin text-primary-500 mx-auto w-10 h-10 border-4 border-t-transparent border-current rounded-full mb-4"></div>
                        <p className="text-slate-500">Loading complaints...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="p-20 text-center glass rounded-2xl">
                        <AlertCircle className="mx-auto text-slate-200 mb-4" size={64} />
                        <p className="text-slate-500 font-medium">No complaints found.</p>
                    </div>
                ) : tickets.map((ticket) => (
                    <div key={ticket._id} className="glass p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 border-l-4 border-l-primary-500">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                    <span className="text-slate-400 text-xs font-medium">
                                        ID: {ticket._id.slice(-6).toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mt-3">{ticket.type}</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString()}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                {canUpdateStatus(ticket) && (
                                    <div className="flex flex-col gap-1.5 flex-1 md:flex-none min-w-[140px]">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Update Status</label>
                                        <select
                                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer shadow-sm"
                                            value={ticket.status}
                                            onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In-Progress">In-Progress</option>
                                            <option value="OnHold">On-Hold</option>
                                            <option value="Completed">Completed</option>
                                            {user.role?.name === 'SuperAdmin' && <option value="Closed">Closed</option>}
                                        </select>
                                    </div>
                                )}

                                {user?.role?.name === 'SuperAdmin' && (
                                    <div className="flex flex-col gap-1.5 flex-1 md:flex-none min-w-[200px]">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assign To</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-white border border-slate-200 rounded-xl px-10 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer shadow-sm appearance-none"
                                                value={ticket.assignedTo?._id || ''}
                                                onChange={(e) => handleAssignment(ticket._id, e.target.value)}
                                            >
                                                <option value="">Unassigned</option>
                                                {staff.map(s => (
                                                    <option key={s._id} value={s._id}>{s.username} ({s.role?.name})</option>
                                                ))}
                                            </select>
                                            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-100 relative group">
                            <p className="text-slate-700 leading-relaxed italic">"{ticket.remarks}"</p>
                            {ticket.attachment && (
                                <a
                                    href={`${api.defaults.baseURL}/uploads/${ticket.attachment}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
                                >
                                    <ExternalLink size={14} /> View Attachment
                                </a>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary-50 p-2.5 rounded-xl text-primary-600 border border-primary-100 shadow-sm">
                                    <User size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Raised By</p>
                                    <p className="font-bold text-slate-700 truncate">{ticket.raisedBy?.username}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 border border-indigo-100 shadow-sm">
                                    <span className="font-bold text-sm">#</span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
                                    <p className="font-bold text-slate-700 truncate">{ticket.block?.name} - {ticket.roomNumber?.number}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl border shadow-sm ${ticket.assignedTo ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                    <CheckCircle2 size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assignee</p>
                                    <p className={`font-bold truncate ${ticket.assignedTo ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                        {ticket.assignedTo?.username || 'Not Assigned'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TicketList;
