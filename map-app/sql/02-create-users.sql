CREATE DATABASE IF NOT EXISTS teste;
USE teste;

-- Criação da tabela users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    fullname VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    token_expiration DATETIME
);


-- Inserção de usuário apenas se não existir
INSERT IGNORE INTO users (cpf, email, fullname, password, first_name, last_name)
SELECT '45538395715', 'teste@teste.com', 'Teste teste', '$2a$10$/vGF21vc6r/vYj/VVwDf3.rS5BMGuFQUBxwtM0qZ9bukzZSFMhFei', 'Teste', 'teste'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE cpf = '45538395715');