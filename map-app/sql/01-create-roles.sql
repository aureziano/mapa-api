CREATE DATABASE IF NOT EXISTS teste;
USE teste;

-- Criação da tabela roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);


-- Inserção de roles apenas se não existirem
INSERT IGNORE INTO roles (name) VALUES
    ('ROLE_ADMIN'),
    ('ROLE_USER');