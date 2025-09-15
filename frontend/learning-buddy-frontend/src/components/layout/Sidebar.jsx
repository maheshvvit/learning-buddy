import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Target, 
  Trophy, 
  BarChart3, 
  MessageCircle, 
  User, 
  Settings,
  Brain,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

const navigation = [
  {
    name: 'Dashboard',
    href: '/app/dashboard',
    icon: Home,
  },
  {
    name: 'Challenges',
    href: '/app/challenges',
    icon: Target,
  },
  {
    name: 'Learning Paths',
    href: '/app/learning-paths',
    icon: BookOpen,
  },
  {
    name: 'Progress',
    href: '/app/progress',
    icon: BarChart3,
  },
  {
    name: 'Leaderboard',
    href: '/app/leaderboard',
    icon: Trophy,
  },
  {
    name: 'AI Chat',
    href: '/app/chat',
    icon: MessageCircle,
  },
];

const userNavigation = [
  {
    name: 'Profile',
    href: '/app/profile',
    icon: User,
  },
  {
    name: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-card border-r border-border overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Learning Buddy</span>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="mt-6 px-4">
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-primary-foreground select-none">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.profile?.firstName || user.username}
                </p>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    Level {user.gamification?.level || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-6 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/app/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* User Navigation */}
        <div className="flex-shrink-0 px-2 pb-4 space-y-1">
          <div className="border-t border-border pt-4">
            {userNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
