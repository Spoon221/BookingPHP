
<?php
class Book {
    private $conn;
    private $table_name = "books";
    
    public $id;
    public $title;
    public $content;
    public $author_id;
    public $deleted;
    public $cover_url;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Создание новой книги
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (title, content, author_id, cover_url, deleted) 
                  VALUES (:title, :content, :author_id, :cover_url, 0)";
        
        $stmt = $this->conn->prepare($query);
        
        // Очистка данных
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->content = htmlspecialchars(strip_tags($this->content));
        $this->cover_url = $this->cover_url ? htmlspecialchars(strip_tags($this->cover_url)) : null;
        
        // Привязка параметров
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':content', $this->content);
        $stmt->bindParam(':author_id', $this->author_id);
        $stmt->bindParam(':cover_url', $this->cover_url);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Получение книги по ID
    public function read() {
        $query = "SELECT b.*, u.username as author_name 
                  FROM " . $this->table_name . " b
                  LEFT JOIN users u ON b.author_id = u.id
                  WHERE b.id = :id AND b.deleted = 0 LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->title = $row['title'];
            $this->content = $row['content'];
            $this->author_id = $row['author_id'];
            $this->cover_url = $row['cover_url'];
            $this->deleted = $row['deleted'];
            
            return true;
        }
        
        return false;
    }
    
    // Получение всех книг пользователя
    public function getUserBooks($userId) {
        $query = "SELECT id, title, cover_url FROM " . $this->table_name . " 
                  WHERE author_id = :author_id AND deleted = 0";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':author_id', $userId);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Обновление книги
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET title = :title, content = :content, cover_url = :cover_url 
                  WHERE id = :id AND author_id = :author_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Очистка данных
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->content = htmlspecialchars(strip_tags($this->content));
        $this->cover_url = $this->cover_url ? htmlspecialchars(strip_tags($this->cover_url)) : null;
        
        // Привязка параметров
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':content', $this->content);
        $stmt->bindParam(':cover_url', $this->cover_url);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':author_id', $this->author_id);
        
        if ($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        
        return false;
    }
    
    // Мягкое удаление книги
    public function delete() {
        $query = "UPDATE " . $this->table_name . " 
                  SET deleted = 1 
                  WHERE id = :id AND author_id = :author_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':author_id', $this->author_id);
        
        if ($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        
        return false;
    }
    
    // Восстановление книги
    public function restore() {
        $query = "UPDATE " . $this->table_name . " 
                  SET deleted = 0 
                  WHERE id = :id AND author_id = :author_id AND deleted = 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':author_id', $this->author_id);
        
        if ($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        
        return false;
    }
    
    // Проверка, является ли пользователь автором книги
    public function isAuthor($userId) {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE id = :id AND author_id = :author_id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':author_id', $userId);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
}
