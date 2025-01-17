package aureziano.map_app.controller;

@RestController
@RequestMapping("/api/areas")
public class AreaController {
    private final AreaService areaService;

    @Autowired
    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @GetMapping
    public List<Area> findAll() {
        return areaService.findAll();
    }

    @PostMapping
    public Area save(@RequestBody Area area) {
        return areaService.save(area);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        areaService.deleteById(id);
    }
}
