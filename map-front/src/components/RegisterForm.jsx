import React, { useState } from 'react';
import api from '../services/api';
import { useNotification } from './NotificationProvider';
import './RegisterForm.css';

const RegisterForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const { addNotification, setLoading } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidCPF(cpf)) {
            addNotification('CPF inválido', 'error');
            return;
        }
        try {
            await api.post('/users/register', {
                firstName,
                lastName,
                email,
                cpf: cleanCPF(cpf),
                password
            });
            alert('Registro realizado com sucesso! Você pode agora fazer login.');
        } catch (error) {
            alert('Erro ao registrar usuário: ' + error.response?.data?.message || error.message);
        }
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

      const isValidCPF = (cpf) => {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) 
            sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        sum = 0;
        for (let i = 1; i <= 10; i++) 
            sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    };
    
      
      const cleanCPF = (cpf) => cpf.replace(/\D/g, '');
      

    return (
        <div className="register-container">
            <div className="register-box">
                <h1 className="register-title">Registrar</h1>
                <form onSubmit={handleSubmit} className="register-form">
                    <input
                        className="register-input"
                        type="text"
                        placeholder="Nome"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <input
                        className="register-input"
                        type="text"
                        placeholder="Sobrenome"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                    <input
                        className="register-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="register-input"
                        type="text"
                        placeholder="CPF"
                        value={cpf}
                        onChange={(e) => setCpf(formatCPF(e.target.value))}
                        maxLength={14}
                        required
                    />
                    <input
                        className="register-input"
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="register-button" type="submit">
                        Registrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
