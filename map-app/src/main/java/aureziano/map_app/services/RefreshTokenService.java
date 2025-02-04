package aureziano.map_app.services;

import aureziano.map_app.entity.RefreshToken;
import aureziano.map_app.entity.User;
import aureziano.map_app.exception.TokenRefreshException;
import aureziano.map_app.repository.RefreshTokenRepository;
import aureziano.map_app.util.JwtTokenUtil;
import jakarta.servlet.http.HttpServletRequest;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            UserService userService,
            JwtTokenUtil jwtTokenUtil) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @Transactional
    public RefreshToken createRefreshToken(User user, String ipAddress, String deviceInfo) {
        revokeAllUserTokens(user); // Revoga tokens existentes

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusSeconds(JwtTokenUtil.REFRESH_TOKEN_VALIDITY));
        refreshToken.setIpAddress(ipAddress);
        refreshToken.setDeviceInfo(deviceInfo);

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .map(refreshToken -> {
                    // Force initialize user
                    Hibernate.initialize(refreshToken.getUser());
                    return refreshToken;
                });
    }

    public void validateTokenContext(RefreshToken token, HttpServletRequest request) {
        String storedDevice = token.getDeviceInfo();
        String currentDevice = getDeviceInfo(request);

        // Normalizar antes de comparar
        if (!storedDevice.equalsIgnoreCase(currentDevice.replaceAll("\\s+", ""))) {
            revokeToken(token);
            throw new TokenRefreshException("Dispositivo alterado");
        }
        if (!token.getIpAddress().equals(getClientIp(request)) ||
                !token.getDeviceInfo().equals(getDeviceInfo(request))) {
            revokeToken(token);
            throw new TokenRefreshException("Contexto de segurança inválido");
        }

    }

    @Transactional
    public void revokeToken(RefreshToken token) {
        if (token != null) {
            refreshTokenRepository.delete(token);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Real-IP"); // Usar header confiável de proxy
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip.split(",")[0]; // Pega primeiro IP da cadeia
    }

    public String getDeviceInfo(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }

    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void purgeExpiredTokens() {
        refreshTokenRepository.deleteAllExpiredSince(Instant.now());
    }

    public Map<String, Long> calculateTokenValidity(User user) {
        Map<String, Long> validity = new HashMap<>();

        RefreshToken refreshToken = refreshTokenRepository.findByUser(user).get(0);

        // Refresh Token - cálculo real
        long refreshRemaining = refreshToken.getExpiryDate().getEpochSecond() - Instant.now().getEpochSecond();
        validity.put("refreshTokenValidity", Math.max(0, refreshRemaining));

        // Access Token - cálculo real
        long accessRemaining = user.getTokenExpiration().getEpochSecond() - Instant.now().getEpochSecond();
        validity.put("accessTokenValidity", Math.max(0, accessRemaining));

        return validity;
    }

}
