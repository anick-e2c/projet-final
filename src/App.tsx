//import React from 'react';
import AuthLayout from './components/AuthLayout';
import AuthForm from './components/AuthForm';
import ChatLayout from './components/ChatLayout';
import { useAuth } from './hooks/useAuth';
import { AuthFormData } from './types/auth';

function App() {
  const { user, login, register, logout, isLoading, error } = useAuth();

  const handleAuthSubmit = async (data: AuthFormData) => {
    if (data.username) {
      // Mode inscription
      await register(data);
    } else {
      // Mode connexion
      await login(data.email, data.password);
    }
  };

  if (user) {
    return (
      <ChatLayout
        user={user}
        onLogout={logout}
      />
    );
  }

  return (
    <AuthLayout>
      <AuthForm
        onSubmit={handleAuthSubmit}
        isLoading={isLoading}
        error={error}
      />
    </AuthLayout>
  );
}

export default App;