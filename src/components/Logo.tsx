
import { BookOpenText } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <BookOpenText className="h-6 w-6 text-book-primary" />
      <span className="font-serif font-bold text-xl">BookWorm</span>
    </div>
  );
};

export default Logo;
