CREATE DATABASE IF NOT EXISTS teste;
USE teste;


-- Criação da tabela users_roles
CREATE TABLE IF NOT EXISTS users_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Inserção de user_role apenas se não existir
INSERT IGNORE INTO users_roles (user_id, role_id)
SELECT 1, 2
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
  AND EXISTS (SELECT 1 FROM roles WHERE id = 2)
  AND NOT EXISTS (SELECT 1 FROM users_roles WHERE user_id = 1 AND role_id = 1);