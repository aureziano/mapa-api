import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import api from '../services/api';
import MiniMapControl from './GenericMapView'; // Usa o GenericMapView

const MapView = () => {
    const [polygons, setPolygons] = useState([]);

    // Busca dados para os polígonos
    useEffect(() => {
        const fetchPolygons = async () => {
            try {
                const areasResponse = await api.get('/areas');
                const formattedPolygons = areasResponse.data.map((area) => ({
                    coordinates: JSON.parse(area.geoJson),
                    color: 'blue',
                    fillColor: 'rgba(0, 0, 255, 0.3)',
                }));
                setPolygons(formattedPolygons);
            } catch (error) {
                console.error('Erro ao carregar os dados do mapa:', error);
            }
        };
        fetchPolygons();
    }, []);

    return (
        <div className="map-view-container">
            <h1 className="map-view-title">Visualização de Mapas</h1>
            <MiniMapControl polygons={polygons} /> {/* Passa os polígonos para o GenericMapView */}
        </div>
    );
};

export default MapView;
