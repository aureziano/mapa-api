package aureziano.map_app.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import aureziano.map_app.entity.Role;
import aureziano.map_app.entity.User;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.sql.Array;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class JwtTokenUtil {

    // Tempos em segundos
    @Value("${jwt.access.token.validity}")
    public static final long ACCESS_TOKEN_VALIDITY = 300;// 1800; // 30 minutos

    @Value("${jwt.refresh.token.validity}")
    public static final long REFRESH_TOKEN_VALIDITY = 86400; // 24 horas

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);

    private Key getSigningKey() {
        if (SECRET_KEY.length() < 64) {
            return Keys.secretKeyFor(SignatureAlgorithm.HS512);
        }
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String id, String subject, String cpf, String firstName, List<String> roles) {
        return Jwts.builder()
                .setSubject(subject)
                .claim("id", id)
                .claim("cpf", cpf)
                .claim("roles", roles)
                .claim("firstName", firstName)
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY * 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRefreshToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_VALIDITY * 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // Método para validar o token
    public boolean validateToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return claims != null && !isTokenExpired(claims);
        } catch (ExpiredJwtException e) {
            logger.warn("Token expirado: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Erro na validação do token: {}", e.getMessage());
        }
        return false;
    }

    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    // Método para obter os claims do token
    private Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            logger.error("Erro ao obter claims do token: {}", e.getMessage());
            return null;
        }
    }

    // Método para obter o role do token
    public boolean hasRole(String token, String requiredRole) {
        Claims claims = getClaimsFromToken(token);
        if (claims != null) {
            // Obter o claim "roles" (exemplo: "roles" é uma lista de roles no token)
            List<String> roles = claims.get("roles", List.class);
            if (roles != null) {
                // Verifica se a role contém o prefixo "ROLE_" antes de comparar
                for (String role : roles) {
                    if (role.equalsIgnoreCase("ROLE_" + requiredRole)) {
                        return true; // O usuário tem o role necessário
                    }
                }
            }
        }
        return false; // O role necessário não foi encontrado no token
    }

    // Método para extrair o CPF do token
    public String extractCpfFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims != null ? claims.get("cpf", String.class) : null;
    }

    // Método para extrair o ROLE do token
    public List extractRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims != null ? claims.get("roles", List.class) : null;
    }

    public String getSubjectFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims != null ? claims.getSubject() : null;
    }

    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    public Date getExpirationDateFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getExpiration();
        } catch (ExpiredJwtException ex) {
            return ex.getClaims().getExpiration();
        }
    }

    public long getAccessTokenValidityRemaining(User user) {
        return ACCESS_TOKEN_VALIDITY; // Valor fixo temporário
    }

    public String getAccessTokenFromUser(User user) {
        // Implementação básica para gerar novo token
        // ATENÇÃO: Esta implementação não recupera o token atual!
        Map<String, Object> claims = new HashMap<>();
        claims.put("cpf", user.getCpf());
        claims.put("roles", user.getRoles().stream().map(Role::getName).toList());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY * 1000))
                .signWith(SignatureAlgorithm.HS512, getSigningKey())
                .compact();
    }

}
