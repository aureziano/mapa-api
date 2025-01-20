package aureziano.map_app.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.geo.GeoJsonPolygon;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;

import java.util.List;
import java.util.Optional;
import java.util.Arrays;
import java.util.stream.Collectors;

import aureziano.map_app.entity.AreaCoordinates;
import aureziano.map_app.repository.AreaCoordinatesRepository;

@Service
public class AreaCoordinatesService {

    private final AreaCoordinatesRepository coordinatesRepository;

    @Autowired
    public AreaCoordinatesService(AreaCoordinatesRepository coordinatesRepository) {
        this.coordinatesRepository = coordinatesRepository;
    }

    // Método para converter string para GeoJsonPolygon
    private GeoJsonPolygon convertStringToGeoJsonPolygon(String coordinatesString) {
        String[] coordinatePairs = coordinatesString.split(" ");
        List<Point> points = Arrays.stream(coordinatePairs)
            .map(coord -> {
                String[] lngLat = coord.split(",");
                double longitude = Double.parseDouble(lngLat[0]);
                double latitude = Double.parseDouble(lngLat[1]);
                return new GeoJsonPoint(longitude, latitude);
            })
            .collect(Collectors.toList());

        return new GeoJsonPolygon(points);
    }

    // Método para salvar as coordenadas no banco
    public void saveCoordinates(String coordinatesString) {
        // Converter a string de coordenadas para GeoJsonPolygon
        GeoJsonPolygon geoJsonPolygon = convertStringToGeoJsonPolygon(coordinatesString);

        // Criar um objeto AreaCoordinates e definir as coordenadas
        AreaCoordinates areaCoordinates = new AreaCoordinates(geoJsonPolygon);
        coordinatesRepository.save(areaCoordinates); // Salva no repositório
    }

    public Optional<AreaCoordinates> findById(String id) {
        return coordinatesRepository.findById(id);
    }

    public void deleteById(String id) {
        coordinatesRepository.deleteById(id);
    }
}
