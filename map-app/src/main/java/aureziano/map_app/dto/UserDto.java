package aureziano.map_app.dto;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.validator.constraints.br.CPF;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    @NotEmpty
    private String firstName;
    @NotEmpty
    private String lastName;
    @NotEmpty(message = "Email should not be empty")
    @Email
    private String email;
    @NotEmpty(message = "CPF should not be empty")
    @CPF
    private String cpf;
    @NotEmpty(message = "Roles should not be empty")
    private List<String> roles;
    @NotEmpty(message = "Password should not be empty")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    // @NotNull(message = "Token expiration cannot be null")
    @PastOrPresent(message = "Token expiration must be in the past or present")
    private Instant tokenExpiration;

    // Campos opcionais para IP e informações do dispositivo
    private String ipAddress;
    private String deviceInfo;
}
