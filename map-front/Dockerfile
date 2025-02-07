# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 755 /usr/share/nginx/html

ARG FRONTEND_PORT
ENV FRONTEND_PORT=${FRONTEND_PORT:-80}
EXPOSE ${FRONTEND_PORT}

CMD ["nginx", "-g", "daemon off;"]
