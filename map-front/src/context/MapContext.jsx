import React, { createContext, useContext, useState } from 'react';

// Criando o Contexto
const MapContext = createContext();

export const MapContextProvider = ({ children }) => {
  const [map, setMap] = useState(null); // Armazena a instância do mapa
  const [isMapReady, setIsMapReady] = useState(false); // Verifica se o mapa está pronto

  // Função chamada quando o mapa é criado
  const setMapInstance = (mapInstance) => {
    setMap(mapInstance);  // Salva a instância do mapa
    setIsMapReady(true);   // Marca o mapa como pronto
    console.log('Mapa inicializado:', mapInstance); // Debug
  };

  // Função para fazer o flyTo
  const flyTo = (coordinates, zoomLevel = 13) => {
    if (map) {
      map.flyTo(coordinates, zoomLevel); // Mover o mapa para as coordenadas fornecidas
    } else {
      console.error("Erro: O mapa não está inicializado.");
    }
  };

  return (
    <MapContext.Provider value={{ flyTo, map, setMapInstance, isMapReady }}>
      {children}
    </MapContext.Provider>
  );
};

// Hook para usar o contexto
export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapContextProvider');
  }
  return context;
};
