
import { User } from "@/lib/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";

interface UserCardProps {
  user: User;
  onGrantAccess?: (id: number) => void;
  onViewBooks?: (id: number) => void;
  currentUserId?: number;
}

const UserCard = ({ user, onGrantAccess, onViewBooks, currentUserId }: UserCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="pt-6 flex-grow flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <UserIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-serif font-medium text-lg">{user.username}</h3>
        <p className="text-sm text-muted-foreground">ID: {user.id}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {onViewBooks && (
          <Button 
            variant="default" 
            className="w-full" 
            onClick={() => onViewBooks(user.id)}
          >
            Посмотреть книги
          </Button>
        )}
        {onGrantAccess && user.id !== currentUserId && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => onGrantAccess(user.id)}
          >
            Дать доступ
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserCard;
