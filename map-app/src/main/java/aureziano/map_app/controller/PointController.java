package aureziano.map_app.controller;

@RestController
@RequestMapping("/api/points")
public class PointController {
    private final PointService pointService;

    @Autowired
    public PointController(PointService pointService) {
        this.pointService = pointService;
    }

    @GetMapping
    public List<Point> findAll() {
        return pointService.findAll();
    }

    @PostMapping
    public Point save(@RequestBody Point point) {
        return pointService.save(point);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        pointService.deleteById(id);
    }
}
