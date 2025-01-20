package aureziano.map_app.services;


import aureziano.map_app.dto.UserDto;
import aureziano.map_app.entity.User;

import java.util.List;

public interface UserService {
    void saveUser(UserDto userDto);

    User findUserByEmail(String email);

    User findUserByCpf(String cpf);

    List<UserDto> findAllUsers();
}
