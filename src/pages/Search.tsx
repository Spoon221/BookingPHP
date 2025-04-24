
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import SearchBookCard from "@/components/SearchBookCard";
import { api, SearchResult } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  useState(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
    }
  });
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Введите поисковый запрос",
        description: "Пожалуйста, введите название книги для поиска",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const searchResults = await api.searchBooks(query);
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось выполнить поиск книг",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSaveBook = async (bookId: string) => {
    try {
      const result = await api.saveFoundBook(bookId);
      
      if (result.success) {
        toast({
          title: "Книга сохранена",
          description: "Книга успешно добавлена в вашу библиотеку",
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.message || "Не удалось сохранить книгу",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить книгу",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">Поиск книг</h1>
        
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Введите название книги..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                "Поиск..."
              ) : (
                <>
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Найти
                </>
              )}
            </Button>
          </form>
        </div>
        
        {isSearching ? (
          <div className="text-center py-12">
            <p>Поиск книг...</p>
          </div>
        ) : hasSearched ? (
          results.length === 0 ? (
            <div className="text-center py-12">
              <p>Книги не найдены. Попробуйте изменить поисковый запрос.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.map((book) => (
                <SearchBookCard
                  key={book.id}
                  book={book}
                  onSave={handleSaveBook}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Введите название книги для поиска
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
