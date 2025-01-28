package aureziano.map_app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import aureziano.map_app.entity.Area;
import aureziano.map_app.services.AreaService;
import java.util.List;

@RestController
@RequestMapping("/api/areas")
public class AreaController {

    private final AreaService areaService;

    @Autowired
    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    // Endpoint para buscar todas as áreas
    @GetMapping
    public List<Area> getAllAreas() {
        return areaService.findAll();
    }

    // Endpoint para criar uma área no MySQL
    @PostMapping
    public Area createArea(@RequestBody Area area) {
        return areaService.save(area); // Salva a área no MySQL
    }

    // Endpoint para excluir uma área
    @DeleteMapping("/{id}")
    public void deleteArea(@PathVariable Long id) {
        areaService.deleteById(id); // Deleta a área no MySQL
    }


    // Endpoint para atualizar uma área
    @PutMapping("/{id}")
    public ResponseEntity<Area> updateArea(@PathVariable Long id, @RequestBody Area area) {
        Area updatedArea = areaService.update(id, area);
        if (updatedArea != null) {
            return ResponseEntity.ok(updatedArea);
        }
        return ResponseEntity.notFound().build();
    }

}
