import React, { useState } from 'react';
import api from '../services/api';
import './RegisterForm.css';

const RegisterForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/register', {
                firstName,
                lastName,
                email,
                cpf,
                password
            });
            alert('Registro realizado com sucesso! Você pode agora fazer login.');
        } catch (error) {
            alert('Erro ao registrar usuário: ' + error.response?.data?.message || error.message);
        }
    };

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
                        onChange={(e) => setCpf(e.target.value)}
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
