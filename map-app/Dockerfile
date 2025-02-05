# Build stage
FROM maven:3.8.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM tomcat:9.0-jdk17
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8086/actuator/health || exit 1

EXPOSE 8080
CMD ["/wait-for-it.sh", "mysql:3306", "--", "/wait-for-it.sh", "mongodb:27017", "--", "catalina.sh", "run"]
