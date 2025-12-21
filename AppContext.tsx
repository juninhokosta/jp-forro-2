
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Transaction, ServiceOrder, Quote, AppContextType, OSStatus } from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users: User[] = [
    { id: '1', name: 'João Paulo', email: 'joao@jpforro.com', avatar: 'https://picsum.photos/seed/joao/100/100' },
    { id: '2', name: 'Sócio Parceiro', email: 'socio@jpforro.com', avatar: 'https://picsum.photos/seed/socio/100/100' }
  ];

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
    localStorage.setItem('jp_user', JSON.stringify(currentUser));
    localStorage.setItem('jp_transactions', JSON.stringify(transactions));
    localStorage.setItem('jp_os', JSON.stringify(serviceOrders));
    localStorage.setItem('jp_quotes', JSON.stringify(quotes));
  }, [currentUser, transactions, serviceOrders, quotes]);

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

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

  // Fix: Generate createdAt internally and update the type to match AppContextType
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