import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users as UsersIcon, Building2, UserPlus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Department, Profile } from '../types';

interface DepartmentWithUsers extends Department {
    users: Profile[];
}

export default function Groups() {
    const [departments, setDepartments] = useState<DepartmentWithUsers[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all departments
            const { data: depts, error: deptError } = await supabase
                .from('departments')
                .select('*')
                .order('name');

            if (deptError) throw deptError;

            // Fetch all users with their auth email
            const { data: users, error: usersError } = await supabase
                .from('profiles')
                .select(`
                    id,
                    full_name,
                    role,
                    department_id,
                    password_changed_at,
                    password_reset_required
                `);

            if (usersError) throw usersError;

            // Fetch emails from auth.users
            const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
            if (authError) throw authError;

            // Merge email data
            const usersWithEmails = users?.map(user => ({
                ...user,
                email: authUsers?.find(au => au.id === user.id)?.email
            })) || [];



            // Group users by department
            const deptsWithUsers: DepartmentWithUsers[] = (depts || []).map(dept => ({
                ...dept,
                users: usersWithEmails.filter(user => user.department_id === dept.id)
            }));

            // Add unassigned users as a special "department"
            const unassignedUsers = usersWithEmails.filter(user => !user.department_id);
            if (unassignedUsers.length > 0) {
                deptsWithUsers.push({
                    id: 'unassigned',
                    name: 'Unassigned',
                    users: unassignedUsers
                });
            }

            setDepartments(deptsWithUsers);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserDepartmentChange = async (userId: string, newDeptId: string) => {
        try {
            setUpdating(true);

            const { error } = await supabase
                .from('profiles')
                .update({ department_id: newDeptId === 'unassigned' ? null : newDeptId })
                .eq('id', userId);

            if (error) throw error;

            // Refresh data
            await fetchData();
        } catch (error) {
            console.error('Error updating user department:', error);
            alert('Failed to update user department');
        } finally {
            setUpdating(false);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Department Groups
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-1">
                        Manage users across departments
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={updating}
                    className="btn btn-secondary flex items-center gap-2"
                >
                    <RefreshCw size={18} className={updating ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {departments.map((dept, index) => (
                    <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

                        {/* Header */}
                        <div className="relative z-10 mb-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl ${dept.id === 'unassigned' ? 'bg-slate-500/20' : 'bg-amber-500/20'}`}>
                                        <Building2 className={dept.id === 'unassigned' ? 'text-slate-400' : 'text-amber-400'} size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{dept.name}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mt-0.5">
                                            <UsersIcon size={14} />
                                            <span>{dept.users.length} {dept.users.length === 1 ? 'member' : 'members'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="space-y-2 relative z-10">
                            {dept.users.length === 0 ? (
                                <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
                                    <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No users assigned</p>
                                </div>
                            ) : (
                                dept.users.map(user => (
                                    <div
                                        key={user.id}
                                        className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-amber-500/20 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {user.full_name || 'Unnamed User'}
                                                </p>
                                                <p className="text-xs text-[var(--color-text-muted)] truncate">
                                                    {user.email}
                                                </p>
                                                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                                                    user.role === 'dept_manager' ? 'bg-blue-500/20 text-blue-300' :
                                                        user.role === 'dept_user' ? 'bg-green-500/20 text-green-300' :
                                                            'bg-slate-500/20 text-slate-300'
                                                    }`}>
                                                    {user.role.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <select
                                                value={user.department_id || 'unassigned'}
                                                onChange={(e) => handleUserDepartmentChange(user.id, e.target.value)}
                                                disabled={updating}
                                                className="text-xs px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 cursor-pointer hover:bg-black/40 transition-all"
                                            >
                                                <option value="unassigned" className="bg-slate-800">Unassigned</option>
                                                {departments
                                                    .filter(d => d.id !== 'unassigned')
                                                    .map(d => (
                                                        <option key={d.id} value={d.id} className="bg-slate-800">
                                                            {d.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {departments.length === 0 && (
                <div className="text-center py-16">
                    <Building2 size={48} className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
                    <p className="text-[var(--color-text-muted)]">No departments found</p>
                </div>
            )}
        </div>
    );
}
