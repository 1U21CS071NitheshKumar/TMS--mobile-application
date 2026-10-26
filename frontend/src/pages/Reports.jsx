import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Download,
    Filter,
    FileText,
    ChevronDown,
    Search,
    Printer,
    Trash2
} from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [filters, setFilters] = useState({
        department: '',
        programme: '',
        type: '',
        status: '',
        assignee: ''
    });
    const [loading, setLoading] = useState(false);
    const [depts, setDepts] = useState([]);
    const [progs, setProgs] = useState([]);
    const [staff, setStaff] = useState([]);

    useEffect(() => {
        fetchInitialData();
        fetchReports();
    }, []);

    const fetchInitialData = async () => {
        const [dRes, pRes, sRes] = await Promise.all([
            api.get('/master/departments'),
            api.get('/master/programmes'),
            api.get('/master/users')
        ]);
        setDepts(dRes.data);
        setProgs(pRes.data);
        setStaff(sRes.data.filter(u => u.role !== 'User' && u.role !== 'SuperAdmin'));
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await api.get(`/complaint/report?${query}`);
            setReports(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!id) return alert('Invalid Ticket ID');
        console.log('Attempting to delete ticket:', id);
        if (window.confirm('Are you sure you want to delete this complaint record permanently?')) {
            try {
                const res = await api.delete(`/complaint/delete/${id}`);
                console.log('Delete response:', res.data);
                fetchReports();
            } catch (err) {
                console.error('Delete error details:', err.response || err);
                const errorMsg = err.response?.data?.error || err.message || 'Error deleting record';
                alert(`Delete Failed: ${errorMsg}`);
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 print:p-0">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Complaint Details Report</h1>
                    <p className="text-slate-500 mt-2">Generate and export comprehensive complaint reports.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all">
                        <Printer size={20} /> Print Report
                    </button>
                    <button className="btn-primary flex items-center gap-2 px-6">
                        <Download size={20} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="glass p-8 rounded-2xl space-y-6 print:hidden">
                <div className="flex items-center gap-2 text-primary-600 font-bold mb-2">
                    <Filter size={20} />
                    <span>Filter Reports</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <select className="input-field" onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                        <option value="">Department</option>
                        {depts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <select className="input-field" onChange={(e) => setFilters({ ...filters, programme: e.target.value })}>
                        <option value="">Programme</option>
                        {progs.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                    </select>
                    <select className="input-field" onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                        <option value="">Type</option>
                        <option value="PC Hardware">PC Hardware</option>
                        <option value="PC Software">PC Software</option>
                        <option value="Network">Network</option>
                    </select>
                    <select className="input-field" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <button onClick={fetchReports} className="btn-primary w-full flex items-center justify-center gap-2">
                        <Search size={18} /> Apply
                    </button>
                </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden print:shadow-none print:border-none">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Location</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Raised By</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Assignee</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right print:hidden">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reports.map((r) => (
                            <tr key={r._id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{new Date(r.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-700">{r.type}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{r.block?.name || 'N/A'} - {r.roomNumber?.number || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{r.raisedBy?.username}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{r.assignedTo?.username || 'Unassigned'}</td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{r.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right print:hidden">
                                    <button 
                                        onClick={() => handleDelete(r._id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Record"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reports.length === 0 && !loading && (
                    <div className="p-20 text-center text-slate-400 font-medium">
                        No records found for the selected filters.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
