package aureziano.map_app.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import aureziano.map_app.dto.UserDto;
import aureziano.map_app.entity.User;
import aureziano.map_app.repository.RoleRepository;
import aureziano.map_app.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import aureziano.map_app.entity.Role;

@Service // Isso indica que o Spring gerencia essa classe como um bean
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    // private final RefreshTokenService refreshTokenService;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional
    @Override
    public UserDto saveUser(UserDto userDto) {
        User user = new User();
        // user.setFirstName(userDto.getFirstName());
        // user.setLastName(userDto.getLastName());
        // user.setFullname(userDto.getFirstName() + " " + userDto.getLastName());
        // user.setEmail(userDto.getEmail());
        // user.setCpf(userDto.getCpf());
        // user.setPassword(userDto.getPassword());

        // List<Role> roles = userDto.getRoles().stream()
        // .map(roleName -> roleRepository.findByName(roleName)
        // .orElseThrow(() -> new RuntimeException("Role não encontrada: " + roleName)))
        // .collect(Collectors.toList());
        // user.setRoles(roles);

        user = convertToUser(userDto);
        User savedUser = userRepository.save(user);

        return convertToDto(savedUser);
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        user.setFullname(user.getFirstName() + " " + user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setCpf(user.getCpf());
        dto.setTokenExpiration(user.getTokenExpiration());
        dto.setRoles(user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList()));
        return dto;
    }

    private User convertToUser(UserDto userDto) {
        User user = new User();
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setFullname(userDto.getFirstName() + " " + userDto.getLastName());
        user.setEmail(userDto.getEmail());
        user.setCpf(userDto.getCpf());
        user.setPassword(userDto.getPassword());
        return user;
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
                    dto = convertToDto(user);
                    // dto.setId(user.getId()); // Mapeia o ID
                    // dto.setEmail(user.getEmail());
                    // dto.setCpf(user.getCpf());
                    // dto.setFirstName(user.getFirstName());
                    // dto.setLastName(user.getLastName());
                    // dto.setRoles(user.getRoles().stream()
                    // .map(Role::getName) // Mapeia as roles para strings
                    // .collect(Collectors.toList())); // Coleta os nomes das roles em uma lista
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long userId, UserDto userDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Atualiza a senha apenas se uma nova senha for fornecida
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPassword(userDto.getPassword());
        }

        // Atualiza os campos do usuário
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setFullname(userDto.getFirstName() + " " + userDto.getLastName());
        user.setEmail(userDto.getEmail());
        user.setCpf(userDto.getCpf());
        user.setTokenExpiration(userDto.getTokenExpiration());

        // Atualiza as roles do usuário
        List<Role> roles = userDto.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role não encontrada: " + roleName)))
                .collect(Collectors.toList());
        user.setRoles(roles);

        // Salva as alterações
        User updatedUser = userRepository.save(user);

        // Converte e retorna o usuário atualizado como DTO
        return convertToDto(updatedUser);
    }

    @Override
    @Transactional
    public UserDto updateUser(User user) {
        // Salva as alterações
        User updatedUser = userRepository.save(user);
        // Converte e retorna o usuário atualizado como DTO
        return convertToDto(updatedUser);
    }

    @Override
    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com id: " + id));
    }

    @Transactional
    public void revokeAllUserTokens(Long userId) {
        User user = findUserById(userId);
        // Aqui você chamaria o método do RefreshTokenService para revogar os tokens
        // RefreshTokenService refreshTokenService.revokeAllUserTokens(userId);
    }

}
