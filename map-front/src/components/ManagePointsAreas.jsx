import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes, FaEdit, FaEye, FaTrash, FaAtlas } from 'react-icons/fa';
import api from '../services/api';
import { useNotification } from './NotificationProvider';
import GenericMapView, { formatPolygons, calculateCentroid } from './GenericMapView';
import L from 'leaflet';
import './ManagePointsAreas.css';
// import { useMap } from 'react-leaflet';

const ManagePointsAreas = () => {
  const [polygons, setPolygons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [areaInCreation, setAreaInCreation] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedPolygon] = useState(null);
  const { addNotification } = useNotification();

  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const [isLayersReady, setIsLayersReady] = useState(false);

  const featureGroupRef = useRef(null);


  // // Usando useEffect para garantir que os layers sejam carregados corretamente
  // useEffect(() => {
  //   if (featureGroupRef.current) {
  //     const layers = featureGroupRef.current.getLayers();
  //     console.log('Verificando layers:', layers);

  //     if (layers.length > 0) {
  //       setIsLayersReady(true);  // Atualiza quando os layers estiverem prontos
  //     }
  //   }
  // }, [featureGroupRef]);  // Quando o FeatureGroup é alterado, verifica os layers

  // // Agora, usar o isLayersReady para garantir que os layers estão prontos
  // useEffect(() => {
  //   if (isLayersReady) {
  //     console.log('Layers prontos. Você pode editar os polígonos.');
  //   } else {
  //     console.log('Aguardando layers no FeatureGroup...');
  //   }
  // }, [isLayersReady]);


  useEffect(() => {
    const fetchRegionPolygons = async () => {
      try {
        const response = await api.get('/api/mongoData/polygons');
        const formattedPolygons = formatPolygons(response.data || []).map((polygon) => ({
          ...polygon,
          mongoId: polygon.mongoId,  // Adicionando o mongoId para cada polígono
        }));
        setPolygons(formattedPolygons);
      } catch (error) {
        console.error('Erro ao carregar os polígonos de região:', error);
      }
    };

    fetchRegionPolygons();
  }, []);

  // No método de criação do polígono dentro de GenericMapView:
  const handlePolygonCreated = (polygonData) => {
    const newPolygon = {
      coordinates: polygonData.coordinates,
      color: 'blue',
      fillColor: 'rgba(0, 0, 255, 0.3)',
      mongoId: polygonData.id,  // Aqui estamos passando o mongoId para a camada
    };

    const layer = L.polygon(newPolygon.coordinates, {
      color: newPolygon.color,
      fillColor: newPolygon.fillColor,
      mongoId: newPolygon.mongoId, // Atribuindo mongoId ao layer
    });

    featureGroupRef.current.addLayer(layer);
    setPolygons([...polygons, newPolygon]);
  };


  const handleSaveArea = async () => {
    if (!name || !description) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const coordinatesString = JSON.stringify(
        editedPolygon || currentPolygon.coordinates // Use as coordenadas editadas se disponíveis
      );

      if (editMode) {
        await api.put(
          `/api/areas/${currentPolygon.mongoId}`,
          { name, description, coordinatesString },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addNotification('Área editada com sucesso!', 'success');
      } else {
        const mongoResponse = await api.post(
          '/api/areas/areaCoordinates',
          { coordinatesString },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const mongoId = mongoResponse.data.id;
        await api.post(
          '/api/areas',
          { name, description, mongoId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addNotification('Área salva com sucesso!', 'success');
      }

      const response = await api.get('/api/mongoData/polygons', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPolygons(formatPolygons(response.data || []));
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar área:', error);
    }
  };

  const updatePolygonInBackend = async (updatedPolygon) => {
    try {
      const response = await api.put(`/api/mongoData/updatePolygon/${updatedPolygon.mongoId}`, updatedPolygon);
      console.log('Polígono atualizado:', response.data);
    } catch (error) {
      console.error('Erro ao atualizar o polígono:', error);
    }
  };

  const handleEdit = (polygon) => {
    const centroid = calculateCentroid(polygon.coordinates);

    if (!centroid || !Array.isArray(centroid) || centroid.length !== 2) {
      console.error('Centróide inválido.');
      addNotification('Erro ao calcular o centróide da área.', 'error');
      return;
    }
    setSelectedPolygon({ ...polygon, centroid });
    setEditMode(true);
    addNotification('Editando área selecionada!', 'info');
  };

  const handleView = (polygon) => {
    const centroid = calculateCentroid(polygon.coordinates);

    if (!centroid || !Array.isArray(centroid) || centroid.length !== 2) {
      console.error('Centróide inválido.');
      addNotification('Erro ao calcular o centróide da área.', 'error');
      return;
    }

    // Atualizar o polígono selecionado
    setSelectedPolygon({ ...polygon, centroid });

    addNotification('Visualizando área selecionada!', 'info');
  };


  const handleDelete = async (polygon) => {
    if (window.confirm('Tem certeza que deseja excluir esta área?')) {
      try {
        const token = localStorage.getItem('authToken');
        await api.delete(`/api/areas/${polygon.mongoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPolygons(polygons.filter((p) => p.mongoId !== polygon.mongoId));
        addNotification('Área excluída com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao excluir área:', error);
        addNotification('Erro ao excluir a área. Tente novamente mais tarde.', 'error');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentPolygon(null);
    setName('');
    setDescription('');
    setAreaInCreation(false);
    setEditMode(false);
  };

  const toggleTable = () => {
    setShowTable(!showTable);
  };

  return (
    <div className="map-view-container">
      {/* Modal Formulário */}
      {showForm && (
        <div className="overlay">
          <div className="slide-modal">
            <div className="modal-header">
              <h3>{editMode ? 'Editar Área' : 'Criar Nova Área'}</h3>
              <button className="close-btn" onClick={handleCancel} aria-label="Close">
                <FaTimes size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Nome da Área</label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveArea}>
                {editMode ? 'Salvar Alterações' : 'Salvar Área'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Componente do Mapa */}
      <GenericMapView
        statePolygons={polygons || []}
        selectedPolygon={selectedPolygon} // Passa o selectedPolygon como prop
        setSelectedPolygon={setSelectedPolygon} // Passa o setSelectedPolygon como prop
        setEditedPolygon={setPolygons}
        onPolygonCreated={handlePolygonCreated}
        enableDrawControl={!areaInCreation}
        enableMiniMap
        isMapReady={isMapReady}
        setIsMapReady={setIsMapReady}
        featureGroupRef={featureGroupRef}  // Passa o ref para o GenericMapView
        editPolygonInMap={handleEdit}
        editMode={editMode}
      />



      {/* Botão de Exibição da Tabela */}
      <Button
        onClick={toggleTable}
        style={{
          position: 'absolute',
          top: '10px',
          left: '50px',
          zIndex: 1000,
          backgroundColor: '#f12711',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          padding: '10px',
        }}
      >
        <FaAtlas size={20} />
      </Button>

      {/* Modal da Tabela de Áreas */}
      {showTable && (
        <div className="table-modal">
          <div className="modal-header">
            <h3>Lista de Áreas Criadas</h3>
            <button onClick={toggleTable} className="close-btn">
              <FaTimes size={20} />
            </button>
          </div>
          <div className="modal-body">
            {polygons.length > 0 ? (
              <table className="table modern-table">
                <thead>
                  <tr>
                    <th>Mongo Id</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Opções</th>
                  </tr>
                </thead>
                <tbody>
                  {polygons.map((polygon, index) => (
                    <tr key={index}>
                      <td>{polygon.mongoId ? `${polygon.mongoId.substring(0, 5)}...` : 'Sem Mongo ID'}</td>
                      <td>{polygon.name || 'Sem Nome'}</td>
                      <td>{polygon.description || 'Sem Descrição'}</td>
                      <td className="table-options">
                        <button
                          title="Editar"
                          className="icon-btn"
                          onClick={() => handleEdit(polygon)}
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          title="Visualizar"
                          className="icon-btn"
                          onClick={() => handleView(polygon)}
                        >
                          <FaEye size={18} />
                        </button>
                        <button
                          title="Excluir"
                          className="icon-btn"
                          onClick={() => handleDelete(polygon)}
                        >
                          <FaTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Não há áreas cadastradas.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePointsAreas;
