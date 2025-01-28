package aureziano.map_app.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import aureziano.map_app.dto.UserDto;
import aureziano.map_app.entity.User;
import aureziano.map_app.services.UserService;
import aureziano.map_app.util.JwtTokenUtil;
import io.swagger.v3.oas.annotations.tags.Tag;

// @CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);


    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Tag(name = "Register User", description = "Register a new user")
    @PostMapping("/api/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDto userDto, BindingResult result) {

        User existingUser = userService.findUserByCpf(userDto.getCpf());

        if (existingUser != null && existingUser.getCpf() != null && !existingUser.getCpf().isEmpty()) {
            result.rejectValue("cpf", null,
                    "There is already an account registered with the same CPF");
        }

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }

        userService.saveUser(userDto);

        return ResponseEntity.ok(userDto);
    }

    @Tag(name = "Get All Users", description = "Get all users")
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        logger.info("Getting all users");
        List<UserDto> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> preflight() {
        return ResponseEntity.ok().build();
    }
}
