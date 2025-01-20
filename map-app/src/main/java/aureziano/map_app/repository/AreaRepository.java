package aureziano.map_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import aureziano.map_app.entity.Area;

public interface AreaRepository extends JpaRepository<Area, Long> {
}

