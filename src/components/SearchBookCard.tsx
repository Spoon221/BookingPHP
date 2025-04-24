
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchResult } from "@/lib/api";

interface SearchBookCardProps {
  book: SearchResult;
  onSave?: (id: string) => void;
}

const SearchBookCard = ({ book, onSave }: SearchBookCardProps) => {
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
        {book.authors && (
          <p className="text-sm text-muted-foreground mt-1">
            {book.authors.join(", ")}
          </p>
        )}
        {book.description && (
          <p className="text-sm mt-2 line-clamp-3">
            {book.description}
          </p>
        )}
      </CardContent>
      <CardFooter>
        {onSave && (
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => onSave(book.id)}
          >
            Сохранить в библиотеку
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SearchBookCard;
