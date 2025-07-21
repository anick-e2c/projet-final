export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface AuthFormData {
  email: string;
  password: string;
  username?: string;
  confirmPassword?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: AuthFormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}