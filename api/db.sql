
-- Создание таблиц для проекта BookWorm

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица авторизационных токенов
CREATE TABLE IF NOT EXISTS tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица разрешений доступа к библиотекам
CREATE TABLE IF NOT EXISTS authorizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_auth (owner_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица книг
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id INT NOT NULL,
    cover_url VARCHAR(512),
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Создание тестовых данных
INSERT INTO users (username, password) VALUES 
('admin', '$2y$10$UvPL4frN.xeU.MBasql4x.zSQNIFSrWlZ.8XW1WoH7xfNW.YX.nRS'), -- password: admin123
('user1', '$2y$10$nmeTwZE4PXAKOr5iQf9.dOEY.QMsVM3V5TKPjihcWLT5T2QHFEk9C'), -- password: password1
('user2', '$2y$10$r1K09WdfsQ6S1PyZZaMaG.92jxfVFebk2a80Bj5zGLFGvhMEO4VwO'); -- password: password2

-- Выдача доступа между пользователями
INSERT INTO authorizations (owner_id, user_id) VALUES 
(1, 2),
(2, 3);

-- Создание тестовых книг
INSERT INTO books (title, content, author_id, cover_url) VALUES 
('Война и мир', 'Это великая книга о войне 1812 года...', 1, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Tolstoy_-_War_and_Peace_-_first_edition%2C_1869.jpg/220px-Tolstoy_-_War_and_Peace_-_first_edition%2C_1869.jpg'),
('Преступление и наказание', 'Психологический роман о...', 1, 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Dostoevsky-Prestuplenie_i_nakazanie.jpg/220px-Dostoevsky-Prestuplenie_i_nakazanie.jpg'),
('Мастер и Маргарита', 'Известный роман о Воланде...', 2, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/The_Master_and_Margarita_%281st_edition%2C_1967%29.jpg/220px-The_Master_and_Margarita_%281st_edition%2C_1967%29.jpg'),
('Идиот', 'История князя Мышкина...', 3, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Dostoevsky-Idiot.jpg/220px-Dostoevsky-Idiot.jpg');
