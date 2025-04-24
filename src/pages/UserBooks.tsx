
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import BookCard from "@/components/BookCard";
import { api, Book, User } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

const UserBooks = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    if (!userId || isNaN(Number(userId))) {
      navigate("/users");
      return;
    }
    
    fetchUserBooks();
  }, [userId, navigate]);
  
  const fetchUserBooks = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // First get user info
      const allUsers = await api.getUsers();
      const userInfo = allUsers.find(u => u.id === Number(userId)) || null;
      setUser(userInfo);
      
      // Then get books
      const userBooks = await api.getUserBooksByUserId(Number(userId));
      setBooks(userBooks);
    } catch (error) {
      console.error("Failed to fetch user books:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить книги пользователя",
        variant: "destructive",
      });
      // Navigate back to users list if there's an error (e.g., no access)
      navigate("/users");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenBook = async (id: number) => {
    try {
      const book = await api.getBook(id);
      if (book) {
        // In a real app, we would navigate to a book viewer
        toast({
          title: book.title,
          description: book.content.substring(0, 100) + "...",
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Книга не найдена",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось открыть книгу",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            className="mb-4 flex items-center gap-2"
            onClick={() => navigate("/users")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Назад к пользователям
          </Button>
          <h1 className="text-3xl font-serif font-bold flex items-center gap-2">
            Книги пользователя {user?.username || "..."}
          </h1>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p>Загрузка книг...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p>У пользователя нет книг</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onOpen={handleOpenBook}
                actions={false}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserBooks;
