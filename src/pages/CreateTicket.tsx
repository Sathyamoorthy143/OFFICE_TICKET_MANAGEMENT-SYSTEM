import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Clock } from 'lucide-react';
import { addMinutes } from 'date-fns';
import { motion } from 'framer-motion';

export default function CreateTicket() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('medium');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const categories = {
        'Engineering': 'Engineering',
        'IT': 'IT',
        'Housekeeping': 'Housekeeping',
        'IRD': 'IRD',
        'Other': 'IT' // Default to IT for uncategorized items
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Get Department ID
            const deptName = categories[category as keyof typeof categories];
            const { data: dept } = await supabase
                .from('departments')
                .select('id')
                .eq('name', deptName)
                .single();

            if (!dept) throw new Error('Department not found');

            const slaDeadline = addMinutes(new Date(), 40).toISOString();

            const { error } = await supabase.from('tickets').insert({
                title,
                description,
                status: 'open',
                priority,
                creator_id: user.id,
                assigned_dept_id: dept.id,
                sla_deadline: slaDeadline
            });

            if (error) throw error;
            navigate('/tickets');
        } catch (error) {
            console.error(error);
            alert('Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-6"
        >
            <button
                onClick={() => navigate('/tickets')}
                className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Tickets</span>
            </button>

            <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Create New Ticket</h1>
                    <p className="text-[var(--color-text-muted)] mb-8">Submit a new support request to the relevant department.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/90">Ticket Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-black/20 border-white/10 focus:border-amber-500/50 focus:bg-black/30 transition-all"
                                placeholder="e.g., Leaking faucet in Room 304"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-white/90">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 focus:bg-white/15 transition-all cursor-pointer hover:bg-white/15"
                                    required
                                >
                                    <option value="" className="bg-slate-800 text-slate-300 font-normal">Select a category</option>
                                    <option value="Engineering" className="bg-slate-800 text-white font-semibold">🔧 Engineering</option>
                                    <option value="IT" className="bg-slate-800 text-white font-semibold">💻 IT Support</option>
                                    <option value="Housekeeping" className="bg-slate-800 text-white font-semibold">🧹 Housekeeping</option>
                                    <option value="IRD" className="bg-slate-800 text-white font-semibold">🍽️ In-Room Dining</option>
                                    <option value="Other" className="bg-slate-800 text-white font-semibold">📋 Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-white/90">Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 focus:bg-white/15 transition-all cursor-pointer hover:bg-white/15"
                                >
                                    <option value="low" className="bg-slate-800 text-green-400 font-semibold">🟢 Low Priority</option>
                                    <option value="medium" className="bg-slate-800 text-yellow-400 font-semibold">🟡 Medium Priority</option>
                                    <option value="high" className="bg-slate-800 text-orange-400 font-semibold">🟠 High Priority</option>
                                    <option value="critical" className="bg-slate-800 text-red-400 font-semibold">🔴 Critical</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/90">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-32 bg-black/20 border-white/10 focus:border-amber-500/50 focus:bg-black/30 transition-all resize-none"
                                placeholder="Describe the issue in detail..."
                                required
                            />
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                            <Clock className="text-amber-400 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-sm font-medium text-amber-300">SLA Policy</h4>
                                <p className="text-xs text-amber-400/70 mt-1">
                                    This ticket will be assigned a 40-minute resolution deadline automatically.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary h-12 text-lg shadow-lg shadow-amber-500/20"
                            >
                                {loading ? 'Creating...' : (
                                    <>
                                        <Send size={18} />
                                        Submit Ticket
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
