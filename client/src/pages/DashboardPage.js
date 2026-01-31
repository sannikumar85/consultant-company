import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Star, 
  DollarSign, 
  MessageCircle, 
  Video,
  User,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Grid,
  List,
  MoreVertical,
  Eye,
  ArrowRight,
  Calendar,
  Award,
  Target,
  Zap,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [viewMode, setViewMode] = useState('grid');
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalSessions: 0,
    averageRating: 0
  });

  // API Functions
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDashboardStats(statsData);
      }

      // For students: DO NOT fetch teachers automatically - only after filtering

      // Fetch subjects
      const subjectsResponse = await fetch('/api/subjects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Separate function to fetch teachers with search filters
  const fetchDashboardTeachers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (priceRange[1] < 100) params.append('maxRate', priceRange[1]);
      
      const teachersResponse = await fetch(`/api/dashboard/teachers?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        setTeachers(teachersData.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard teachers:', error);
      setTeachers([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]); 

  // ONLY fetch teachers when student actually searches or filters
  useEffect(() => {
    if (user?.role === 'student' && (searchTerm || selectedSubject || priceRange[1] < 100)) {
      const debounceTimer = setTimeout(() => {
        fetchDashboardTeachers();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else if (user?.role === 'student') {
      // Clear teachers when no filters are applied
      setTeachers([]);
    }
  }, [searchTerm, selectedSubject, priceRange, user?.role]);

  // Calculate dynamic stats based on user role and actual data
  const getStatsCards = () => {
    if (user?.role === 'student') {
      return [
        {
          title: 'Available Tutors',
          value: teachers.length,
          icon: Users,
          color: 'text-blue-500',
          bgColor: theme === 'bright' ? 'bg-blue-50' : 'bg-blue-900/20',
          trend: '+12%',
          subtitle: 'Ready to help'
        },
        {
          title: 'Hours Learned',
          value: user?.totalLearningHours || 0,
          icon: Clock,
          color: 'text-green-500',
          bgColor: theme === 'bright' ? 'bg-green-50' : 'bg-green-900/20',
          trend: '+8%',
          subtitle: 'This month'
        },
        {
          title: 'Subjects Studied',
          value: user?.enrolledSubjects?.length || 0,
          icon: BookOpen,
          color: 'text-purple-500',
          bgColor: theme === 'bright' ? 'bg-purple-50' : 'bg-purple-900/20',
          trend: '+3',
          subtitle: 'Active courses'
        },
        {
          title: 'Average Rating',
          value: user?.averageRating ? user.averageRating.toFixed(1) : '0.0',
          icon: Star,
          color: 'text-yellow-500',
          bgColor: theme === 'bright' ? 'bg-yellow-50' : 'bg-yellow-900/20',
          trend: '+0.2',
          subtitle: 'From tutors'
        }
      ];
    } else {
      return [
        {
          title: 'Active Students',
          value: user?.activeStudents || 0,
          icon: Users,
          color: 'text-blue-500',
          bgColor: theme === 'bright' ? 'bg-blue-50' : 'bg-blue-900/20',
          trend: '+5',
          subtitle: 'This month'
        },
        {
          title: 'Teaching Hours',
          value: user?.totalTeachingHours || 0,
          icon: Clock,
          color: 'text-green-500',
          bgColor: theme === 'bright' ? 'bg-green-50' : 'bg-green-900/20',
          trend: `+${user?.weeklyHours || 0}`,
          subtitle: 'This week'
        },
        {
          title: 'Total Earnings',
          value: user?.totalEarnings || 0,
          icon: DollarSign,
          color: 'text-emerald-500',
          bgColor: theme === 'bright' ? 'bg-emerald-50' : 'bg-emerald-900/20',
          trend: '+15%',
          subtitle: 'This month',
          prefix: '$'
        },
        {
          title: 'Student Rating',
          value: user?.averageRating ? user.averageRating.toFixed(1) : '0.0',
          icon: Star,
          color: 'text-yellow-500',
          bgColor: theme === 'bright' ? 'bg-yellow-50' : 'bg-yellow-900/20',
          trend: '+0.3',
          subtitle: 'From students'
        }
      ];
    }
  };

  // Handlers
  const handleStartChat = (teacherId, teacherName) => {
    // Navigate directly to chat page with teacherId in URL
    navigate(`/chat/${teacherId}`, {
      state: {
        teacherName
      }
    });
  };

  const handleStartVideoCall = async (teacherId) => {
    try {
      const response = await fetch('/api/calls/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ teacherId, type: 'video' })
      });

      if (response.ok) {
        const { callId } = await response.json();
        navigate(`/video-call/${callId}`);
      }
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  };

  // Filtering logic - now just use the teachers from server
  const filteredTeachers = teachers; // Remove client-side filtering since server handles it

  const statsCards = getStatsCards();

  return (
    <div className={`min-h-screen ${
      theme === 'bright'
        ? 'bg-gradient-to-br from-orange-50 via-white to-red-50'
        : 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900'
    }`}>
      
      {/* Welcome Header */}
      <div className="pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className={`text-4xl font-bold mb-2 ${
              theme === 'bright' ? 'text-gray-900' : 'text-white'
            }`}>
              Welcome back, {user?.name}! 👋
            </h1>
            <p className={`text-lg ${
              theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {user?.role === 'student' 
                ? 'Ready to learn something amazing today? Find the perfect tutor below!' 
                : 'Ready to inspire and teach students today? Manage your profile and connect with learners!'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, index) => (
            <div
              key={index}
              className={`${card.bgColor} rounded-xl p-4 border ${
                theme === 'bright' 
                  ? 'border-gray-200 shadow-sm' 
                  : 'border-gray-700 shadow-lg'
              } hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  theme === 'bright' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-green-900/50 text-green-400'
                }`}>
                  {card.trend}
                </span>
              </div>
              <div>
                <p className={`text-2xl font-bold mb-1 ${
                  theme === 'bright' ? 'text-gray-900' : 'text-white'
                }`}>
                  {card.prefix || ''}{card.value}{card.title === 'Teaching Hours' || card.title === 'Hours Learned' ? 'h' : ''}
                </p>
                <p className={`text-sm font-medium ${
                  theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  {card.title}
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'bright' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {card.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        
        {/* Student Dashboard */}
        {user?.role === 'student' && (
          <div className="space-y-6">
            
            {/* Search Section */}
            <div className={`${
              theme === 'bright' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
            } rounded-xl border p-4 shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'bright' ? 'text-gray-900' : 'text-white'
              }`}>
                🔍 Find Your Perfect Tutor
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    theme === 'bright' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search tutors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'bright'
                        ? 'bg-gray-50 border-gray-200 focus:border-orange-400 text-gray-900'
                        : 'bg-gray-900 border-gray-600 focus:border-blue-500 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  />
                </div>

                {/* Subject Filter */}
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'bright'
                      ? 'bg-gray-50 border-gray-200 focus:border-orange-400 text-gray-900'
                      : 'bg-gray-900 border-gray-600 focus:border-blue-500 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                >
                  <option value="">All Subjects</option>
                  {Array.isArray(subjects) && subjects.map(subject => (
                    <option key={subject._id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-2 ${
                      viewMode === 'grid'
                        ? theme === 'bright'
                          ? 'bg-orange-500 text-white'
                          : 'bg-blue-600 text-white'
                        : theme === 'bright'
                          ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } transition-colors`}
                  >
                    <Grid className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 ${
                      viewMode === 'list'
                        ? theme === 'bright'
                          ? 'bg-orange-500 text-white'
                          : 'bg-blue-600 text-white'
                        : theme === 'bright'
                          ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } transition-colors`}
                  >
                    <List className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Price Range: ${priceRange[0]} - ${priceRange[1]}/hour
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                    theme === 'bright' 
                      ? 'bg-gray-200 accent-orange-500' 
                      : 'bg-gray-700 accent-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Teachers List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${
                  theme === 'bright' ? 'text-gray-900' : 'text-white'
                }`}>
                  Available Teachers ({filteredTeachers.length})
                </h3>
                <Link
                  to="/find-tutors"
                  className={`text-sm font-medium transition-colors ${
                    theme === 'bright' 
                      ? 'text-orange-600 hover:text-orange-700' 
                      : 'text-blue-400 hover:text-blue-300'
                  }`}
                >
                  View All Teachers →
                </Link>
              </div>

              {filteredTeachers.length === 0 ? (
                <div className={`${
                  theme === 'bright' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
                } rounded-xl border p-8 text-center shadow-sm`}>
                  <Users className={`h-12 w-12 mx-auto mb-4 ${
                    theme === 'bright' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <h4 className={`text-lg font-medium mb-2 ${
                    theme === 'bright' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {searchTerm || selectedSubject || priceRange[1] < 100 
                      ? 'No teachers found' 
                      : 'Search for Teachers'
                    }
                  </h4>
                  <p className={`${
                    theme === 'bright' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {searchTerm || selectedSubject || priceRange[1] < 100 
                      ? 'Try adjusting your search criteria' 
                      : 'Use the search box above to find teachers, or visit Find Tutors to browse all teachers'
                    }
                  </p>
                </div>
              ) : (
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredTeachers.map((teacher, index) => (
                    <div
                      key={teacher._id || index}
                      className={`${
                        theme === 'bright' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
                      } rounded-xl border p-4 hover:shadow-md transition-shadow duration-200`}
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                          theme === 'bright' 
                            ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                            : 'bg-gradient-to-br from-blue-500 to-purple-500'
                        }`}>
                          {teacher.name?.charAt(0)?.toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold truncate ${
                            theme === 'bright' ? 'text-gray-900' : 'text-white'
                          }`}>
                            {teacher.name}
                          </h4>
                          
                          <div className="flex items-center space-x-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (teacher.rating || 4) 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : theme === 'bright' 
                                      ? 'text-gray-300' 
                                      : 'text-gray-600'
                                }`}
                              />
                            ))}
                            <span className={`text-xs ${
                              theme === 'bright' ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              ({teacher.reviews || 127})
                            </span>
                          </div>
                          
                          <p className={`text-lg font-bold ${
                            theme === 'bright' ? 'text-green-600' : 'text-green-400'
                          }`}>
                            ${teacher.hourlyRate || 25}/hr
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {(teacher.specializations || ['Math', 'Science']).slice(0, 2).map((spec, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                theme === 'bright'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-blue-900/50 text-blue-300'
                              }`}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStartChat(teacher._id, teacher.name)}
                          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-colors ${
                            theme === 'bright'
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                        </button>
                        <button
                          onClick={() => handleStartVideoCall(teacher._id)}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                            theme === 'bright'
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          <Video className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/tutor/${teacher._id}`}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                            theme === 'bright'
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* View All Teachers Link */}
              <div className="mt-6 text-center">
                <Link
                  to="/find-tutors"
                  className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                    theme === 'bright'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                  }`}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse All Available Teachers
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Teacher Dashboard */}
        {user?.role === 'teacher' && (
          <div className="space-y-6">
            
            {/* Teacher Profile Card */}
            <div className={`${
              theme === 'bright' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
            } rounded-xl border p-6 shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'bright' ? 'text-gray-900' : 'text-white'
              }`}>
                Your Teaching Profile
              </h3>
              
              <div className="flex items-start space-x-4 mb-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-white text-xl ${
                  theme === 'bright' 
                    ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }`}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <h4 className={`text-xl font-bold ${
                    theme === 'bright' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {user?.name}
                  </h4>
                  
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (user?.rating || 4) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : theme === 'bright' 
                              ? 'text-gray-300' 
                              : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className={`text-sm ml-2 ${
                      theme === 'bright' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {user?.rating ? user.rating.toFixed(1) : '4.0'} ({user?.totalRatings || 0} reviews)
                    </span>
                  </div>
                  
                  <p className={`text-lg font-bold mb-2 ${
                    theme === 'bright' ? 'text-green-600' : 'text-green-400'
                  }`}>
                    ${user?.hourlyRate || 0}/hour
                  </p>
                  
                  <p className={`text-sm mb-3 ${
                    theme === 'bright' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {user?.bio || 'Add a bio to tell students about yourself and your teaching approach.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(user?.specializations || []).map((spec, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          theme === 'bright'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-blue-900/50 text-blue-300'
                        }`}
                      >
                        {spec}
                      </span>
                    ))}
                    {(!user?.specializations || user.specializations.length === 0) && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        theme === 'bright'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        No subjects added yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Link
                  to="/profile"
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'bright'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'bright'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Quick Actions */}
              <div className={`lg:col-span-2 ${
                theme === 'bright' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
              } rounded-xl border p-6 shadow-sm`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'bright' ? 'text-gray-900' : 'text-white'
                }`}>
                  Quick Actions
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Update Profile', icon: User, link: '/profile', color: 'text-blue-500' },
                    { title: 'My Students', icon: Users, link: '/students', color: 'text-green-500' },
                    { title: 'Schedule', icon: Calendar, link: '/schedule', color: 'text-purple-500' },
                    { title: 'Analytics', icon: TrendingUp, link: '/analytics', color: 'text-orange-500' }
                  ].map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className={`flex items-center p-3 rounded-lg border transition-colors ${
                        theme === 'bright' 
                          ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50' 
                          : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      <action.icon className={`h-5 w-5 ${action.color} mr-3`} />
                      <span className={`font-medium ${
                        theme === 'bright' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {action.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Profile Completion */}
              <div className={`${
                theme === 'bright' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
              } rounded-xl border p-6 shadow-sm`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'bright' ? 'text-gray-900' : 'text-white'
                }`}>
                  Profile Status
                </h3>
                
                <div className="space-y-3 mb-6">
                  {[
                    { title: 'Basic Info', completed: !!(user?.name && user?.email) },
                    { title: 'Bio', completed: !!user?.bio },
                    { title: 'Subjects', completed: !!(user?.specializations?.length) },
                    { title: 'Rate & Experience', completed: !!(user?.hourlyRate && user?.experience) }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className={`text-sm ${
                        theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        {item.title}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${
                        item.completed
                          ? 'bg-green-500'
                          : theme === 'bright' 
                            ? 'bg-gray-300' 
                            : 'bg-gray-600'
                      }`}></div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/profile"
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'bright'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Complete Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;