package aureziano.map_app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import aureziano.map_app.entity.AreaCoordinates;

public interface AreaCoordinatesRepository extends MongoRepository<AreaCoordinates, String> {
    // Você pode adicionar métodos personalizados se necessário
}
