
<?php
require_once 'models/Book.php';

class SearchController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    // Поиск книг через внешний API
    public function searchBooks() {
        $currentUser = $GLOBALS['current_user'];
        
        // Получаем строку поиска
        $query = isset($_GET['q']) ? $_GET['q'] : '';
        
        if (empty($query)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Строка поиска обязательна']);
            return;
        }
        
        try {
            // Запрос к Google Books API
            $url = 'https://www.googleapis.com/books/v1/volumes?q=' . urlencode($query);
            $response = file_get_contents($url);
            $data = json_decode($response, true);
            
            if (!isset($data['items']) || empty($data['items'])) {
                http_response_code(200);
                echo json_encode([]);
                return;
            }
            
            $books_arr = [];
            
            foreach ($data['items'] as $item) {
                $book = [
                    'id' => $item['id'],
                    'title' => isset($item['volumeInfo']['title']) ? $item['volumeInfo']['title'] : 'Без названия',
                    'authors' => isset($item['volumeInfo']['authors']) ? $item['volumeInfo']['authors'] : [],
                    'description' => isset($item['volumeInfo']['description']) ? $item['volumeInfo']['description'] : '',
                    'coverUrl' => isset($item['volumeInfo']['imageLinks']['thumbnail']) ? $item['volumeInfo']['imageLinks']['thumbnail'] : null
                ];
                
                array_push($books_arr, $book);
            }
            
            http_response_code(200);
            echo json_encode($books_arr);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Ошибка при поиске книг: ' . $e->getMessage()]);
        }
    }
    
    // Сохранение найденной книги
    public function saveFoundBook($bookId) {
        $currentUser = $GLOBALS['current_user'];
        
        try {
            // Получаем данные о книге из Google Books API
            $url = 'https://www.googleapis.com/books/v1/volumes/' . urlencode($bookId);
            $response = file_get_contents($url);
            $data = json_decode($response, true);
            
            if (!isset($data['volumeInfo'])) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Книга не найдена']);
                return;
            }
            
            // Создаем книгу
            $book = new Book($this->db);
            $book->title = isset($data['volumeInfo']['title']) ? $data['volumeInfo']['title'] : 'Без названия';
            $book->content = isset($data['volumeInfo']['description']) ? $data['volumeInfo']['description'] : 'Описание отсутствует';
            $book->author_id = $currentUser['id'];
            $book->cover_url = isset($data['volumeInfo']['imageLinks']['thumbnail']) ? $data['volumeInfo']['imageLinks']['thumbnail'] : null;
            
            if ($book->create()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'bookId' => $book->id
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Не удалось сохранить книгу']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Ошибка при сохранении книги: ' . $e->getMessage()]);
        }
    }
}
