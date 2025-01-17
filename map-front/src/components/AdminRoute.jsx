import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AdminRoute = ({ children }) => {
    const { user } = useUser(); // Obtém os dados do usuário do contexto
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
        if (!user.isLoggedIn) {
            setIsValid(false);
            return;
        }

        if (!user.role || !user.role.includes('ROLE_ADMIN')) {
            setIsValid(false);
            return;
        }

        setIsValid(true);
    }, [user]);

    if (isValid === null) {
        return <div>Validando...</div>; // Pode ser um spinner ou uma mensagem de carregamento
    }

    return isValid ? children : <Navigate to="/" />;
};

export default AdminRoute;