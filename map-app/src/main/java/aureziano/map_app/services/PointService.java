package aureziano.map_app.services;

@Service
public class PointService {
    private final PointRepository pointRepository;

    @Autowired
    public PointService(PointRepository pointRepository) {
        this.pointRepository = pointRepository;
    }

    public List<Point> findAll() {
        return pointRepository.findAll();
    }

    public Point save(Point point) {
        return pointRepository.save(point);
    }

    public void deleteById(Long id) {
        pointRepository.deleteById(id);
    }
}

