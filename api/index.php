
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Обработка предварительных запросов OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';
require_once 'Database.php';
require_once 'controllers/AuthController.php';
require_once 'controllers/UserController.php';
require_once 'controllers/BookController.php';
require_once 'controllers/SearchController.php';

// Получаем URI и метод запроса
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', trim($uri, '/'));

// Проверяем базовый путь API
if (!isset($uri[1]) || $uri[1] !== 'api') {
    header("HTTP/1.1 404 Not Found");
    echo json_encode(['error' => 'API endpoint not found']);
    exit();
}

// Маршрутизация запросов
$route = isset($uri[2]) ? $uri[2] : '';
$id = isset($uri[3]) ? $uri[3] : null;
$action = isset($uri[4]) ? $uri[4] : null;

// Инициализация базы данных
$database = new Database();
$db = $database->getConnection();

// Проверка аутентификации для защищенных маршрутов
$protected_routes = ['users', 'books', 'search'];
if (in_array($route, $protected_routes)) {
    // Проверка заголовка Authorization для защищенных маршрутов
    $headers = apache_request_headers();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    
    if (!$token) {
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode(['error' => 'Требуется авторизация']);
        exit();
    }
    
    // Проверка токена
    $authController = new AuthController($db);
    $user = $authController->verifyToken($token);
    
    if (!$user) {
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode(['error' => 'Недействительный токен авторизации']);
        exit();
    }
    
    // Установка текущего пользователя для использования в контроллерах
    $GLOBALS['current_user'] = $user;
}

// Маршрутизация на соответствующие контроллеры
switch ($route) {
    case 'auth':
        $controller = new AuthController($db);
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset($uri[3]) && $uri[3] === 'register') {
                $controller->register();
            } else {
                $controller->login();
            }
        } else {
            header("HTTP/1.1 405 Method Not Allowed");
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case 'users':
        $controller = new UserController($db);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($id && $action === 'books') {
                $bookController = new BookController($db);
                $bookController->getUserBooks($id);
            } else {
                $controller->getUsers();
            }
        } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if ($id && $action === 'grant') {
                $controller->grantAccess($id);
            } else {
                header("HTTP/1.1 404 Not Found");
                echo json_encode(['error' => 'Endpoint not found']);
            }
        } else {
            header("HTTP/1.1 405 Method Not Allowed");
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case 'books':
        $controller = new BookController($db);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($id) {
                $controller->getBook($id);
            } else {
                $controller->getBooks();
            }
        } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if ($id && $action === 'restore') {
                $controller->restoreBook($id);
            } else {
                $controller->createBook();
            }
        } else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            if ($id) {
                $controller->updateBook($id);
            } else {
                header("HTTP/1.1 400 Bad Request");
                echo json_encode(['error' => 'Book ID is required']);
            }
        } else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            if ($id) {
                $controller->deleteBook($id);
            } else {
                header("HTTP/1.1 400 Bad Request");
                echo json_encode(['error' => 'Book ID is required']);
            }
        } else {
            header("HTTP/1.1 405 Method Not Allowed");
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case 'search':
        $controller = new SearchController($db);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->searchBooks();
        } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if ($id) {
                $controller->saveFoundBook($id);
            } else {
                header("HTTP/1.1 400 Bad Request");
                echo json_encode(['error' => 'Book ID is required']);
            }
        } else {
            header("HTTP/1.1 405 Method Not Allowed");
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    default:
        header("HTTP/1.1 404 Not Found");
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
