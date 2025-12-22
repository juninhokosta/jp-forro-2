
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Transaction, ServiceOrder, Quote, AppContextType, OSStatus, CatalogItem, Customer } from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper para simular chamadas de banco de dados (Vercel Ready)
const db = {
  save: (key: string, data: any) => {
    localStorage.setItem(`jp_db_${key}`, JSON.stringify(data));
  },
  load: (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(`jp_db_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => db.load('users', []));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('jp_user_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [customers, setCustomers] = useState<Customer[]>(() => db.load('customers', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => db.load('transactions', []));
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => db.load('os', []));
  const [quotes, setQuotes] = useState<Quote[]>(() => db.load('quotes', []));
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => db.load('catalog', [
    { id: '1', name: 'Mão de Obra Forro PVC', price: 25, type: 'SERVICE' },
    { id: '2', name: 'Mão de Obra Drywall', price: 35, type: 'SERVICE' },
    { id: '3', name: 'Perfil Canaleta', price: 15.50, type: 'PRODUCT' },
    { id: '4', name: 'Placa de Gesso', price: 45, type: 'PRODUCT' }
  ]));

  useEffect(() => { db.save('users', users); }, [users]);
  useEffect(() => { 
    if (currentUser) {
      localStorage.setItem('jp_user_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('jp_user_session');
    }
  }, [currentUser]);
  useEffect(() => { db.save('customers', customers); }, [customers]);
  useEffect(() => { db.save('transactions', transactions); }, [transactions]);
  useEffect(() => { db.save('os', serviceOrders); }, [serviceOrders]);
  useEffect(() => { db.save('quotes', quotes); }, [quotes]);
  useEffect(() => { db.save('catalog', catalog); }, [catalog]);

  const login = (emailInput: string, passwordInput: string) => {
    const email = emailInput.toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === email);
    
    if (!user) {
      if (users.length < 2) {
        // Criação automática do primeiro acesso com senha padrão
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: email,
          name: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          password: '123456' // Senha inicial padrão
        };
        
        if (passwordInput === '123456') {
          setUsers(prev => [...prev, newUser]);
          setCurrentUser(newUser);
        } else {
          throw new Error("Senha incorreta para novo cadastro.");
        }
      } else {
        throw new Error("Usuário não encontrado ou limite de sociedade atingido.");
      }
    } else {
      if (user.password === passwordInput) {
        setCurrentUser(user);
      } else {
        throw new Error("Senha incorreta.");
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const changePassword = (newPassword: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? { ...u, password: newPassword } : u
    );
    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, password: newPassword });
    alert("Senha alterada com sucesso!");
  };

  const addCustomer = (c: Omit<Customer, 'id' | 'createdAt'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newCustomer: Customer = { ...c, id, createdAt: new Date().toISOString() };
    setCustomers(prev => [...prev, newCustomer]);
    return id;
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

  const updateTransaction = (id: string, t: Partial<Transaction>) => {
    setTransactions(prev => prev.map(item => item.id === id ? { ...item, ...t } : item));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
  };

  const addOS = (os: Omit<ServiceOrder, 'id' | 'progress' | 'createdAt'>) => {
    const newOS: ServiceOrder = {
      ...os,
      id: `OS-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    setServiceOrders(prev => [newOS, ...prev]);
  };

  const updateOS = (id: string, updates: Partial<ServiceOrder>) => {
    setServiceOrders(prev => prev.map(os => os.id === id ? { ...os, ...updates } : os));
  };

  const updateOSStatus = (id: string, status: OSStatus) => {
    setServiceOrders(prev => prev.map(os => {
        if (os.id === id) {
            let progress = os.progress;
            if (status === OSStatus.QUOTED) progress = 10;
            if (status === OSStatus.APPROVED) progress = 30;
            if (status === OSStatus.IN_PROGRESS) progress = 60;
            if (status === OSStatus.FINISHED) progress = 100;
            if (status === OSStatus.PAID) progress = 100;
            return { ...os, status, progress };
        }
        return os;
    }));
  };

  const createOSFromQuote = (quote: Quote) => {
    const customer = customers.find(c => c.id === quote.customerId);
    const newOS: ServiceOrder = {
      id: `OS-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      quoteId: quote.id,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerContact: quote.customerContact,
      customerAddress: customer?.address || '',
      description: `Ref Orçamento ${quote.id}. Itens: ` + quote.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
      status: OSStatus.APPROVED,
      progress: 30,
      createdAt: new Date().toISOString(),
      expectedDate: new Date().toISOString().split('T')[0],
      totalValue: quote.total
    };
    setServiceOrders(prev => [newOS, ...prev]);
    updateQuoteStatus(quote.id, 'APPROVED');
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

  const addCatalogItem = (item: Omit<CatalogItem, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    setCatalog(prev => [...prev, newItem]);
  };

  const removeCatalogItem = (id: string) => {
    setCatalog(prev => prev.filter(item => item.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, login, logout, changePassword, customers, addCustomer,
      transactions, addTransaction, updateTransaction, deleteTransaction,
      serviceOrders, addOS, updateOS, updateOSStatus, createOSFromQuote,
      quotes, addQuote, updateQuoteStatus,
      catalog, addCatalogItem, removeCatalogItem
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp error');
  return context;
};
