import React, { useEffect, useState } from 'react';
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

const FocusOnSelectedPolygon = ({ selectedPolygon, editing }) => {
    const map = useMap();
    useEffect(() => {
        if (selectedPolygon && selectedPolygon.centroid) {
            if (editing) {
                const currentZoom = map.getZoom(); // Obtém o zoom atual do mapa
                map.setView(selectedPolygon.centroid, currentZoom); // Mantém o zoom atual
            }
            else
                map.setView(selectedPolygon.centroid, 12);
        }

    }, [selectedPolygon, map, editing]);

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
    setPolygons,
    handleStopEdit,
    currentPolygon,
    setCurrentPolygon,
    setEditedPolygon,
    stopEditingPolygon,
    setIsMapReady,
    featureGroupRef,
    editMode,
    setEditMode,
    editing
}) => {
    // Ref callback para garantir a inicialização correta
    const [editableLayer, setEditableLayer] = useState(null);
    useEffect(() => {
        if (editMode && selectedPolygon && featureGroupRef.current) {
            // Remove any previous editable layer
            if (editableLayer) {
                featureGroupRef.current.removeLayer(editableLayer);
            }

            // Create a new layer for the selected polygon
            const layer = L.polygon(selectedPolygon.coordinates, {
                color: 'red',
                weight: 3,
                fillColor: 'rgba(255, 0, 0, 0.3)',
            });

            featureGroupRef.current.addLayer(layer);
            setEditableLayer(layer);

            // Enable editing on the created layer
            layer.editing.enable();

            // Add listener to capture changes
            layer.on('edit', () => {
                const updatedCoordinates = layer.getLatLngs().map((ring) =>
                    ring.map((latlng) => [latlng.lat, latlng.lng])
                );

                const updatedPolygon = {
                    ...selectedPolygon,
                    coordinates: updatedCoordinates,
                };

                setSelectedPolygon(updatedPolygon); // Update the selected polygon
                setEditedPolygon(updatedPolygon); // Sync the edited state
            });

            // Cleanup on unmount or when polygon changes
            return () => {
                layer.off('edit');
                featureGroupRef.current.removeLayer(layer); // Remove the layer from the map
            };
        }

        if (!editMode && editableLayer) {
            handleStopEdit(); // Stop editing if editMode is false
        }
    }, [editMode, selectedPolygon?.id, editableLayer?.id, featureGroupRef, setEditedPolygon, setSelectedPolygon?.id]);

    const renderPolygons = (polygons = [], layerName, selectedPolygon = null) => {
        const safePolygons = Array.isArray(polygons) ? polygons : [polygons];

        return (
            <LayerGroup key={`${layerName}-${safePolygons.length}`}>
                {selectedPolygon && (
                    <Polygon
                        key={`selected-${layerName}-${selectedPolygon?.mongoId || Math.random()}`}
                        positions={selectedPolygon.coordinates}
                        pathOptions={{
                            color: "red",
                            fillColor: "rgba(255, 0, 0, 0.3)",
                            weight: 3
                        }}
                    />
                )}
                {safePolygons.map((polygon) => {
                    const uniqueKey = `polygon-${polygon.mongoId || polygon.id}-${polygon.coordinates[0][0]}`;
                    return (
                        <Polygon
                            key={uniqueKey}
                            positions={polygon.coordinates}
                            pathOptions={{
                                color: polygon.color || 'blue',
                                fillColor: polygon.fillColor || 'rgba(0, 0, 255, 0.3)'
                            }}
                            eventHandlers={{
                                click: (e) => {
                                    const layer = e.target;
                                    const popupContent = `
                        <div>
                          <h4>${polygon.name || 'Sem Nome'}</h4>
                          <p>${polygon.description || 'Sem Descrição'}</p>
                          <p>Camada: ${layerName}</p>
                          <p>ID: ${polygon.mongoId || 'Sem ID'}</p>
                        </div>
                      `;
                                    layer.bindPopup(popupContent).openPopup();
                                }
                            }}
                        />
                    );
                })}
            </LayerGroup>
        );
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
                    // onEdited={(event) => handleEditPolygon(event)}
                    >
                        {/* {console.log('FeatureGroup ref:', featureGroupRef.current)} Verifica a referência */}
                        <EditControl
                            position="topright"
                            onCreated={onPolygonCreated}
                            draw={{
                                polygon: true,
                                polyline: false,
                                rectangle: false,
                                circle: false,
                                marker: false,
                                circlemarker: false,
                            }}
                            edit={{
                                featureGroup: featureGroupRef.current,
                                edit: false, // Permite edição
                                remove: false, // Permite remoção
                            }}
                        />
                    </FeatureGroup>

                )}


                {enableMiniMap && <MiniMapControl />}

                <FocusOnSelectedPolygon selectedPolygon={selectedPolygon} editing={editing} />
            </LayersControl>
        </MapContainer>
    );
};

export default GenericMapView;
export { formatPolygons, calculateCentroid, getValidatedCentroid, areCoordinatesDifferent };
