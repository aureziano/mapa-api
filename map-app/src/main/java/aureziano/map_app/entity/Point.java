package aureziano.map_app.entity;

import lombok.Data;
import jakarta.persistence.*;

@Entity
@Data
public class Point {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private double latitude;
    private double longitude;
}