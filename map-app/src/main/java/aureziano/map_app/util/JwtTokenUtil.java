package aureziano.map_app.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.sql.Array;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenUtil {

    private static final long JWT_TOKEN_VALIDITY = 365 * 24 * 60 * 60; // 1 ano em segundos
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);

    @Value("${jwt.secret}") // Lendo o segredo a partir da configuração
    private String SECRET_KEY;

    // Método para gerar uma chave segura de 512 bits
    private Key getSigningKey() {
        // Garantindo que a chave tenha pelo menos 512 bits de comprimento
        if (SECRET_KEY.length() < 64) {
            // Se a chave fornecida for muito curta, gerar uma chave segura de 512 bits
            return Keys.secretKeyFor(SignatureAlgorithm.HS512);
        }
        // Caso contrário, utilizar a chave fornecida
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    // Atualizando o método para aceitar parâmetros como nome de usuário, cpf, etc.
    public String generateToken(String subject, String cpf, String firstName, List<String> roles) {
        Key key = getSigningKey(); // Usando a chave secreta para assinatura

        return Jwts.builder()
                .setSubject(subject) // Nome do usuário ou 'subject'
                .claim("cpf", cpf) // Incluindo o CPF nos claims do token
                .claim("roles", roles) // Incluindo os roles nos claims do token
                .claim("firstName", firstName) // Incluindo o firstName nos claims do token
                .signWith(key, SignatureAlgorithm.HS512) // Assinando com a chave secreta e algoritmo HS512
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000)) // Definindo a validade do token
                .compact();
    }

    // Método para validar o token
    public boolean validateToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            if (claims != null) {
                Date expiration = claims.getExpiration();
                if (expiration != null && expiration.before(new Date())) {
                    logger.warn("O token JWT expirou. Expiração: {}", expiration);
                    return false;
                }
                logger.info("Token válido. Expiração: {}", expiration);
                return true;
            }
        } catch (ExpiredJwtException e) {
            logger.warn("O token JWT expirou. Erro: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Erro ao processar o token JWT: {}", e.getMessage());
        }
        return false;
    }

    // Método para obter os claims do token
    private Claims getClaimsFromToken(String token) {
        // logger.info("Decodificando token JWT: {}", token);
        try {
            Key key = getSigningKey(); // A chave de assinatura
            return Jwts.parserBuilder()
                    .setSigningKey(key) // Decodifica o token usando a chave correta
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            logger.error("Erro ao processar o token JWT: {}", e.getMessage());
        }
        return null; // Retorna null se ocorrer um erro ao processar o token
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
}
