package aureziano.map_app.controller;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Implementar autenticação JWT
        return ResponseEntity.ok("Token JWT gerado");
    }
}

