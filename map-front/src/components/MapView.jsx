import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import api from '../services/api';
import GenericMapView, { formatPolygons } from './GenericMapView';

const MapView = () => {
    const [statePolygons, setStatePolygons] = useState([]);
    const [regionPolygons, setRegionPolygons] = useState([]);
    const [isMapReady, setIsMapReady] = useState(false);
    
    const featureGroupRef = useRef(null);

    useEffect(() => {
        const fetchStatePolygons = async () => {
            try {
                const response = await api.get('/api/mongoData/polygonsEstado');
                const formattedPolygons = formatPolygons(response.data);
                setStatePolygons(formattedPolygons);
            } catch (error) {
                console.error('Erro ao carregar os polígonos de estado:', error);
            }
        };

        fetchStatePolygons();
    }, []);

    useEffect(() => {
        const fetchRegionPolygons = async () => {
            try {
                const response = await api.get('/api/mongoData/polygons');
                const formattedPolygons = formatPolygons(response.data);
                setRegionPolygons(formattedPolygons);
            } catch (error) {
                console.error('Erro ao carregar os polígonos de região:', error);
            }
        };

        fetchRegionPolygons();
    }, []);

    return (
        <div className="map-view-container">
            
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
