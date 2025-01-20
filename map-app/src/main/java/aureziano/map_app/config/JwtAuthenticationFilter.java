package aureziano.map_app.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import aureziano.map_app.util.JwtTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;

    @Autowired
    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil, UserDetailsService userDetailsService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");
        String token = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7); // Remove "Bearer "
        }

        try {
            if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String cpf = jwtTokenUtil.extractCpfFromToken(token);
                List<String> roles = jwtTokenUtil.extractRoleFromToken(token); // Extrapola as roles do token

                if (cpf != null && jwtTokenUtil.validateToken(token)) {
                    // Aqui você pode validar se o usuário tem a role necessária
                    logger.info("Token válido para usuário: {}  {}", cpf, roles);
                    
                    // Verifica se o usuário tem a role 'ADMIN', caso contrário, lança uma exceção
                    if (!roles.contains("ROLE_ADMIN")) {
                        throw new SecurityException("Acesso negado. Role insuficiente.");
                    }

                    UserDetails userDetails = userDetailsService.loadUserByUsername(cpf);

                    // Converte as roles para Authorities para o Spring Security
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    logger.info("authToken: {}", authToken.getAuthorities().toString());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    // logger.info("Autenticação realizada com sucesso para usuário: {}", cpf);
                } else {
                    throw new IllegalArgumentException("Token inválido ou expirado");
                }
            }
        } catch (SecurityException e) {
            logger.error("Acesso negado: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write(e.getMessage());
            return;
        } catch (Exception e) {
            logger.error("Erro ao processar token JWT: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write(e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }

}
