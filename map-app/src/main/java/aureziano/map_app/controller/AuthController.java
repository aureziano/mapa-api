package aureziano.map_app.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import aureziano.map_app.entity.JwtResponse;
import aureziano.map_app.entity.Role;
import aureziano.map_app.entity.User;
import aureziano.map_app.services.UserService;
import aureziano.map_app.util.JwtTokenUtil;

// @CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtTokenUtil jwtTokenUtil; // Serviço de geração de token JWT

    @Autowired
    private UserService userService; // Serviço para buscar usuário no banco

    @Autowired
    private PasswordEncoder passwordEncoder; // PasswordEncoder do Spring Security

    public boolean checkPassword(String rawPassword, String storedPasswordHash) {
        return passwordEncoder.matches(rawPassword, storedPasswordHash);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Buscar o usuário pelo CPF (ou email, se preferir)
        User user = userService.findUserByCpf(request.getUsername()); // 'username' é o CPF aqui

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        // Comparar a senha com segurança
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        // Converte as roles de objetos Role para uma lista de Strings
        List<String> roleNames = user.getRoles().stream()
                                      .map(Role::getName) // Supondo que Role tem o método getName
                                      .collect(Collectors.toList());

        // Gerar o token JWT, passando tanto o CPF quanto o username
        String token = jwtTokenUtil.generateToken(user.getUsername(), user.getCpf(), user.getFirstName(), roleNames); 

        // Retornar o token no corpo da resposta
        return ResponseEntity.ok(new JwtResponse(token));
    }

}
