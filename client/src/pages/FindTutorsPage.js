import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Users, 
  MessageCircle, 
  BookOpen, 
  ArrowRight, 
  Filter,
  MapPin,
  Star,
  Clock,
  Video,
  GraduationCap,
  Award,
  DollarSign,
  Sparkles,
  Target
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const FindTutorsPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [availability, setAvailability] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize search parameters from URL
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlSubject = searchParams.get('subject') || '';
    
    setSearchTerm(urlSearch);
    setSelectedSubject(urlSubject);
  }, [searchParams]);

  // Fetch all teachers (no filtering like dashboard)
  const fetchAllTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (priceRange) {
        const [min, max] = priceRange.split('-');
        if (max !== '+') params.append('maxRate', max);
      }
      
      // Use the users/teachers endpoint which shows ALL teachers
      const response = await fetch(`/api/users/teachers?${params}&limit=50`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load teachers when component mounts, URL params change, or search filters change
  useEffect(() => {
    if (user) {
      fetchAllTeachers();
    }
  }, [user, searchTerm, selectedSubject, priceRange]);

  // Handle contact button click - navigate directly to chat with teacher
  const handleContactTeacher = (teacherId, teacherName) => {
    // Navigate directly to chat page with teacherId in URL
    navigate(`/chat/${teacherId}`, {
      state: {
        teacherName
      }
    });
  };

  return (
    <div 
      className={`min-h-screen transition-all duration-500 ${
        theme === 'bright' 
        ? 'bg-gradient-to-br from-yellow-50 via-white to-yellow-100' 
        : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900'
      }`}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute top-20 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
            theme === 'bright' 
            ? 'bg-gradient-to-tr from-yellow-200/30 via-transparent to-orange-200/30' 
            : 'bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20'
          }`}
        />
        <div 
          className={`absolute bottom-20 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            theme === 'bright' ? 'bg-yellow-400' : 'bg-blue-500'
          }`}
        />
        <div 
          className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-15 ${
            theme === 'bright' ? 'bg-orange-400' : 'bg-purple-500'
          }`}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div 
              className={`p-4 rounded-full ${
                theme === 'bright'
                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200'
                : 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700'
              } backdrop-blur-sm`}
            >
              <Search 
                className={`h-8 w-8 ${
                  theme === 'bright' ? 'text-orange-600' : 'text-blue-400'
                }`} 
              />
            </div>
          </div>
          
          <h1 
            className={`text-4xl md:text-6xl font-bold mb-6 ${
              theme === 'bright' ? 'text-gray-900' : 'text-white'
            }`}
          >
            Find Your Perfect{' '}
            <span 
              className={`bg-clip-text text-transparent bg-gradient-to-r ${
                theme === 'bright' 
                ? 'from-yellow-600 via-orange-500 to-red-500' 
                : 'from-blue-400 via-purple-400 to-pink-400'
              }`}
            >
              Tutor
            </span>
          </h1>
          
          <p 
            className={`text-xl max-w-3xl mx-auto leading-relaxed mb-8 ${
              theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            Browse all available tutors and find the perfect match for your learning needs.
          </p>
        </div>

        {/* Advanced Search Section */}
        <div 
          className={`mb-16 p-8 rounded-2xl border backdrop-blur-sm ${
            theme === 'bright'
            ? 'bg-white/60 border-yellow-200 shadow-xl shadow-yellow-500/10'
            : 'bg-gray-800/60 border-gray-700 shadow-xl shadow-blue-500/10'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  theme === 'bright' ? 'text-gray-400' : 'text-gray-500'
                }`} 
              />
              <input
                type="text"
                placeholder="Search tutors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${
                  theme === 'bright'
                  ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                  : 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
            </div>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={`px-4 py-3 rounded-lg border transition-all ${
                theme === 'bright'
                ? 'bg-white border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                : 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            >
              <option value="">All Subjects</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="history">History</option>
            </select>
            
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className={`px-4 py-3 rounded-lg border transition-all ${
                theme === 'bright'
                ? 'bg-white border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                : 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            >
              <option value="">Any Price</option>
              <option value="0-25">$0 - $25/hr</option>
              <option value="25-50">$25 - $50/hr</option>
              <option value="50-100">$50 - $100/hr</option>
              <option value="100+">$100+/hr</option>
            </select>
            
            <button 
              onClick={fetchAllTeachers}
              className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all ${
                theme === 'bright'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <Filter className="h-5 w-5 mr-2" />
              Search
            </button>
          </div>
        </div>

        {/* Teachers Results Section */}
        <div className="mb-16">
          <div 
            className={`mb-8 p-8 rounded-2xl border backdrop-blur-sm ${
              theme === 'bright'
              ? 'bg-white/60 border-yellow-200 shadow-xl shadow-yellow-500/10'
              : 'bg-gray-800/60 border-gray-700 shadow-xl shadow-blue-500/10'
            }`}
          >
            <h3 className={`text-2xl font-bold mb-6 ${
              theme === 'bright' ? 'text-gray-900' : 'text-white'
            }`}>
              All Available Tutors ({teachers.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${
                  theme === 'bright' ? 'border-orange-600' : 'border-blue-500'
                }`}></div>
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-8">
                <Users className={`h-12 w-12 mx-auto mb-4 ${
                  theme === 'bright' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <h4 className={`text-lg font-medium mb-2 ${
                  theme === 'bright' ? 'text-gray-900' : 'text-white'
                }`}>
                  No tutors found
                </h4>
                <p className={`${
                  theme === 'bright' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                      theme === 'bright' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3 mb-4">
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
                            ({teacher.totalRatings || 127})
                          </span>
                        </div>
                        
                        <p className={`text-lg font-bold ${
                          theme === 'bright' ? 'text-green-600' : 'text-green-400'
                        }`}>
                          ${teacher.hourlyRate || 25}/hr
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className={`text-sm mb-2 ${
                        theme === 'bright' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {teacher.bio || 'Experienced tutor ready to help you succeed.'}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {(teacher.specializations || ['Math', 'Science']).slice(0, 3).map((spec, idx) => (
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
                        onClick={() => handleContactTeacher(teacher._id, teacher.name)}
                        className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-colors ${
                          theme === 'bright'
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Contact
                      </button>
                      <button
                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                          theme === 'bright'
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        <Video className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindTutorsPage;