import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import api from '../services/api';
import GenericMapView, { formatPolygons } from './GenericMapView';

const MapView = () => {
    const [statePolygons, setStatePolygons] = useState([]);
    const [regionPolygons, setRegionPolygons] = useState([]);
    const [isMapReady, setIsMapReady] = useState(false);
    
    // Inicialize o featureGroupRef com useRef
    const featureGroupRef = useRef(null);

    // Busca dados para os polígonos de estado
    useEffect(() => {
        const fetchStatePolygons = async () => {
            try {
                const response = await api.get('/api/mongoData/polygonsEstado');
                const formattedPolygons = formatPolygons(response.data);  // Chama a função formatPolygons importada
                setStatePolygons(formattedPolygons);
            } catch (error) {
                console.error('Erro ao carregar os polígonos de estado:', error);
            }
        };

        fetchStatePolygons();
    }, []);

    // Busca dados para os polígonos de região
    useEffect(() => {
        const fetchRegionPolygons = async () => {
            try {
                const response = await api.get('/api/mongoData/polygons');
                const formattedPolygons = formatPolygons(response.data);  // Chama a função formatPolygons importada
                setRegionPolygons(formattedPolygons);
            } catch (error) {
                console.error('Erro ao carregar os polígonos de região:', error);
            }
        };

        fetchRegionPolygons();
    }, []);

    return (
        <div className="map-view-container">
            <h1 className="map-view-title">Visualização de Mapas</h1>
            <GenericMapView
                statePolygons={statePolygons}
                regionPolygons={regionPolygons}
                enableDrawControl={false}
                enableMiniMap={true}
                isMapReady={isMapReady}
                setIsMapReady={setIsMapReady}
                featureGroupRef={featureGroupRef}
            />
        </div>
    );
};

export default MapView;
