package aureziano.map_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import aureziano.map_app.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);

    User findByCpf(String cpf); 
}