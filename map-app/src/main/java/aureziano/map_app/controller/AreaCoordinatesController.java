package aureziano.map_app.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import aureziano.map_app.dto.AreaCoordinatesDto;
import aureziano.map_app.services.AreaCoordinatesService;

@RestController
@RequestMapping("/api/areas/areaCoordinates")
public class AreaCoordinatesController {

    Logger logger = Logger.getLogger(AreaCoordinatesController.class.getName());

    @Autowired
    private AreaCoordinatesService areaCoordinatesService;

    // Endpoint para salvar as coordenadas
    @PostMapping
    public ResponseEntity<Map<String, String>> createArea(@RequestBody AreaCoordinatesDto areaRequest) {
        if (areaRequest == null || areaRequest.getCoordinatesString() == null || areaRequest.getCoordinatesString().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "As coordenadas não podem estar vazias"));
        }
        
        logger.info("Corpo da requisição recebido: " + areaRequest.getCoordinatesString());
        logger.info("Salvando as coordenadas: " + areaRequest.getCoordinatesString());
        
        // Salva as coordenadas e recupera o ID
        String mongoId = areaCoordinatesService.saveCoordinates(areaRequest.getCoordinatesString());
        
        // Retorna o ID do MongoDB
        Map<String, String> response = new HashMap<>();
        response.put("id", mongoId);
        
        return ResponseEntity.ok(response);
    }

    // Endpoint para atualizar coordenadas
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateCoordinates(@PathVariable String id, @RequestBody AreaCoordinatesDto areaRequest) {
        if (areaRequest == null || areaRequest.getCoordinatesString() == null || areaRequest.getCoordinatesString().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "As coordenadas não podem estar vazias"));
        }

        boolean updated = areaCoordinatesService.updateCoordinates(id, areaRequest.getCoordinatesString());
        if (updated) {
            return ResponseEntity.ok(Map.of("message", "Coordenadas atualizadas com sucesso"));
        }
        return ResponseEntity.notFound().build();
    }



    


}
