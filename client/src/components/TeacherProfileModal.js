import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  MessageCircle, 
  Video,
  Mail,
  Phone
} from 'lucide-react';

const TeacherProfileModal = ({ teacher, isOpen, onClose, onStartChat, onStartVideoCall }) => {
  if (!teacher) return null;

  const handleStartChat = () => {
    onStartChat(teacher._id);
    onClose();
  };

  const handleStartVideoCall = () => {
    onStartVideoCall(teacher._id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {teacher.name?.charAt(0).toUpperCase() || 'T'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{teacher.name}</h2>
                  <p className="text-blue-100 capitalize">{teacher.role}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-300 fill-current" />
                    <span className="text-sm">4.8 (127 reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{teacher.email}</span>
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}
                  {teacher.location && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{teacher.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Specializations */}
              {teacher.specializations && teacher.specializations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {teacher.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600">{teacher.bio}</p>
                </div>
              )}

              {/* Experience */}
              {teacher.experience && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience</h3>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>{teacher.experience} years of teaching experience</span>
                  </div>
                </div>
              )}

              {/* Availability */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Available Mon-Fri, 9 AM - 6 PM</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">127</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">4.8</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleStartChat}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Start Chat</span>
                </button>
                <button
                  onClick={handleStartVideoCall}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TeacherProfileModal;
