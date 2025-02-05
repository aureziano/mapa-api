import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../components/layout/Notification/NotificationProvider';
import { FaTimes, FaEdit, FaEye, FaTrash, FaAtlas, FaSave, FaUserPlus } from 'react-icons/fa';
import './ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        cpf: '',
        password: '',
        roles: ['ROLE_USER']
    });
    const { user } = useUser();
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const [userTokenValidity, setUserTokenValidity] = useState({});


    const fetchUsers = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Você precisa estar logado para acessar esta página.');
            navigate('/login');
            return;
        }

        try {
            const response = await api.get('/api/users/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const validUsers = response.data.filter(user => user.id != null);
            setUsers(validUsers);
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
    }, [navigate]);

    useEffect(() => {
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

        fetchUsers();
    }, [user, navigate, fetchUsers]);

    // Função de formatação de tempo
    const formatTime = (seconds) => {
        if (seconds <= 0) return '00:00:00';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return [hours, minutes, secs]
            .map(v => v < 10 ? "0" + v : v)
            .join(":");
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('Token não encontrado');
                return;
            }
            try {
                await api.delete(`/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers((prevUsers) => prevUsers.filter(user => user.id !== userId));
                addNotification('Usuário excluído com sucesso!', 'sucess');
            } catch (err) {
                console.error('Erro ao excluir usuário:', err);
                addNotification('Erro ao excluir usuário', 'error');
            }
        }
    };

    const handleEditUser = (user) => {
        setEditingUser({ ...user, password: '' });
        setViewingUser(null);
        setIsCreating(false);
    };

    const handleViewUser = async (user) => {
        try {
            const response = await api.get(`/api/auth/token-validity/${user.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            });

            setUserTokenValidity(prev => ({
                ...prev,
                [user.id]: {
                    access: response.data.accessTokenValidity,
                    refresh: response.data.refreshTokenValidity
                }
            }));

            setViewingUser(user);
        } catch (error) {
            console.error('Erro ao buscar validade dos tokens:', error);
            addNotification('Não foi possível obter informações dos tokens', 'error');
        }
    };

    const handleSaveUser = async (updatedUser) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Token não encontrado');
            return;
        }
        console.log("updatedUser", updatedUser);
        try {
            const response = await api.put(`/api/users/${updatedUser.id}`, updatedUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === updatedUser.id ? response.data : user
                )
            );
            setEditingUser(null);
            addNotification('Usuário atualizado com sucesso!', 'sucess');
        } catch (err) {
            addNotification('Erro ao atualizar usuário!', 'error');
            console.error('Erro ao atualizar usuário:', err);
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setIsCreating(false);
    };

    const handleCreateUser = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Token não encontrado');
            return;
        }

        const cleanedCpf = newUser.cpf.replace(/\D/g, '');
        if (!isValidCPF(cleanedCpf)) {
            addNotification('CPF inválido', 'error');
            return;
        }

        try {
            const response = await api.post('/api/users/register', {
                ...newUser,
                cpf: cleanedCpf
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsers((prevUsers) => [...prevUsers, response.data]);
            setIsCreating(false);
            setNewUser({
                firstName: '',
                lastName: '',
                email: '',
                cpf: '',
                password: '',
                roles: ['ROLE_USER']
            });
            addNotification('Usuário criado com sucesso!', 'sucess');
        } catch (err) {
            console.error('Erro ao criar usuário:', err);
            addNotification('Erro ao criar usuário', 'error');
        }
    };

    const isValidCPF = (cpf) => {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++)
            sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        remainder = (sum * 10) % 11;

        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++)
            sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;

        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    };

    return (
        <div className="manage-container">
            <h1 className="manage-title"><FaAtlas /> Gerenciar Usuários</h1>
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="manage-section">
                    <button className="create-user-button" onClick={() => setIsCreating(true)}>
                        <FaUserPlus /> Criar Novo Usuário
                    </button>
                    <table className="manage-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Sobrenome</th>
                                <th>Email</th>
                                <th>CPF</th>
                                <th>Roles</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user.id ?? `user-${index}`}>
                                    <td>{editingUser?.id === user.id ? (
                                        <input
                                            value={editingUser.firstName}
                                            onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                        />
                                    ) : (
                                        user.firstName
                                    )}</td>
                                    <td>{editingUser?.id === user.id ? (
                                        <input
                                            value={editingUser.lastName}
                                            onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                        />
                                    ) : (
                                        user.lastName
                                    )}</td>
                                    <td>{editingUser?.id === user.id ? (
                                        <input
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        />
                                    ) : (
                                        user.email
                                    )}</td>
                                    <td>{editingUser?.id === user.id ? (
                                        <input
                                            value={editingUser.cpf}
                                            onChange={(e) => setEditingUser({ ...editingUser, cpf: e.target.value })}
                                        />
                                    ) : (
                                        user.cpf
                                    )}</td>
                                    <td>
                                        {editingUser?.id === user.id ? (
                                            <select
                                                value={editingUser.roles[0]}
                                                onChange={(e) => setEditingUser({ ...editingUser, roles: [e.target.value] })}
                                            >
                                                <option value="ROLE_USER">User</option>
                                                <option value="ROLE_ADMIN">Admin</option>
                                            </select>
                                        ) : (
                                            Array.isArray(user.roles) ? user.roles.join(', ') : 'Nenhuma role atribuída'
                                        )}
                                    </td>
                                    <td>
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <button className="icon-btn" onClick={() => handleSaveUser(editingUser)}><FaSave /></button>
                                                <button className="icon-btn" onClick={handleCancelEdit}><FaTimes /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="icon-btn" onClick={() => handleViewUser(user)}><FaEye /></button>
                                                <button className="icon-btn" onClick={() => handleEditUser(user)}><FaEdit /></button>
                                                <button className="icon-btn" onClick={() => handleDeleteUser(user.id)}><FaTrash /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {viewingUser && (
                <div className="user-details-modal">
                    <h2>Detalhes do Usuário</h2>
                    <p><strong>Nome:</strong> {viewingUser.firstName}</p>
                    <p><strong>Sobrenome:</strong> {viewingUser.lastName}</p>
                    <p><strong>Email:</strong> {viewingUser.email}</p>
                    <p><strong>CPF:</strong> {viewingUser.cpf}</p>
                    <p><strong>Roles:</strong> {viewingUser.roles.join(', ')}</p>

                    <div className="token-info-section">
                        <h3>Informações de Sessão</h3>
                        <div className="token-timers">
                            <div className="token-timer">
                                <span className="timer-label">Access Token:</span>
                                <span className="timer-value">
                                    {formatTime(userTokenValidity[viewingUser.id]?.access || 0)}
                                </span>
                            </div>
                            <div className="timer-divider"></div>
                            <div className="token-timer">
                                <span className="timer-label">Refresh Token:</span>
                                <span className="timer-value">
                                    {formatTime(userTokenValidity[viewingUser.id]?.refresh || 0)}
                                </span>
                            </div>
                        </div>
                    </div>


                    <button onClick={() => setViewingUser(null)}>
                        <FaTimes /> Fechar
                    </button>
                </div>
            )}
            {isCreating && (
                <div className="create-user-modal">
                    <h2>Criar Novo Usuário</h2>
                    <input
                        placeholder="Nome"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    />
                    <input
                        placeholder="Sobrenome"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    />
                    <input
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                    <input
                        placeholder="CPF"
                        value={newUser.cpf}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            const formattedValue = rawValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                            setNewUser({ ...newUser, cpf: formattedValue });
                        }}
                        maxLength={14}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    <select
                        value={newUser.roles[0]}
                        onChange={(e) => setNewUser({ ...newUser, roles: [e.target.value] })}
                    >
                        <option value="ROLE_USER">User</option>
                        <option value="ROLE_ADMIN">Admin</option>
                    </select>
                    <button onClick={handleCreateUser}>Criar Usuário</button>
                    <button onClick={() => setIsCreating(false)}><FaTimes /> Cancelar</button>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
