
<?php
require_once 'models/User.php';

class UserController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    // Получение списка всех пользователей
    public function getUsers() {
        $user = new User($this->db);
        $stmt = $user->readAll();
        $num = $stmt->rowCount();
        
        if ($num > 0) {
            $users_arr = [];
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $user_item = [
                    'id' => $row['id'],
                    'username' => $row['username']
                ];
                
                array_push($users_arr, $user_item);
            }
            
            http_response_code(200);
            echo json_encode($users_arr);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Пользователи не найдены']);
        }
    }
    
    // Выдача доступа к библиотеке
    public function grantAccess($userId) {
        // Получение ID текущего пользователя
        $currentUser = $GLOBALS['current_user'];
        
        // Проверка, что пользователь не пытается дать доступ самому себе
        if ($currentUser['id'] == $userId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Нельзя дать доступ самому себе']);
            return;
        }
        
        // Проверка существования целевого пользователя
        $targetUser = new User($this->db);
        $targetUser->id = $userId;
        
        if (!$targetUser->read()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
            return;
        }
        
        // Выдача доступа
        $user = new User($this->db);
        $user->id = $currentUser['id'];
        
        if ($user->grantAccess($userId)) {
            http_response_code(200);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Не удалось выдать доступ']);
        }
    }
}
