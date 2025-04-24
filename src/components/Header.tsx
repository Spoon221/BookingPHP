
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { api } from "@/lib/api";

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = api.isAuthenticated();
  const currentUser = api.getCurrentUser();
  
  const handleLogout = () => {
    api.logout();
    navigate("/login");
  };
  
  return (
    <header className="border-b border-border py-4 px-6 bg-card">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Logo />
          
          {isAuthenticated && (
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Button variant="link" onClick={() => navigate("/")}>
                    Мои книги
                  </Button>
                </li>
                <li>
                  <Button variant="link" onClick={() => navigate("/users")}>
                    Пользователи
                  </Button>
                </li>
                <li>
                  <Button variant="link" onClick={() => navigate("/search")}>
                    Поиск книг
                  </Button>
                </li>
              </ul>
            </nav>
          )}
        </div>
        
        <div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {currentUser?.username}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Выйти
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Войти
              </Button>
              <Button onClick={() => navigate("/register")}>
                Регистрация
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
