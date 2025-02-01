import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        isLoggedIn: false,
        role: [],
        email: '',
        cpf: '',
        firstName: '',
    });

    const navigate = useNavigate();

    const verifyToken = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                
                if (decodedToken.exp > currentTime) {
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    setUser({ ...storedUser, isLoggedIn: true });
                    return true;
                }
            } catch (error) {
                console.error('Erro ao decodificar o token:', error);
            }
        }
        return false;
    }, []);

    useEffect(() => {
        if (!verifyToken()) {
            logout();
        }
    }, [verifyToken]);

    const login = useCallback((userData, token) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser({ ...userData, isLoggedIn: true });
        navigate('/dashboard');
    }, [navigate]);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser({
            isLoggedIn: false,
            role: [],
            email: '',
            cpf: '',
            firstName: '',
        });
        navigate('/');
    }, [navigate]);

    return (
        <UserContext.Provider value={{ user, setUser, login, logout, verifyToken }}>
            {children}
        </UserContext.Provider>
    );
};
