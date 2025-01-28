import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes, FaEdit, FaEye, FaTrash, FaAtlas, FaPen, FaSave } from 'react-icons/fa';
import api from '../services/api';
import { useNotification } from './NotificationProvider';
import GenericMapView, { formatPolygons, calculateCentroid, getValidatedCentroid, areCoordinatesDifferent } from './GenericMapView';
import L from 'leaflet';
import './ManagePointsAreas.css';
// import { useMap } from 'react-leaflet';

const ManagePointsAreas = () => {
  const [polygons, setPolygons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedPolygon] = useState(null);
  const [loading, setLoading] = useState(false); // Adicionando o estado para loading
  const { addNotification } = useNotification();
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [areaInCreation, setAreaInCreation] = useState(false);
  const [originalCoordinates, setOriginalCoordinates] = useState(null);

  const featureGroupRef = useRef(null);


  useEffect(() => {
    const fetchRegionPolygons = async () => {
      try {
        const response = await api.get('/api/mongoData/polygons');
        const formattedPolygons = formatPolygons(response.data || []).map((polygon) => ({
          ...polygon,
          mongoId: polygon.mongoId
        }));
        setPolygons(formattedPolygons);
      } catch (error) {
        console.error('Erro ao carregar os polígonos de região:', error);
      }
    };

    fetchRegionPolygons();
  }, []);

  useEffect(() => {
    if (selectedPolygon && JSON.stringify(selectedPolygon) !== JSON.stringify(currentPolygon)) {
      console.log('Atualizando currentPolygon');
      setCurrentPolygon({ ...selectedPolygon });
    }
  }, [selectedPolygon, currentPolygon]); // Comparação profunda
  
  setPolygons((prevPolygons) => {
    const updatedPolygons = prevPolygons.map((polygon) =>
      polygon.mongoId === selectedPolygon.mongoId
        ? { ...polygon, coordinates: selectedPolygon.coordinates }
        : polygon
    );
  
    console.log("Polígonos atualizados:", updatedPolygons); // Verifique o valor de updatedPolygons aqui
  
    return updatedPolygons;
  });
  

  // No método de criação do polígono dentro de GenericMapView:
  const handlePolygonCreated = (polygonData) => {
    const newPolygon = {
      coordinates: polygonData.coordinates,
      color: 'blue',
      fillColor: 'rgba(0, 0, 255, 0.3)',
      mongoId: polygonData.id,
    };

    const layer = L.polygon(newPolygon.coordinates, {
      color: newPolygon.color,
      fillColor: newPolygon.fillColor,
      mongoId: newPolygon.mongoId,
    });

    featureGroupRef.current.addLayer(layer);
    setPolygons([...polygons, newPolygon]);
    setCurrentPolygon(newPolygon);
    setShowForm(true); // Abre o formulário automaticamente
    setEditMode(false); // Garante que não esteja no modo de edição
  };

  const handleSaveArea = async () => {
          if (!currentPolygon) {
              addNotification('Nenhum polígono selecionado para salvar.', 'error');
              return;
          }
  
          // Atualiza a lista de polígonos na tabela
          setPolygons((prevPolygons) =>
              prevPolygons.map((polygon) =>
                  polygon.mongoId === currentPolygon.mongoId
                      ? { ...polygon, coordinates: currentPolygon.coordinates }
                      : polygon
              )
          );
  
          // Aqui, você pode realizar a atualização no servidor (API) para salvar as alterações no banco de dados
          try {
              const token = localStorage.getItem('authToken');
              if (!token) {
                  addNotification('Token de autenticação não encontrado.', 'error');
                  return;
              }
  
              // Salvar as alterações no banco (exemplo de chamada de API)
              await api.put(
                  `/api/areas/${currentPolygon.mongoId}`,
                  {
                      coordinatesString: JSON.stringify(currentPolygon.coordinates),
                      name: currentPolygon.name,
                      description: currentPolygon.description,
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
              );
  
              addNotification('Polígono salvo com sucesso!', 'success');
          } catch (error) {
              console.error('Erro ao salvar polígono:', error);
              addNotification('Erro ao salvar polígono.', 'error');
          }
      };

  const handleOpenEditForm = () => {
    setShowForm(true); // Abre o formulário manualmente
  };

  const handleEdit = (polygon) => {
    const centroid = getValidatedCentroid(polygon);

    if (!centroid || !Array.isArray(centroid) || centroid.length !== 2) {
      console.error('Centróide inválido.');
      addNotification('Erro ao calcular o centróide da área.', 'error');
      return;
    }

    setOriginalCoordinates(polygon.coordinates);
    const updatedPolygon = {
      ...polygon,
      centroid,
    };


    setSelectedPolygon(updatedPolygon);
    setCurrentPolygon(updatedPolygon);

    // Armazena as coordenadas originais antes da edição
    setOriginalCoordinates([...polygon.coordinates]);

    setName(polygon.name || '');
    setDescription(polygon.description || '');
    setEditMode(true);
    setShowForm(true);

    addNotification('Editando área selecionada!', 'info');
  };

  const handleView = (polygon) => {
    setEditMode(false); // Desativa o modo de edição
    const centroid = getValidatedCentroid(polygon);

    if (!centroid || !Array.isArray(centroid) || centroid.length !== 2) {
      console.error('Centróide inválido.');
      addNotification('Erro ao calcular o centróide da área.', 'error');
      return;
    }

    // Atualizar o polígono selecionado
    setSelectedPolygon({ ...polygon, centroid });
    setShowForm(false); // Garante que o formulário não seja exibido
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
        addNotification('Área excluída com sucesso!', 'sucess');
      } catch (error) {
        console.error('Erro ao excluir área:', error);
        addNotification('Erro ao excluir a área. Tente novamente mais tarde.', 'error');
      }
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setShowForm(false); // Fecha o modal
    setEditMode(false); // Sai do modo de edição
    setSelectedPolygon(null); // Reseta o polígono selecionado
  };

  const handleCancelEdit = () => {
    setEditMode(true); // Sai do modo de edição
    setShowForm(false); // Fecha o modal
  };

  const toggleTable = () => {
    setShowTable(!showTable);
  };

  return (
    <div className="map-view-container">
      {/* Exibindo as coordenadas em inputs flutuantes */}
      {editMode && <div
        style={{
          position: 'absolute',
          top: 10,
          right: 80,
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.13)',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>
          Coordenadas da área editada (selectedPolygon):
        </label>
        <textarea
          value={JSON.stringify(selectedPolygon?.coordinates || [], null, 2)}
          readOnly
          rows={5}
          style={{ resize: 'none', width: '300px', fontSize: '12px', fontFamily: 'monospace' }}
        />
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>
          Coordenadas da área salva (originalCoordinates):
        </label>
        <textarea
          value={originalCoordinates ? JSON.stringify(originalCoordinates, null, 2) : 'Nenhum dado original disponível.'}
          readOnly
          rows={5}
          style={{ resize: 'none', width: '300px', fontSize: '12px', fontFamily: 'monospace' }}
        />

        <Button
          variant="primary"
          onClick={handleSaveArea}
          label="Salvar Alterações"
        >
          <FaSave size={20} />

        </Button>
      </div>
      }
      {/* Modal Formulário */}
      {showForm && (
        <div className="overlay">
          <div className="slide-modal">
            <div className="modal-header">
              <h3>{editMode ? 'Editar Área' : 'Criar Nova Área'}</h3>
              <button className="close-btn" onClick={editMode ? handleCancelEdit : handleCancel} aria-label="Close">
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
              <Button variant="secondary" onClick={editMode ? handleCancelEdit : handleCancel}>
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
                      <td>{polygon.description + ' - ' + polygon.id || 'Sem Descrição'}</td>
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
      {editMode && (
        <Button
          onClick={handleOpenEditForm}
          style={{
            position: 'absolute',
            top: '5px',
            right: '50px',
            zIndex: 500,
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            padding: '10px',
          }}
        >
          <FaPen size={20} />
        </Button>
      )}

    </div>
  );
};

export default ManagePointsAreas;
