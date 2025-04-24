# Bookworm API Backend

Это RESTful API бэкенд для приложения Bookworm, построенный с использованием PHP 8.2 и MySQL 8.

## Содержание
- [Требования](#требования)
- [Установка](#установка)
- [Настройка базы данных](#настройка-базы-данных)
- [Настройка веб-сервера](#настройка-веб-сервера)
- [Запуск приложения](#запуск-приложения)
- [API Эндпоинты](#api-эндпоинты)
- [Структура базы данных](#структура-базы-данных)
- [Структура проекта](#структура-проекта)
- [Используемые технологии](#используемые-технологии)

## Требования

Перед началом работы убедитесь, что у вас установлено:
- PHP 8.2 или выше
- MySQL 8.0 или выше
- Apache/Nginx веб-сервер
- Composer (менеджер зависимостей PHP)
- Git

## Установка

1. Клонируйте репозиторий:
```bash
git clone <url-репозитория>
cd bookworm-api-backend
```

2. Установите зависимости через Composer:
```bash
composer install
```

## Настройка базы данных

1. Убедитесь, что MySQL сервер запущен
2. Создайте файл `.env` в корневой директории проекта:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=bookworm_db
JWT_SECRET=your_jwt_secret
```

3. Импортируйте схему базы данных:
```bash
mysql -u your_username -p < src/database/schema.sql
```

## Настройка веб-сервера

### Apache
1. Убедитесь, что модуль mod_rewrite включен
2. Настройте виртуальный хост, указывающий на корневую директорию проекта
3. Убедитесь, что файл .htaccess доступен для чтения

### Nginx
Добавьте следующую конфигурацию в ваш виртуальный хост:
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

## Структура базы данных

База данных спроектирована в 3-й нормальной форме и включает следующие таблицы:

### Таблицы
1. `users` - информация о пользователях
2. `books` - информация о книгах
3. `genres` - жанры книг
4. `book_genres` - связь книг с жанрами (многие-ко-многим)
5. `reviews` - рецензии на книги
6. `user_favorites` - избранные книги пользователей

### Основные поля таблиц

#### users
- id (INT, PRIMARY KEY)
- username (VARCHAR(50), UNIQUE)
- email (VARCHAR(100), UNIQUE)
- password_hash (VARCHAR(255))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### books
- id (INT, PRIMARY KEY)
- title (VARCHAR(255))
- author (VARCHAR(100))
- description (TEXT)
- publication_year (INT)
- isbn (VARCHAR(13), UNIQUE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### reviews
- id (INT, PRIMARY KEY)
- book_id (INT, FOREIGN KEY)
- user_id (INT, FOREIGN KEY)
- rating (INT, CHECK 1-5)
- text (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Запуск приложения

### Режим разработки
```bash
npm run dev
```
Сервер разработки запустится с включенной функцией горячей перезагрузки.

### Сборка для продакшена
```bash
npm run build
npm run preview
```

## API Эндпоинты

### Аутентификация

#### Регистрация пользователя
- **POST** `/api/auth/register`
- **Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```
- **Ответ:** 
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### Вход в систему
- **POST** `/api/auth/login`
- **Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Ответ:** 
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### Книги

#### Получение всех книг
- **GET** `/api/books`
- **Ответ:**
```json
[
  {
    "id": "book_id",
    "title": "Название книги",
    "author": "Автор",
    "description": "Описание книги",
    "rating": 4.5,
    "genres": ["Жанр1", "Жанр2"]
  }
]
```

#### Создание новой книги
- **POST** `/api/books`
- **Тело запроса:**
```json
{
  "title": "Название книги",
  "author": "Автор",
  "description": "Описание книги",
  "genres": ["Жанр1", "Жанр2"]
}
```
- **Ответ:** 
```json
{
  "id": "book_id",
  "title": "Название книги",
  "author": "Автор",
  "description": "Описание книги",
  "genres": ["Жанр1", "Жанр2"]
}
```

### Рецензии

#### Получение рецензий для книги
- **GET** `/api/books/:bookId/reviews`
- **Ответ:**
```json
[
  {
    "id": "review_id",
    "bookId": "book_id",
    "userId": "user_id",
    "rating": 5,
    "text": "Текст рецензии",
    "createdAt": "2024-03-20T12:00:00Z",
    "user": {
      "username": "username"
    }
  }
]
```

#### Создание рецензии
- **POST** `/api/books/:bookId/reviews`
- **Тело запроса:**
```json
{
  "rating": 5,
  "text": "Текст рецензии"
}
```
- **Ответ:**
```json
{
  "id": "review_id",
  "bookId": "book_id",
  "userId": "user_id",
  "rating": 5,
  "text": "Текст рецензии",
  "createdAt": "2024-03-20T12:00:00Z"
}
```

### Профиль пользователя

#### Получение профиля пользователя
- **GET** `/api/users/:id`
- **Ответ:**
```json
{
  "id": "user_id",
  "username": "username",
  "email": "user@example.com",
  "createdAt": "2024-03-20T12:00:00Z",
  "favoriteBooks": [
    {
      "id": "book_id",
      "title": "Название книги",
      "author": "Автор"
    }
  ]
}
```

## Структура проекта

```
src/
├── api/           # API маршруты и контроллеры
├── config/        # Файлы конфигурации
├── database/      # Схема базы данных
├── models/        # Модели базы данных
├── services/      # Бизнес-логика
└── utils/         # Вспомогательные функции
```

## Используемые технологии

- PHP 8.2
- MySQL 8
- PDO для работы с базой данных
- JWT для аутентификации
- Apache/Nginx для веб-сервера

## Тестирование

Для запуска тестов:
```bash
npm test
```

## Лицензия

Этот проект лицензирован под MIT License - подробности в файле LICENSE.
