import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // If no specific roles are required, just being logged in is enough
            if (!allowedRoles || allowedRoles.length === 0) {
                setAuthorized(true);
                setLoading(false);
                return;
            }

            // Check user profile for role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile && allowedRoles.includes(profile.role)) {
                setAuthorized(true);
            }

            setLoading(false);
        };

        checkAuth();
    }, [allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-premium-gradient">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!authorized) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
