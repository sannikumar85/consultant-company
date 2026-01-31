import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import FindTutorsPage from './pages/FindTutorsPage';
import TutorDetailPage from './pages/TutorDetailPage';
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import VideoCallPage from './pages/VideoCallPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
            <div className="min-h-screen relative overflow-hidden font-['Poppins',_system-ui,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_sans-serif]">
              {/* Enhanced Animated Background */}
              <div className="fixed inset-0 -z-10">
                {/* Primary gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-indigo-900/30" />
                
                {/* Animated gradient orbs */}
                <motion.div
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
                />
                
                <motion.div
                  animate={{
                    x: [0, -150, 0],
                    y: [0, 100, 0],
                    scale: [1, 0.9, 1],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute top-32 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl"
                />
                
                <motion.div
                  animate={{
                    x: [0, 120, 0],
                    y: [0, -80, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                  }}
                  className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-500/10 to-rose-500/10 rounded-full blur-3xl"
                />
                
                <motion.div
                  animate={{
                    x: [0, -80, 0],
                    y: [0, 120, 0],
                    scale: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 8
                  }}
                  className="absolute bottom-32 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500/12 to-teal-500/12 rounded-full blur-3xl"
                />
                
                {/* Subtle grain texture overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E')] opacity-30" />
                
                {/* Animated mesh gradient overlay */}
                <motion.div
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.05) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.05) 0%, transparent 50%)',
                      'radial-gradient(circle at 40% 80%, rgba(119, 255, 198, 0.05) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.05) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0"
                />
              </div>

              <Navbar />
              <main className="pt-16 relative z-10">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/find-tutors" element={
                    <ProtectedRoute roles={['student']}>
                      <FindTutorsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/tutor/:id" element={
                    <ProtectedRoute>
                      <TutorDetailPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <ChatListPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/chat/:teacherId" element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/video-call/:chatId" element={
                    <ProtectedRoute>
                      <VideoCallPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </main>
              
              {/* Enhanced Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    fontFamily: "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontWeight: '500',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                    style: {
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                    style: {
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
