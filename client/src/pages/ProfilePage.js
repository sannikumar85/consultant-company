import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Edit3,
  Save,
  X,
  Star,
  GraduationCap,
  Briefcase,
  Award,
  MapPin,
  Clock,
  BookOpen,
  Heart,
  Trophy,
  Target,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, subjectAPI } from '../utils/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specializations: [],
    hourlyRate: '',
    experience: '',
    education: '',
    availability: '',
    grade: '',
    subjects: []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        specializations: user.specializations || [],
        hourlyRate: user.hourlyRate || '',
        experience: user.experience || '',
        education: user.education || '',
        availability: user.availability || '',
        grade: user.grade || '',
        subjects: user.subjects || []
      });
    }
    loadSubjects();
  }, [user]);

  const loadSubjects = async () => {
    try {
      const response = await subjectAPI.getAll();
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (specializationToRemove) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(spec => spec !== specializationToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
      };

      if (user.role === 'teacher') {
        updateData.specializations = formData.specializations;
        updateData.hourlyRate = formData.hourlyRate;
        updateData.experience = formData.experience;
        updateData.education = formData.education;
        updateData.availability = formData.availability;
      } else {
        updateData.grade = formData.grade;
        updateData.subjects = formData.subjects;
      }

      const response = await userAPI.updateProfile(updateData);
      
      if (response.data.success) {
        updateUser(response.data.user);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      specializations: user.specializations || [],
      hourlyRate: user.hourlyRate || '',
      experience: user.experience || '',
      education: user.education || '',
      availability: user.availability || '',
      grade: user.grade || '',
      subjects: user.subjects || []
    });
    setIsEditing(false);
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
            theme === 'bright' ? 'bg-orange-400' : 'bg-purple-500'
          }`}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div 
          className={`mb-8 p-8 rounded-3xl border backdrop-blur-sm ${
            theme === 'bright'
            ? 'bg-gradient-to-br from-white/80 via-yellow-50/80 to-orange-50/80 border-yellow-200 shadow-2xl shadow-yellow-500/10'
            : 'bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-blue-900/80 border-gray-700 shadow-2xl shadow-blue-500/10'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Profile Picture */}
              <div className="relative">
                <div 
                  className={`h-32 w-32 rounded-full flex items-center justify-center shadow-2xl ${
                    theme === 'bright'
                    ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400'
                    : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                  }`}
                >
                  <span className="text-4xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div 
                  className={`absolute -bottom-2 -right-2 p-3 rounded-full shadow-lg ${
                    theme === 'bright'
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                  }`}
                >
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* User Info */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-2">
                  <h1 
                    className={`text-4xl font-bold mr-3 ${
                      theme === 'bright' ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    {user?.name}
                  </h1>
                  <div 
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      theme === 'bright'
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700'
                      : 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-blue-300'
                    }`}
                  >
                    {user?.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                  </div>
                </div>
                
                <div 
                  className={`flex items-center justify-center lg:justify-start mb-4 ${
                    theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
                  }`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  <p className="text-lg">{user?.email}</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[
                    { 
                      icon: Star, 
                      label: 'Rating', 
                      value: user?.rating ? `${user.rating.toFixed(1)}⭐` : '5.0⭐',
                      gradient: theme === 'bright' ? 'from-yellow-500 to-orange-500' : 'from-blue-500 to-purple-500'
                    },
                    { 
                      icon: BookOpen, 
                      label: user?.role === 'teacher' ? 'Students' : 'Courses', 
                      value: user?.role === 'teacher' ? '24' : '8',
                      gradient: theme === 'bright' ? 'from-orange-500 to-red-500' : 'from-purple-500 to-pink-500'
                    },
                    { 
                      icon: Clock, 
                      label: 'Hours', 
                      value: user?.role === 'teacher' ? '150+' : '45+',
                      gradient: theme === 'bright' ? 'from-red-500 to-pink-500' : 'from-cyan-500 to-teal-500'
                    }
                  ].map((stat, index) => (
                    <div 
                      key={stat.label}
                      className={`text-center p-4 rounded-2xl border ${
                        theme === 'bright'
                        ? 'bg-white/60 border-yellow-200/50'
                        : 'bg-gray-700/60 border-gray-600/50'
                      }`}
                    >
                      <div 
                        className={`inline-flex p-3 rounded-xl mb-2 bg-gradient-to-r ${stat.gradient} shadow-lg`}
                      >
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <p 
                        className={`text-xl font-bold ${
                          theme === 'bright' ? 'text-gray-900' : 'text-white'
                        }`}
                      >
                        {stat.value}
                      </p>
                      <p 
                        className={`text-sm ${
                          theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
                        }`}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 lg:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`group inline-flex items-center px-8 py-4 font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl ${
                    theme === 'bright'
                    ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white hover:shadow-2xl hover:shadow-orange-500/25'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/25'
                  }`}
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Edit Profile
                  <Sparkles className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform" />
                </button>
              ) : (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`group inline-flex items-center justify-center px-6 py-3 font-semibold rounded-xl transition-all shadow-lg ${
                      theme === 'bright'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white'
                    }`}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    className={`inline-flex items-center justify-center px-6 py-3 font-semibold rounded-xl transition-all border-2 ${
                      theme === 'bright'
                      ? 'border-gray-300 text-gray-700 bg-white/50 hover:bg-white hover:border-orange-300 hover:text-orange-600'
                      : 'border-gray-600 text-gray-300 bg-gray-800/50 hover:bg-gray-700 hover:border-blue-400 hover:text-blue-400'
                    }`}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div 
          className={`p-8 rounded-3xl border backdrop-blur-sm ${
            theme === 'bright'
            ? 'bg-gradient-to-br from-white/80 via-yellow-50/80 to-orange-50/80 border-yellow-200 shadow-2xl shadow-yellow-500/10'
            : 'bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-blue-900/80 border-gray-700 shadow-2xl shadow-blue-500/10'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <div className="flex items-center mb-6">
                <div 
                  className={`p-3 rounded-xl mr-4 ${
                    theme === 'bright'
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100'
                    : 'bg-gradient-to-r from-blue-900/50 to-purple-900/50'
                  }`}
                >
                  <User 
                    className={`h-6 w-6 ${
                      theme === 'bright' ? 'text-orange-600' : 'text-blue-400'
                    }`} 
                  />
                </div>
                <h3 
                  className={`text-2xl font-bold ${
                    theme === 'bright' ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  Basic Information
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    className={`block text-sm font-semibold mb-3 ${
                      theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isEditing
                      ? theme === 'bright'
                        ? 'border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                        : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      : theme === 'bright'
                        ? 'border-gray-100 bg-gray-50 text-gray-500'
                        : 'border-gray-700 bg-gray-800 text-gray-400'
                    }`}
                  />
                </div>
                  
                <div>
                  <label 
                    className={`block text-sm font-semibold mb-3 ${
                      theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      theme === 'bright'
                      ? 'border-gray-100 bg-gray-50 text-gray-500'
                      : 'border-gray-700 bg-gray-800 text-gray-400'
                    }`}
                  />
                </div>
                  
                <div>
                  <label 
                    className={`block text-sm font-semibold mb-3 ${
                      theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      isEditing
                      ? theme === 'bright'
                        ? 'border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                        : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      : theme === 'bright'
                        ? 'border-gray-100 bg-gray-50 text-gray-500'
                        : 'border-gray-700 bg-gray-800 text-gray-400'
                    }`}
                  />
                </div>
                  
                <div className="md:col-span-2">
                  <label 
                    className={`block text-sm font-semibold mb-3 ${
                      theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all resize-none ${
                      isEditing
                      ? theme === 'bright'
                        ? 'border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                        : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      : theme === 'bright'
                        ? 'border-gray-100 bg-gray-50 text-gray-500'
                        : 'border-gray-700 bg-gray-800 text-gray-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Role-specific Information */}
            {user?.role === 'teacher' ? (
              <div>
                <div className="flex items-center mb-6">
                  <div 
                    className={`p-3 rounded-xl mr-4 ${
                      theme === 'bright'
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100'
                      : 'bg-gradient-to-r from-blue-900/50 to-purple-900/50'
                    }`}
                  >
                    <GraduationCap 
                      className={`h-6 w-6 ${
                        theme === 'bright' ? 'text-orange-600' : 'text-blue-400'
                      }`} 
                    />
                  </div>
                  <h3 
                    className={`text-2xl font-bold ${
                      theme === 'bright' ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    Teaching Information
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label 
                      className={`block text-sm font-semibold mb-3 ${
                        theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                      }`}
                    >
                      Hourly Rate ($)
                    </label>
                    <div className="relative">
                      <DollarSign 
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                          theme === 'bright' ? 'text-gray-400' : 'text-gray-500'
                        }`} 
                      />
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="50"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                          isEditing
                          ? theme === 'bright'
                            ? 'border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                            : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : theme === 'bright'
                            ? 'border-gray-100 bg-gray-50 text-gray-500'
                            : 'border-gray-700 bg-gray-800 text-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label 
                      className={`block text-sm font-semibold mb-3 ${
                        theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                      }`}
                    >
                      Experience (years)
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="5"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        isEditing
                        ? theme === 'bright'
                          ? 'border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                          : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : theme === 'bright'
                          ? 'border-gray-100 bg-gray-50 text-gray-500'
                          : 'border-gray-700 bg-gray-800 text-gray-400'
                      }`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label 
                      className={`block text-sm font-semibold mb-3 ${
                        theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                      }`}
                    >
                      Education
                    </label>
                    <textarea
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Your educational background..."
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all resize-none ${
                        isEditing
                        ? theme === 'bright'
                          ? 'border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                          : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : theme === 'bright'
                          ? 'border-gray-100 bg-gray-50 text-gray-500'
                          : 'border-gray-700 bg-gray-800 text-gray-400'
                      }`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label 
                      className={`block text-sm font-semibold mb-3 ${
                        theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                      }`}
                    >
                      Teaching Subjects
                    </label>
                    
                    {/* Current Specializations */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.specializations.map((spec, index) => (
                          <div
                            key={index}
                            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                              theme === 'bright'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-blue-900/50 text-blue-300'
                            }`}
                          >
                            {spec}
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSpecialization(spec)}
                                className={`ml-2 hover:text-red-600 ${
                                  theme === 'bright' ? 'text-blue-600' : 'text-blue-300'
                                }`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {formData.specializations.length === 0 && (
                          <p className={`text-sm italic ${
                            theme === 'bright' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            No subjects added yet. Add subjects you can teach.
                          </p>
                        )}
                      </div>
                      
                      {/* Add New Specialization */}
                      {isEditing && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSpecialization}
                            onChange={(e) => setNewSpecialization(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                            placeholder="Add a subject (e.g., Mathematics, Physics, English)"
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                              theme === 'bright'
                                ? 'border-gray-200 bg-white text-gray-900 focus:border-orange-500'
                                : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleAddSpecialization}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              theme === 'bright'
                                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label 
                      className={`block text-sm font-semibold mb-3 ${
                        theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                      }`}
                    >
                      Availability
                    </label>
                    <input
                      type="text"
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Monday-Friday, 9am-5pm"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        isEditing
                        ? theme === 'bright'
                          ? 'border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                          : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : theme === 'bright'
                          ? 'border-gray-100 bg-gray-50 text-gray-500'
                          : 'border-gray-700 bg-gray-800 text-gray-400'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-6">
                  <div 
                    className={`p-3 rounded-xl mr-4 ${
                      theme === 'bright'
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100'
                      : 'bg-gradient-to-r from-blue-900/50 to-purple-900/50'
                    }`}
                  >
                    <BookOpen 
                      className={`h-6 w-6 ${
                        theme === 'bright' ? 'text-orange-600' : 'text-blue-400'
                      }`} 
                    />
                  </div>
                  <h3 
                    className={`text-2xl font-bold ${
                      theme === 'bright' ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    Learning Information
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label 
                      className={`block text-sm font-semibold mb-3 ${
                        theme === 'bright' ? 'text-gray-700' : 'text-gray-300'
                      }`}
                    >
                      Grade Level
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        isEditing
                        ? theme === 'bright'
                          ? 'border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                          : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : theme === 'bright'
                          ? 'border-gray-100 bg-gray-50 text-gray-500'
                          : 'border-gray-700 bg-gray-800 text-gray-400'
                      }`}
                    >
                      <option value="">Select Grade</option>
                      <option value="elementary">Elementary (K-5)</option>
                      <option value="middle">Middle School (6-8)</option>
                      <option value="high">High School (9-12)</option>
                      <option value="college">College</option>
                      <option value="adult">Adult Learning</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;