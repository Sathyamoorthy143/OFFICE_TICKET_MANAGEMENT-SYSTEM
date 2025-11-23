import type { Profile } from '../types';

const PASSWORD_EXPIRY_DAYS = 30;

export const isPasswordExpired = (profile: Profile | null): boolean => {
    if (!profile) return false;

    // Admins never have password expiry
    if (profile.role === 'admin') return false;

    // Check if password_changed_at exists and is older than 30 days
    if (!profile.password_changed_at) return false;

    const passwordAge = Date.now() - new Date(profile.password_changed_at).getTime();
    const thirtyDaysInMs = PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    return passwordAge > thirtyDaysInMs;
};

export const shouldSkipExpiry = (profile: Profile | null): boolean => {
    if (!profile) return true;
    return profile.role === 'admin';
};

export const validatePasswordStrength = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        return {
            valid: false,
            message: 'Password must contain uppercase, lowercase, number, and special character'
        };
    }

    return { valid: true, message: '' };
};

export const getDaysUntilExpiry = (profile: Profile | null): number => {
    if (!profile || shouldSkipExpiry(profile)) return Infinity;
    if (!profile.password_changed_at) return PASSWORD_EXPIRY_DAYS;

    const passwordAge = Date.now() - new Date(profile.password_changed_at).getTime();
    const daysOld = Math.floor(passwordAge / (24 * 60 * 60 * 1000));
    const daysRemaining = PASSWORD_EXPIRY_DAYS - daysOld;

    return Math.max(0, daysRemaining);
};
