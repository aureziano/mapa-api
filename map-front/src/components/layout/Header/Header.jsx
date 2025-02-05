import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ username, role, cpf, firstName, onLogout }) => {
    const navigate = useNavigate();

    // Função de logout
    const handleLogout = () => {
        localStorage.removeItem('authToken'); // Remove o token
        onLogout(); // Chama a função de logout passada como prop
        navigate('/'); // Redireciona para a página de login
    };

    return (
        <header>
            <h1>Bem-vindo, {firstName}!</h1>
            <p>Email: {username}</p>
            <p>CPF: {cpf}</p>
            <p>Roles: {role.join(', ')}</p>
            <button onClick={onLogout}>Sair</button>
        </header>
    );
};

export default Header;
