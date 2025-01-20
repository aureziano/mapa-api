# Base Tomcat com JDK 17
FROM tomcat:9.0-jdk17

# Instalar ferramentas de rede (ssh, netcat, telnet)
RUN apt-get update && apt-get install -y \
    openssh-client \
    telnet \
    netcat-openbsd \
    && apt-get clean

ARG JAR_FILE=target/*.war  
COPY ${JAR_FILE} app.war  

# Copiar o arquivo .war gerado para o diretório webapps do Tomcat
COPY app.war  /usr/local/tomcat/webapps/

# # Copiar o script de inicialização
# COPY init_ssh.sh /usr/local/tomcat/init_ssh.sh
# RUN chmod +x /usr/local/tomcat/init_ssh.sh

# Configurar o diretório de trabalho
WORKDIR /usr/local/tomcat

# Expor a porta 8080
EXPOSE 8080

# # Comando para iniciar o Tomcat com o script de inicialização
CMD ["/bin/sh", "-c", "catalina.sh run"]
