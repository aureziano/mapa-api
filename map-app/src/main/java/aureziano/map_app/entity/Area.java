package aureziano.map_app.entity;

import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;

@Entity
@Data
@Schema(name = "Area", description = "Área de polígono")
public class Area {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @Schema(description = "ID das coordenadas no MongoDB")
    private String mongoId; // Referência ao documento do MongoDB
}
