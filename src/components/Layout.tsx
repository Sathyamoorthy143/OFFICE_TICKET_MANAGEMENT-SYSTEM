import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Ticket, PlusCircle, LogOut, Menu, X, Users, Building2 } from 'lucide-react';
import type { Profile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isPasswordExpired, getDaysUntilExpiry } from '../lib/passwordPolicy';
import PasswordResetModal from './PasswordResetModal';

export default function Layout() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        setProfile(data);

        // Check password expiry or reset requirement
        if (data && (data.password_reset_required || isPasswordExpired(data))) {
            setShowPasswordModal(true);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Ticket, label: 'All Tickets', path: '/tickets' },
        { icon: PlusCircle, label: 'Create Ticket', path: '/tickets/new' },
        ...(profile?.role === 'admin' || profile?.role === 'dept_manager' ? [
            { icon: Users, label: 'Users', path: '/users' },
            { icon: Building2, label: 'Groups', path: '/groups' }
        ] : []),
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-text)] font-sans">
            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={twMerge(
                "fixed lg:static inset-y-0 left-0 z-50 w-72 p-4 transition-transform duration-300 ease-in-out lg:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full glass-panel rounded-2xl flex flex-col overflow-hidden">
                    <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--color-border)]">
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Ticket System
                        </span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden text-[var(--color-text-muted)] hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "bg-gradient-to-r from-violet-600/20 to-pink-600/20 text-white shadow-lg shadow-violet-500/10 border border-violet-500/20"
                                            : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-pink-600/10 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <Icon size={20} className={clsx("relative z-10", isActive ? "text-violet-400" : "group-hover:text-white transition-colors")} />
                                    <span className="relative z-10 font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-[var(--color-border)] bg-black/20">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                {profile?.full_name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-white">{profile?.full_name || 'Loading...'}</p>
                                <p className="text-xs text-[var(--color-text-muted)] truncate capitalize">{profile?.role?.replace('_', ' ') || 'User'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-200"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)] bg-[var(--color-surface-glass)] backdrop-blur-md">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-[var(--color-text)] p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-lg bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Ticket System</span>
                    <div className="w-10" /> {/* Spacer */}
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Password Reset Modal */}
            {profile && (
                <PasswordResetModal
                    isOpen={showPasswordModal}
                    userId={profile.id}
                    daysRemaining={getDaysUntilExpiry(profile)}
                />
            )}
        </div>
    );
}
