package aureziano.map_app.services;

@Service
public class AreaService {
    private final AreaRepository areaRepository;

    @Autowired
    public AreaService(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    public List<Area> findAll() {
        return areaRepository.findAll();
    }

    public Area save(Area area) {
        return areaRepository.save(area);
    }

    public void deleteById(Long id) {
        areaRepository.deleteById(id);
    }
}
