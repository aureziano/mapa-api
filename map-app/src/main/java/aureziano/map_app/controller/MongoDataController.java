package aureziano.map_app.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPolygon;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import aureziano.map_app.entity.AreaEstado;
import aureziano.map_app.dto.GeoJsonResponse;
import aureziano.map_app.entity.AreaCoordinates;
import aureziano.map_app.services.AreaEstadoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import aureziano.map_app.services.AreaCoordinatesService;

@RestController
@RequestMapping("/api/mongoData")
public class MongoDataController {

    @Autowired
    private AreaEstadoService areaEstadoService;
    
    @Autowired
    private AreaCoordinatesService areaCoordinatesService;

    Logger logger = Logger.getLogger(MongoDataController.class.getName());

    // Endpoint para buscar todas as áreas do estado e as coordenadas
    @Tag(name = "Áreas", description = "Retorna as áreas do cadastradas no MongoDB")
    @GetMapping("/polygons")
    public ResponseEntity<Object> getPolygons() {
        try {

            // Buscar as áreas e coordenadas
            List<Object> areaList = areaCoordinatesService.getPolygonsWithCoordinates();


            return ResponseEntity.ok(areaList);

        } catch (Exception e) {
            logger.info("Erro ao carregar as áreas com coordenadas."+ e);
            return ResponseEntity.status(500).body("Erro ao carregar dados do MongoDB");
        }
    }




    // Método para buscar as coordenadas do estado
    @Tag(name = "Áreas dos Estados", description = "Retorna as áreas dos Estados no MongoDB")
    @GetMapping("/polygonsEstado")
    public ResponseEntity<Object> getPolygonsEstado() {
        try {
            // Buscar as coordenadas do estado
            List<AreaEstado> areaEstadoList = areaEstadoService.getAllCoordinates();
            
            // Formatar a resposta no formato necessário para o mapa
            List<Object> polygons = areaEstadoList.stream()
                .map(area -> {
                    // Formatar as coordenadas corretamente
                    List<List<Double>> formattedCoordinates = formatCoordinates(area.getCoordinates());

                    return new GeoJsonResponse(
                                area.getId(), 
                                formattedCoordinates,
                                "blue", 
                                "rgba(0, 0, 255, 0.3)", 
                                "Área do estado", 
                                "ES",
                                String.valueOf(area.getId())
                                );
                }).collect(Collectors.toList());

            return ResponseEntity.ok(polygons);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao carregar dados do MongoDB");
        }
    }

    // Método auxiliar para formatar as coordenadas no formato correto
    private List<List<Double>> formatCoordinates(GeoJsonPolygon geoJsonPolygon) {
        // As coordenadas devem ser no formato [latitude, longitude]
        return geoJsonPolygon.getCoordinates().stream()
            // Para cada GeoJsonLineString, vamos pegar as coordenadas e transformá-las em [latitude, longitude]
            .flatMap(lineString -> lineString.getCoordinates().stream()
                .map(point -> List.of(point.getY(), point.getX())) // Corrige a ordem para [latitude, longitude]
            )
            .collect(Collectors.toList());  // Coleta todas as coordenadas de forma plana em uma lista
    }
    


    
}
