import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  MessageCircle, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  LayoutDashboard,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationCenter from '../NotificationCenter';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path) => location.pathname === path;

  const navItems = isAuthenticated ? [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ...(user?.role === 'student' ? [
      { name: 'Find Tutors', path: '/find-tutors', icon: Search }
    ] : []),
    { name: 'Chat', path: '/chat', icon: MessageCircle }
  ] : [
    { name: 'Home', path: '/', icon: Home },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b transition-all duration-300 ${
      theme === 'bright' 
        ? 'bg-white/95 border-gray-200/50 shadow-lg shadow-gray-200/20' 
        : 'bg-slate-900/95 border-slate-700/50 shadow-lg shadow-slate-900/20'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="SKG Consulting" 
                  className="h-12 w-12 object-contain rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className={`hidden p-2 rounded-full shadow-lg ${
                  theme === 'bright' 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                    : 'bg-gradient-to-br from-blue-600 to-purple-600'
                }`}>
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold transition-colors ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>
                  SKG Consulting
                </h1>
                <p className={`text-xs -mt-1 font-medium transition-colors ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                }`}>
                  SanniKumarGupta - Your Consulting Partner
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <div key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActiveRoute(item.path)
                      ? theme === 'bright'
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border border-yellow-300/50 shadow-md'
                        : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30 shadow-md'
                      : theme === 'bright'
                        ? 'text-gray-700 hover:text-black hover:bg-gray-100/80 border border-transparent hover:border-gray-200'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50 border border-transparent hover:border-slate-600/50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </div>
            ))}
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl backdrop-blur-sm border transition-all duration-300 transform hover:scale-110 shadow-md ${
                theme === 'bright' 
                  ? 'bg-gray-100/80 border-gray-200 hover:bg-gray-200/80 text-gray-700' 
                  : 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50 text-slate-200'
              }`}
              title={theme === 'bright' ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
            >
              {theme === 'bright' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            {/* Connection Status (when authenticated) */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className={`text-xs font-medium transition-colors ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                }`}>
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            )}

            {/* Notification Center (when authenticated) */}
            {isAuthenticated && (
              <div>
                <NotificationCenter />
              </div>
            )}

            {isAuthenticated ? (
              /* User Profile Dropdown */
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className={`flex items-center space-x-3 p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                    theme === 'bright' 
                      ? 'hover:bg-gray-100/80' 
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20"
                    />
                  ) : (
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      theme === 'bright' 
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                        : 'bg-gradient-to-br from-blue-600 to-purple-600'
                    }`}>
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className={`text-sm font-medium transition-colors ${
                      theme === 'bright' ? 'text-black' : 'text-white'
                    }`}>
                      {user?.name}
                    </p>
                    <p className={`text-xs capitalize transition-colors ${
                      theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                    }`}>
                      {user?.role}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border py-2 backdrop-blur-lg ${
                    theme === 'bright' 
                      ? 'bg-white/95 border-gray-200' 
                      : 'bg-slate-800/95 border-slate-600'
                  }`}>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                        theme === 'bright' 
                          ? 'text-gray-700 hover:bg-gray-100/80 hover:text-black' 
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <div className={`h-px mx-2 my-2 ${
                      theme === 'bright' ? 'bg-gray-200' : 'bg-slate-600'
                    }`}></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register Buttons */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    theme === 'bright' 
                      ? 'text-gray-700 hover:text-black hover:bg-gray-100/80' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`text-sm font-medium px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    theme === 'bright' 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 shadow-yellow-500/25' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                theme === 'bright' 
                  ? 'hover:bg-gray-100/80 text-gray-700' 
                  : 'hover:bg-slate-700/50 text-slate-300'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden backdrop-blur-lg border-t ${
          theme === 'bright' 
            ? 'bg-white/95 border-gray-200/50' 
            : 'bg-slate-900/95 border-slate-700/50'
        }`}>
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <div key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActiveRoute(item.path)
                      ? theme === 'bright'
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border border-yellow-300/50'
                        : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30'
                      : theme === 'bright'
                        ? 'text-gray-700 hover:text-black hover:bg-gray-100/80'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </div>
            ))}
            
            {!isAuthenticated && (
              <div className={`pt-4 space-y-3 border-t ${
                theme === 'bright' ? 'border-gray-200' : 'border-slate-700'
              }`}>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block w-full text-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    theme === 'bright' 
                      ? 'text-gray-700 hover:text-black hover:bg-gray-100/80' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block w-full text-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 shadow-lg ${
                    theme === 'bright' 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 shadow-yellow-500/25' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
