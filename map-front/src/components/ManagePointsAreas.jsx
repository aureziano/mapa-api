import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes, FaEdit, FaEye, FaTrash, FaAtlas, FaPen, FaSave } from 'react-icons/fa';
import api from '../services/api';
import { useNotification } from './NotificationProvider';
import GenericMapView, { formatPolygons, getValidatedCentroid } from './GenericMapView';
import L from 'leaflet';
import './ManagePointsAreas.css';

const ManagePointsAreas = () => {
  const [polygons, setPolygons] = useState([]);
  const [statePolygons, setStatePolygons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState(false);
  const { addNotification, setLoading } = useNotification();
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [IsMapReady, setIsMapReady] = useState(false);
  const [areaInCreation] = useState(false);
  const [originalCoordinates, setOriginalCoordinates] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [idArea, setIdArea] = useState('');
  const [ setMapKey] = useState(0); // Adicione este estado no componente pai

  const featureGroupRef = useRef(null);


  // Busca dados para os polígonos de estado
  useEffect(() => {
    const fetchStatePolygons = async () => {
      try {
        setLoading(true); // Set loading state before fetching
        const response = await api.get('/api/mongoData/polygonsEstado');
        const formattedPolygons = formatPolygons(response.data);  // Format the polygons
        const uniquePolygons = formattedPolygons.filter(
          (polygon, index, self) =>
            index === self.findIndex((p) => p.mongoId === polygon.mongoId)
        );
        setStatePolygons([]);
        setStatePolygons(uniquePolygons); // Store the formatted polygons
      } catch (error) {
        console.error('Erro ao carregar os polígonos de estado:', error);
        // setError('Failed to load state polygons'); // Set error message
      } finally {
        setLoading(false); // Reset loading state
      }
    };

    fetchStatePolygons();
  }, [setLoading]);


  // Busca dados para os polígonos preenchidos
  useEffect(() => {
    const fetchRegionPolygons = async () => {
      try {
        setLoading(true); // Set loading state
        const response = await api.get('/api/mongoData/polygons');
        const formattedPolygons = formatPolygons(response.data || []).map((polygon) => ({
          ...polygon,
          mongoId: polygon.mongoId
        }));

        // Remover duplicatas com base no mongoId
        const uniquePolygons = formattedPolygons.filter(
          (polygon, index, self) =>
            index === self.findIndex((p) => p.mongoId === polygon.mongoId)
        );
        setPolygons([]);
        setTableData([]);

        setPolygons(uniquePolygons);
        setTableData(uniquePolygons);
      } catch (error) {
        console.error('Erro ao carregar os polígonos de região:', error);
        // setError('Failed to load region polygons'); // Set error message
      } finally {
        setLoading(false); // Reset loading state
      }
    };

    fetchRegionPolygons();
  }, [setLoading]);

  const handlePolygonEdit = (selectedPolygon, currentPolygon) => {
    if (selectedPolygon && JSON.stringify(selectedPolygon) !== JSON.stringify(currentPolygon)) {
      setCurrentPolygon({ ...selectedPolygon });
      // Não altera o zoom ou a visão do mapa aqui
      setEditing(true);
    }
  };

  const handleStopEdit = () => {
    // Só executa a lógica se houver edição ativa
    if (editMode) {
      // Restaura o estado original
      if (selectedPolygon !== null) {
        setSelectedPolygon(null);  // Ou alguma outra forma de "desmarcar" o polígono
      }
      if (setCurrentPolygon !== null) {
        setCurrentPolygon(null);  // Ou alguma outra forma de "desmarcar" o polígono
      }
      setOriginalCoordinates([]);  // Limpa as coordenadas originais
      setName('');               // Limpa o nome
      setDescription('');        // Limpa a descrição
      setIdArea('');
      setEditMode(false);        // Desativa o modo de edição
      setShowForm(false);        // Fecha o formulário de edição

      addNotification('Edição desativada!', 'info');  // Notificação de que a edição foi desativada

    }
  };

  // No método de criação do polígono dentro de GenericMapView:
  const handlePolygonCreated = (polygonData) => {
    const coordinates = polygonData.layer._latlngs[0].map(coord => [coord.lat, coord.lng]);
    const newPolygon = {
      coordinates: coordinates,
      color: 'blue',
      fillColor: 'rgba(0, 0, 255, 0.3)',
      mongoId: polygonData.layer._leaflet_id,
    };

    const layer = L.polygon(newPolygon.coordinates, {
      color: newPolygon.color,
      fillColor: newPolygon.fillColor,
      mongoId: newPolygon.mongoId,
    });

    featureGroupRef.current.addLayer(layer);
    setPolygons((prevPolygons) => [...prevPolygons, newPolygon]);
    setCurrentPolygon(newPolygon);
    setName('');
    setDescription('');
    setIdArea('');
    setShowForm(true);
    setEditMode(false);
  };

  const handleSaveArea = async () => {
    if (!name || !description) {
      addNotification('Preencha todos os campos!', 'error');
      return;
    }

    const polygonCoordinates = currentPolygon?.coordinates;
    if (!polygonCoordinates || polygonCoordinates.length === 0) {
      addNotification('Coordenadas do polígono estão ausentes.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        addNotification('Token de autenticação não encontrado.', 'error');
        return;
      }

      setLoading(true);
      const coordinatesString = JSON.stringify(polygonCoordinates);

      if (editMode) {
        if (!currentPolygon?.id) {
          addNotification('ID da área ausente. Não é possível editar.', 'error');
          return;
        }

        await api.put(
          `/api/areas/${currentPolygon.id}`,
          { name, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (currentPolygon?.mongoId) {
          await api.put(
            `/api/areas/areaCoordinates/${currentPolygon.mongoId}`,
            { coordinatesString },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          console.warn('MongoId ausente, não será possível atualizar as coordenadas.');
        }
        handleStopEdit();
        addNotification('Área editada com sucesso!', 'sucess');
      } else {
        const mongoResponse = await api.post(
          '/api/areas/areaCoordinates',
          { coordinatesString },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const mongoId = mongoResponse.data.id;
        if (!mongoId) {
          throw new Error('ID do MongoDB não foi retornado.');
        }

        await api.post(
          '/api/areas',
          { name, description, mongoId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        addNotification('Área salva com sucesso!', 'sucess');
      }

      const response = await api.get('/api/mongoData/polygons', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPolygons(formatPolygons(response.data || []));
      setTableData(formatPolygons(response.data || []));
      handleCancel();

    } catch (error) {
      console.error('Erro ao salvar área:', error);
      let errorMessage = 'Erro ao salvar área. Tente novamente.';
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      addNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
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
    setOriginalCoordinates([...polygon.coordinates]);
    setName(polygon.name || '');
    setDescription(polygon.description || '');
    setIdArea(polygon.id || '');
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
    setEditing(false);
    setEditMode(false);
    addNotification('Visualizando área selecionada!', 'info');
  };

  const handleDelete = async (polygon) => {
    if (window.confirm('Tem certeza que deseja excluir esta área?')) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          addNotification('Token de autenticação não encontrado.', 'error');
          return;
        }

        setLoading(true);

        // Exclui as coordenadas no MongoDB
        await api.delete(`/api/areas/areaCoordinates/${polygon.mongoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Exclui a área no MySQL
        await api.delete(`/api/areas/${polygon.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Remove a camada do FeatureGroup
        if (featureGroupRef.current) {
          featureGroupRef.current.eachLayer((layer) => {
            if (layer.options.mongoId === polygon.mongoId) {
              featureGroupRef.current.removeLayer(layer);
            }
          });
        }

        // Atualiza os estados locais
        setPolygons((prevPolygons) => prevPolygons.filter((p) => p.mongoId !== polygon.mongoId));
        setTableData((prevData) => prevData.filter((p) => p.mongoId !== polygon.mongoId));

        // Limpa o polígono selecionado se for o que está sendo excluído
        if (selectedPolygon && selectedPolygon.mongoId === polygon.mongoId) {
          setSelectedPolygon(null);
          setCurrentPolygon(null);
          setEditMode(false);
          setShowForm(false);
        }

        // Chama a função clearAllPolygons
        clearAndReloadLayers();

        addNotification('Área excluída com sucesso!', 'sucess');
      } catch (error) {
        console.error('Erro ao excluir área:', error);
        addNotification('Erro ao excluir a área. Tente novamente mais tarde.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setIdArea("");
    setShowForm(false); // Fecha o modal
    setEditing(false);
    setEditMode(false);
    setSelectedPolygon(null);
  };

  const clearAndReloadLayers = async () => {
    try {
      setLoading(true);

      // Limpar todas as camadas existentes
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
      }

      // Limpar os estados
      setPolygons([]);
      setTableData([]);
      setSelectedPolygon(null);
      setCurrentPolygon(null);

      // Recarregar os polígonos de estado
      const stateResponse = await api.get('/api/mongoData/polygonsEstado');
      const formattedStatePolygons = formatPolygons(stateResponse.data);
      setStatePolygons(formattedStatePolygons);

      // Recarregar os polígonos de região
      const regionResponse = await api.get('/api/mongoData/polygons');
      const formattedRegionPolygons = formatPolygons(regionResponse.data || []);
      setPolygons(formattedRegionPolygons);
      setTableData(formattedRegionPolygons);

      // Forçar a re-renderização do mapa
      setMapKey(prevKey => prevKey + 1);

      addNotification('Camadas recarregadas com sucesso!', 'sucess');
    } catch (error) {
      console.error('Erro ao recarregar as camadas:', error);
      addNotification('Erro ao recarregar as camadas. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
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

      {editMode && (
        <Button
          onClick={handleOpenEditForm}
          style={{
            position: 'absolute',
            top: '120px',
            right: '10px',
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
            <span className="form-id" >{idArea ? ('Id: ' + idArea) : ''}</span>
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
        statePolygons={statePolygons || []}
        regionPolygons={polygons || []}
        onPolygonCreated={handlePolygonCreated}
        enableMiniMap={true}
        enableDrawControl={!areaInCreation}
        selectedPolygon={selectedPolygon}
        setSelectedPolygon={setSelectedPolygon}
        handleStopEdit={handleStopEdit}
        setEditedPolygon={handlePolygonEdit}
        setIsMapReady={setIsMapReady}
        featureGroupRef={featureGroupRef} 
        editMode={editMode}
        editing={editing}
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
            {tableData.length > 0 ? (
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
                  {tableData.map((polygon, index) => (
                    <tr key={polygon.mongoId || `polygon-${index}`}>
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
      
    </div>
  );
};

export default ManagePointsAreas;
