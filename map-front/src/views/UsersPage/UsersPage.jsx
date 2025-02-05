import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import api, { setAuthToken } from '../../services/api';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        const token = localStorage.getItem('authToken');  // Garantir que o token esteja no localStorage
        if (token) {
            try {
                const response = await api.get('/api/users', {
                    headers: {
                        Authorization: `Bearer ${token}`  // Envia o token JWT no cabeçalho
                    }
                });
                setUsers(response.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    console.log('Token expirado ou inválido. Redirecionando para o login...');
                    localStorage.removeItem('authToken');
                    setError('Sua sessão expirou. Faça login novamente.');
                    navigate('/login');
                } else {
                    console.error("Erro ao buscar usuários:", err.message);
                    setError('Erro ao buscar usuários: ' + err.message);
                }
            }
        } else {
            setError('Você precisa estar logado para acessar esta página.');
            navigate('/login');
        }
    }, [navigate]);
    

    useEffect(() => {
        // Impede múltiplas execuções do useEffect
        let isMounted = true;

        const checkAndFetchUsers = async () => {
            if (!user.isLoggedIn) {
                setError('Você precisa estar logado para acessar esta página.');
                navigate('/');
                return;
            }

            if (!user.role.includes('ROLE_ADMIN')) {
                setError('Você não tem permissão para acessar esta página.');
                navigate('/');
                return;
            }

            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Você precisa estar logado para acessar esta página.');
                navigate('/login');
                return;
            }

            setAuthToken(token);

            if (isMounted) {
                await fetchUsers();
            }
        };

        checkAndFetchUsers();

        return () => {
            isMounted = false;
        };
    }, [user, navigate, fetchUsers]);

    return (
        <div className="users-page">
            <h1>Lista de Usuários</h1>
            {error ? (
                <p>{error}</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>CPF</th>
                            <th>Roles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{user.cpf}</td>
                                <td>{user.roles.map((role) => role.name).join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UsersPage;
