
<?php
require_once 'models/User.php';
require_once 'models/Token.php';

class AuthController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    // Регистрация нового пользователя
    public function register() {
        // Проверка наличия необходимых данных
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->username) || !isset($data->password) || !isset($data->confirmPassword)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Заполните все необходимые поля']);
            return;
        }
        
        // Проверка совпадения паролей
        if ($data->password !== $data->confirmPassword) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Пароли не совпадают']);
            return;
        }
        
        // Создание нового пользователя
        $user = new User($this->db);
        $user->username = $data->username;
        $user->password = $data->password;
        
        // Проверка существования пользователя с таким именем
        if ($user->usernameExists()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Пользователь с таким именем уже существует']);
            return;
        }
        
        // Добавление пользователя в базу данных
        if ($user->create()) {
            // Создание токена для пользователя
            $token = new Token($this->db);
            $token->user_id = $user->id;
            
            if ($token->create()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'token' => $token->token,
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Не удалось создать токен авторизации']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Не удалось зарегистрировать пользователя']);
        }
    }
    
    // Аутентификация пользователя
    public function login() {
        // Проверка наличия необходимых данных
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->username) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Заполните все необходимые поля']);
            return;
        }
        
        // Проверка пользователя
        $user = new User($this->db);
        $user->username = $data->username;
        
        if ($user->usernameExists()) {
            // Проверка пароля
            if (password_verify($data->password, $user->password)) {
                // Создание токена для пользователя
                $token = new Token($this->db);
                $token->user_id = $user->id;
                
                if ($token->create()) {
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'token' => $token->token,
                        'user' => [
                            'id' => $user->id,
                            'username' => $user->username
                        ]
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Не удалось создать токен авторизации']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Неверный пароль']);
            }
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
        }
    }
    
    // Проверка токена авторизации
    public function verifyToken($token) {
        $tokenObj = new Token($this->db);
        $tokenObj->token = $token;
        
        return $tokenObj->validate();
    }
}
