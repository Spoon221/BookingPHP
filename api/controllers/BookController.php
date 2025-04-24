
<?php
require_once 'models/Book.php';
require_once 'models/User.php';

class BookController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    // Получение списка книг текущего пользователя
    public function getBooks() {
        $currentUser = $GLOBALS['current_user'];
        
        $book = new Book($this->db);
        $stmt = $book->getUserBooks($currentUser['id']);
        $num = $stmt->rowCount();
        
        if ($num > 0) {
            $books_arr = [];
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $book_item = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'coverUrl' => $row['cover_url']
                ];
                
                array_push($books_arr, $book_item);
            }
            
            http_response_code(200);
            echo json_encode($books_arr);
        } else {
            http_response_code(200);
            echo json_encode([]);
        }
    }
    
    // Получение книг указанного пользователя
    public function getUserBooks($userId) {
        $currentUser = $GLOBALS['current_user'];
        
        // Проверка доступа к библиотеке
        $user = new User($this->db);
        $user->id = $currentUser['id'];
        
        if (!$user->hasAccess($userId)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'У вас нет доступа к библиотеке этого пользователя']);
            return;
        }
        
        $book = new Book($this->db);
        $stmt = $book->getUserBooks($userId);
        $num = $stmt->rowCount();
        
        if ($num > 0) {
            $books_arr = [];
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $book_item = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'coverUrl' => $row['cover_url']
                ];
                
                array_push($books_arr, $book_item);
            }
            
            http_response_code(200);
            echo json_encode($books_arr);
        } else {
            http_response_code(200);
            echo json_encode([]);
        }
    }
    
    // Создание книги
    public function createBook() {
        $currentUser = $GLOBALS['current_user'];
        
        // Проверка наличия необходимых данных
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        
        if (strpos($contentType, 'application/json') !== false) {
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->title)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Название книги обязательно']);
                return;
            }
            
            $title = $data->title;
            $content = isset($data->content) ? $data->content : '';
            $coverUrl = isset($data->coverUrl) ? $data->coverUrl : null;
        } else {
            // Обработка формы с файлом
            if (!isset($_POST['title'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Название книги обязательно']);
                return;
            }
            
            $title = $_POST['title'];
            $content = isset($_POST['content']) ? $_POST['content'] : '';
            $coverUrl = isset($_POST['coverUrl']) ? $_POST['coverUrl'] : null;
            
            // Если передан файл вместо content
            if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
                $fileContent = file_get_contents($_FILES['file']['tmp_name']);
                if (!empty($fileContent) && empty($content)) {
                    $content = $fileContent;
                }
            }
        }
        
        // Создание книги
        $book = new Book($this->db);
        $book->title = $title;
        $book->content = $content;
        $book->author_id = $currentUser['id'];
        $book->cover_url = $coverUrl;
        
        if ($book->create()) {
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'bookId' => $book->id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Не удалось создать книгу']);
        }
    }
    
    // Получение книги по ID
    public function getBook($id) {
        $currentUser = $GLOBALS['current_user'];
        
        $book = new Book($this->db);
        $book->id = $id;
        
        if ($book->read()) {
            // Проверка доступа к книге
            $user = new User($this->db);
            $user->id = $currentUser['id'];
            
            if ($user->hasAccess($book->author_id)) {
                http_response_code(200);
                echo json_encode([
                    'id' => $book->id,
                    'title' => $book->title,
                    'content' => $book->content,
                    'authorId' => $book->author_id,
                    'coverUrl' => $book->cover_url
                ]);
            } else {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'У вас нет доступа к этой книге']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Книга не найдена']);
        }
    }
    
    // Обновление книги
    public function updateBook($id) {
        $currentUser = $GLOBALS['current_user'];
        
        // Проверка наличия необходимых данных
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->title) || !isset($data->content)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Название и содержание книги обязательны']);
            return;
        }
        
        // Проверка прав на редактирование
        $book = new Book($this->db);
        $book->id = $id;
        
        if (!$book->isAuthor($currentUser['id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'У вас нет прав редактировать эту книгу']);
            return;
        }
        
        // Обновление книги
        $book->title = $data->title;
        $book->content = $data->content;
        $book->cover_url = isset($data->coverUrl) ? $data->coverUrl : null;
        $book->author_id = $currentUser['id'];
        
        if ($book->update()) {
            http_response_code(200);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Не удалось обновить книгу']);
        }
    }
    
    // Удаление книги
    public function deleteBook($id) {
        $currentUser = $GLOBALS['current_user'];
        
        // Проверка прав на удаление
        $book = new Book($this->db);
        $book->id = $id;
        
        if (!$book->isAuthor($currentUser['id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'У вас нет прав удалить эту книгу']);
            return;
        }
        
        // Удаление (мягкое) книги
        $book->author_id = $currentUser['id'];
        
        if ($book->delete()) {
            http_response_code(200);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Не удалось удалить книгу']);
        }
    }
    
    // Восстановление книги
    public function restoreBook($id) {
        $currentUser = $GLOBALS['current_user'];
        
        // Проверка прав на восстановление
        $book = new Book($this->db);
        $book->id = $id;
        
        if (!$book->isAuthor($currentUser['id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'У вас нет прав восстановить эту книгу']);
            return;
        }
        
        // Восстановление книги
        $book->author_id = $currentUser['id'];
        
        if ($book->restore()) {
            http_response_code(200);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Не удалось восстановить книгу']);
        }
    }
}
