import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { validatePasswordStrength } from '../lib/passwordPolicy';

interface PasswordResetModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    daysRemaining?: number;
}

export default function PasswordResetModal({ isOpen, userId, daysRemaining }: PasswordResetModalProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const validation = validatePasswordStrength(newPassword);
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        setLoading(true);

        try {
            // Update password in Supabase Auth
            const { error: authError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (authError) throw authError;

            // Update password_changed_at and reset the flag
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    password_changed_at: new Date().toISOString(),
                    password_reset_required: false
                })
                .eq('id', userId);

            if (profileError) throw profileError;

            // Success - reload page to refresh session
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel p-8 rounded-2xl max-w-md w-full relative"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                                        <Lock className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Password Reset Required</h2>
                                        {daysRemaining !== undefined && daysRemaining <= 0 && (
                                            <p className="text-sm text-red-400">Your password has expired</p>
                                        )}
                                        {daysRemaining !== undefined && daysRemaining > 0 && (
                                            <p className="text-sm text-yellow-400">Expires in {daysRemaining} days</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400">
                                    <AlertCircle size={18} />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full"
                                        required
                                    />
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                        Must be 8+ characters with uppercase, lowercase, number, and special character
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="w-full"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn btn-primary mt-6"
                                >
                                    {loading ? 'Updating...' : 'Reset Password'}
                                </button>
                            </form>

                            <p className="text-xs text-center text-[var(--color-text-muted)] mt-4">
                                You must reset your password to continue
                            </p>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
