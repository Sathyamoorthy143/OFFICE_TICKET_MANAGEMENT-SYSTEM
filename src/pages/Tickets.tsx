import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Ticket } from '../types';
import { Plus, Clock, Search, ChevronRight, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { exportTicketsToCSV } from '../utils/export';

export default function Tickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const fetchTickets = async () => {
        setLoading(true);
        let query = supabase
            .from('tickets')
            .select(`
        *,
        creator:profiles!creator_id(full_name),
        assigned_dept:departments!assigned_dept_id(name)
      `)
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;
        if (error) console.error(error);
        else setTickets(data || []);
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
            case 'in_progress': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
            case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'closed': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    // Filter tickets by search term
    const filteredTickets = tickets.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Tickets
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Manage and track support requests</p>
                </div>
                <Link to="/tickets/new" className="btn btn-primary shadow-lg shadow-amber-500/20">
                    <Plus size={18} />
                    New Ticket
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
                    {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`
                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                ${filter === status
                                    ? 'bg-white/10 text-white shadow-sm border border-white/10'
                                    : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'}
              `}
                        >
                            {status.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 text-sm bg-black/20 border-transparent focus:bg-black/40 w-full"
                        />
                    </div>

                    <button
                        onClick={() => exportTicketsToCSV(filteredTickets)}
                        className="btn btn-ghost border border-white/10 hover:border-white/20 h-10 px-4 shrink-0"
                        title="Export to CSV"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
                    <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
                    <p>Loading tickets...</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View (Hidden on Mobile) */}
                    <div className="hidden lg:block glass-panel rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-4 font-medium text-[var(--color-text-muted)]">ID</th>
                                    <th className="p-4 font-medium text-[var(--color-text-muted)]">Title</th>
                                    <th className="p-4 font-medium text-[var(--color-text-muted)]">Department</th>
                                    <th className="p-4 font-medium text-[var(--color-text-muted)]">Creator</th>
                                    <th className="p-4 font-medium text-[var(--color-text-muted)]">Status</th>
                                    <th className="p-4 font-medium text-[var(--color-text-muted)]">Created</th>
                                    <th className="p-4 font-medium text-[var(--color-text-muted)]">SLA</th>
                                    <th className="p-4 font-medium text-[var(--color-text-muted)]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                                    >
                                        <td className="p-4 font-mono text-xs text-[var(--color-text-muted)]">#{ticket.id.slice(0, 8)}</td>
                                        <td className="p-4 font-medium text-white group-hover:text-amber-300 transition-colors">{ticket.title}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
                                                {ticket.assigned_dept?.name}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--color-text-muted)]">{ticket.creator?.full_name}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--color-text-muted)]">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            {ticket.sla_deadline && (
                                                <span className={`text-xs font-mono ${new Date(ticket.sla_deadline) < new Date() && ticket.status !== 'resolved' ? 'text-red-400' : 'text-emerald-400'
                                                    }`}>
                                                    {new Date(ticket.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-white inline-block" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View (Hidden on Desktop) */}
                    <motion.div
                        layout
                        className="grid gap-4 lg:hidden"
                    >
                        <AnimatePresence>
                            {filteredTickets.map((ticket) => (
                                <motion.div
                                    key={ticket.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    className="glass-card p-5 rounded-2xl cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex items-start justify-between gap-4 pl-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <span className="text-xs font-mono text-[var(--color-text-muted)] bg-white/5 px-2 py-1 rounded-md">
                                                    #{ticket.id.slice(0, 8)}
                                                </span>
                                                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg truncate text-white group-hover:text-amber-300 transition-colors">
                                                {ticket.title}
                                            </h3>
                                            <p className="text-[var(--color-text-muted)] text-sm line-clamp-2 mt-1 font-light">
                                                {ticket.description}
                                            </p>
                                            <div className="flex items-center gap-6 mt-4 text-xs text-[var(--color-text-muted)]">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                                                        {ticket.assigned_dept?.name?.[0]}
                                                    </div>
                                                    <span>{ticket.assigned_dept?.name || 'Unassigned'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                                                        {ticket.creator?.full_name?.[0]}
                                                    </div>
                                                    <span>{ticket.creator?.full_name || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </div>
    );
}
