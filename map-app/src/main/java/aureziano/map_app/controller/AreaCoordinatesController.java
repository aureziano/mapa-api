package aureziano.map_app.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import aureziano.map_app.dto.AreaCoordinatesDto;
import aureziano.map_app.services.AreaCoordinatesService;

@RestController
@RequestMapping("/areaCoordinates")
public class AreaCoordinatesController {

    @Autowired
    private AreaCoordinatesService areaCoordinatesService;

    // Endpoint para salvar as coordenadas
    @PostMapping
    public ResponseEntity<String> createArea(@RequestBody AreaCoordinatesDto areaRequest) {
        // Chama o método do serviço para salvar as coordenadas
        areaCoordinatesService.saveCoordinates(areaRequest.getCoordinatesString());
        
        return ResponseEntity.ok("Coordenadas salvas com sucesso!");
    }
}
