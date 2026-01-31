import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  GraduationCap,
  CheckCircle,
  Star,
  Shield,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  Users,
  BookOpen,
  Target,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { register, isAuthenticated } = useAuth();
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

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return false;
    }
    if (!formData.email) {
      toast.error('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    // Silent validation - visual feedback is provided by the password requirements indicators
    if (!formData.password || formData.password.length < 6) {
      return false;
    }
    if (!formData.confirmPassword) {
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Registration attempt:', {
        name: formData.name,
        email: formData.email,
        role: formData.role
      });

      const result = await register({
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: formData.role
      });

      console.log('Registration result:', result);

      if (result.success) {
        toast.success('Registration successful! Welcome to SKG Consulting!');
        // Navigate to profile completion or dashboard
        if (result.needsProfileCompletion) {
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('Registration failed:', result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed - please check if server is running');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className={`block text-sm font-semibold mb-3 ${
          theme === 'bright' ? 'text-black' : 'text-white'
        }`}>
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className={`h-5 w-5 ${
              theme === 'bright' ? 'text-gray-500' : 'text-slate-400'
            }`} />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="given-name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full pl-12 pr-4 py-4 border rounded-xl text-sm font-medium placeholder-opacity-60 focus:outline-none focus:ring-2 transition-all duration-300 ${
              theme === 'bright'
                ? 'bg-gray-50 border-gray-200 text-black placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-300'
                : 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-500'
            }`}
            placeholder="Enter your full name"
          />
        </div>
      </div>

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
                : 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-500'
            }`}
            placeholder="Enter your email address"
          />
        </div>
      </div>

      {/* Role Selection */}
      <div>
        <label className={`block text-sm font-semibold mb-4 ${
          theme === 'bright' ? 'text-black' : 'text-white'
        }`}>
          I want to join as a
        </label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'student', icon: BookOpen, title: 'Student', desc: 'Learn from experts' },
            { value: 'teacher', icon: GraduationCap, title: 'Teacher', desc: 'Share your knowledge' }
          ].map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
              className={`p-6 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                formData.role === role.value
                  ? theme === 'bright'
                    ? 'border-orange-500 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg shadow-orange-500/20'
                    : 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-purple-500/10 shadow-lg shadow-blue-500/20'
                  : theme === 'bright'
                    ? 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <role.icon className={`h-8 w-8 mx-auto mb-3 ${
                formData.role === role.value
                  ? theme === 'bright'
                    ? 'text-orange-600'
                    : 'text-blue-400'
                  : theme === 'bright'
                    ? 'text-gray-600'
                    : 'text-slate-400'
              }`} />
              <h3 className={`font-bold text-sm mb-1 ${
                formData.role === role.value
                  ? theme === 'bright'
                    ? 'text-orange-900'
                    : 'text-blue-200'
                  : theme === 'bright'
                    ? 'text-black'
                    : 'text-white'
              }`}>
                {role.title}
              </h3>
              <p className={`text-xs ${
                formData.role === role.value
                  ? theme === 'bright'
                    ? 'text-orange-700'
                    : 'text-blue-300'
                  : theme === 'bright'
                    ? 'text-gray-600'
                    : 'text-slate-400'
              }`}>
                {role.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNextStep}
        className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg ${
          theme === 'bright'
            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-yellow-500/25'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25'
        }`}
      >
        Continue
        <ArrowRight className="h-5 w-5 ml-2" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
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
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full pl-12 pr-12 py-4 border rounded-xl text-sm font-medium placeholder-opacity-60 focus:outline-none focus:ring-2 transition-all duration-300 ${
              theme === 'bright'
                ? 'bg-gray-50 border-gray-200 text-black placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-300'
                : 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-500'
            }`}
            placeholder="Create a strong password"
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
        <div className={`mt-2 text-xs ${
          theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
        }`}>
          Password must be at least 6 characters long
        </div>
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-3 ${
          theme === 'bright' ? 'text-black' : 'text-white'
        }`}>
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Shield className={`h-5 w-5 ${
              theme === 'bright' ? 'text-gray-500' : 'text-slate-400'
            }`} />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full pl-12 pr-12 py-4 border rounded-xl text-sm font-medium placeholder-opacity-60 focus:outline-none focus:ring-2 transition-all duration-300 ${
              theme === 'bright'
                ? 'bg-gray-50 border-gray-200 text-black placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-300'
                : 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-500'
            }`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
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

      {/* Password Requirements */}
      <div className={`p-4 rounded-xl ${
        theme === 'bright' 
          ? 'bg-gray-50 border border-gray-200' 
          : 'bg-slate-800 border border-slate-600'
      }`}>
        <h4 className={`text-sm font-semibold mb-3 ${
          theme === 'bright' ? 'text-black' : 'text-white'
        }`}>
          Password Requirements:
        </h4>
        <div className="space-y-2">
          {[
            { check: formData.password.length >= 6, text: 'At least 6 characters' },
            { check: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
            { check: /[0-9]/.test(formData.password), text: 'One number' },
            { check: formData.password === formData.confirmPassword && formData.password !== '', text: 'Passwords match' }
          ].map((req, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                req.check
                  ? theme === 'bright'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-green-900 text-green-400'
                  : theme === 'bright'
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-slate-700 text-slate-500'
              }`}>
                {req.check && <CheckCircle className="h-3 w-3" />}
              </div>
              <span className={`text-xs ${
                req.check
                  ? theme === 'bright'
                    ? 'text-green-700'
                    : 'text-green-400'
                  : theme === 'bright'
                    ? 'text-gray-500'
                    : 'text-slate-400'
              }`}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={handlePrevStep}
          className={`flex items-center justify-center px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
            theme === 'bright'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
          }`}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || !validateStep2()}
          className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'bright'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-yellow-500/25'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Creating Account...
            </>
          ) : (
            <>
              Create Account
              <UserPlus className="h-5 w-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          theme === 'bright'
            ? 'bg-green-100'
            : 'bg-green-900/50'
        }`}>
          <CheckCircle className={`h-8 w-8 ${
            theme === 'bright' ? 'text-green-600' : 'text-green-400'
          }`} />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${
          theme === 'bright' ? 'text-black' : 'text-white'
        }`}>
          Almost Done!
        </h2>
        <p className={`${
          theme === 'bright' ? 'text-gray-600' : 'text-slate-300'
        }`}>
          Review your information and create your account
        </p>
      </div>

      {/* Summary Card */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        theme === 'bright'
          ? 'bg-gray-50 border-gray-200'
          : 'bg-slate-800 border-slate-600'
      }`}>
        <h3 className={`font-semibold text-lg mb-4 ${
          theme === 'bright' ? 'text-black' : 'text-white'
        }`}>
          Account Details
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`font-medium ${
              theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
            }`}>
              Full Name:
            </span>
            <span className={`font-semibold ${
              theme === 'bright' ? 'text-black' : 'text-white'
            }`}>
              {formData.name}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`font-medium ${
              theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
            }`}>
              Email:
            </span>
            <span className={`font-semibold ${
              theme === 'bright' ? 'text-black' : 'text-white'
            }`}>
              {formData.email}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`font-medium ${
              theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
            }`}>
              Joining as:
            </span>
            <div className="flex items-center space-x-2">
              {formData.role === 'student' ? (
                <BookOpen className={`h-4 w-4 ${
                  theme === 'bright' ? 'text-orange-600' : 'text-blue-400'
                }`} />
              ) : (
                <GraduationCap className={`h-4 w-4 ${
                  theme === 'bright' ? 'text-orange-600' : 'text-blue-400'
                }`} />
              )}
              <span className={`font-semibold capitalize ${
                theme === 'bright' ? 'text-black' : 'text-white'
              }`}>
                {formData.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={handlePrevStep}
          className={`flex items-center justify-center px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
            theme === 'bright'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
          }`}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'bright'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-yellow-500/25'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Creating Account...
            </>
          ) : (
            <>
              Create Account
              <UserPlus className="h-5 w-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );

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
                : 'bg-white/10 border-white/20'
            }`}>
              {/* Welcome Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center px-6 py-3 backdrop-blur-sm border rounded-full text-sm font-medium mb-6 ${
                  theme === 'bright' 
                    ? 'bg-yellow-200/30 border-yellow-400/40 text-orange-700' 
                    : 'bg-white/10 border-white/20 text-white'
                }`}>
                  <Sparkles className={`h-4 w-4 mr-2 ${
                    theme === 'bright' ? 'text-yellow-600' : 'text-yellow-400'
                  }`} />
                  Join Our Learning Community
                </div>
                <h1 className={`text-4xl lg:text-5xl font-bold mb-4 leading-tight ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>
                  Start Your
                  <span className={`bg-gradient-to-r bg-clip-text text-transparent block ${
                    theme === 'bright' 
                      ? 'from-yellow-600 via-orange-500 to-red-500' 
                      : 'from-blue-400 via-purple-400 to-pink-400'
                  }`}>
                    Learning Journey
                  </span>
                </h1>
                <p className={`text-lg leading-relaxed mb-8 ${
                  theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                }`}>
                  Connect with world-class educators and unlock your potential with personalized tutoring.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Users, title: '10K+ Students', desc: 'Active learners' },
                  { icon: Award, title: '500+ Tutors', desc: 'Expert educators' },
                  { icon: Target, title: '98% Success', desc: 'Achievement rate' },
                  { icon: Heart, title: '24/7 Support', desc: 'Always here' }
                ].map((feature, index) => (
                  <div key={index} className={`p-4 rounded-2xl backdrop-blur-sm border ${
                    theme === 'bright' 
                      ? 'bg-white/20 border-white/30' 
                      : 'bg-white/10 border-white/20'
                  }`}>
                    <feature.icon className={`h-6 w-6 mb-2 ${
                      theme === 'bright' ? 'text-orange-600' : 'text-blue-400'
                    }`} />
                    <h3 className={`font-bold text-sm ${
                      theme === 'bright' ? 'text-black' : 'text-white'
                    }`}>{feature.title}</h3>
                    <p className={`text-xs ${
                      theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                    }`}>{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                theme === 'bright' 
                  ? 'bg-gradient-to-r from-yellow-100/50 to-orange-100/50 border-yellow-300/30' 
                  : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30'
              }`}>
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className={`text-sm italic mb-3 ${
                  theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                }`}>
                  "SKG Consulting transformed my learning experience. The tutors are exceptional!"
                </p>
                <p className={`text-xs font-medium ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                }`}>
                  - Sarah M., Computer Science Student
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full max-w-md mx-auto">
            <div className={`relative backdrop-blur-lg rounded-3xl shadow-2xl border p-8 ${
              theme === 'bright' 
                ? 'bg-white/95 border-gray-200/50' 
                : 'bg-slate-900/95 border-slate-700/50'
            }`}>
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                  theme === 'bright' 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                    : 'bg-gradient-to-br from-blue-600 to-purple-600'
                }`}>
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>
                  Create Your Account
                </h2>
                <p className={`${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                }`}>
                  {step === 1 ? 'Tell us about yourself' : 'Secure your account'}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                {[1, 2].map((stepNum) => (
                  <React.Fragment key={stepNum}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      stepNum <= step
                        ? theme === 'bright'
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
                          : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                        : theme === 'bright'
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-slate-700 text-slate-400'
                    }`}>
                      {stepNum < step ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        stepNum
                      )}
                    </div>
                    {stepNum < 2 && (
                      <div className={`w-8 h-0.5 ${
                        stepNum < step
                          ? theme === 'bright'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : theme === 'bright'
                            ? 'bg-gray-200'
                            : 'bg-slate-700'
                      }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? renderStep1() : renderStep2()}
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className={`text-sm ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                }`}>
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className={`font-semibold transition-colors ${
                      theme === 'bright' 
                        ? 'text-orange-600 hover:text-orange-700' 
                        : 'text-blue-400 hover:text-blue-300'
                    }`}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;