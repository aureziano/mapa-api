import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaUser, FaCogs } from 'react-icons/fa'; // Importando ícones
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Dashboard</h1>
            <div className="dashboard-grid">
                {/* Botão Visualizar Mapas */}
                <div className="dashboard-card" onClick={() => navigate('/map-view')}>
                    <FaMapMarkerAlt size={50} />
                    <p>Visualizar Mapas</p>
                </div>
                {/* Botão Gerenciar Pontos/Áreas */}
                <div className="dashboard-card" onClick={() => navigate('/manage')}>
                    <FaCogs size={50} />
                    <p>Gerenciar Pontos/Áreas</p>
                </div>
                {/* Botão Gerenciar Usuários */}
                <div className="dashboard-card" onClick={() => navigate('/users')}>
                    <FaUser size={50} />
                    <p>Gerenciar Usuários</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
