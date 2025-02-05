import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaMapMarkedAlt, FaCogs, FaUsers, FaBars, FaClock } from 'react-icons/fa';
import jwtDecode from 'jwt-decode';
import { useUser } from '../../../context/UserContext';
import { useNotification} from '../Notification/NotificationProvider';
import './HeaderWithMenu.css';

const pageDescriptions = {
    dashboard: "**Visão geral das principais métricas e informações do sistema**",
    mapView: "**Visualização interativa de mapas e áreas geográficas**",
    manage: "**Gerenciamento de configurações e recursos do sistema**",
    users: "**Administração de usuários e permissões**"
};

const HeaderWithMenu = ({ username, role, cpf, firstName, onLogout, currentPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [tokenExpiration, setTokenExpiration] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useUser();
    const { removeNotification} = useNotification();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const expirationDate = new Date(decoded.exp * 1000);
                setTokenExpiration(expirationDate.toLocaleDateString('pt-BR') + ' ' +
                    expirationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
            } catch (error) {
                console.error('Erro ao decodificar token:', error);
            }
        }
    }, []);

    const getFormattedDate = () => {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return now.toLocaleDateString('pt-BR', options).replace(/(\w+)(,)/, "$1,");
    };

    const handleLogout = () => {
        removeNotification();
        onLogout();
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="header">
            <div className="header-content">
                <div className="left-section">
                    <div className="menu-container" ref={menuRef}>
                        <button className="menu-button" onClick={toggleMenu}>
                            <FaBars color={isMenuOpen ? 'green' : '#ffff'} />
                        </button>
                        {isMenuOpen && (
                            <nav className="menu">
                                <NavLink to="/dashboard" className="menu-item" state={{ description: pageDescriptions.dashboard }}>
                                    <FaHome /> Dashboard
                                </NavLink>
                                <NavLink to="/map-view" className="menu-item" state={{ description: pageDescriptions.mapView }}>
                                    <FaMapMarkedAlt /> Mapa
                                </NavLink>
                                <NavLink to="/manage" className="menu-item" state={{ description: pageDescriptions.manage }}>
                                    <FaCogs /> Gerenciar
                                </NavLink>
                                <NavLink to="/users" className="menu-item" state={{ description: pageDescriptions.users }}>
                                    <FaUsers /> Usuários
                                </NavLink>
                            </nav>
                        )}
                    </div>
                    <div className="user-info">
                        <span className="header-username">Olá, {user.firstName}, </span>
                        <span className="header-role">Perfil: {Array.isArray(user.role) ? user.role.join(', ') : ''}, </span>
                        <span className="header-cpf">CPF: {user.cpf}</span>
                    </div>
                </div>
                <h1 className="app-title">{currentPage || 'API MAPAS'}</h1>
                <div className="logout-container">
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                    <div className="date-and-token">
                        <div className="token-info"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}>
                            <FaClock className="clock-icon" />
                            {showTooltip && (
                                <div className="token-tooltip">
                                    <p>Token válido até:</p>a
                                    <p>{tokenExpiration}</p>
                                </div>
                            )}
                        </div>
                        <span>{getFormattedDate()}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderWithMenu;
