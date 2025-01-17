import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaMapMarkedAlt, FaCogs, FaUsers } from 'react-icons/fa'; // Ícones para os itens
import './HeaderWithMenu.css';

const HeaderWithMenu = ({ username, role, cpf, firstName, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null); // Referência para o menu
    const navigate = useNavigate();

    // Função para obter a data no formato solicitado
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

    // Fecha o menu se clicar fora dele
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
                {/* Botão de Menu no extremo esquerdo */}
                <div className="menu-container" ref={menuRef}>
                    {/* Botão para abrir/fechar o menu */}
                    <button className="menu-button" onClick={toggleMenu}>
                        {isMenuOpen ? 'Fechar Menu' : 'Abrir Menu'}
                    </button>

                    {/* Texto do usuário abaixo do botão */}
                    <div className="user-info">
                        <span className="header-username">Olá, {firstName}, </span>
                        <span className="header-role">Perfil: {role.join(', ')}, </span>
                        <span className="header-cpf">CPF: {cpf}</span>
                    </div>

                    {/* Menu de navegação */}
                    {isMenuOpen && (
                        <nav className="menu">
                            <NavLink to="/dashboard" className="menu-item">
                                <FaHome /> Dashboard
                            </NavLink>
                            <NavLink to="/map-view" className="menu-item">
                                <FaMapMarkedAlt /> Mapa
                            </NavLink>
                            <NavLink to="/manage" className="menu-item">
                                <FaCogs /> Gerenciar
                            </NavLink>
                            <NavLink to="/users" className="menu-item">
                                <FaUsers /> Usuários
                            </NavLink>
                        </nav>
                    )}
                </div>

                {/* Botão de Logout à direita */}
                <div className="logout-container">
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>

                    {/* Exibindo a data formatada abaixo do logout */}
                    <div className="date">
                        <span>{getFormattedDate()}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderWithMenu;
