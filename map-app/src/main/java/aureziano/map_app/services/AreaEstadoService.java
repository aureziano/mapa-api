package aureziano.map_app.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;
import java.util.Optional;

import aureziano.map_app.entity.AreaEstado;

@Service
public class AreaEstadoService {

    private final MongoTemplate mongoTemplate;

    @Autowired
    public AreaEstadoService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    // Buscar as coordenadas no MongoDB
    public List<AreaEstado> getAllCoordinates() {
        // Buscar todos os documentos na coleção `areaEstado`
        return mongoTemplate.findAll(AreaEstado.class);
    }

    // Buscar coordenadas por ID
    public Optional<AreaEstado> getCoordinatesById(String id) {
        Query query = new Query(Criteria.where("id").is(id));
        return Optional.ofNullable(mongoTemplate.findOne(query, AreaEstado.class));
    }

    // Salvar as coordenadas
    public void saveCoordinates(String coordenadas) {
        // Código para salvar coordenadas (como você já está fazendo)
    }
}
