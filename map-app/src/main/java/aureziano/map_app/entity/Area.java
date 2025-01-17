package aureziano.map_app.entity;

@Entity
public class Area {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Lob
    private String geoJson; // Dados do mapa em formato GeoJSON

    // Getters, setters, constructors
}

