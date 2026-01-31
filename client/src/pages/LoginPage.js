import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  LogIn, 
  GraduationCap,
  ArrowRight,
  Shield,
  Zap,
  Star,
  BookOpen,
  Users,
  Award,
  CheckCircle,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Login attempt:', formData);
      
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        // Navigate based on profile completion
        if (result.needsProfileCompletion) {
          navigate('/profile');
        } else if (result.user.role === 'student') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error - please check if server is running');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'student@demo.com', password: 'password', role: 'Student' },
    { email: 'teacher@demo.com', password: 'password', role: 'Teacher' }
  ];

  const handleDemoLogin = async (email, password) => {
    setFormData({ email, password });
    setIsLoading(true);
    
    try {
      console.log('Demo login attempt:', email);
      const result = await login(email, password);
      console.log('Demo login result:', result);
      
      if (result.success) {
        // Navigate based on profile completion and role
        if (result.needsProfileCompletion) {
          navigate('/profile');
        } else if (result.user.role === 'student') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('Demo login failed:', result.error);
      }
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Demo login network error - check server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'bright' 
        ? 'bg-gradient-to-br from-yellow-50 via-white to-orange-50' 
        : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow ${
          theme === 'bright' ? 'bg-yellow-400/30' : 'bg-blue-500/20'
        }`}></div>
        <div className={`absolute top-40 right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-300 ${
          theme === 'bright' ? 'bg-orange-400/30' : 'bg-purple-500/20'
        }`}></div>
        <div className={`absolute bottom-20 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-700 ${
          theme === 'bright' ? 'bg-yellow-500/30' : 'bg-indigo-500/20'
        }`}></div>
      </div>

      <div className="relative w-full max-w-6xl mx-auto flex items-center justify-center min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-center">
          
          {/* Left Side - Welcome Section */}
          <div className="hidden lg:block relative">
            <div className={`relative p-8 rounded-3xl backdrop-blur-lg border ${
              theme === 'bright' 
                ? 'bg-white/10 border-white/20' 
                : 'bg-slate-800/50 border-slate-700/50'
            }`}>
              
              {/* Logo and Brand */}
              <div className="mb-8">
                <Link to="/" className="inline-flex items-center space-x-4 group">
                  <div className={`p-4 rounded-2xl shadow-xl transition-transform group-hover:scale-110 ${
                    theme === 'bright' 
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                      : 'bg-gradient-to-br from-blue-600 to-purple-600'
                  }`}>
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h1 className={`text-3xl font-bold ${
                      theme === 'bright' ? 'text-black' : 'text-white'
                    }`}>
                      SKG Consulting
                    </h1>
                    <p className={`text-lg ${
                      theme === 'bright' ? 'text-gray-600' : 'text-slate-300'
                    }`}>
                      Find Your Perfect Tutor
                    </p>
                  </div>
                </Link>
              </div>

              {/* Welcome Message */}
              <div className="mb-8">
                <h2 className={`text-4xl font-bold mb-4 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>
                  Welcome Back!
                </h2>
                <p className={`text-lg leading-relaxed ${
                  theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                }`}>
                  Continue your learning journey with our expert tutors and personalized education experience.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { icon: BookOpen, title: 'Expert Tutors', desc: 'Learn from the best' },
                  { icon: Users, title: 'Community', desc: 'Join thousands of learners' },
                  { icon: Award, title: 'Achievements', desc: 'Track your progress' },
                  { icon: Globe, title: 'Global Access', desc: 'Learn from anywhere' }
                ].map((feature, index) => (
                  <div key={index} className={`p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                    theme === 'bright'
                      ? 'bg-white/20 border-white/30 hover:bg-white/30'
                      : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/40'
                  }`}>
                    <feature.icon className={`h-6 w-6 mb-3 ${
                      theme === 'bright' ? 'text-orange-600' : 'text-blue-400'
                    }`} />
                    <h3 className={`font-semibold text-sm mb-1 ${
                      theme === 'bright' ? 'text-black' : 'text-white'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-xs ${
                      theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                    }`}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                theme === 'bright'
                  ? 'bg-white/20 border-white/30'
                  : 'bg-slate-700/30 border-slate-600/30'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 fill-current ${
                      theme === 'bright' ? 'text-yellow-500' : 'text-yellow-400'
                    }`} />
                  ))}
                </div>
                <p className={`text-sm mb-3 italic ${
                  theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                }`}>
                  "SKG Consulting transformed my learning experience. The tutors are amazing!"
                </p>
                <p className={`text-xs font-semibold ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                }`}>
                  - Sarah Johnson, Student
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className={`p-8 rounded-3xl backdrop-blur-lg border shadow-2xl ${
              theme === 'bright' 
                ? 'bg-white/90 border-white/50' 
                : 'bg-slate-800/90 border-slate-700/50'
            }`}>
              
              {/* Mobile Logo */}
              <div className="lg:hidden mb-8 text-center">
                <Link to="/" className="inline-flex items-center space-x-3 group">
                  <div className={`p-3 rounded-xl shadow-lg transition-transform group-hover:scale-110 ${
                    theme === 'bright' 
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                      : 'bg-gradient-to-br from-blue-600 to-purple-600'
                  }`}>
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h1 className={`text-xl font-bold ${
                      theme === 'bright' ? 'text-black' : 'text-white'
                    }`}>
                      SKG Consulting
                    </h1>
                    <p className={`text-sm ${
                      theme === 'bright' ? 'text-gray-600' : 'text-slate-300'
                    }`}>
                      Find Your Perfect Tutor
                    </p>
                  </div>
                </Link>
              </div>

              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold mb-3 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>
                  Sign In
                </h2>
                <p className={`text-lg ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-300'
                }`}>
                  Continue your learning journey
                </p>
              </div>

              {/* Demo Accounts */}
              <div className={`p-6 rounded-2xl border mb-6 ${
                theme === 'bright'
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-slate-700 border-slate-600'
              }`}>
                <h3 className={`text-sm font-semibold mb-4 text-center ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>
                  Quick Demo Login
                </h3>
                
                <div className="space-y-3">
                  {demoAccounts.map((account, index) => (
                    <button
                      key={index}
                      onClick={() => handleDemoLogin(account.email, account.password)}
                      disabled={isLoading}
                      className={`w-full flex items-center justify-between p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 ${
                        index === 0
                          ? theme === 'bright'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/25'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                          : theme === 'bright'
                            ? 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                            : 'bg-slate-600 text-white border border-slate-500 hover:bg-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">
                          {index === 0 ? '🎓' : '👨‍🏫'}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold">Login as {account.role}</div>
                          <div className={`text-xs ${
                            index === 0 
                              ? 'text-white/80' 
                              : theme === 'bright' 
                                ? 'text-gray-500' 
                                : 'text-slate-300'
                          }`}>
                            {account.email}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-center mt-3">
                  <Zap className={`h-4 w-4 mr-1 ${
                    theme === 'bright' ? 'text-orange-600' : 'text-blue-400'
                  }`} />
                  <p className={`text-xs ${
                    theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                  }`}>
                    Instant access with demo accounts
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${
                    theme === 'bright' ? 'border-gray-300' : 'border-slate-600'
                  }`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-4 font-medium ${
                    theme === 'bright' 
                      ? 'bg-white text-gray-500' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-semibold mb-3 ${
                    theme === 'bright' ? 'text-black' : 'text-white'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 ${
                        theme === 'bright' ? 'text-gray-500' : 'text-slate-400'
                      }`} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl text-sm font-medium placeholder-opacity-60 focus:outline-none focus:ring-2 transition-all duration-300 ${
                        theme === 'bright'
                          ? 'bg-gray-50 border-gray-200 text-black placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-300'
                          : 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-500'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className={`block text-sm font-semibold mb-3 ${
                    theme === 'bright' ? 'text-black' : 'text-white'
                  }`}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${
                        theme === 'bright' ? 'text-gray-500' : 'text-slate-400'
                      }`} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-4 border rounded-xl text-sm font-medium placeholder-opacity-60 focus:outline-none focus:ring-2 transition-all duration-300 ${
                        theme === 'bright'
                          ? 'bg-gray-50 border-gray-200 text-black placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-300'
                          : 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-500'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className={`h-5 w-5 transition-colors ${
                          theme === 'bright' 
                            ? 'text-gray-500 hover:text-gray-700' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`} />
                      ) : (
                        <Eye className={`h-5 w-5 transition-colors ${
                          theme === 'bright' 
                            ? 'text-gray-500 hover:text-gray-700' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className={`text-sm font-medium transition-colors ${
                      theme === 'bright'
                        ? 'text-orange-600 hover:text-orange-700'
                        : 'text-blue-400 hover:text-blue-300'
                    }`}
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'bright'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-yellow-500/25'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <LogIn className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>

                {/* Register Link */}
                <div className="text-center">
                  <span className={`text-sm ${
                    theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                  }`}>
                    Don't have an account?{' '}
                  </span>
                  <Link
                    to="/register"
                    className={`text-sm font-bold transition-colors ${
                      theme === 'bright'
                        ? 'text-orange-600 hover:text-orange-700'
                        : 'text-blue-400 hover:text-blue-300'
                    }`}
                  >
                    Create Account →
                  </Link>
                </div>
              </form>

              {/* Security Features */}
              <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-slate-600">
                {[
                  { icon: Shield, text: 'Secure', color: theme === 'bright' ? 'text-green-600' : 'text-green-400' },
                  { icon: Zap, text: 'Fast', color: theme === 'bright' ? 'text-yellow-600' : 'text-yellow-400' },
                  { icon: CheckCircle, text: 'Trusted', color: theme === 'bright' ? 'text-blue-600' : 'text-blue-400' }
                ].map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className={`inline-flex p-2 rounded-lg mb-2 ${
                      theme === 'bright' ? 'bg-gray-100' : 'bg-slate-700'
                    }`}>
                      <feature.icon className={`h-4 w-4 ${feature.color}`} />
                    </div>
                    <p className={`text-xs font-medium ${
                      theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                    }`}>
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;