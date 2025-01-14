import React, { createContext, useContext, useState, useEffect } from 'react';
import api  from '../services/api';
import { User } from '../types/user';

interface UsersContextData {
  users: User[];
  loading: boolean;
  error: string | null;
}

const UsersContext = createContext<UsersContextData>({
  users: [],
  loading: false,
  error: null
});

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users');
        setUsers(response.data.users);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <UsersContext.Provider value={{ users, loading, error }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
} 