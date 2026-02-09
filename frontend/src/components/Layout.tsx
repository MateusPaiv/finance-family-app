import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  FolderOpen,
  CreditCard,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Expenses', path: '/expenses', icon: <Receipt size={20} /> },
  { name: 'Categories', path: '/categories', icon: <FolderOpen size={20} /> },
  { name: 'Payment Methods', path: '/payment-methods', icon: <CreditCard size={20} /> },
  { name: 'Fixed Bills', path: '/fixed-bills', icon: <Calendar size={20} /> },
  { name: 'Family Sharing', path: '/family', icon: <Users size={20} /> },
  { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
  { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Finance Hub</h1>
              <p className="text-xs text-gray-500">Family Edition</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'bg-accent-light text-accent'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="px-3 py-4 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={cn(
                    'text-gray-400 transition-transform',
                    isProfileDropdownOpen && 'transform rotate-180'
                  )}
                />
              </button>

              {/* Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h1 className="text-base font-semibold text-gray-900">Finance Hub</h1>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <nav className="px-2 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.path)
                      ? 'bg-accent-light text-accent'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* User Info & Logout */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <nav className="flex items-center justify-around px-2 py-2">
          {navigation.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-0',
                isActive(item.path)
                  ? 'text-accent'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <span
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isActive(item.path) && 'bg-accent-light'
                )}
              >
                {item.icon}
              </span>
              <span className="truncate text-[10px]">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="pt-14 pb-20 lg:pt-0 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
