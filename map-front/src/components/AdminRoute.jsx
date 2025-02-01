import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AdminRoute = ({ children }) => {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            // Simula uma verificação assíncrona
            await new Promise(resolve => setTimeout(resolve, 100));
            setIsLoading(false);
        };
        checkAuth();
    }, [user]);

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    if (!user.isLoggedIn) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (!user.role || !user.role.includes('ROLE_ADMIN')) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminRoute;