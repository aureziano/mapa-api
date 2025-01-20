package aureziano.map_app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPolygon;
import org.springframework.web.bind.annotation.*;

import aureziano.map_app.entity.Area;
import aureziano.map_app.services.AreaService;
import aureziano.map_app.entity.AreaCoordinates;


import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/areas")
public class AreaController {

    private final AreaService areaService;

    @Autowired
    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @GetMapping
    public List<Area> getAllAreas() {
        return areaService.findAll();
    }

    @GetMapping("/{id}/coordinates")
    public Optional<AreaCoordinates> getCoordinates(@PathVariable Long id) {
        return Optional.ofNullable(areaService.findById(id));
    }

    @PostMapping
    public Area createArea(@RequestBody Area area, @RequestBody GeoJsonPolygon coordinates) {
        AreaCoordinates areaCoordinates = new AreaCoordinates(coordinates); 
        return areaService.save(area, areaCoordinates);
    }

    @DeleteMapping("/{id}")
    public void deleteArea(@PathVariable Long id) {
        areaService.deleteById(id);
    }
}
