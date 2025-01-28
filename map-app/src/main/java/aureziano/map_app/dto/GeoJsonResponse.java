package aureziano.map_app.dto;

import java.util.List;

import org.springframework.data.mongodb.core.geo.GeoJsonLineString;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GeoJsonResponse {
    private String id;
        private Object coordinates;  // Pode ser GeoJsonPolygon ou outras coordenadas
        private String color;
        private String fillColor;
        private String description;
        private String name;
        private String mongoId;

        public GeoJsonResponse(String id, Object coordinates, String color, String fillColor, String description, String name, String mongoId) {
            this.id = id;
            this.coordinates = coordinates;
            this.color = color;
            this.fillColor = fillColor;
            this.description = description;
            this.name = name; 
            this.mongoId = mongoId;
        }

        // Getters e setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public Object getCoordinates() {
            return coordinates;
        }

        public void setCoordinates(Object coordinates) {
            this.coordinates = coordinates;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }

        public String getFillColor() {
            return fillColor;
        }

        public void setFillColor(String fillColor) {
            this.fillColor = fillColor;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getMongoId()
        {
            return mongoId;
        }

        public void setMongoId(String mongoId)
        {
            this.mongoId = mongoId;
        }
}
