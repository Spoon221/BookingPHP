
import { Book } from "@/lib/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
  onOpen?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  actions?: boolean;
}

const BookCard = ({ book, onOpen, onEdit, onDelete, actions = true }: BookCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-[2/3] relative overflow-hidden">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full book-cover flex items-center justify-center p-4">
            <span className="text-center font-serif text-sm">{book.title}</span>
          </div>
        )}
      </div>
      <CardContent className="pt-4 flex-grow">
        <h3 className="font-serif font-medium text-lg truncate">{book.title}</h3>
      </CardContent>
      {actions && (
        <CardFooter className="flex flex-col gap-2 pt-0">
          {onOpen && (
            <Button 
              variant="default" 
              className="w-full" 
              onClick={() => onOpen(book.id)}
            >
              Открыть
            </Button>
          )}
          <div className="flex gap-2 w-full">
            {onEdit && (
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => onEdit(book.id)}
              >
                Изменить
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                className="flex-1 hover:bg-destructive hover:text-destructive-foreground" 
                onClick={() => onDelete(book.id)}
              >
                Удалить
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default BookCard;
