import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaMapMarkedAlt, FaCogs, FaUsers, FaBars } from 'react-icons/fa';
import './HeaderWithMenu.css';

const pageDescriptions = {
  dashboard: "**Visão geral das principais métricas e informações do sistema**",
  mapView: "**Visualização interativa de mapas e áreas geográficas**",
  manage: "**Gerenciamento de configurações e recursos do sistema**",
  users: "**Administração de usuários e permissões**"
};

const HeaderWithMenu = ({ username, role, cpf, firstName, onLogout, currentPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const getFormattedDate = () => {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return now.toLocaleDateString('pt-BR', options).replace(/(\w+)(,)/, "$1,");
    };

    const handleLogout = () => {
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
                            <FaBars color={isMenuOpen ? 'green' : '#ffff'}/>
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
                        <span className="header-username">Olá, {firstName}, </span>
                        <span className="header-role">Perfil: {Array.isArray(role) ? role.join(', ') : ''}, </span>
                        <span className="header-cpf">CPF: {cpf}</span>
                    </div>
                </div>
                <h1 className="app-title">{currentPage || 'API MAPAS'}</h1>
                <div className="logout-container">
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                    <div className="date">
                        <span>{getFormattedDate()}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderWithMenu;
