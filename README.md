# Projeto de Mapeamento

React
Spring Boot
MySQL
MongoDB
Docker
Nginx

## Descrição

Este projeto consiste em uma aplicação de mapeamento com frontend em React e backend em Spring Boot, utilizando MySQL e MongoDB como bancos de dados. A aplicação é containerizada usando Docker para facilitar o desenvolvimento e implantação.

## Estrutura do Projeto

```
.
├── map-front/
│   ├── Dockerfile
│   └── package.json
├── map-app/
│   ├── Dockerfile
│   ├── pom.xml
│   ├── sql/
│   │   ├── 01-create-roles.sql
│   │   ├── 02-create-users.sql
│   │   └── 03-create-users_roles.sql
│   └── mongo/
|       ├── init-mongo.js
│       └── areasdb.areaEstado.json
└── docker-compose.yml
```

## Pré-requisitos

- Docker
- Docker Compose

## Configuração e Execução

1. Clone o repositório:
   ```
   git clone [URL_DO_REPOSITÓRIO]
   cd [NOME_DO_DIRETÓRIO]
   ```

2. Construa e inicie os contêineres:
   ```
   docker-compose up --build
   ```

3. Acesse a aplicação:
   - Frontend: `http://localhost:80`
   - Backend: `http://localhost:8080`

## Serviços

- **Frontend**: React servido pelo Nginx
- **Backend**: Spring Boot rodando no Tomcat
- **Banco de Dados**:
  - MySQL (Porta 3311)
  - MongoDB (Porta 27018)

## Dados Iniciais

Os dados iniciais são carregados automaticamente:
- MySQL: roles, users, e users_roles
- MongoDB: áreas do estado

## Desenvolvimento

Para desenvolvimento local:

1. Frontend:
   ```
   cd map-front
   npm install
   npm start
   ```

2. Backend:
   ```
   cd map-app
   ./mvnw spring-boot:run
   ```

## Contribuição

Para contribuir com o projeto, por favor:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Faça commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

[Inserir informações sobre a licença aqui]

