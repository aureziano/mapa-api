import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MiniMap from 'leaflet-minimap'; // Minimap plugin
import './Control.MiniMap.css'; // CSS para o minimapa
import './MapView.css'; // CSS para o componente do mapa

// Componente para o minimapa
const MinimapControl = () => {
    const map = useMap();
    const minimapRef = useRef(null);

    useEffect(() => {
        if (!minimapRef.current) {
            minimapRef.current = new MiniMap(
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
                {
                    toggleDisplay: true,
                    position: 'bottomright',
                    width: 100,
                    height: 100,
                }
            );
            minimapRef.current.addTo(map);
        }
        // Cleanup para evitar múltiplas instâncias
        return () => {
            if (minimapRef.current) {
                minimapRef.current.remove();
                minimapRef.current = null;
            }
        };
    }, [map]);

    return null;
};

// Função para converter string de coordenadas em um array
const parseCoordinates = (coordinatesString) => {
    if (!coordinatesString) return [];
    return coordinatesString.split(' ').map((coord) => {
        const [lng, lat] = coord.split(',').map(parseFloat); // Inverte para Leaflet (lat, lng)
        return [lat, lng];
    });
};

// Componente genérico do mapa
const GenericMapView = ({ polygons = [] }) => {
    return (
        <MapContainer 
            className="map-view"
            center={[-20.2592, -40.2655]}
            zoom={13}>
            {/* Controle de camadas */}
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                        url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="OpenTopoMap">
                    <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="CartoDB (Tons Claros)">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="CartoDB (Tons Escuros)">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="Google Satélite">
                    <TileLayer
                        url="http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                        attribution="&copy; Google"
                        maxZoom={22}
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="Imagem de Satélite (Esri)">
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                </LayersControl.BaseLayer>
            </LayersControl>

            {/* Minimap */}
            <MinimapControl />

            {/* Polígonos */}
            {polygons.length > 0 ? (
                polygons.map((polygon, index) => (
                    <Polygon
                        key={index}
                        positions={parseCoordinates(polygon.coordinates)}
                        pathOptions={{
                            color: polygon.color || 'blue',
                            fillColor: polygon.fillColor || 'rgba(0, 0, 255, 0.3)',
                            weight: 2,
                        }}
                    />
                ))
            ) : (
                <p className="map-empty-message">Nenhum polígono disponível</p>
            )}
        </MapContainer>
    );
};

export default GenericMapView;
