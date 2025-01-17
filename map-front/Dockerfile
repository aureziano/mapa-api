# Etapa 1: Construir a aplicação (build stage)
FROM node:18 AS build

# Define o diretório de trabalho no contêiner
WORKDIR /app

# Copia o package.json e package-lock.json (ou yarn.lock) para o contêiner
COPY package*.json ./

# Instala as dependências da aplicação
RUN npm install

# Copia o restante dos arquivos da aplicação para o contêiner
COPY . .

# Realiza o build da aplicação
RUN npm run build

# Etapa 2: Servir a aplicação (production stage)
FROM nginx:alpine

# Copia os arquivos buildados para o diretório de onde o Nginx servirá a aplicação
COPY --from=build /app/build /usr/share/nginx/html

# Expõe a porta 80 para acesso à aplicação
EXPOSE 80

# Comando para rodar o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
