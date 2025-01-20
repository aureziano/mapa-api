package aureziano.map_app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import aureziano.map_app.util.JwtTokenUtil;

@Configuration
public class AppConfig {

    @Bean
    public JwtTokenUtil jwtTokenUtil() {
        return new JwtTokenUtil(); // Retorna uma nova instância de JwtTokenUtil
    }
}
