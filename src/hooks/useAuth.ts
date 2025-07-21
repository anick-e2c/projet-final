import { useState, useCallback, useEffect } from 'react';
import { AuthFormData, User } from '../types/auth';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    console.log('Vérification de la session existante...', token, savedUser);
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        socketService.connect(token);
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      
      // Connect to socket
      socketService.connect(token);
      
    } catch (err: any) {
      let errorMessage: string;
      
      if (!err.response) {
        // Network error or server not reachable
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.';
      } else {
        // Server responded with an error
        errorMessage = err.response.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register({
        username: userData.username!,
        email: userData.email,
        password: userData.password
      });
      console.log('Inscription réussie:', response.data);
      
      const { token, user: newUser } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setUser(newUser);
      
      // Connect to socket
      socketService.connect(token);
      
    } catch (err: any) {
      let errorMessage: string;
      
      if (!err.response) {
        // Network error or server not reachable
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.';
      } else {
        // Server responded with an error
        errorMessage = err.response.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Disconnect socket
      socketService.disconnect();
      
      // Update state
      setUser(null);
      setError(null);
    }
  }, []);

  return {
    user,
    login,
    register,
    logout,
    isLoading,
    error
  };
};