package aureziano.map_app.services;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.geo.GeoJsonPolygon;
import org.springframework.stereotype.Service;

import aureziano.map_app.controller.AreaCoordinatesController;
import aureziano.map_app.dto.GeoJsonResponse;
import aureziano.map_app.entity.Area;
import aureziano.map_app.entity.AreaCoordinates;
import aureziano.map_app.repository.AreaCoordinatesRepository;
import aureziano.map_app.repository.AreaRepository;

@Service
public class AreaCoordinatesService {

    private final AreaCoordinatesRepository coordinatesRepository;

    private final AreaRepository areaRepository;

    Logger logger = Logger.getLogger(AreaCoordinatesService.class.getName());

    @Autowired
    public AreaCoordinatesService(AreaCoordinatesRepository coordinatesRepository, AreaRepository areaRepository) {
        this.coordinatesRepository = coordinatesRepository;
        this.areaRepository = areaRepository;
    }

    // Método para buscar as áreas no MySQL e coordenadas no MongoDB
    public List<Object> getPolygonsWithCoordinates() {
        List<Area> areas = areaRepository.findAll();
        return areas.stream().map(area -> {
            if (area.getMongoId() == null) {
                System.out.println("MongoId ausente para a área ID: " + area.getId());
                return new GeoJsonResponse(
                    String.valueOf(area.getId()),
                    null,
                    "red",
                    "rgba(255, 0, 0, 0.3)",
                    area.getDescription(),
                    area.getName(),
                    null
                );
            }
    
            Optional<AreaCoordinates> areaCoordinatesOpt = coordinatesRepository.findById(area.getMongoId());
            if (areaCoordinatesOpt.isPresent()) {
                AreaCoordinates areaCoordinates = areaCoordinatesOpt.get();
                logger.info("Coordenadas retornadas do MongoDB: " + areaCoordinates.getCoordinates());
                GeoJsonPolygon geoJsonPolygon = areaCoordinates.getCoordinates();
    
                if (geoJsonPolygon != null && geoJsonPolygon.getCoordinates() != null) {
                    List<List<Double>> formattedCoordinates = geoJsonPolygon.getCoordinates().stream()
                        .map(lineString -> lineString.getCoordinates().stream()
                            .map(point -> List.of(point.getX(), point.getY()))
                            .collect(Collectors.toList()))
                        .flatMap(List::stream)
                        .collect(Collectors.toList());
    
                    return new GeoJsonResponse(
                        String.valueOf(area.getId()),
                        formattedCoordinates,
                        "green",
                        "rgba(1, 22, 9, 0.7)",
                        area.getDescription(),
                        area.getName(),
                        area.getMongoId()
                    );
                } else {
                    System.out.println("Coordenadas inválidas ou ausentes para a área ID: " + area.getId());
                }
            } else {
                System.out.println("Nenhuma correspondência no MongoDB para a área ID: " + area.getId());
            }
    
            return new GeoJsonResponse(
                String.valueOf(area.getId()),
                null,
                "red",
                "rgba(255, 0, 0, 0.3)",
                area.getDescription(),
                area.getName(),
                area.getMongoId()
            );
        }).collect(Collectors.toList());
    }
    
    
    private GeoJsonPolygon convertStringToGeoJsonPolygon(String coordinatesString) {
        if (coordinatesString == null || coordinatesString.trim().isEmpty()) {
            throw new IllegalArgumentException("A string de coordenadas não pode ser vazia");
        }
    
        coordinatesString = coordinatesString.replace("[[", "[").replace("]]", "]");
    
        String[] coordinatePairs = coordinatesString.substring(1, coordinatesString.length() - 1)
            .split("\\],\\[");
    
        List<Point> points = Arrays.stream(coordinatePairs)
            .map(coord -> {
                coord = coord.replace("[", "").replace("]", "");
                String[] lngLat = coord.split(",");
                if (lngLat.length != 2) {
                    throw new IllegalArgumentException("Coordenadas mal formatadas: " + coord);
                }
                double longitude = Double.parseDouble(lngLat[0]);
                double latitude = Double.parseDouble(lngLat[1]);
                return new GeoJsonPoint(longitude, latitude);
            })
            .collect(Collectors.toList());
    
        if (!points.get(0).equals(points.get(points.size() - 1))) {
            points.add(points.get(0)); // Fecha o polígono
        }
    
        return new GeoJsonPolygon(points);
    }
    

    public String saveCoordinates(String coordinatesString) {
        // Converter a string de coordenadas para GeoJsonPolygon
        GeoJsonPolygon geoJsonPolygon = convertStringToGeoJsonPolygon(coordinatesString);
    
        // Criar um objeto AreaCoordinates e salvar as coordenadas
        AreaCoordinates areaCoordinates = new AreaCoordinates(geoJsonPolygon);
        coordinatesRepository.save(areaCoordinates); // Salva no repositório
    
        // Retorna o ID gerado no MongoDB
        return areaCoordinates.getId();
    }
    

    // Buscar coordenadas por ID
    public Optional<AreaCoordinates> findById(String id) {
        return coordinatesRepository.findById(id);
    }

    // Excluir coordenadas por ID
    public void deleteById(String id) {
        coordinatesRepository.deleteById(id);
    }

    // Buscar todas as coordenadas
    public List<AreaCoordinates> getAllCoordinates() {
        return coordinatesRepository.findAll();
    }

    public boolean updateCoordinates(String id, String newCoordinates) {
        Optional<AreaCoordinates> existingCoordinatesOpt = coordinatesRepository.findById(id);
        if (existingCoordinatesOpt.isPresent()) {
            AreaCoordinates existingCoordinates = existingCoordinatesOpt.get();
    
            // Obter o valor atual das coordenadas
            GeoJsonPolygon currentPolygon = existingCoordinates.getCoordinates();
            logger.info("Coordenadas atuais no MongoDB para ID : "+ id +" currentPolygon:"+ currentPolygon);
    
            // Converter o novo valor para GeoJsonPolygon
            GeoJsonPolygon newPolygon = convertStringToGeoJsonPolygon(newCoordinates);
            logger.info("Novas coordenadas fornecidas: "+ newPolygon);
    
            // Comparar valores
            if (currentPolygon != null && currentPolygon.equals(newPolygon)) {
                logger.info("As coordenadas fornecidas são iguais às existentes. Nenhuma atualização será feita.");
                return false; // Indica que nada foi atualizado
            }
    
            // Atualizar o valor no MongoDB
            existingCoordinates.setCoordinates(newPolygon);
            coordinatesRepository.save(existingCoordinates);
            logger.info("Coordenadas atualizadas com sucesso no MongoDB para ID "+ id);
            return true;
        }
    
        logger.warning("Coordenadas não encontradas para ID "+ id);
        return false; // ID não encontrado
    }
    
    
    
}
