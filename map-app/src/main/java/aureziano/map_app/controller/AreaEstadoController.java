package aureziano.map_app.controller;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import aureziano.map_app.dto.AreaEstadoDto;
import aureziano.map_app.entity.AreaEstado;
import aureziano.map_app.services.AreaEstadoService;

@RestController
@RequestMapping("/api/areaEstado")
public class AreaEstadoController {

    @Autowired
    private AreaEstadoService areaEstadoService;

    // Endpoint para salvar as coordenadas
    @PostMapping
    public ResponseEntity<String> createArea(@RequestBody AreaEstadoDto areaRequest) {
        // Chama o método do serviço para salvar as coordenadas
        areaEstadoService.saveCoordinates(areaRequest.getEstadoString());
        
        return ResponseEntity.ok("Coordenadas salvas com sucesso!");
    }


    // Endpoint para buscar todas as coordenadas
    @GetMapping
    public ResponseEntity<List<AreaEstado>> getAllCoordinates() {
        List<AreaEstado> coordinates = areaEstadoService.getAllCoordinates();
        return ResponseEntity.ok(coordinates);
    }

    // Endpoint para buscar coordenadas específicas pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<AreaEstado> getCoordinatesById(@PathVariable String id) {
        Optional<AreaEstado> coordinates = areaEstadoService.getCoordinatesById(id);
        return coordinates.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
