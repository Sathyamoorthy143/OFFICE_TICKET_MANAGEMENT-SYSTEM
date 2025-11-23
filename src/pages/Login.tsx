import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, AlertCircle, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const navigate = useNavigate();

    const ALLOWED_DOMAINS = ['leroyalmeridienchennai.com', 'leroyalmeridien-chennai.com'];

    const validateEmail = (email: string) => {
        const domain = email.split('@')[1];
        return ALLOWED_DOMAINS.includes(domain);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!validateEmail(email)) {
                throw new Error(`Email domain not allowed. Allowed: ${ALLOWED_DOMAINS.join(', ')}`);
            }

            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[var(--color-background)]" />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/20 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/20 blur-[120px]" />

            <div className="w-full max-w-6xl relative z-10">
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2">
                            Ticket System
                        </h1>
                        <p className="text-[var(--color-text-muted)] font-light">
                            Le Royal Meridien Chennai Support
                        </p>
                    </motion.div>
                </div>

                {/* Two Column Layout: Login Form + Developer Profile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Left: Login Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <div className="glass-panel p-8 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 h-full">
                            <h2 className="text-2xl font-semibold mb-6 text-center text-white">
                                {isSignUp ? 'Create Account' : 'Welcome Back'}
                            </h2>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm"
                                >
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleAuth} className="space-y-5">
                                {isSignUp && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-muted)] ml-1">Full Name</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                className="pl-11 bg-black/20 border-white/10 focus:border-amber-500/50 focus:bg-black/30 transition-all"
                                                placeholder="John Doe"
                                            />
                                            <User className="absolute left-3.5 top-3 text-[var(--color-text-muted)] group-focus-within:text-amber-400 transition-colors" size={18} />
                                        </div>
                                    </motion.div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-muted)] ml-1">Email Address</label>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="pl-11 bg-black/20 border-white/10 focus:border-amber-500/50 focus:bg-black/30 transition-all"
                                            placeholder="you@leroyalmeridienchennai.com"
                                        />
                                        <Mail className="absolute left-3.5 top-3 text-[var(--color-text-muted)] group-focus-within:text-amber-400 transition-colors" size={18} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-muted)] ml-1">Password</label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-11 bg-black/20 border-white/10 focus:border-amber-500/50 focus:bg-black/30 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <Lock className="absolute left-3.5 top-3 text-[var(--color-text-muted)] group-focus-within:text-amber-400 transition-colors" size={18} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn btn-primary mt-2 h-12 text-lg shadow-lg shadow-amber-600/20"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Processing...</span>
                                    ) : (
                                        <>
                                            {isSignUp ? 'Sign Up' : 'Sign In'}
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                <button
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="ml-2 text-amber-400 hover:text-amber-300 font-medium hover:underline transition-colors"
                                >
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Developer Profile */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-center"
                    >
                        <h2 className="text-xl font-bold text-white mb-6 text-center">System Developer</h2>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                                S
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Sathyamoorthy A</h3>
                                <p className="text-sm text-[var(--color-text-muted)] mt-1">IT Associate</p>
                                <p className="text-sm text-[var(--color-text-muted)]">Le Royal Meridien Chennai</p>
                                <p className="text-xs text-amber-400 mt-2">Full Stack Developer</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                                <a
                                    href="https://linkedin.com/in/sathyamoorthy-offical"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 w-full sm:w-auto justify-center"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    <span className="text-sm font-medium">LinkedIn</span>
                                </a>
                                <a
                                    href="https://github.com/Sathyamoorthy143"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 border border-slate-500/20 hover:border-slate-500/40 transition-all duration-200 w-full sm:w-auto justify-center"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    <span className="text-sm font-medium">GitHub</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Features Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel p-6 rounded-2xl border border-white/10 max-w-4xl mx-auto"
                >
                    <h2 className="text-xl font-bold text-white mb-4 text-center">System Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors">
                            <div className="text-amber-400 mb-2 text-2xl">🎫</div>
                            <h3 className="font-semibold text-white mb-1">Ticket Management</h3>
                            <p className="text-xs text-[var(--color-text-muted)]">Create, track, and resolve support tickets with SLA monitoring</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors">
                            <div className="text-amber-400 mb-2 text-2xl">👥</div>
                            <h3 className="font-semibold text-white mb-1">Role-Based Access</h3>
                            <p className="text-xs text-[var(--color-text-muted)]">4 user roles with specific permissions and workflows</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors">
                            <div className="text-amber-400 mb-2 text-2xl">⏱️</div>
                            <h3 className="font-semibold text-white mb-1">SLA Tracking</h3>
                            <p className="text-xs text-[var(--color-text-muted)]">40-minute resolution deadline with visual indicators</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors">
                            <div className="text-amber-400 mb-2 text-2xl">📧</div>
                            <h3 className="font-semibold text-white mb-1">Email Notifications</h3>
                            <p className="text-xs text-[var(--color-text-muted)]">Automated monthly reports to department managers</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors">
                            <div className="text-amber-400 mb-2 text-2xl">🔒</div>
                            <h3 className="font-semibold text-white mb-1">Password Security</h3>
                            <p className="text-xs text-[var(--color-text-muted)]">30-day expiry with admin reset capability</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors">
                            <div className="text-amber-400 mb-2 text-2xl">📊</div>
                            <h3 className="font-semibold text-white mb-1">Export & Analytics</h3>
                            <p className="text-xs text-[var(--color-text-muted)]">CSV export and real-time dashboard insights</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
