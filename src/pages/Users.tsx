
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import UserCard from "@/components/UserCard";
import { api, User } from "@/lib/api";

const Users = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = api.getCurrentUser();
  
  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    fetchUsers();
  }, [navigate]);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await api.getUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGrantAccess = async (userId: number) => {
    try {
      const result = await api.grantAccess(userId);
      if (result.success) {
        toast({
          title: "Успешно",
          description: "Доступ предоставлен",
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.message || "Не удалось предоставить доступ",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось предоставить доступ",
        variant: "destructive",
      });
    }
  };
  
  const handleViewBooks = (userId: number) => {
    navigate(`/users/${userId}/books`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">Все пользователи</h1>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p>Загрузка пользователей...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p>Пользователи не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onGrantAccess={handleGrantAccess}
                onViewBooks={handleViewBooks}
                currentUserId={currentUser?.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Users;
