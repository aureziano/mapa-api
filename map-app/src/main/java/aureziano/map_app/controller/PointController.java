package aureziano.map_app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import aureziano.map_app.entity.Point;
import aureziano.map_app.repository.PointRepository;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/points")
public class PointController {

    @Autowired
    private PointRepository pointRepository;

    @Tag(name = "Get All Points", description = "Get all points") 
    @GetMapping
    @Operation(summary = "Get all points (Sumario)", description = "Get all points (Descrição Sumário)")
    public List<Point> getAllPoints() {
        return pointRepository.findAll();
    }

    @Tag(name = "Create Point", description = "Create a new point")
    @PostMapping
    public Point createPoint(@RequestBody Point point) {
        return pointRepository.save(point);
    }

    @Tag(name = "Get Point by ID", description = "Get a point by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePoint(@PathVariable Long id) {
        pointRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}