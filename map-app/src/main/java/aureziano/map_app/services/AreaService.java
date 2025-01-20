package aureziano.map_app.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import aureziano.map_app.entity.Area;
import aureziano.map_app.entity.AreaCoordinates;
import aureziano.map_app.repository.AreaCoordinatesRepository;
import aureziano.map_app.repository.AreaRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AreaService {

    private final AreaRepository areaRepository;
    private final AreaCoordinatesRepository coordinatesRepository;

    @Autowired
    public AreaService(AreaRepository areaRepository, AreaCoordinatesRepository coordinatesRepository) {
        this.areaRepository = areaRepository;
        this.coordinatesRepository = coordinatesRepository;
    }

    public List<Area> findAll() {
        return areaRepository.findAll();
    }

    public Optional<AreaCoordinates> getCoordinates(String mongoId) {
        return coordinatesRepository.findById(mongoId);
    }

    public Area save(Area area, AreaCoordinates coordinates) {
        // Salvar as coordenadas no MongoDB
        AreaCoordinates savedCoordinates = coordinatesRepository.save(coordinates);

        // Associar o ID do MongoDB à entidade do MySQL
        area.setMongoId(savedCoordinates.getId());
        return areaRepository.save(area);
    }

    public void deleteById(Long id) {
        areaRepository.findById(id).ifPresent(area -> {
            // Remover as coordenadas no MongoDB
            coordinatesRepository.deleteById(area.getMongoId());
            // Remover a área no MySQL
            areaRepository.deleteById(id);
        });
    }

    public AreaCoordinates findById(Long id) {
        return areaRepository.findById(id)
                .flatMap(area -> coordinatesRepository.findById(area.getMongoId()))
                .orElse(null);
    }
}
