import React, { useState, useEffect } from 'react';
import api from '../services/api';  // Seu serviço de API
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './ManageUsers.css';  // Estilo para o componente

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useUser();  // Pega o usuário do contexto
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!user.isLoggedIn) {
                setError('Você precisa estar logado para acessar esta página.');
                navigate('/login');
                return;
            }

            if (!user.role || !user.role.includes('ROLE_ADMIN')) {
                setError('Você não tem permissão para acessar esta página.');
                navigate('/');
                return;
            }

            const token = localStorage.getItem('authToken');
            // console.log('Token JWT:', token);  // Verifique o valor do token aqui
            if (!token) {
                setError('Você precisa estar logado para acessar esta página.');
                navigate('/login');
                return;
            }

            try {
                const response = await api.get('/api/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Dados dos usuários:', response.data);
                setUsers(response.data);
            } catch (err) {
                console.error('Erro ao buscar usuários:', err);
                if (err.response?.status === 401) {
                    setError('Sua sessão expirou. Faça login novamente.');
                    localStorage.removeItem('authToken');
                    navigate('/login');
                } else {
                    setError('Erro ao buscar usuários. Tente novamente.');
                }
            }
        };

        fetchData();
    }, [user, navigate]);

    const handleDeleteUser = async (userId) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Token não encontrado');
            return;
        }

        try {
            // Envia a requisição DELETE para excluir o usuário
            await api.delete(`/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers((prevUsers) => prevUsers.filter(user => user.id !== userId));
        } catch (err) {
            console.error('Erro ao excluir usuário:', err);
        }
    };

    return (
        <div className="manage-container">
            <h1 className="manage-title">Gerenciar Usuários</h1>
            {error ? (
                <p>{error}</p>
            ) : (
                <div className="manage-section">
                    <h2>Usuários</h2>
                    <table className="manage-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Roles</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.firstName} {user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {/* Verifica se user.roles é um array e exibe as roles diretamente */}
                                        {Array.isArray(user.roles) ? user.roles.join(', ') : 'Nenhuma role atribuída'}
                                    </td>
                                    <td>
                                        <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}
        </div>
    );
};

export default ManageUsers;
