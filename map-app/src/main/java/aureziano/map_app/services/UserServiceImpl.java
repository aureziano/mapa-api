package aureziano.map_app.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import aureziano.map_app.dto.UserDto;
import aureziano.map_app.entity.User;
import aureziano.map_app.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

import aureziano.map_app.entity.Role;

@Service  // Isso indica que o Spring gerencia essa classe como um bean
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void saveUser(UserDto userDto) {
        // Converter o UserDto para um User e salvar no banco
        User user = new User();
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setEmail(userDto.getEmail());
        user.setCpf(userDto.getCpf());
        user.setPassword(userDto.getPassword());  // Criptografar a senha aqui, se necessário

        userRepository.save(user);
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User findUserByCpf(String cpf) {
        return userRepository.findByCpf(cpf);
    }

    @Override
    public List<UserDto> findAllUsers() {
        List<User> users = userRepository.findAll(); // Busca todos os usuários do banco
        return users.stream()
                .map(user -> {
                    UserDto dto = new UserDto();
                    dto.setEmail(user.getEmail());
                    dto.setCpf(user.getCpf());
                    dto.setFirstName(user.getFirstName());
                    dto.setLastName(user.getLastName());
                    dto.setRoles(user.getRoles().stream()
                            .map(Role::getName) // Mapeia as roles para strings 
                            .collect(Collectors.toList())); // Coleta os nomes das roles em uma lista
                    return dto;
                })
                .collect(Collectors.toList());
    }

}
