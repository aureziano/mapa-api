package aureziano.map_app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import aureziano.map_app.entity.AreaEstado;

public interface AreaEstadoRepository extends MongoRepository<AreaEstado, String> {
    // Você pode adicionar métodos personalizados se necessário
}
