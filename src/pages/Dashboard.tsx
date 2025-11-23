import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Ticket, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        activeUsers: 0
    });
    const [deptData, setDeptData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch Tickets
            const { data: tickets, error: ticketError } = await supabase
                .from('tickets')
                .select(`
                    id,
                    status,
                    assigned_dept_id,
                    departments (
                        name
                    )
                `);

            if (ticketError) throw ticketError;

            // Fetch Users Count
            const { count: userCount, error: userError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (userError) throw userError;

            // Process Ticket Stats
            const total = tickets?.length || 0;
            const open = tickets?.filter(t => t.status === 'open').length || 0;
            const resolved = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0;

            setStats({
                totalTickets: total,
                openTickets: open,
                resolvedTickets: resolved,
                activeUsers: userCount || 0
            });

            // Process Department Data
            const deptMap = new Map();
            tickets?.forEach(t => {
                // @ts-ignore
                const deptName = t.departments?.name || 'Unassigned';
                deptMap.set(deptName, (deptMap.get(deptName) || 0) + 1);
            });

            const processedDeptData = Array.from(deptMap.entries()).map(([name, count]) => ({
                name,
                tickets: count
            }));
            setDeptData(processedDeptData);

            // Process Status Data
            const statusMap = new Map();
            tickets?.forEach(t => {
                const status = t.status.charAt(0).toUpperCase() + t.status.slice(1).replace('_', ' ');
                statusMap.set(status, (statusMap.get(status) || 0) + 1);
            });

            const statusColors: any = {
                'Open': '#8b5cf6', // Violet
                'In progress': '#ec4899', // Pink
                'Resolved': '#10b981', // Emerald
                'Closed': '#94a3b8', // Slate
                'On hold': '#f59e0b' // Amber
            };

            const processedStatusData = Array.from(statusMap.entries()).map(([name, count]) => ({
                name,
                value: count,
                color: statusColors[name] || '#cbd5e1'
            }));
            setStatusData(processedStatusData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Dashboard Overview
                </h1>
                <span className="text-sm text-[var(--color-text-muted)] bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Last updated: Just now
                </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Ticket} label="Total Tickets" value={stats.totalTickets} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
                <StatCard icon={AlertTriangle} label="Open Issues" value={stats.openTickets} color="text-yellow-400" bg="bg-yellow-500/10" border="border-yellow-500/20" />
                <StatCard icon={CheckCircle} label="Resolved" value={stats.resolvedTickets} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                <StatCard icon={Users} label="Active Users" value={stats.activeUsers} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div variants={item} className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-6 text-white/90">Tickets by Department</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#12121a',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        color: '#f8fafc',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                    }}
                                />
                                <Bar
                                    dataKey="tickets"
                                    fill="#f59e0b"
                                    radius={[6, 6, 0, 0]}
                                    animationDuration={1500}
                                >
                                    {deptData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f59e0b' : '#fb923c'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={item} className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-6 text-white/90">Ticket Status Distribution</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#12121a',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        color: '#f8fafc',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4 flex-wrap">
                        {statusData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs text-[var(--color-text-muted)]">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

function StatCard({ icon: Icon, label, value, color, bg, border }: any) {
    return (
        <motion.div
            variants={item}
            whileHover={{ y: -5 }}
            className={`glass-card p-6 rounded-2xl border ${border}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">{label}</p>
                    <h4 className="text-3xl font-bold text-white">{value}</h4>
                </div>
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={color} size={24} />
                </div>
            </div>
        </motion.div>
    );
}
