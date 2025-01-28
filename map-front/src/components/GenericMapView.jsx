import React, { useRef, useEffect, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Polygon,
    LayerGroup,
    LayersControl,
    FeatureGroup,
    useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-minimap/dist/Control.MiniMap.min.css';
import 'leaflet-minimap';
import 'leaflet-draw';
import { EditControl } from 'react-leaflet-draw';



// Função para formatar os polígonos
const formatPolygons = (data) => {
    return data
        .map((polygon) => {
            const coordinates = polygon.coordinates?.map((point) => {
                if (Array.isArray(point) && point.length === 2) {
                    return [point[0], point[1]];
                }
                console.warn('Ponto inválido:', point);
                return null;
            }).filter(Boolean);

            if (!coordinates || coordinates.length === 0) {
                console.warn('Polígono inválido:', polygon);
                return null;
            }

            return {
                coordinates,
                color: polygon.color || 'blue',
                fillColor: polygon.fillColor || 'rgba(0, 0, 255, 0.3)',
                description: polygon.description || '',
                name: polygon.name || '',
                mongoId: polygon.mongoId || ''
            };
        })
        .filter(Boolean);
};

// Função para calcular o centróide
const calculateCentroid = (coordinates) => {
    let totalLat = 0, totalLng = 0, totalPoints = 0;
    coordinates.forEach(([lat, lng]) => {
        totalLat += lat;
        totalLng += lng;
        totalPoints++;
    });
    return [totalLat / totalPoints, totalLng / totalPoints];
};

const FocusOnSelectedPolygon = ({ selectedPolygon }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedPolygon && selectedPolygon.centroid) {
            map.setView(selectedPolygon.centroid, 14); // Centraliza e ajusta o zoom
        }
    }, [selectedPolygon, map]);

    return null;
};

// Controle do MiniMapa
const MiniMapControl = () => {
    const map = useMap();

    useEffect(() => {
        if (map) {
            if (!map._miniMapControl) {
                const miniMap = new L.Control.MiniMap(
                    new L.TileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png"),
                    {
                        position: 'bottomright',
                        width: 200,
                        height: 200,
                    }
                );
                miniMap.addTo(map);
                map._miniMapControl = miniMap;
            }
        }
    }, [map]);

    return null;
};

// Componente principal
const GenericMapView = ({
    statePolygons,
    onPolygonCreated,
    enableMiniMap,
    regionPolygons,
    enableDrawControl,
    selectedPolygon,
    setSelectedPolygon,
    setEditedPolygon,
    isMapReady,
    setIsMapReady,
    featureGroupRef,
    editMode,
    setEditMode 
}) => {
    // Ref callback para garantir a inicialização correta
    const [editableLayer, setEditableLayer] = useState(null);
    const [activeLayer, setActiveLayer] = useState(null); // Camada ativa para edição

    // Atualizar a camada de edição quando o modo de edição for ativado
    useEffect(() => {
        if (editMode && selectedPolygon) {
            const layer = L.polygon(selectedPolygon.coordinates);

            // Adiciona o layer ao FeatureGroup
            featureGroupRef.current.addLayer(layer);
            setEditableLayer(layer);

            // Crie um FeatureGroup para edição
            const editableLayers = new L.FeatureGroup();
            editableLayers.addLayer(layer);

            // Tenta ativar a edição diretamente no Layer
            if (featureGroupRef.current?.leafletElement?.editTools) {
                featureGroupRef.current?.leafletElement?.editTools?.startEdit(editableLayers); // Inicia a edição
            }
        }
    }, [editMode, selectedPolygon]);

    const renderPolygons = (polygons = [], layerName, selectedPolygon = null) => {
        return (
            <LayerGroup key={layerName}>
                {selectedPolygon && (
                    <Polygon
                        key="selectedPolygon"
                        positions={selectedPolygon.coordinates}
                        color="red"
                        fillColor="rgba(255, 0, 0, 0.3)"
                        weight={3}

                    />
                )}
                {polygons.map((polygon, idx) => (
                    <Polygon
                        key={`${layerName}-${idx}`}
                        positions={polygon.coordinates}
                        color={polygon.color}
                        fillColor={polygon.fillColor}
                        onClick={() => handlePolygonClick(polygon.mongoId)}
                    />
                ))}
            </LayerGroup>
        );
    };

    const handleEditPolygon = (event) => {
        const layers = event.layers.getLayers();
        const updatedPolygons = layers.map((layer) => {
            const coordinates = layer.getLatLngs().map((ring) =>
                ring.map((latlng) => [latlng.lat, latlng.lng])
            );
            return {
                coordinates,
                mongoId: layer.mongoId,
            };
        });
        setEditedPolygon(updatedPolygons);
    };

    const handlePolygonClick = (mongoId) => {
        // Lógica para lidar com o clique no polígono, como selecionar o polígono, por exemplo
        console.log('Polígono clicado:', mongoId);

        // Se você deseja selecionar o polígono ao clicar:
        const selectedPolygon = regionPolygons.find((polygon) => polygon.mongoId === mongoId);
        setSelectedPolygon(selectedPolygon); // Supondo que você tenha uma função setSelectedPolygon
    };


    const handleCreatedPolygon = (event) => {
        const { layer } = event;

        // Certifique-se de que a referência está inicializada
        if (featureGroupRef.current) {
            const coordinates = layer.getLatLngs().map((ring) =>
                ring.map((latlng) => [latlng.lat, latlng.lng])
            );
            onPolygonCreated({ coordinates });

            // Adiciona o layer ao FeatureGroup
            featureGroupRef.current.addLayer(layer);
            console.log('Polígono adicionado ao FeatureGroup:', layer);
        } else {
            console.error('FeatureGroupRef não está inicializado.');
        }
    };


    return (
        <MapContainer
            center={[-20.2592, -40.2655]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            whenReady={() => setIsMapReady(true)}
            ref={featureGroupRef}
        >
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Mapa Padrão">
                    <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="OpenTopoMap">
                    <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="CartoDB (Tons Claros)">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Google Satélite">
                    <TileLayer
                        url="http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                        attribution="&copy; Google"
                        maxZoom={22}
                    />
                </LayersControl.BaseLayer>

                <LayersControl.Overlay checked name="Polígonos de Estado">
                    {renderPolygons(statePolygons, 'state')}
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Polígonos de Região">
                    {renderPolygons(regionPolygons, 'region')}
                </LayersControl.Overlay>

                {enableDrawControl && (
                    <FeatureGroup ref={featureGroupRef}>
                        <EditControl
                            position="topright"
                            onCreated={handleCreatedPolygon}
                            draw={{
                                polygon: true,
                                polyline: false,
                                rectangle: false,
                                circle: false,
                                marker: false,
                                circlemarker: false,
                            }}
                        />
                    </FeatureGroup>
                )}

                {enableMiniMap && <MiniMapControl />}

                <FocusOnSelectedPolygon selectedPolygon={selectedPolygon} />
            </LayersControl>
        </MapContainer>
    );
};

export default GenericMapView;
export { formatPolygons, calculateCentroid };
