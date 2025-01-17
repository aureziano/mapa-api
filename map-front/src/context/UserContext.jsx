import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Cria o contexto do usuário
const UserContext = createContext();

export const useUser = () => useContext(UserContext); // Hook para acessar o contexto

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        isLoggedIn: false,
        role: [],
        email: '',
        cpf: '',
        firstName: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (token && storedUser) {
            setUser({ ...storedUser, isLoggedIn: true });
        } else {
            setUser({
                isLoggedIn: false,
                role: [],
                email: '',
                cpf: '',
                firstName: '',
            });
        }
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser({ ...userData, isLoggedIn: true });
        navigate('/users'); // Redireciona após login
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser({
            isLoggedIn: false,
            role: [],
            email: '',
            cpf: '',
            firstName: '',
        });
        navigate('/login'); // Redireciona após logout
    };

    return (
        <UserContext.Provider value={{ user, setUser, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
