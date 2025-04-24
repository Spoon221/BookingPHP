
<?php
class Token {
    private $conn;
    private $table_name = "tokens";
    
    public $id;
    public $user_id;
    public $token;
    public $created_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Создание нового токена
    public function create() {
        // Удаляем старые токены пользователя
        $this->deleteUserTokens();
        
        // Генерируем новый токен
        $this->token = bin2hex(random_bytes(32));
        $this->created_at = date('Y-m-d H:i:s');
        
        $query = "INSERT INTO " . $this->table_name . " (user_id, token, created_at) 
                  VALUES (:user_id, :token, :created_at)";
        
        $stmt = $this->conn->prepare($query);
        
        // Привязка параметров
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':token', $this->token);
        $stmt->bindParam(':created_at', $this->created_at);
        
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Проверка токена
    public function validate() {
        $query = "SELECT t.*, u.id as user_id, u.username 
                  FROM " . $this->table_name . " t
                  JOIN users u ON t.user_id = u.id
                  WHERE t.token = :token LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $this->token);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return [
                'id' => $row['user_id'],
                'username' => $row['username']
            ];
        }
        
        return false;
    }
    
    // Удаление всех токенов пользователя
    public function deleteUserTokens() {
        $query = "DELETE FROM " . $this->table_name . " WHERE user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();
    }
    
    // Удаление токена
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE token = :token";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $this->token);
        
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
}
