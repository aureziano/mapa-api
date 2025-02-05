import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './components/users/LoginForm/LoginForm';
import RegisterForm from './components/users/RegisterForm/RegisterForm';
import Dashboard from './features/dashboard/Dashboard';
import MapView from './components/map/MapView/MapView';
import ManagePointsAreas from './features/manage-points-areas/ManagePointsAreas'; ///components/ManagePointsAreas';
import UsersPage from './views/UsersPage/UsersPage';
import AdminRoute from './components/common/AdminRoute/AdminRoute';
import HeaderWithMenu from './components/layout/HeaderWithMenu/HeaderWithMenu';
import jwtDecode from 'jwt-decode';
import { useUser } from './context/UserContext';
import './assets/styles/App.css';
import { setupInterceptors } from './services/api';
import ManageUsers from './features/manage-users/ManageUsers';
import { useNotification } from './components/layout/Notification/NotificationProvider';

const App = () => {
    const { user, setUser } = useUser(); // Remova o login desnecessário
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState('');

    const pageTitles = useMemo(() => ({
        '/dashboard': 'Dashboard',
        '/map-view': 'Visualização de Mapa',
        '/manage': 'Gerenciamento de Áreas',
        '/userspage': 'Página de Usuários',
        '/users': 'Gestão de Usuários'
    }), []);

    useEffect(() => {
        setCurrentPage(pageTitles[location.pathname] || '');
    }, [location.pathname, pageTitles]);

    const handleLogout = useCallback(() => {
        addNotification("Logout realizado.", "sucess");
        setUser({
            isLoggedIn: false,
            id: '',
            email: '',
            role: [],
            cpf: '',
            firstName: '',
        });
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
    }, [addNotification, setUser, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        const verifyToken = async () => {
            if (!token || !refreshToken) {
                handleLogout();
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
                    id: decodedToken.id || '',
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
    }, [navigate, setUser, handleLogout]);

    const handleLoginSuccess = useCallback((accessToken) => {
        const decoded = jwtDecode(accessToken);
        setUser({
            isLoggedIn: true,
            id: decoded.id,
            email: decoded.sub,
            role: decoded.roles,
            cpf: decoded.cpf,
            firstName: decoded.firstName,
        });
        navigate('/dashboard');
    }, [navigate, setUser]);

    return (
        <div>
            {user.isLoggedIn && (
                <HeaderWithMenu
                    onLogout={handleLogout}
                    currentPage={currentPage}
                />
            )}

            <Routes>
                <Route path="/" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/register" element={<RegisterForm />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map-view" element={<MapView />} />
                <Route path="/manage" element={<AdminRoute><ManagePointsAreas /></AdminRoute>} />
                <Route path="/userspage" element={<AdminRoute><UsersPage /></AdminRoute>} />
                <Route path="/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
                {/* <Route path="/teste" element={<TestModal />} /> */}
            </Routes>
        </div>
    );
};

export default App;
