import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ManagePointsAreas.css';

const ManagePointsAreas = () => {
    const [points, setPoints] = useState([]);
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pointsResponse = await api.get('/points');
                const areasResponse = await api.get('/areas');
                setPoints(pointsResponse.data);
                setAreas(areasResponse.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };
        fetchData();
    }, []);

    const handleDeletePoint = async (id) => {
        try {
            await api.delete(`/points/${id}`);
            setPoints(points.filter((point) => point.id !== id));
        } catch (error) {
            console.error('Erro ao excluir ponto:', error);
        }
    };

    const handleDeleteArea = async (id) => {
        try {
            await api.delete(`/areas/${id}`);
            setAreas(areas.filter((area) => area.id !== id));
        } catch (error) {
            console.error('Erro ao excluir área:', error);
        }
    };

    return (
        <div className="manage-container">
            <h1 className="manage-title">Gerenciar Pontos e Áreas</h1>
            <div className="manage-section">
                <h2>Pontos</h2>
                <table className="manage-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {points.map((point) => (
                            <tr key={point.id}>
                                <td>{point.name}</td>
                                <td>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeletePoint(point.id)}
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="manage-section">
                <h2>Áreas</h2>
                <table className="manage-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areas.map((area) => (
                            <tr key={area.id}>
                                <td>{area.name}</td>
                                <td>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteArea(area.id)}
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagePointsAreas;
