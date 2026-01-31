import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Users, 
  MessageCircle, 
  Star, 
  ArrowRight,
  GraduationCap,
  Video,
  Clock,
  Code,
  Award,
  Zap,
  Shield,
  Heart,
  CheckCircle,
  TrendingUp,
  Globe,
  Bookmark,
  Target,
  Sparkles,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  ExternalLink,
  ChevronUp,
  Play,
  Download,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, subjectAPI } from '../utils/api';
import toast from 'react-hot-toast';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Clear teachers for authenticated users to show clean homepage
  useEffect(() => {
    if (isAuthenticated) {
      setTeachers([]); // Clear teachers for logged-in users
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (searchTerm || selectedSubject) {
      searchTeachers();
    }
  }, [searchTerm, selectedSubject]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch subjects (optional - don't show error if it fails)
      try {
        const subjectsResponse = await subjectAPI.getAll();
        if (subjectsResponse?.data) {
          setSubjects(Array.isArray(subjectsResponse.data) ? subjectsResponse.data : []);
        }
      } catch (subjectError) {
        console.warn('Could not load subjects:', subjectError);
        // Silently fail - subjects are optional for homepage
      }

      // Only fetch featured teachers for non-authenticated users (guests)
      if (!isAuthenticated) {
        try {
          const teachersResponse = await userAPI.searchTeachers({});
          if (teachersResponse?.data?.teachers) {
            setTeachers(teachersResponse.data.teachers.slice(0, 6)); // Show first 6 teachers
          }
        } catch (teachersError) {
          console.warn('Could not load featured teachers:', teachersError);
          // Silently fail - teachers are optional for homepage
        }
      }
    } catch (error) {
      console.error('Unexpected error during data fetch:', error);
      // Only show error for unexpected/critical errors
    } finally {
      setLoading(false);
    }
  };

  const searchTeachers = async () => {
    // If user is authenticated, redirect to Find Tutors page with search params
    if (isAuthenticated && (searchTerm || selectedSubject)) {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSubject) params.append('subject', selectedSubject);
      navigate(`/find-tutors?${params.toString()}`);
      return;
    }

    // For non-authenticated users, show search results on homepage
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedSubject) params.subject = selectedSubject;

      const response = await userAPI.searchTeachers(params);
      if (response?.data?.teachers) {
        setTeachers(response.data.teachers);
      }
    } catch (error) {
      console.error('Error searching teachers:', error);
      // Only show error message if user actively searched
      if (searchTerm || selectedSubject) {
        toast.error('Failed to search teachers. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithTeacher = (teacherId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to chat with teachers');
      navigate('/login');
      return;
    }
    navigate(`/chat/${teacherId}`);
  };

  const handleVideoCallWithTeacher = (teacherId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to start a video call');
      navigate('/login');
      return;
    }
    navigate(`/video-call/${teacherId}`);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'bright' 
        ? 'bg-gradient-to-br from-yellow-50 via-white to-yellow-100' 
        : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900'
    }`}>
      {/* Hero Section - Premium Design */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className={`absolute inset-0 ${
          theme === 'bright' 
            ? 'bg-gradient-to-br from-white via-yellow-50 to-yellow-100' 
            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900'
        }`}></div>
        <div className={`absolute inset-0 ${
          theme === 'bright' 
            ? 'bg-gradient-to-tr from-yellow-200/30 via-transparent to-orange-200/30' 
            : 'bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20'
        }`}></div>
        
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className={`absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow ${
            theme === 'bright' ? 'bg-yellow-400' : 'bg-blue-500'
          }`}></div>
          <div className={`absolute top-40 right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-300 ${
            theme === 'bright' ? 'bg-orange-400' : 'bg-purple-500'
          }`}></div>
          <div className={`absolute bottom-20 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-700 ${
            theme === 'bright' ? 'bg-yellow-500' : 'bg-indigo-500'
          }`}></div>
        </div>

        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Premium Badge */}
            <div className={`inline-flex items-center px-6 py-2 backdrop-blur-sm border rounded-full text-sm font-medium mb-8 ${
              theme === 'bright' 
                ? 'bg-yellow-200/30 border-yellow-400/40 text-black' 
                : 'bg-white/10 border-white/20 text-white'
            }`}>
              <Sparkles className={`h-4 w-4 mr-2 ${
                theme === 'bright' ? 'text-yellow-600' : 'text-yellow-400'
              }`} />
              Premium Learning Platform
            </div>

            <h1 className={`text-5xl lg:text-7xl font-bold mb-6 leading-tight ${
              theme === 'bright' ? 'text-black' : 'text-white'
            }`}>
              Transform Your
              <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
                theme === 'bright' 
                  ? 'from-yellow-600 via-orange-500 to-red-500' 
                  : 'from-blue-400 via-purple-400 to-pink-400'
              }`}>
                {" "}Learning Journey
              </span>
            </h1>
            
            <p className={`text-xl lg:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
              theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
            }`}>
              Connect with world-class educators and unlock your potential with personalized, 
              expert-led tutoring sessions designed for modern learners.
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                <Link
                  to="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center shadow-xl shadow-blue-500/25"
                >
                  Start Learning Today
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className={`px-8 py-4 border-2 font-bold rounded-xl transition-all duration-300 backdrop-blur-sm ${
                    theme === 'bright' 
                      ? 'border-black/30 text-black hover:bg-black/10 hover:border-black/50' 
                      : 'border-white/30 text-white hover:bg-white/10 hover:border-white/50'
                  }`}
                >
                  Sign In
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center shadow-xl shadow-blue-500/25"
                >
                  Access Dashboard
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className={`px-8 py-4 border-2 font-bold rounded-xl transition-all duration-300 backdrop-blur-sm ${
                    theme === 'bright' 
                      ? 'border-black/30 text-black hover:bg-black/10 hover:border-black/50' 
                      : 'border-white/30 text-white hover:bg-white/10 hover:border-white/50'
                  }`}
                >
                  Edit Profile
                </button>
              </div>
            )}

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className={`text-3xl lg:text-4xl font-bold mb-2 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>10K+</div>
                <div className={`text-sm ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-300'
                }`}>Active Students</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl lg:text-4xl font-bold mb-2 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>500+</div>
                <div className={`text-sm ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-300'
                }`}>Expert Tutors</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl lg:text-4xl font-bold mb-2 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>98%</div>
                <div className={`text-sm ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-300'
                }`}>Success Rate</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl lg:text-4xl font-bold mb-2 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>24/7</div>
                <div className={`text-sm ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-300'
                }`}>Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section - Enhanced */}
      <div className="relative -mt-16 z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Main Search Card */}
            <div className={`backdrop-blur-lg rounded-2xl shadow-2xl border p-8 lg:p-12 mb-12 ${
              theme === 'bright' 
                ? 'bg-white/95 border-yellow-300/50' 
                : 'bg-slate-900/95 border-slate-700/50'
            }`}>
              <div className="text-center mb-8">
                <div className={`inline-flex items-center px-4 py-2 border rounded-full text-sm font-medium mb-4 ${
                  theme === 'bright' 
                    ? 'bg-yellow-100/50 border-yellow-300/50 text-black' 
                    : 'bg-blue-600/20 border-blue-500/30 text-blue-300'
                }`}>
                  <Search className="h-4 w-4 mr-2" />
                  Smart Search
                </div>
                <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>
                  Find Your Perfect Tutor
                </h2>
                <p className={`text-lg ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-300'
                }`}>Search from our curated selection of expert educators</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                <div className="lg:col-span-3 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Search className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder={isAuthenticated ? "Search for tutors (redirects to Find Tutors page)..." : "Search by name, expertise, or subject..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-16 pr-6 py-5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg font-medium shadow-inner backdrop-blur-sm ${
                      theme === 'bright' 
                        ? 'border-gray-300 bg-white/80 text-black placeholder-gray-500' 
                        : 'border-slate-600 bg-slate-800/50 text-white placeholder-slate-400'
                    }`}
                  />
                </div>
                
                <div className="lg:col-span-1">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className={`w-full px-4 py-5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg font-medium shadow-inner backdrop-blur-sm ${
                      theme === 'bright' 
                        ? 'border-gray-300 bg-white/80 text-black' 
                        : 'border-slate-600 bg-slate-800/50 text-white'
                    }`}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <button
                    onClick={() => searchTeachers()}
                    className="w-full px-6 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Popular Subjects */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Mathematics', icon: '🔢', color: 'from-blue-500 to-cyan-500' },
                { name: 'Science', icon: '🔬', color: 'from-green-500 to-emerald-500' },
                { name: 'Programming', icon: '💻', color: 'from-purple-500 to-pink-500' },
                { name: 'Languages', icon: '🌍', color: 'from-orange-500 to-red-500' },
                { name: 'Business', icon: '💼', color: 'from-indigo-500 to-blue-500' },
                { name: 'Arts', icon: '🎨', color: 'from-pink-500 to-rose-500' }
              ].map((subject, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSubject(subject.name)}
                  className={`group p-6 backdrop-blur-sm rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                    theme === 'bright' 
                      ? 'bg-white/80 border-gray-200/50 hover:bg-gray-50/80' 
                      : 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-700/80'
                  }`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${subject.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition-transform`}>
                    {subject.icon}
                  </div>
                  <h3 className={`font-bold transition-colors ${
                    theme === 'bright' 
                      ? 'text-gray-700 group-hover:text-black' 
                      : 'text-slate-200 group-hover:text-white'
                  }`}>
                    {subject.name}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Grid - Premium Design */}
      <div className="container mx-auto px-6 py-16">

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="relative">
              <div className={`w-16 h-16 border-4 border-t-blue-600 rounded-full animate-spin ${
                theme === 'bright' ? 'border-gray-200' : 'border-slate-200'
              }`}></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animate-reverse opacity-60"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.length > 0 && (
              teachers.map((teacher) => (
                <div key={teacher._id} className="group relative">
                  {/* Card Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur"></div>
                  
                  {/* Main Card */}
                  <div className={`relative backdrop-blur-lg rounded-3xl shadow-xl border p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden ${
                    theme === 'bright' 
                      ? 'bg-white/95 border-gray-200/50' 
                      : 'bg-white/95 border-white/50'
                  }`}>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    
                    {/* Header */}
                    <div className="relative flex items-start justify-between mb-6">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-2xl font-bold">
                              {teacher.name?.charAt(0) || 'T'}
                            </span>
                          </div>
                          {/* Online Status */}
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className={`text-xl font-bold transition-colors ${
                            theme === 'bright' 
                              ? 'text-black group-hover:text-blue-600' 
                              : 'text-slate-800 group-hover:text-blue-600'
                          }`}>
                            {teacher.name}
                          </h3>
                          <div className="flex items-center mt-1">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <p className={`text-sm font-medium ${
                              theme === 'bright' ? 'text-gray-600' : 'text-slate-500'
                            }`}>Verified Expert</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex items-center space-x-2">
                        <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          theme === 'bright' 
                            ? 'bg-gray-100 hover:bg-blue-100' 
                            : 'bg-slate-100 hover:bg-blue-100'
                        }`}>
                          <Heart className={`h-4 w-4 hover:text-red-500 ${
                            theme === 'bright' ? 'text-gray-600' : 'text-slate-500'
                          }`} />
                        </button>
                        <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          theme === 'bright' 
                            ? 'bg-gray-100 hover:bg-blue-100' 
                            : 'bg-slate-100 hover:bg-blue-100'
                        }`}>
                          <Bookmark className={`h-4 w-4 hover:text-blue-500 ${
                            theme === 'bright' ? 'text-gray-600' : 'text-slate-500'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Bio */}
                    {teacher.bio && (
                      <div className="mb-6">
                        <p className={`line-clamp-3 leading-relaxed ${
                          theme === 'bright' ? 'text-gray-700' : 'text-slate-600'
                        }`}>
                          {teacher.bio}
                        </p>
                      </div>
                    )}

                    {/* Specializations */}
                    {teacher.specializations && teacher.specializations.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center mr-2 ${
                            theme === 'bright' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            <Target className={`h-4 w-4 ${
                              theme === 'bright' ? 'text-yellow-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <p className={`text-sm font-bold ${
                            theme === 'bright' ? 'text-black' : 'text-slate-700'
                          }`}>Expertise</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {teacher.specializations.slice(0, 3).map((spec, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1.5 text-sm rounded-xl border font-medium transition-all ${
                                theme === 'bright' 
                                  ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-orange-700 border-orange-200/50 hover:from-yellow-500/20 hover:to-orange-500/20' 
                                  : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border-blue-200/50 hover:from-blue-500/20 hover:to-purple-500/20'
                              }`}
                            >
                              {spec}
                            </span>
                          ))}
                          {teacher.specializations.length > 3 && (
                            <span className={`text-sm px-3 py-1.5 rounded-xl ${
                              theme === 'bright' 
                                ? 'text-gray-600 bg-gray-100' 
                                : 'text-slate-500 bg-slate-100'
                            }`}>
                              +{teacher.specializations.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats & Pricing */}
                    <div className={`flex items-center justify-between mb-6 p-4 rounded-2xl border ${
                      theme === 'bright' 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50/50 border-yellow-100' 
                        : 'bg-gradient-to-r from-slate-50 to-blue-50/50 border-slate-100'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className={`text-sm ml-2 font-bold ${
                            theme === 'bright' ? 'text-black' : 'text-slate-700'
                          }`}>
                            {teacher.rating || '5.0'}
                          </span>
                        </div>
                        <div className={`flex items-center ${
                          theme === 'bright' ? 'text-gray-700' : 'text-slate-600'
                        }`}>
                          <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                          <span className="text-xs font-medium">98% success</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${teacher.hourlyRate || 25}
                        </div>
                        <div className={`text-xs font-medium ${
                          theme === 'bright' ? 'text-gray-600' : 'text-slate-500'
                        }`}>per hour</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleChatWithTeacher(teacher._id)}
                        className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold group"
                      >
                        <MessageCircle className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                        Chat Now
                      </button>
                      <button
                        onClick={() => handleVideoCallWithTeacher(teacher._id)}
                        className={`flex-1 flex items-center justify-center px-6 py-4 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold group ${
                          theme === 'bright' 
                            ? 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:border-yellow-200' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200'
                        }`}
                      >
                        <Video className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                        Video Call
                      </button>
                    </div>

                    {/* Quick Stats */}
                    <div className={`mt-4 pt-4 border-t flex items-center justify-between text-xs ${
                      theme === 'bright' 
                        ? 'border-gray-100 text-gray-600' 
                        : 'border-slate-100 text-slate-500'
                    }`}>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Usually responds in 5 mins</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>150+ students taught</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {teachers.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/find-tutors"
              className={`group inline-flex items-center px-8 py-4 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl ${
                theme === 'bright' 
                  ? 'bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-900' 
                  : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-900 hover:to-black'
              }`}
            >
              Explore All Tutors
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {/* Features Section - Premium Design */}
      <div className={`relative py-20 overflow-hidden ${
        theme === 'bright' 
          ? 'bg-gradient-to-br from-yellow-50 via-white to-orange-50' 
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900'
      }`}>
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>

        <div className="relative container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className={`inline-flex items-center px-4 py-2 backdrop-blur-sm border rounded-full text-sm font-medium mb-6 ${
              theme === 'bright' 
                ? 'bg-yellow-500/20 border-yellow-400/30 text-orange-700' 
                : 'bg-blue-500/20 border-blue-400/30 text-blue-300'
            }`}>
              <Award className="h-4 w-4 mr-2" />
              Why Choose SKG Consulting
            </div>
            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${
              theme === 'bright' ? 'text-black' : 'text-white'
            }`}>
              The Future of
              <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
                theme === 'bright' 
                  ? 'from-yellow-600 to-orange-600' 
                  : 'from-blue-400 to-purple-400'
              }`}>
                {" "}Learning
              </span>
            </h2>
            <p className={`text-xl leading-relaxed ${
              theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
            }`}>
              Experience education reimagined with our cutting-edge platform designed for the modern learner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className={`relative backdrop-blur-lg border rounded-2xl p-8 h-full transition-all duration-300 ${
                theme === 'bright' 
                  ? 'bg-white/90 border-gray-200/50 hover:bg-white/95' 
                  : 'bg-white/10 border-white/20 hover:bg-white/15'
              }`}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>Verified Excellence</h3>
                <p className={`leading-relaxed mb-6 ${
                  theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                }`}>
                  Every educator undergoes rigorous verification and continuous quality assessment to ensure world-class teaching standards.
                </p>
                <div className={`flex items-center text-sm font-medium ${
                  theme === 'bright' ? 'text-blue-600' : 'text-blue-300'
                }`}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  100% Verified Professionals
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className={`relative backdrop-blur-lg border rounded-2xl p-8 h-full transition-all duration-300 ${
                theme === 'bright' 
                  ? 'bg-white/90 border-gray-200/50 hover:bg-white/95' 
                  : 'bg-white/10 border-white/20 hover:bg-white/15'
              }`}>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>Instant Connection</h3>
                <p className={`leading-relaxed mb-6 ${
                  theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                }`}>
                  Connect with expert tutors in seconds through our advanced matching algorithm and real-time communication platform.
                </p>
                <div className={`flex items-center text-sm font-medium ${
                  theme === 'bright' ? 'text-green-600' : 'text-green-300'
                }`}>
                  <Clock className="h-4 w-4 mr-2" />
                  Average Response: 30 seconds
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className={`relative backdrop-blur-lg border rounded-2xl p-8 h-full transition-all duration-300 ${
                theme === 'bright' 
                  ? 'bg-white/90 border-gray-200/50 hover:bg-white/95' 
                  : 'bg-white/10 border-white/20 hover:bg-white/15'
              }`}>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>Personalized Journey</h3>
                <p className={`leading-relaxed mb-6 ${
                  theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                }`}>
                  AI-powered learning paths adapt to your pace, learning style, and goals for maximum educational impact.
                </p>
                <div className={`flex items-center text-sm font-medium ${
                  theme === 'bright' ? 'text-purple-600' : 'text-purple-300'
                }`}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  98% Success Rate
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                theme === 'bright' ? 'bg-gray-100' : 'bg-white/10'
              }`}>
                <Globe className={`h-6 w-6 ${
                  theme === 'bright' ? 'text-blue-600' : 'text-blue-400'
                }`} />
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${
                theme === 'bright' ? 'text-black' : 'text-white'
              }`}>Global Reach</h4>
              <p className={`text-sm ${
                theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
              }`}>Learn from anywhere, anytime</p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                theme === 'bright' ? 'bg-gray-100' : 'bg-white/10'
              }`}>
                <Bookmark className={`h-6 w-6 ${
                  theme === 'bright' ? 'text-green-600' : 'text-green-400'
                }`} />
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${
                theme === 'bright' ? 'text-black' : 'text-white'
              }`}>Progress Tracking</h4>
              <p className={`text-sm ${
                theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
              }`}>Monitor your learning journey</p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                theme === 'bright' ? 'bg-gray-100' : 'bg-white/10'
              }`}>
                <Users className={`h-6 w-6 ${
                  theme === 'bright' ? 'text-purple-600' : 'text-purple-400'
                }`} />
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${
                theme === 'bright' ? 'text-black' : 'text-white'
              }`}>Community</h4>
              <p className={`text-sm ${
                theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
              }`}>Join study groups and forums</p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                theme === 'bright' ? 'bg-gray-100' : 'bg-white/10'
              }`}>
                <Award className={`h-6 w-6 ${
                  theme === 'bright' ? 'text-yellow-600' : 'text-yellow-400'
                }`} />
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${
                theme === 'bright' ? 'text-black' : 'text-white'
              }`}>Certifications</h4>
              <p className={`text-sm ${
                theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
              }`}>Earn recognized credentials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className={`relative ${
        theme === 'bright' 
          ? 'bg-gradient-to-br from-gray-50 via-white to-gray-100' 
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      }`}>
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-1"></div>
        </div>

        <div className="relative">
          {/* Newsletter Section */}
          <div className={`py-16 ${
            theme === 'bright' ? 'border-b border-gray-200' : 'border-b border-slate-700/50'
          }`}>
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center">
                <div className={`inline-flex items-center px-4 py-2 backdrop-blur-sm border rounded-full text-sm font-medium mb-6 ${
                  theme === 'bright' 
                    ? 'bg-yellow-500/20 border-yellow-400/30 text-orange-700' 
                    : 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                }`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Stay Updated
                </div>
                
                <h3 className={`text-3xl lg:text-4xl font-bold mb-4 ${
                  theme === 'bright' ? 'text-black' : 'text-white'
                }`}>
                  Get the Latest Learning Tips & Updates
                </h3>
                <p className={`text-xl mb-8 ${
                  theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                }`}>
                  Join our newsletter for expert insights, new tutor spotlights, and exclusive learning resources.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={`w-full px-6 py-4 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'bright' 
                          ? 'bg-gray-100/80 border-gray-200 text-black placeholder-gray-500' 
                          : 'bg-white/10 border-white/20 text-white placeholder-slate-300'
                      }`}
                    />
                  </div>
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center shadow-xl">
                    <Send className="h-5 w-5 mr-2" />
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="py-16">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                {/* Company Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                      <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${
                        theme === 'bright' ? 'text-black' : 'text-white'
                      }`}>SKG Consulting</h3>
                      <p className={`text-sm ${
                        theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                      }`}>Your Learning Partner</p>
                    </div>
                  </div>
                  
                  <p className={`mb-6 leading-relaxed ${
                    theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                  }`}>
                    Empowering students worldwide with access to top-tier educators and personalized learning experiences. 
                    Transform your educational journey with our innovative platform.
                  </p>
                  
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className={`flex items-center ${
                      theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                    }`}>
                      <Mail className={`h-5 w-5 mr-3 ${
                        theme === 'bright' ? 'text-blue-600' : 'text-blue-400'
                      }`} />
                      <span>sannikumargupta43a2@gmail.com</span>
                    </div>
                    <div className={`flex items-center ${
                      theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                    }`}>
                      <Phone className={`h-5 w-5 mr-3 ${
                        theme === 'bright' ? 'text-blue-600' : 'text-blue-400'
                      }`} />
                      <span>+91 8579037260</span>
                    </div>
                    <div className={`flex items-center ${
                      theme === 'bright' ? 'text-gray-700' : 'text-slate-300'
                    }`}>
                      <MapPin className={`h-5 w-5 mr-3 ${
                        theme === 'bright' ? 'text-blue-600' : 'text-blue-400'
                      }`} />
                      <span>Jodhpur, Rajasthan</span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className={`text-lg font-bold mb-6 ${
                    theme === 'bright' ? 'text-black' : 'text-white'
                  }`}>Quick Links</h4>
                  <ul className="space-y-3">
                    {[
                      { name: 'Find Tutors', href: '/find-tutors' },
                      { name: 'How It Works', href: '/how-it-works' },
                      { name: 'Pricing', href: '/pricing' },
                      { name: 'Success Stories', href: '/testimonials' },
                      { name: 'Blog', href: '/blog' },
                      { name: 'Help Center', href: '/help' }
                    ].map((link) => (
                      <li key={link.name}>
                        <Link 
                          to={link.href} 
                          className={`transition-colors duration-300 flex items-center group ${
                            theme === 'bright' 
                              ? 'text-gray-600 hover:text-black' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* For Students */}
                <div>
                  <h4 className={`text-lg font-bold mb-6 ${
                    theme === 'bright' ? 'text-black' : 'text-white'
                  }`}>For Students</h4>
                  <ul className="space-y-3">
                    {[
                      { name: 'Dashboard', href: '/dashboard' },
                      { name: 'Browse Subjects', href: '/subjects' },
                      { name: 'Study Groups', href: '/groups' },
                      { name: 'Progress Tracking', href: '/progress' },
                      { name: 'Certificates', href: '/certificates' },
                      { name: 'Mobile App', href: '/app' }
                    ].map((link) => (
                      <li key={link.name}>
                        <Link 
                          to={link.href} 
                          className={`transition-colors duration-300 flex items-center group ${
                            theme === 'bright' 
                              ? 'text-gray-600 hover:text-black' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* For Tutors */}
                <div>
                  <h4 className={`text-lg font-bold mb-6 ${
                    theme === 'bright' ? 'text-black' : 'text-white'
                  }`}>For Tutors</h4>
                  <ul className="space-y-3">
                    {[
                      { name: 'Become a Tutor', href: '/become-tutor' },
                      { name: 'Tutor Resources', href: '/tutor-resources' },
                      { name: 'Payment Info', href: '/payments' },
                      { name: 'Teaching Tools', href: '/tools' },
                      { name: 'Community', href: '/community' },
                      { name: 'Support', href: '/tutor-support' }
                    ].map((link) => (
                      <li key={link.name}>
                        <Link 
                          to={link.href} 
                          className={`transition-colors duration-300 flex items-center group ${
                            theme === 'bright' 
                              ? 'text-gray-600 hover:text-black' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Social Media & Additional Info */}
              <div className={`mt-16 pt-8 border-t ${
                theme === 'bright' ? 'border-gray-200' : 'border-slate-700/50'
              }`}>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  {/* Social Media */}
                  <div className="flex items-center gap-4">
                    <span className={`mr-4 ${
                      theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                    }`}>Follow Us:</span>
                    {[
                      { icon: Facebook, href: 'https://www.facebook.com/sannigupta.sannigupta.334', color: 'hover:text-blue-500' },
                      { icon: Twitter, href: '#', color: 'hover:text-blue-400' },
                      { icon: Instagram, href: 'https://www.instagram.com/itz____sanni/', color: 'hover:text-pink-500' },
                      { icon: Linkedin, href: 'https://www.linkedin.com/in/sanni-kumar-gupta-10792b290/', color: 'hover:text-blue-600' },
                      { icon: Youtube, href: 'https://www.youtube.com/@lifeexperiencewith_sanni8579', color: 'hover:text-red-500' }
                    ].map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-12 h-12 backdrop-blur-sm border rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                            theme === 'bright' 
                              ? 'bg-gray-100/50 border-gray-200/50 text-gray-600 hover:bg-gray-200/50' + ' ' + social.color
                              : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50' + ' ' + social.color
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      );
                    })}
                  </div>

                  {/* App Download */}
                  <div className="flex items-center gap-4">
                    <span className={`${
                      theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                    }`}>Download App:</span>
                    <button className={`px-4 py-2 backdrop-blur-sm border rounded-lg transition-all duration-300 flex items-center ${
                      theme === 'bright' 
                        ? 'bg-gray-100/50 border-gray-200/50 text-gray-700 hover:text-black hover:bg-gray-200/50' 
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}>
                      <Download className="h-4 w-4 mr-2" />
                      iOS
                    </button>
                    <button className={`px-4 py-2 backdrop-blur-sm border rounded-lg transition-all duration-300 flex items-center ${
                      theme === 'bright' 
                        ? 'bg-gray-100/50 border-gray-200/50 text-gray-700 hover:text-black hover:bg-gray-200/50' 
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}>
                      <Download className="h-4 w-4 mr-2" />
                      Android
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className={`py-6 border-t ${
            theme === 'bright' ? 'border-gray-200' : 'border-slate-700/50'
          }`}>
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className={`flex items-center gap-6 text-sm ${
                  theme === 'bright' ? 'text-gray-600' : 'text-slate-400'
                }`}>
                  <span>© 2024 SKG Consulting. All rights reserved.</span>
                  <div className="hidden md:flex items-center gap-4">
                    <Link to="/privacy" className={`transition-colors ${
                      theme === 'bright' ? 'hover:text-black' : 'hover:text-white'
                    }`}>Privacy Policy</Link>
                    <span className={`${
                      theme === 'bright' ? 'text-gray-400' : 'text-slate-600'
                    }`}>•</span>
                    <Link to="/terms" className={`transition-colors ${
                      theme === 'bright' ? 'hover:text-black' : 'hover:text-white'
                    }`}>Terms of Service</Link>
                    <span className={`${
                      theme === 'bright' ? 'text-gray-400' : 'text-slate-600'
                    }`}>•</span>
                    <Link to="/cookies" className={`transition-colors ${
                      theme === 'bright' ? 'hover:text-black' : 'hover:text-white'
                    }`}>Cookie Policy</Link>
                  </div>
                </div>
                
                {/* Back to Top */}
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
