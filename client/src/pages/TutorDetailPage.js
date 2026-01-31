import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Star, 
  Clock, 
  Award, 
  MessageCircle, 
  Video,
  Mail,
  BookOpen,
  CheckCircle,
  User
} from 'lucide-react';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';

const TutorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getTeacher(id);
        if (response.data.success) {
          setTeacher(response.data.teacher);
        } else {
          toast.error('Teacher not found');
          navigate('/404');
        }
      } catch (error) {
        console.error('Error fetching teacher details:', error);
        toast.error('Failed to load teacher details');
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeacherDetails();
    }
  }, [id, navigate]);

  const handleStartChat = () => {
    navigate(`/chat/${id}`);
  };

  const handleStartVideoCall = () => {
    navigate(`/video-call/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4 border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😔</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Teacher Not Found</h1>
          <p className="text-gray-600 mb-6">
            The teacher profile you're looking for doesn't exist.
          </p>
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-all duration-200 bg-white px-4 py-2 rounded-lg shadow-sm border hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back</span>
        </motion.button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Teacher Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden sticky top-6"
            >
              {/* Profile Header */}
              <div className="p-6 text-center border-b border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg">
                  {teacher.name?.charAt(0).toUpperCase() || 'T'}
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">{teacher.name}</h1>
                <p className="text-blue-600 font-medium capitalize mb-3">{teacher.role}</p>
                
                {/* Status Badge */}
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Profile Complete</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">0.0</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">0</div>
                    <div className="text-xs text-gray-600">Reviews</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{teacher.experience || 0}</div>
                    <div className="text-xs text-gray-600">Years Exp.</div>
                  </div>
                </div>
              </div>

              {/* Hourly Rate */}
              <div className="p-6 border-b border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${teacher.hourlyRate || 0}</div>
                  <div className="text-sm text-gray-600">per hour</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 space-y-3">
                <motion.button
                  onClick={handleStartChat}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Send Message</span>
                </motion.button>
                <motion.button
                  onClick={handleStartVideoCall}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Teacher Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">About {teacher.name}</h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {teacher.bio || "This teacher hasn't added a bio yet. They are passionate about education and helping students achieve their academic goals through personalized learning experiences."}
                </p>
              </div>
            </motion.div>

            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{teacher.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Response Time</p>
                    <p className="text-gray-900">Usually within an hour</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Teaching Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Teaching Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Experience</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{teacher.experience || 0} years</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Hourly Rate</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">${teacher.hourlyRate || 0}/hour</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Status</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm font-medium text-green-600">Available</p>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              {teacher.specializations && teacher.specializations.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {teacher.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Availability & Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Availability</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">General Schedule</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Monday to Friday</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Flexible scheduling available</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Weekend sessions upon request</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Response & Booking</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">Fast Response</div>
                      <div className="text-sm text-blue-700">Usually replies within 1 hour</div>
                      <div className="text-xs text-gray-600 mt-2">Available for immediate booking</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reviews Section (Placeholder) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Reviews</h3>
              </div>
              
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h4>
                <p className="text-gray-600">Be the first to book a session and leave a review!</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDetailPage;
