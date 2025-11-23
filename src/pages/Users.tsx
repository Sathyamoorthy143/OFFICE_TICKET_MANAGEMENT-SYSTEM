import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Department, UserRole } from '../types';
import { motion } from 'framer-motion';
import { Shield, Briefcase, Save, Search, KeyRound, Clock } from 'lucide-react';
import { getDaysUntilExpiry } from '../lib/passwordPolicy';

export default function Users() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Edit state
    const [editRole, setEditRole] = useState<UserRole>('view_only');
    const [editDept, setEditDept] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [usersRes, deptsRes] = await Promise.all([
            supabase.from('profiles').select('*, department:departments(name)').order('full_name'),
            supabase.from('departments').select('*').order('name')
        ]);

        if (usersRes.error) console.error(usersRes.error);
        if (deptsRes.error) console.error(deptsRes.error);

        setUsers(usersRes.data || []);
        setDepartments(deptsRes.data || []);
        setLoading(false);
    };

    const startEdit = (user: Profile) => {
        setEditingId(user.id);
        setEditRole(user.role);
        setEditDept(user.department_id || '');
    };

    const saveEdit = async (userId: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({
                role: editRole,
                department_id: editDept || null
            })
            .eq('id', userId);

        if (error) {
            alert('Failed to update user');
            console.error(error);
        } else {
            setEditingId(null);
            fetchData();
        }
    };

    const resetPassword = async (userId: string, userName: string) => {
        if (!confirm(`Force password reset for ${userName}?`)) return;

        const { error } = await supabase
            .from('profiles')
            .update({ password_reset_required: true })
            .eq('id', userId);

        if (error) {
            alert('Failed to trigger password reset');
            console.error(error);
        } else {
            alert(`Password reset required for ${userName}. They will be prompted on next login.`);
            fetchData();
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        User Management
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Manage user roles and access rights</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 text-sm bg-black/20 border-transparent focus:bg-black/40"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 font-medium text-[var(--color-text-muted)]">User</th>
                                <th className="p-4 font-medium text-[var(--color-text-muted)]">Role</th>
                                <th className="p-4 font-medium text-[var(--color-text-muted)]">Department</th>
                                <th className="p-4 font-medium text-[var(--color-text-muted)]">Password Status</th>
                                <th className="p-4 font-medium text-[var(--color-text-muted)] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center text-white font-bold border border-white/10">
                                                {user.full_name[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.full_name}</div>
                                                <div className="text-xs text-[var(--color-text-muted)]">{user.email || 'No email'}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        {editingId === user.id ? (
                                            <div className="relative">
                                                <select
                                                    value={editRole}
                                                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                                                    className="pl-9 py-1.5 text-sm bg-black/40 border-violet-500/50"
                                                >
                                                    <option value="view_only">View Only</option>
                                                    <option value="dept_user">Dept User</option>
                                                    <option value="dept_manager">Dept Manager</option>
                                                    <option value="administrative_personnel">Admin Personnel</option>
                                                    <option value="admin">Administrator</option>
                                                </select>
                                                <Shield className="absolute left-2.5 top-2 text-violet-400" size={14} />
                                            </div>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${user.role === 'admin' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' :
                                                user.role === 'dept_manager' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' :
                                                    'bg-white/5 text-[var(--color-text-muted)] border-white/10'
                                                }`}>
                                                <Shield size={12} />
                                                {user.role.replace('_', ' ').toUpperCase()}
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-4">
                                        {editingId === user.id ? (
                                            <div className="relative">
                                                <select
                                                    value={editDept}
                                                    onChange={(e) => setEditDept(e.target.value)}
                                                    className="pl-9 py-1.5 text-sm bg-black/40 border-violet-500/50"
                                                >
                                                    <option value="">No Department</option>
                                                    {departments.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </select>
                                                <Briefcase className="absolute left-2.5 top-2 text-violet-400" size={14} />
                                            </div>
                                        ) : (
                                            <span className="text-sm text-[var(--color-text-muted)]">
                                                {departments.find(d => d.id === user.department_id)?.name || '-'}
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-4">
                                        {user.role === 'admin' ? (
                                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                Never expires
                                            </span>
                                        ) : (
                                            <span className={`text-xs flex items-center gap-1 ${getDaysUntilExpiry(user) <= 7 ? 'text-red-400' : getDaysUntilExpiry(user) <= 14 ? 'text-yellow-400' : 'text-[var(--color-text-muted)]'}`}>
                                                <Clock size={12} />
                                                {getDaysUntilExpiry(user) === 0 ? 'Expired' : `${getDaysUntilExpiry(user)} days left`}
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-4 text-right">
                                        {editingId === user.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => saveEdit(user.id)}
                                                    className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                                >
                                                    <Save size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-2 rounded-lg bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => startEdit(user)}
                                                    className="btn btn-ghost text-sm py-1.5 px-3 border border-white/10 hover:border-white/20"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => resetPassword(user.id, user.full_name)}
                                                    className="p-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
                                                    title="Force Password Reset"
                                                >
                                                    <KeyRound size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
