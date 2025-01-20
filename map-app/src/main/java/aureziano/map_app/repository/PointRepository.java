package aureziano.map_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import aureziano.map_app.entity.Point;

public interface PointRepository extends JpaRepository<Point, Long> {}
