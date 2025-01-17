import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
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
import { setupInterceptors } from './services/api'; // Importe a função setupInterceptors
import ManageUsers from './components/ManageUsers';
import { useNotification } from './components/NotificationProvider';


const App = () => {
    const { user, setUser } = useUser();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const token = localStorage.getItem('authToken');
    
        if (!token) {
            console.warn('Nenhum token encontrado no localStorage.');
            // addNotification("Nenhum token encontrado no localStorage.", "Erro");
            navigate('/'); // Redireciona para a página de login se não houver token
            return;
        }
    
        try {
            const decodedToken = jwtDecode(token);
            // console.log('Token decodificado no App:', decodedToken);
    
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                // addNotification("Token expirado.", "Erro");
                console.warn('Token expirado.');
                localStorage.removeItem('authToken');
                setUser({
                    isLoggedIn: false,
                    email: '',
                    role: [],
                    cpf: '',
                    firstName: '',
                });
                navigate('/'); // Redireciona para a página de login
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
        }
        setupInterceptors(setUser, navigate);
    }, [navigate, setUser]); // Adicionei 'navigate' aqui.
    

    const handleLoginSuccess = () => {
        // console.log('Login bem-sucedido.');
        // addNotification("Login bem-sucedido.", "Sucesso");
        const token = localStorage.getItem('authToken');
        navigate('/');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser({
                    isLoggedIn: true,
                    email: decodedToken.sub || 'Email não fornecido',
                    role: decodedToken.roles || [],
                    cpf: decodedToken.cpf || 'Não informado',
                    firstName: decodedToken.firstName || 'Primeiro nome não fornecido',
                });
            } catch (error) {
                console.error('Erro ao decodificar o token:', error);
            }
        }
        navigate('/dashboard');
    };


    const handleLogout = () => {
        // console.log('Logout realizado.');
        addNotification("Logout realizado.", "Sucesso");
        setUser({
            isLoggedIn: false,
            email: '',
            role: [],
            cpf: '',
            firstName: '',
        });
        localStorage.removeItem('authToken');
        
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
                />
            )}

            <Routes>
                <Route path="/" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route
                    path="/dashboard"
                    element={
                        user.isLoggedIn ? (
                            <AdminRoute>
                                <Dashboard />
                            </AdminRoute>
                        ) : null
                    }
                />
                <Route
                    path="/map-view"
                    element={
                        user.isLoggedIn ? (
                            <AdminRoute>
                                <MapView />
                            </AdminRoute>
                        ) : null
                    }
                />
                <Route
                    path="/manage"
                    element={
                        user.isLoggedIn ? (
                            <AdminRoute>
                                <ManagePointsAreas />
                            </AdminRoute>
                        ) : null
                    }
                />
                <Route
                    path="/userspage"
                    element={
                        user.isLoggedIn ? (
                            <AdminRoute>
                                <UsersPage />
                            </AdminRoute>
                        ) : null
                    }
                />
                <Route
                    path="/users"
                    element={
                        user.isLoggedIn ? (
                            <AdminRoute>
                                <ManageUsers />
                            </AdminRoute>
                        ) : null
                    }
                />
            </Routes>
        </div>
    );
};

export default App;
