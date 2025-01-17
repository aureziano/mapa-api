import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import api from '../services/api';
import MiniMapControl from './MinimapControl'; // Usa o GenericMapView
import axios from 'axios'; // Biblioteca para chamadas HTTP

const MapView = () => {
    const [polygons, setPolygons] = useState([]);

    // Busca dados para os polígonos
    useEffect(() => {
        const fetchPolygons = async () => {
            try {
                const areasResponse = await api.get('/areas');
                const formattedPolygons = areasResponse.data.map((area) => ({
                    coordinates: JSON.parse(area.geoJson), // Assumindo que os dados já são GeoJSON válidos
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

    // Função para converter coordenadas de GeoJSON para string
    const convertCoordinatesToString = (coordinates) => {
        return coordinates
            .map((polygon) => 
                polygon.map(([longitude, latitude]) => `${longitude},${latitude}`).join(" ")
            )
            .join(";");
    };

    // Função para enviar as coordenadas ao banco
    const handleSaveCoordinates = async () => {
        // Exemplo de coordenadas extraídas do polígono carregado
        const coordinatesString = convertCoordinatesToString(polygons.map(p => p.coordinates));
        
        try {
            const response = await axios.post('http://localhost:8080/areaCoordinates', {
                coordinates: coordinatesString,
            });
            console.log("Coordenadas salvas:", response.data);
            alert("Coordenadas salvas no banco com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar as coordenadas:", error);
            alert("Falha ao salvar as coordenadas.");
        }
    };

    return (
        <div className="map-view-container">
            <h1 className="map-view-title">Visualização de Mapas</h1>
            <MiniMapControl polygons={polygons} /> {/* Passa os polígonos para o GenericMapView */}
            
            {/* Botão para salvar as coordenadas */}
            <button onClick={handleSaveCoordinates} className="save-button">
                Salvar Coordenadas no Banco
            </button>
        </div>
    );
};

export default MapView;
