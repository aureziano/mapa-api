package aureziano.map_app.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import aureziano.map_app.dto.UserDto;
import aureziano.map_app.entity.User;
import aureziano.map_app.services.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

// @CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users/")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Tag(name = "Register User", description = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDto userDto, BindingResult result) {
        logger.info("Recebida requisição para registro de usuário: {}", userDto);

        // Verificar se o CPF já está registrado
        User existingUser = userService.findUserByCpf(userDto.getCpf());
        if (existingUser != null && existingUser.getCpf() != null && !existingUser.getCpf().isEmpty()) {
            result.rejectValue("cpf", "duplicate.cpf", "Já existe uma conta registrada com este CPF");
        }

        // Verificar erros de validação
        if (result.hasErrors()) {
            List<String> errors = result.getAllErrors().stream()
                .map(error -> {
                    if (error instanceof FieldError) {
                        return ((FieldError) error).getField() + ": " + error.getDefaultMessage();
                    }
                    return error.getDefaultMessage();
                })
                .collect(Collectors.toList());
            
            logger.error("Erros de validação ao registrar usuário: {}", errors);
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            UserDto savedUser = userService.saveUser(userDto); 
            logger.info("Usuário registrado com sucesso: {}", savedUser);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            logger.error("Erro ao salvar usuário: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Ocorreu um erro ao registrar o usuário: " + e.getMessage());
        }
    }


    @Tag(name = "Get All Users", description = "Get all users")
    @GetMapping("/all")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        logger.info("Getting all users");
        List<UserDto> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }


    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable(required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.badRequest().body("UserId não pode ser nulo");
        }
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Erro ao deletar usuário: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Ocorreu um erro ao deletar o usuário: " + e.getMessage());
        }
    }


    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @Valid @RequestBody UserDto userDto, BindingResult result) {
        // Filtra os erros, excluindo o erro de senha se a senha estiver vazia
        List<FieldError> filteredErrors = result.getFieldErrors().stream()
            .filter(error -> !("password".equals(error.getField()) && (userDto.getPassword() == null || userDto.getPassword().isEmpty())))
            .collect(Collectors.toList());

        if (!filteredErrors.isEmpty()) {
            List<String> errorMessages = filteredErrors.stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());
            
            logger.error("Erros de validação ao atualizar usuário: {}", errorMessages);
            return ResponseEntity.badRequest().body(errorMessages);
        }

        try {
            UserDto updatedUser = userService.updateUser(userId, userDto);
            logger.info("Usuário atualizado com sucesso: {}", updatedUser);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            logger.error("Erro ao atualizar usuário: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Ocorreu um erro ao atualizar o usuário: " + e.getMessage());
        }
    }


    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> preflight() {
        return ResponseEntity.ok().build(); 
    }
}
