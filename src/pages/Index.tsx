
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import BookCard from "@/components/BookCard";
import { api, Book } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileContent, setFileContent] = useState("");
  
  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    fetchBooks();
  }, [navigate]);
  
  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const userBooks = await api.getUserBooks();
      setBooks(userBooks);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить книги",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenBook = async (id: number) => {
    try {
      const book = await api.getBook(id);
      if (book) {
        setSelectedBook(book);
        setOpenDialog("view");
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
  
  const handleEditBook = async (id: number) => {
    try {
      const book = await api.getBook(id);
      if (book) {
        setSelectedBook(book);
        setTitle(book.title);
        setContent(book.content);
        setOpenDialog("edit");
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
        description: "Не удалось открыть книгу для редактирования",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteBook = async (id: number) => {
    try {
      const result = await api.deleteBook(id);
      if (result.success) {
        toast({
          title: "Успешно",
          description: "Книга удалена",
        });
        fetchBooks();
      } else {
        toast({
          title: "Ошибка",
          description: result.message || "Не удалось удалить книгу",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить книгу",
        variant: "destructive",
      });
    }
  };
  
  const handleCreateBook = async () => {
    if (!title) {
      toast({
        title: "Ошибка",
        description: "Укажите название книги",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await api.createBook(title, content, fileContent);
      if (result.success) {
        toast({
          title: "Успешно",
          description: "Книга создана",
        });
        setTitle("");
        setContent("");
        setFileContent("");
        setOpenDialog("");
        fetchBooks();
      } else {
        toast({
          title: "Ошибка",
          description: result.message || "Не удалось создать книгу",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать книгу",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateBook = async () => {
    if (!selectedBook || !title) {
      toast({
        title: "Ошибка",
        description: "Укажите название книги",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await api.updateBook(selectedBook.id, title, content);
      if (result.success) {
        toast({
          title: "Успешно",
          description: "Книга обновлена",
        });
        setTitle("");
        setContent("");
        setSelectedBook(null);
        setOpenDialog("");
        fetchBooks();
      } else {
        toast({
          title: "Ошибка",
          description: result.message || "Не удалось обновить книгу",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить книгу",
        variant: "destructive",
      });
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
    };
    reader.readAsText(file);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold">Мои книги</h1>
          <Dialog open={openDialog === "create"} onOpenChange={(open) => {
            if (open) {
              setOpenDialog("create");
              setTitle("");
              setContent("");
              setFileContent("");
            } else {
              setOpenDialog("");
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex gap-2">
                <PlusIcon className="h-4 w-4" />
                Создать книгу
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Создать новую книгу</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Название книги</Label>
                  <Input
                    id="title"
                    placeholder="Название"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Содержание</Label>
                  <Textarea
                    id="content"
                    placeholder="Содержание книги..."
                    rows={10}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">Или загрузить файл</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleCreateBook}>
                  Создать
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p>Загрузка книг...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-4">У вас пока нет книг</p>
            <Button onClick={() => setOpenDialog("create")}>
              Создать первую книгу
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onOpen={handleOpenBook}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* View Book Dialog */}
      <Dialog open={openDialog === "view"} onOpenChange={(open) => !open && setOpenDialog("")}>
        <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBook?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{selectedBook?.content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Book Dialog */}
      <Dialog open={openDialog === "edit"} onOpenChange={(open) => !open && setOpenDialog("")}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Редактировать книгу</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Название книги</Label>
              <Input
                id="edit-title"
                placeholder="Название"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Содержание</Label>
              <Textarea
                id="edit-content"
                placeholder="Содержание книги..."
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUpdateBook}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
