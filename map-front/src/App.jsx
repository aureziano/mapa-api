import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import ManagePointsAreas from './components/ManagePointsAreas';
import UsersPage from './components/UsersPage';
import AdminRoute from './components/AdminRoute';
import HeaderWithMenu from './components/HeaderWithMenu';
import jwtDecode from 'jwt-decode';
import { useUser } from './context/UserContext';
import './App.css';
import { setupInterceptors } from './services/api';
import ManageUsers from './components/ManageUsers';
import { useNotification } from './components/NotificationProvider';
import TestModal from './components/TesteModal';

const App = () => {
    const { user, setUser } = useUser();
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState('');

    // Mapeamento de rotas para títulos
    const pageTitles = {
        '/dashboard': 'Dashboard',
        '/map-view': 'Visualização de Mapa',
        '/manage': 'Gerenciamento de Áreas',
        '/userspage': 'Página de Usuários',
        '/users': 'Gestão de Usuários'
    };

    // Atualiza o título da página quando a rota muda
    useEffect(() => {
        setCurrentPage(pageTitles[location.pathname] || '');
    }, [location.pathname]);

    // Efeito para verificação de autenticação
    useEffect(() => {
        const token = localStorage.getItem('authToken');

        const verifyToken = async () => {
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                
                if (decodedToken.exp < currentTime) {
                    handleLogout();
                    return;
                }

                setUser({
                    isLoggedIn: true,
                    email: decodedToken.sub || 'Email não fornecido',
                    role: decodedToken.roles || [],
                    cpf: decodedToken.cpf || 'Não informado',
                    firstName: decodedToken.firstName || 'Primeiro nome não fornecido',
                });
            } catch (error) {
                console.error('Erro ao decodificar o token:', error);
                handleLogout();
            }
        };

        verifyToken();
        setupInterceptors(setUser, navigate);
    }, [navigate, setUser]);

    const handleLoginSuccess = () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser({
                    isLoggedIn: true,
                    email: decodedToken.sub,
                    role: decodedToken.roles,
                    cpf: decodedToken.cpf,
                    firstName: decodedToken.firstName,
                });
                navigate('/dashboard');
            } catch (error) {
                console.error('Erro ao decodificar o token:', error);
            }
        }
    };

    const handleLogout = () => {
        addNotification("Logout realizado.", "success");
        setUser({
            isLoggedIn: false,
            email: '',
            role: [],
            cpf: '',
            firstName: '',
        });
        localStorage.removeItem('authToken');
        navigate('/');
    };

    return (
        <div>
            {user.isLoggedIn && (
                <HeaderWithMenu
                    username={user.email}
                    role={user.role}
                    cpf={user.cpf}
                    firstName={user.firstName}
                    onLogout={handleLogout}
                    currentPage={currentPage}
                />
            )}

            <Routes>
                <Route path="/" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/register" element={<RegisterForm />} />
                
                <Route path="/dashboard" element={
                    <AdminRoute>
                        <Dashboard />
                    </AdminRoute>
                } />
                
                <Route path="/map-view" element={
                    <AdminRoute>
                        <MapView />
                    </AdminRoute>
                } />
                
                <Route path="/manage" element={
                    <AdminRoute>
                        <ManagePointsAreas />
                    </AdminRoute>
                } />
                
                <Route path="/userspage" element={
                    <AdminRoute>
                        <UsersPage />
                    </AdminRoute>
                } />
                
                <Route path="/users" element={
                    <AdminRoute>
                        <ManageUsers />
                    </AdminRoute>
                } />
                
                <Route path="/teste" element={<TestModal />} />
            </Routes>
        </div>
    );
};

export default App;
