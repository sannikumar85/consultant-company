import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        error: null
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await authAPI.getCurrentUser();
            dispatch({ type: 'SET_USER', payload: response.data.user });
          } catch (error) {
            // If API call fails but token exists, don't automatically remove token
            // This prevents logout on temporary network issues
            console.warn('Failed to validate token on refresh:', error);
            
            // Only remove token if it's actually invalid (401 error)
            if (error.response?.status === 401) {
              localStorage.removeItem('token');
            }
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      console.log('Attempting login with:', { email });
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);
      
      // Store token
      localStorage.setItem('token', response.data.token);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: response.data.user 
      });

      // Show success message
      toast.success(`Welcome back, ${response.data.user.name}!`);
      
      return { 
        success: true, 
        user: response.data.user,
        needsProfileCompletion: !response.data.user.isProfileComplete
      };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage 
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'REGISTER_START' });
      
      console.log('Attempting registration with:', userData);
      const response = await authAPI.register(userData);
      console.log('Registration response:', response.data);
      
      // Store token
      localStorage.setItem('token', response.data.token);
      
      dispatch({ 
        type: 'REGISTER_SUCCESS', 
        payload: response.data.user 
      });

      // Show success message
      toast.success(`Welcome, ${response.data.user.name}! Please complete your profile.`);
      
      return { 
        success: true, 
        user: response.data.user,
        needsProfileCompletion: true
      };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: errorMessage 
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    dispatch({ 
      type: 'SET_USER', 
      payload: userData 
    });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      dispatch({ 
        type: 'SET_USER', 
        payload: response.data.user 
      });
      toast.success('Profile updated successfully!');
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    clearError,
    isAuthenticated: !!state.user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
