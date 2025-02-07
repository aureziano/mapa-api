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
    net-tools \
    nano \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar os arquivos de configuração do Tomcat
COPY tomcat/conf/tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY tomcat/conf/server.xml /usr/local/tomcat/conf/server.xml   
COPY tomcat/conf/context.xml /usr/local/tomcat/conf/context.xml

COPY tomcat/webapps/ /usr/local/tomcat/webapps

# Criar diretórios e copiar o context.xml atualizado para habilitar acesso remoto ao Manager
RUN mkdir -p /usr/local/tomcat/webapps/manager/META-INF \
    && mkdir -p /usr/local/tomcat/webapps/host-manager/META-INF \
    && echo '<Context privileged="true" antiResourceLocking="false" docBase="manager">' > /usr/local/tomcat/webapps/manager/META-INF/context.xml \
    && echo '  <Valve className="org.apache.catalina.valves.RemoteAddrValve" allow="^.*$"/>' >> /usr/local/tomcat/webapps/manager/META-INF/context.xml \
    && echo '</Context>' >> /usr/local/tomcat/webapps/manager/META-INF/context.xml \
    && echo '<Context privileged="true" antiResourceLocking="false" docBase="host-manager">' > /usr/local/tomcat/webapps/host-manager/META-INF/context.xml \
    && echo '  <Valve className="org.apache.catalina.valves.RemoteAddrValve" allow="^.*$"/>' >> /usr/local/tomcat/webapps/host-manager/META-INF/context.xml \
    && echo '</Context>' >> /usr/local/tomcat/webapps/host-manager/META-INF/context.xml


# Copiar a WAR gerada no stage anterior para o Tomcat
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war

# Copiar o script wait-for-it.sh
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Definir variáveis de ambiente com valores padrão
ARG MYSQL_HOST=mysql
ARG MYSQL_PORT=3311
ARG MONGODB_HOST=mongodb
ARG MONGODB_PORT=27017
ARG BACKEND_PORT=8086
ARG MYSQL_DATABASE=teste
ARG MYSQL_ROOT_PASSWORD=150202
ARG MONGODB_USERNAME=admin
ARG MONGODB_PASSWORD=password

# Definir variáveis de ambiente (certifique-se de que as variáveis estejam corretamente no formato nome=valor)
ENV MYSQL_HOST=${MYSQL_HOST}
ENV MYSQL_PORT=${MYSQL_PORT}
ENV MONGODB_HOST=${MONGODB_HOST}
ENV MONGODB_PORT=${MONGODB_PORT}
ENV SERVER_PORT=${BACKEND_PORT}
ENV MYSQL_DATABASE=${MYSQL_DATABASE}
ENV MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
ENV MONGODB_USERNAME=${MONGODB_USERNAME}
ENV MONGODB_PASSWORD=${MONGODB_PASSWORD}

# Substituir a porta padrão do Tomcat no server.xml por garantia
RUN sed -i "s/port=\"8080\"/port=\"$SERVER_PORT\"/g" /usr/local/tomcat/conf/server.xml

# Definir o healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:${SERVER_PORT}/actuator/health || exit 1

# Expor a porta definida
EXPOSE ${SERVER_PORT}

# Rodar o Tomcat com a variável de ambiente de porta
CMD ["/bin/sh", "-c", "echo 'MYSQL_HOST:' $MYSQL_HOST 'MYSQL_PORT:' $MYSQL_PORT && /wait-for-it.sh $MYSQL_HOST:$MYSQL_PORT -t 180 && /wait-for-it.sh $MONGODB_HOST:$MONGODB_PORT -t 180 && catalina.sh run -Dserver.port=$SERVER_PORT"]
