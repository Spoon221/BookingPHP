// API клиент для взаимодействия с PHP бэкендом
import { toast } from "@/components/ui/use-toast";

// Определение базового URL для API
const API_BASE_URL = "/api"; // Путь к PHP API относительно корня приложения

// Типы для нашего приложения
export interface User {
  id: number;
  username: string;
  token?: string;
  authorizedUsers?: number[];
}

export interface Book {
  id: number;
  title: string;
  content: string;
  authorId: number;
  deleted?: boolean;
  coverUrl?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  coverUrl?: string;
}

// API Service класс
class BookwormAPI {
  // Текущий авторизованный пользователь
  private currentUser: User | null = null;
  
  // Хелпер для выполнения запросов с обработкой ошибок
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    try {
      // Если пользователь авторизован, добавляем токен к заголовкам
      if (this.isAuthenticated()) {
        const headers = {
          ...options.headers,
          'Authorization': `Bearer ${this.currentUser?.token}`
        };
        options.headers = headers;
      }
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API error');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Методы аутентификации
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Сохраняем информацию о пользователе и токен
        this.currentUser = {
          id: data.user.id,
          username: data.user.username,
          token: data.token
        };
        
        // Сохраняем токен в localStorage для сохранения сессии
        localStorage.setItem('bookworm_token', data.token);
        localStorage.setItem('bookworm_user', JSON.stringify({
          id: data.user.id,
          username: data.user.username
        }));
        
        return { success: true, token: data.token };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Ошибка авторизации' };
    }
  }
  
  async register(username: string, password: string, confirmPassword: string): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, confirmPassword })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Сохраняем информацию о пользователе и токен
        this.currentUser = {
          id: data.user.id,
          username: data.user.username,
          token: data.token
        };
        
        // Сохраняем токен в localStorage для сохранения сессии
        localStorage.setItem('bookworm_token', data.token);
        localStorage.setItem('bookworm_user', JSON.stringify({
          id: data.user.id,
          username: data.user.username
        }));
        
        return { success: true, token: data.token };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Ошибка регистрации' };
    }
  }
  
  logout(): void {
    // Удаляем информацию о пользователе и токен
    this.currentUser = null;
    localStorage.removeItem('bookworm_token');
    localStorage.removeItem('bookworm_user');
  }
  
  // Восстановление сессии из localStorage при инициализации приложения
  initAuth(): boolean {
    const token = localStorage.getItem('bookworm_token');
    const userJson = localStorage.getItem('bookworm_user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser = {
          ...user,
          token
        };
        return true;
      } catch (e) {
        this.logout();
      }
    }
    
    return false;
  }
  
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
  
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  // Методы для работы с пользователями
  async getUsers(): Promise<User[]> {
    try {
      const data = await this.fetchWithAuth('users');
      return data;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive"
      });
      throw error;
    }
  }
  
  async grantAccess(userId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const data = await this.fetchWithAuth(`users/${userId}/grant`, {
        method: 'POST'
      });
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось выдать доступ",
        variant: "destructive"
      });
      return { success: false, message: error.message };
    }
  }
  
  // Методы для работы с книгами
  async getUserBooks(): Promise<Book[]> {
    try {
      const data = await this.fetchWithAuth('books');
      return data;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список книг",
        variant: "destructive"
      });
      return [];
    }
  }
  
  async createBook(title: string, content: string, fileContent?: string): Promise<{ success: boolean; bookId?: number; message?: string }> {
    try {
      let formData;
      
      if (fileContent) {
        // Создаем FormData для отправки файла
        formData = new FormData();
        formData.append('title', title);
        
        // Создаем файл из содержимого
        const file = new Blob([fileContent], { type: 'text/plain' });
        formData.append('file', file, 'book.txt');
      } else {
        // Обычный JSON запрос
        const data = await this.fetchWithAuth('books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title, content })
        });
        
        return { success: true, bookId: data.bookId };
      }
      
      // Отправка formData
      const headers: Record<string, string> = {};
      if (this.isAuthenticated()) {
        headers['Authorization'] = `Bearer ${this.currentUser?.token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers,
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, bookId: data.bookId };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать книгу",
        variant: "destructive"
      });
      return { success: false, message: error.message };
    }
  }
  
  async getBook(bookId: number): Promise<Book | null> {
    try {
      const data = await this.fetchWithAuth(`books/${bookId}`);
      return data;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить книгу",
        variant: "destructive"
      });
      return null;
    }
  }
  
  async updateBook(bookId: number, title: string, content: string): Promise<{ success: boolean; message?: string }> {
    try {
      const data = await this.fetchWithAuth(`books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить книгу",
        variant: "destructive"
      });
      return { success: false, message: error.message };
    }
  }
  
  async deleteBook(bookId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const data = await this.fetchWithAuth(`books/${bookId}`, {
        method: 'DELETE'
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить книгу",
        variant: "destructive"
      });
      return { success: false, message: error.message };
    }
  }
  
  async restoreBook(bookId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const data = await this.fetchWithAuth(`books/${bookId}/restore`, {
        method: 'POST'
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось восстановить книгу",
        variant: "destructive"
      });
      return { success: false, message: error.message };
    }
  }
  
  // Метод для получения книг определенного пользователя (по userId)
  async getUserBooksByUserId(userId: number): Promise<Book[]> {
    try {
      const data = await this.fetchWithAuth(`users/${userId}/books`);
      return data;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить книги пользователя",
        variant: "destructive"
      });
      return [];
    }
  }
  
  async searchBooks(query: string): Promise<SearchResult[]> {
    try {
      const data = await this.fetchWithAuth(`search?q=${encodeURIComponent(query)}`);
      return data;
    } catch (error) {
      toast({
        title: "Ошибка поиска",
        description: "Не удалось выполнить поиск книг",
        variant: "destructive"
      });
      return [];
    }
  }
  
  async saveFoundBook(bookId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const data = await this.fetchWithAuth(`search/${bookId}`, {
        method: 'POST'
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить книгу",
        variant: "destructive"
      });
      return { success: false, message: error.message };
    }
  }
}

export const api = new BookwormAPI();
// Инициализация аутентификации при загрузке приложения
api.initAuth();
