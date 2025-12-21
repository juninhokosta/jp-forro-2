
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Transaction, ServiceOrder, Quote, AppContextType, OSStatus } from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para armazenar os 2 usuários permitidos na sociedade
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('jp_authorized_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('jp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('jp_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('jp_os');
    return saved ? JSON.parse(saved) : [];
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('jp_quotes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('jp_authorized_users', JSON.stringify(users));
    localStorage.setItem('jp_user', JSON.stringify(currentUser));
    localStorage.setItem('jp_transactions', JSON.stringify(transactions));
    localStorage.setItem('jp_os', JSON.stringify(serviceOrders));
    localStorage.setItem('jp_quotes', JSON.stringify(quotes));
  }, [users, currentUser, transactions, serviceOrders, quotes]);

  const login = (emailOrId: string, name?: string) => {
    const email = emailOrId.toLowerCase();
    
    // Verifica se o usuário já existe
    let user = users.find(u => u.email.toLowerCase() === email || u.id === emailOrId);
    
    if (!user) {
      // Se não existe, tenta criar se houver vaga (máximo 2)
      if (users.length < 2) {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: email,
          name: name || email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
      } else {
        throw new Error("Limite de 2 usuários atingido para esta sociedade.");
      }
    } else {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('jp_user');
  };

  const addTransaction = (t: Omit<Transaction, 'id' | 'userId' | 'userName'>) => {
    if (!currentUser) return;
    const newTransaction: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const addOS = (os: Omit<ServiceOrder, 'id' | 'transactions' | 'progress' | 'createdAt'>) => {
    const newOS: ServiceOrder = {
      ...os,
      id: `OS-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      transactions: [],
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    setServiceOrders(prev => [newOS, ...prev]);
  };

  const updateOSStatus = (id: string, status: OSStatus) => {
    setServiceOrders(prev => prev.map(os => {
        if (os.id === id) {
            let progress = 0;
            if (status === OSStatus.QUOTED) progress = 10;
            if (status === OSStatus.APPROVED) progress = 30;
            if (status === OSStatus.IN_PROGRESS) progress = 60;
            if (status === OSStatus.FINISHED) progress = 90;
            if (status === OSStatus.PAID) progress = 100;
            return { ...os, status, progress };
        }
        return os;
    }));
  };

  const addQuote = (q: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
    const newQuote: Quote = {
      ...q,
      id: `ORC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    setQuotes(prev => [newQuote, ...prev]);
  };

  const updateQuoteStatus = (id: string, status: Quote['status']) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, login, logout, 
      transactions, addTransaction, 
      serviceOrders, addOS, updateOSStatus,
      quotes, addQuote, updateQuoteStatus 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
