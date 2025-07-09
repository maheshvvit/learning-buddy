import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Menu, 
  LogOut, 
  User, 
  Settings,
  Zap,
  Trophy
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { useAuthStore } from '../../stores/authStore';
import { fetchNotifications, markNotificationAsRead } from '../../services/notificationService';

const Header = ({ searchQuery, onSearchSubmit }) => {
  const { user, logout } = useAuthStore();

  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };
    loadNotifications();
  }, []);

  const handleNotificationClick = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const [inputValue, setInputValue] = React.useState(searchQuery || '');

  React.useEffect(() => {
    setInputValue(searchQuery || '');
  }, [searchQuery]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (typeof onSearchSubmit === 'function') {
        onSearchSubmit(inputValue);
      }
    }
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search challenges, paths, or topics..."
              className="pl-10 pr-4"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* XP Display */}
          {user && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-muted rounded-full">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {user.gamification?.xp || 0} XP
              </span>
            </div>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuLabel className="font-medium">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 && (
                <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
              )}
              {notifications.map(notification => (
                <DropdownMenuItem
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification._id)}
                  className={notification.read ? 'text-muted-foreground' : 'font-semibold'}
                >
                  {notification.message}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative rounded-full p-2 min-w-[64px] flex justify-center items-center" asChild>
                <Link to="/app/profile" className="flex items-center justify-center space-x-2">
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                </Link>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.profile?.firstName || user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* User Stats */}
              <div className="px-2 py-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Level {user?.gamification?.level || 1}</span>
                  <span>{user?.gamification?.totalXp || 0} Total XP</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>Streak: {user?.gamification?.streak?.current || 0}</span>
                  <span>{user?.gamification?.badges?.length || 0} Badges</span>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link to="/app/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/app/leaderboard" className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>Leaderboard</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/app/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
