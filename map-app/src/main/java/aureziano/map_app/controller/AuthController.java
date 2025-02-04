package aureziano.map_app.controller;

import aureziano.map_app.entity.*;
import aureziano.map_app.exception.TokenRefreshException;
import aureziano.map_app.services.RefreshTokenService;
import aureziano.map_app.services.UserService;
import aureziano.map_app.util.JwtTokenUtil;
import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private RefreshTokenService refreshTokenService;
    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        User user = userService.findUserByCpf(request.getUsername());

        Hibernate.initialize(user.getRoles());

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        String accessToken = jwtTokenUtil.generateAccessToken(
                user.getId().toString(),
                user.getUsername(),
                user.getCpf(),
                user.getFirstName(),
                roleNames);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(
                user,
                refreshTokenService.getDeviceInfo(servletRequest),
                servletRequest.getHeader("User-Agent"));

        // Calcular datas de expiração
        Instant accessExpiration = Instant.now().plusSeconds(JwtTokenUtil.ACCESS_TOKEN_VALIDITY);
        Instant refreshExpiration = Instant.now().plusSeconds(JwtTokenUtil.REFRESH_TOKEN_VALIDITY);

        user.setTokenExpiration(Instant.now().plusSeconds(JwtTokenUtil.ACCESS_TOKEN_VALIDITY));
        userService.updateUser(user);

        return ResponseEntity.ok(new JwtResponse(
                accessToken,
                refreshToken.getToken(),
                accessExpiration,
                refreshExpiration));
    }

    @PostMapping("/refreshtoken")
    @Transactional
    public ResponseEntity<?> refreshToken(
            @RequestBody TokenRefreshRequest request,
            HttpServletRequest servletRequest) {

        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(token -> {
                    User user = token.getUser(); // Já inicializado pelo Hibernate.initialize()
                    return ResponseEntity.ok(createNewTokenPair(user, servletRequest));
                })
                .orElseThrow(() -> new TokenRefreshException("Refresh token inválido"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogOutRequest request) {
        refreshTokenService.revokeAllUserTokens(userService.findUserById(request.getUserId()));
        return ResponseEntity.ok(new MessageResponse("Logout realizado com sucesso"));
    }

    @GetMapping("/token-validity")
    public ResponseEntity<Map<String, Long>> getTokenValidity() {
        Map<String, Long> validity = new HashMap<>();
        validity.put("accessTokenValidity", JwtTokenUtil.ACCESS_TOKEN_VALIDITY);
        validity.put("refreshTokenValidity", JwtTokenUtil.REFRESH_TOKEN_VALIDITY);
        return ResponseEntity.ok(validity);
    }

    @GetMapping("/token-validity/{userId}")
    public ResponseEntity<Map<String, Long>> getUserTokenValidity(@PathVariable Long userId) {
        User user = userService.findUserById(userId);
        Map<String, Long> validity = refreshTokenService.calculateTokenValidity(user);
        return ResponseEntity.ok(validity);
    }

    @PostMapping("/revoke-tokens/{userId}")
    public ResponseEntity<?> revokeUserTokens(@PathVariable Long userId) {
        User user = userService.findUserById(userId);
        refreshTokenService.revokeAllUserTokens(user);
        return ResponseEntity.ok(new MessageResponse("Todos os tokens do usuário foram revogados"));
    }

    private boolean invalidCredentials(User user, String password) {
        return user == null || !passwordEncoder.matches(password, user.getPassword());
    }

    private JwtResponse createTokenResponse(User user, HttpServletRequest request) {
        String accessToken = jwtTokenUtil.generateAccessToken(
                user.getId().toString(),
                user.getUsername(),
                user.getCpf(),
                user.getFirstName(),
                user.getRoles().stream().map(Role::getName).toList());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(
                user,
                getClientIp(request),
                request.getHeader("User-Agent"));

        // Calcular datas de expiração
        Instant accessExpiration = Instant.now().plusSeconds(JwtTokenUtil.ACCESS_TOKEN_VALIDITY);
        Instant refreshExpiration = Instant.now().plusSeconds(JwtTokenUtil.REFRESH_TOKEN_VALIDITY);

        return new JwtResponse(accessToken, refreshToken.getToken(), accessExpiration, refreshExpiration);
    }

    private JwtResponse createNewTokenPair(User user, HttpServletRequest request) {
        String newAccessToken = jwtTokenUtil.generateAccessToken(
                user.getId().toString(),
                user.getUsername(),
                user.getCpf(),
                user.getFirstName(),
                user.getRoles().stream().map(Role::getName).toList());

        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(
                user,
                getClientIp(request),
                request.getHeader("User-Agent"));

        // Calcular datas de expiração
        Instant accessExpiration = Instant.now().plusSeconds(JwtTokenUtil.ACCESS_TOKEN_VALIDITY);
        Instant refreshExpiration = Instant.now().plusSeconds(JwtTokenUtil.REFRESH_TOKEN_VALIDITY);

        return new JwtResponse(newAccessToken, newRefreshToken.getToken(), accessExpiration, refreshExpiration);
    }

    private String getClientIp(HttpServletRequest request) {
        return refreshTokenService.getDeviceInfo(request);
    }
}