
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Transaction, ServiceOrder, Quote, AppContextType, OSStatus, CatalogItem, Customer } from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Nota: Estes dados estão prontos para serem persistidos em um banco como Vercel Postgres ou KV.
  // Por enquanto, utilizamos o localStorage como o "Banco de Dados Local".
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('jp_authorized_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('jp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('jp_customers');
    return saved ? JSON.parse(saved) : [];
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

  const [catalog, setCatalog] = useState<CatalogItem[]>(() => {
    const saved = localStorage.getItem('jp_catalog');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Mão de Obra Forro PVC', price: 25, type: 'SERVICE' },
      { id: '2', name: 'Mão de Obra Drywall', price: 35, type: 'SERVICE' },
      { id: '3', name: 'Perfil Canaleta', price: 15.50, type: 'PRODUCT' },
      { id: '4', name: 'Placa de Gesso', price: 45, type: 'PRODUCT' }
    ];
  });

  // Este hook simula o salvamento no banco de dados. 
  // Em uma versão com backend real, aqui dispararíamos chamadas assíncronas para a API da Vercel.
  useEffect(() => {
    localStorage.setItem('jp_authorized_users', JSON.stringify(users));
    localStorage.setItem('jp_user', JSON.stringify(currentUser));
    localStorage.setItem('jp_customers', JSON.stringify(customers));
    localStorage.setItem('jp_transactions', JSON.stringify(transactions));
    localStorage.setItem('jp_os', JSON.stringify(serviceOrders));
    localStorage.setItem('jp_quotes', JSON.stringify(quotes));
    localStorage.setItem('jp_catalog', JSON.stringify(catalog));
    
    // Log para fins de auditoria (simulando salvamento em cloud)
    console.log("Database jp_forro sincronizado com sucesso.");
  }, [users, currentUser, customers, transactions, serviceOrders, quotes, catalog]);

  const login = (emailOrId: string, name?: string) => {
    const email = emailOrId.toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === email || u.id === emailOrId);
    if (!user) {
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
        throw new Error("Limite de 2 usuários atingido.");
      }
    } else {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('jp_user');
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
      currentUser, users, login, logout, customers, addCustomer,
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
