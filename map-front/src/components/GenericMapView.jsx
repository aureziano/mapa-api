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
import { useNotification } from './NotificationProvider';


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
                id: polygon.id || '',
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

const getValidatedCentroid = (polygon) => {
    const centroid = calculateCentroid(polygon.coordinates);
    if (!centroid || !Array.isArray(centroid) || centroid.length !== 2) {
        console.error('Centróide inválido.');
        return null;
    }
    return centroid;
};

const areCoordinatesDifferent = (coordinates1, coordinates2) => {
    if (coordinates1.length !== coordinates2.length) {
        return true;
    }

    for (let i = 0; i < coordinates1.length; i++) {
        const point1 = coordinates1[i];
        const point2 = coordinates2[i];

        // Verifique se a diferença nas coordenadas é significativa (ajuste a tolerância conforme necessário)
        if (Math.abs(point1[0] - point2[0]) > 0.000001 || Math.abs(point1[1] - point2[1]) > 0.000001) {
            return true;
        }
    }
    return false;
};

const FocusOnSelectedPolygon = ({ selectedPolygon }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedPolygon && selectedPolygon.centroid) {
            map.setView(selectedPolygon.centroid, 12); // Centraliza e ajusta o zoom
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
    setPolygons,
    polygons,
    setSelectedPolygon,
    currentPolygon,
    setCurrentPolygon,
    setEditedPolygon,
    isMapReady,
    setIsMapReady,
    featureGroupRef,
    editMode,
    setEditMode
}) => {
    // Ref callback para garantir a inicialização correta
    const { addNotification } = useNotification();
    const [editableLayer, setEditableLayer] = useState(null);

    useEffect(() => {
        // Ativar edição no polígono selecionado
        if (editMode && selectedPolygon && featureGroupRef.current) {
            // Remove qualquer camada de edição anterior
            if (editableLayer) {
                featureGroupRef.current.removeLayer(editableLayer);
            }

            // Criar um novo layer para o polígono selecionado
            const layer = L.polygon(selectedPolygon.coordinates, {
                color: 'red',
                weight: 3,
                fillColor: 'rgba(255, 0, 0, 0.3)',
            });

            featureGroupRef.current.addLayer(layer);
            setEditableLayer(layer);

            // Ativar edição no layer criado
            layer.editing.enable();

            // Adicionar listener para capturar alterações no polígono
            layer.on('edit', () => {
                const updatedCoordinates = layer.getLatLngs().map((ring) =>
                    ring.map((latlng) => [latlng.lat, latlng.lng])
                );

                // Atualizar o estado com as novas coordenadas
                const updatedPolygon = {
                    ...selectedPolygon,
                    coordinates: updatedCoordinates,
                };

                setSelectedPolygon(updatedPolygon); // Atualiza o polígono selecionado
                setEditedPolygon(updatedPolygon); // Mantém o estado de edição sincronizado
            });

            return () => {
                // Limpar o listener ao desmontar ou quando o polígono mudar
                layer.off('edit');
            };
        }
    }, [editMode, selectedPolygon]);

    const renderPolygons = (polygons = [], layerName, selectedPolygon = null) => {
        const safePolygons = Array.isArray(polygons) ? polygons : [polygons];

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
                {safePolygons.map((polygon, idx) => (
                    <Polygon
                        key={`${layerName}-${idx}`}
                        positions={polygon.coordinates}
                        color={polygon.color || 'blue'}
                        fillColor={polygon.fillColor || 'rgba(0, 0, 255, 0.3)'}
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
                mongoId: selectedPolygon?.mongoId,
                name: selectedPolygon?.name,
                description: selectedPolygon?.description,
            };
        });

        // Atualizar selectedPolygon com as novas coordenadas
        setSelectedPolygon({
            ...selectedPolygon,
            coordinates: updatedPolygons[0].coordinates,
        });

        // Atualizar currentPolygon com as novas coordenadas
        setCurrentPolygon({
            ...currentPolygon,
            coordinates: updatedPolygons[0].coordinates,
        });

        console.log('Polígono editado', updatedPolygons[0]);
    };

    const handlePolygonClick = (mongoId) => {
        const polygon = regionPolygons.find((p) => p.mongoId === mongoId);

        if (polygon) {
            setSelectedPolygon(polygon);
            setEditMode(true);
            addNotification('Editando o polígono selecionado!', 'info');
        } else {
            console.error('Polígono não encontrado:', mongoId);
        }
    };

    const handleCreatedPolygon = (event) => {
        console.log("veio aqui!!!!")
        const { layer } = event;

        if (featureGroupRef.current) {
            const coordinates = layer.getLatLngs().map((ring) =>
                ring.map((latlng) => [latlng.lat, latlng.lng])
            );
            onPolygonCreated({ coordinates });
            featureGroupRef.current.addLayer(layer);
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
                    {renderPolygons(regionPolygons, 'region', selectedPolygon)}
                </LayersControl.Overlay>

                {enableDrawControl && (
                    <FeatureGroup
                        ref={featureGroupRef}
                        onEdited={(event) => handleEditPolygon(event)}
                    >
                        {/* {console.log('FeatureGroup ref:', featureGroupRef.current)} Verifica a referência */}
                        <EditControl
                            position="topright"
                            onCreated={handleCreatedPolygon}
                            onEdited={handleEditPolygon}
                            draw={{
                                polygon: true,
                                polyline: false,
                                rectangle: false,
                                circle: false,
                                marker: false,
                                circlemarker: false,
                            }}
                            edit={{
                                featureGroup: featureGroupRef.current, // Camadas disponíveis para edição
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
export { formatPolygons, calculateCentroid, getValidatedCentroid, areCoordinatesDifferent };
