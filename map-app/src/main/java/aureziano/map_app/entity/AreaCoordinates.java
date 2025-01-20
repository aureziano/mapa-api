package aureziano.map_app.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.geo.GeoJsonPolygon;

@Document(collection = "areaCoordinates")
public class AreaCoordinates {

    @Id
    private String id;

    private GeoJsonPolygon coordinates;  // Assumindo que você armazena coordenadas como um GeoJsonPolygon

    // Construtor padrão
    public AreaCoordinates() {}

    // Construtor que aceita um GeoJsonPolygon
    public AreaCoordinates(GeoJsonPolygon coordinates) {
        this.coordinates = coordinates;
    }

    // Getters e Setters
    public GeoJsonPolygon getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(GeoJsonPolygon coordinates) {
        this.coordinates = coordinates;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
