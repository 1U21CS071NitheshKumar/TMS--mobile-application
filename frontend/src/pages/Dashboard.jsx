import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import {
    Activity,
    Clock,
    CheckCircle2,
    XCircle,
    ClipboardList,
    ChevronRight,
    MapPin
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0, pending: 0, assigned: 0, completed: 0, closed: 0
    });
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, ticketsRes] = await Promise.all([
                    api.get('/complaint/dashboard'),
                    api.get('/complaint/list')
                ]);
                setStats(statsRes.data);
                setRecentTickets(ticketsRes.data.slice(0, 5));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700';
            case 'In-Progress': return 'bg-blue-100 text-blue-700';
            case 'Completed': return 'bg-emerald-100 text-emerald-700';
            case 'Closed': return 'bg-slate-100 text-slate-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const cards = [
        { title: 'Total Complaints', value: stats.total, icon: Activity, color: 'bg-blue-500' },
        { title: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
        { title: 'Assigned', value: stats.assigned, icon: ClipboardList, color: 'bg-indigo-500' },
        { title: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'bg-emerald-500' },
        { title: 'Closed', value: stats.closed, icon: XCircle, color: 'bg-slate-500' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.username}!</h1>
                <p className="text-slate-500 mt-2">Here's what's happening in your department today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {cards.map((card) => (
                    <div key={card.title} className="glass p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
                        <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                            <card.icon size={24} />
                        </div>
                        <p className="text-slate-500 text-sm font-semibold">{card.title}</p>
                        <h2 className="text-3xl font-bold text-slate-900 mt-1">{card.value}</h2>
                    </div>
                ))}
            </div>

            <div className="glass rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">System Overview</h3>
                    <button 
                        onClick={() => navigate('/tickets/list')}
                        className="text-primary-600 font-bold text-sm hover:text-primary-700 flex items-center gap-1 transition-colors"
                    >
                        View All <ChevronRight size={16} />
                    </button>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin text-primary-500 mx-auto w-8 h-8 border-4 border-t-transparent border-current rounded-full mb-4"></div>
                            <p className="text-slate-500">Loading activity...</p>
                        </div>
                    ) : recentTickets.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Activity size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Recent activity will appear here as complaints are raised.</p>
                        </div>
                    ) : recentTickets.map((ticket) => (
                        <div key={ticket._id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm bg-slate-100 group-hover:scale-110 transition-transform`}>
                                   <Activity size={18} className="text-slate-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900">{ticket.type}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} className="text-slate-400" />
                                            {ticket.block?.name || 'N/A'} - {ticket.roomNumber?.number || 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} className="text-slate-400" />
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/tickets/list')}
                                className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-primary-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
