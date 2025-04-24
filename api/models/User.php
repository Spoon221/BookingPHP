
<?php
class User {
    private $conn;
    private $table_name = "users";
    
    public $id;
    public $username;
    public $password;
    public $authorizedUsers;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Создание нового пользователя
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (username, password) VALUES (:username, :password)";
        
        $stmt = $this->conn->prepare($query);
        
        // Очистка и защита входных данных
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->password = password_hash($this->password, PASSWORD_BCRYPT);
        
        // Привязка параметров
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':password', $this->password);
        
        // Выполнение запроса
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Проверка существования пользователя с таким же именем
    public function usernameExists() {
        $query = "SELECT id, username, password FROM " . $this->table_name . " WHERE username = :username LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $this->username);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->username = $row['username'];
            $this->password = $row['password'];
            return true;
        }
        
        return false;
    }
    
    // Получение пользователя по ID
    public function read() {
        $query = "SELECT id, username FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->username = $row['username'];
            return true;
        }
        
        return false;
    }
    
    // Получение всех пользователей
    public function readAll() {
        $query = "SELECT id, username FROM " . $this->table_name;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Выдача доступа к библиотеке
    public function grantAccess($userId) {
        // Сначала проверим существующие разрешения
        $query = "SELECT * FROM authorizations WHERE owner_id = :owner_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':owner_id', $this->id);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        // Если разрешение уже существует, вернуть true
        if ($stmt->rowCount() > 0) {
            return true;
        }
        
        // Создание нового разрешения
        $query = "INSERT INTO authorizations (owner_id, user_id) VALUES (:owner_id, :user_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':owner_id', $this->id);
        $stmt->bindParam(':user_id', $userId);
        
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Проверка наличия доступа к библиотеке
    public function hasAccess($ownerId) {
        // Владелец всегда имеет доступ к своей библиотеке
        if ($this->id == $ownerId) {
            return true;
        }
        
        $query = "SELECT * FROM authorizations WHERE owner_id = :owner_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':owner_id', $ownerId);
        $stmt->bindParam(':user_id', $this->id);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
    
    // Получение пользователя по ID для проверки токена
    public function getUserById($id) {
        $query = "SELECT id, username FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        return false;
    }
}
