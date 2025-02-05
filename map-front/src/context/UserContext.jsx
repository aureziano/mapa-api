import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../services/api';
import { useNotification } from "../components/layout/Notification/NotificationProvider";
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        isLoggedIn: false,
        id: '',
        role: [],
        email: '',
        cpf: '',
        firstName: '',
    });

    const { addNotification, showExpirationModal, removeNotification } = useNotification();
    const navigate = useNavigate();
    const expirationTimerRef = useRef(null);
    const handleTokenRenewalRef = useRef(null);

    const logout = useCallback((message = 'Sessão expirada') => {
        if (expirationTimerRef.current) clearInterval(expirationTimerRef.current);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser({
            isLoggedIn: false,
            id: '',
            role: [],
            email: '',
            cpf: '',
            firstName: '',
        });
        navigate('/');
        removeNotification();
    }, [navigate, removeNotification]); // Adicionei removeNotification aqui

    const startExpirationTimer = useCallback((token) => {
        if (expirationTimerRef.current) clearInterval(expirationTimerRef.current);

        const decoded = jwtDecode(token);
        const expirationTime = decoded.exp * 1000;

        const checkExpiration = () => {
            const remaining = expirationTime - Date.now();

            if (remaining <= 300000 && remaining > 0) { // 5 minutos
                showExpirationModal(
                    () => handleTokenRenewalRef.current(),
                    () => logout('Você foi desconectado por inatividade'),
                    remaining
                );
            }

            if (remaining <= 0) {
                logout('Sua sessão expirou');
            }
        };

        expirationTimerRef.current = setInterval(checkExpiration, 30000);
        checkExpiration();

        return () => clearInterval(expirationTimerRef.current);
    }, [showExpirationModal, logout]);

    const handleTokenRenewal = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const token = localStorage.getItem('authToken');
            const response = await api.post('/api/auth/refreshtoken', {
                refreshToken
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            localStorage.setItem('authToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            startExpirationTimer(response.data.accessToken);

            const decoded = jwtDecode(response.data.accessToken);
            setUser(prev => ({
                ...prev,
                id: decoded.userId,
                email: decoded.sub,
                role: decoded.roles,
                cpf: decoded.cpf,
                firstName: decoded.firstName,
                isLoggedIn: true
            }));

        } catch (error) {
            addNotification("Falha na renovação da sessão", "error");
            logout();
        }
    }, [startExpirationTimer, logout, addNotification]);

    const login = useCallback((token) => {
        const decoded = jwtDecode(token);
        const userData = {
            isLoggedIn: true,
            id: decoded.userId,
            email: decoded.sub,
            role: decoded.roles,
            cpf: decoded.cpf,
            firstName: decoded.firstName
        };

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        startExpirationTimer(token);
        navigate('/dashboard');
    }, [navigate, startExpirationTimer]);

    useEffect(() => {
        handleTokenRenewalRef.current = handleTokenRenewal;
    }, [handleTokenRenewal]);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('authToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (token && refreshToken) {
                try {
                    const decoded = jwtDecode(token);
                    setUser({
                        isLoggedIn: true,
                        id: decoded.userId,
                        email: decoded.sub,
                        role: decoded.roles,
                        cpf: decoded.cpf,
                        firstName: decoded.firstName
                    });
                    startExpirationTimer(token);
                } catch (error) {
                    logout();
                }
            }
        };
        initializeAuth();
    }, [logout, startExpirationTimer]);

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            login,
            logout,
            verifyToken: handleTokenRenewal
        }}>
            {children}
        </UserContext.Provider>
    );
};
