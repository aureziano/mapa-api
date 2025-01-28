package aureziano.map_app.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import aureziano.map_app.entity.Area;
import aureziano.map_app.repository.AreaRepository;
import aureziano.map_app.repository.AreaCoordinatesRepository;
import aureziano.map_app.entity.AreaCoordinates;

@Service
public class AreaService {

    private final AreaRepository areaRepository;
    private final AreaCoordinatesRepository areaCoordinatesRepository;

    @Autowired
    public AreaService(AreaRepository areaRepository, AreaCoordinatesRepository areaCoordinatesRepository) {
        this.areaRepository = areaRepository;
        this.areaCoordinatesRepository = areaCoordinatesRepository;
    }

    // Buscar todas as áreas no MySQL
    public List<Area> findAll() {
        return areaRepository.findAll();
    }

    // Buscar área pelo ID no MySQL
    public Optional<Area> findById(Long id) {
        return areaRepository.findById(id);
    }

    // Buscar coordenadas do MongoDB pela referência do ID
    public Optional<AreaCoordinates> findCoordinatesByMongoId(String mongoId) {
        return areaCoordinatesRepository.findById(mongoId); // Aqui você busca o documento do MongoDB usando o ID
    }

    // Salvar uma área no MySQL
    public Area save(Area area) {
        return areaRepository.save(area);
    }

    // Excluir uma área no MySQL
    public void deleteById(Long id) {
        areaRepository.deleteById(id);
    }

    public Area update(Long id, Area area) {
        return areaRepository.findById(id).map(existingArea -> {
            existingArea.setName(area.getName());
            existingArea.setDescription(area.getDescription());
            // Atualize outros campos, se necessário
            return areaRepository.save(existingArea);
        }).orElse(null);
    }
}
