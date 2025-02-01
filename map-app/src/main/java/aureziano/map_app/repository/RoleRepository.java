package aureziano.map_app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import aureziano.map_app.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
