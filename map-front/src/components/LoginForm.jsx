import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';
import { useNotification } from "./NotificationProvider";
import './LoginForm.css';

const LoginForm = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/auth/login', { 
                username: cleanCPF(username), 
                password 
            });
    
            if (response.data?.accessToken && response.data?.refreshToken) {
                const { accessToken, refreshToken } = response.data;
                
                localStorage.setItem('authToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                setAuthToken(accessToken);
    
                if (typeof onLoginSuccess === 'function') {
                    onLoginSuccess(accessToken);
                }
                addNotification("Login bem-sucedido!", "sucess");
            } else {
                addNotification("Resposta inválida do servidor", "error");
            }
        } catch (error) {
            if (error.response) {
                // Erros 4xx/5xx
                addNotification(error.response.data?.message || "Credenciais inválidas", "error");
            } else if (error.request) {
                // Sem resposta do servidor
                addNotification("Servidor não respondeu", "error");
            } else {
                // Erros de configuração
                addNotification("Erro ao configurar requisição", "error");
            }
        }
    };
    
    const handleRegisterRedirect = () => {
        navigate('/register');
    };

    const formatCPF = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
        if (match) {
          return !match[2] ? match[1] 
               : !match[3] ? `${match[1]}.${match[2]}`
               : !match[4] ? `${match[1]}.${match[2]}.${match[3]}`
               : `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
        }
        return cleaned;
      };
      
      const cleanCPF = (cpf) => cpf.replace(/\D/g, '');
      

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">Login</h1>
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        className="login-input"
                        type="text"
                        placeholder="CPF"
                        value={username}
                        onChange={(e) => setUsername(formatCPF(e.target.value))}
                        maxLength={14}
                        required
                    />
                    <input
                        className="login-input"
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="login-button" type="submit">
                        Login
                    </button>
                </form>
                <button className="register-link" onClick={handleRegisterRedirect}>
                    Registrar-se
                </button>
            </div>
        </div>
    );
};

export default LoginForm;
