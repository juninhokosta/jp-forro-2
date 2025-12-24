
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Transaction, ServiceOrder, Quote, AppContextType, OSStatus, CatalogItem, Customer, CompanySettings } from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

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
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => db.load('company_settings', {
    name: 'JP FORRO',
    slogan: 'Excelência em Forros e Revestimentos',
    phone: '(00) 00000-0000',
    address: 'Endereço da sua empresa aqui'
  }));

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
  useEffect(() => { db.save('company_settings', companySettings); }, [companySettings]);

  const login = (emailInput: string, passwordInput: string) => {
    const email = emailInput.toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === email);
    if (!user) {
      if (users.length < 2) {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: email,
          name: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          password: '123456'
        };
        if (passwordInput === '123456') {
          setUsers(prev => [...prev, newUser]);
          setCurrentUser(newUser);
        } else throw new Error("Senha incorreta.");
      } else throw new Error("Limite de usuários atingido.");
    } else {
      if (user.password === passwordInput) setCurrentUser(user);
      else throw new Error("Senha incorreta.");
    }
  };

  const logout = () => setCurrentUser(null);

  const changePassword = (newPassword: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u);
    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, password: newPassword });
    alert("Senha alterada!");
  };

  const addCustomer = (c: Omit<Customer, 'id' | 'createdAt'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    setCustomers(prev => [...prev, { ...c, id, createdAt: new Date().toISOString() }]);
    return id;
  };

  const addTransaction = (t: Omit<Transaction, 'id' | 'userId' | 'userName'>) => {
    if (!currentUser) return;
    setTransactions(prev => [{ ...t, id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, userName: currentUser.name }, ...prev]);
  };

  const updateTransaction = (id: string, t: Partial<Transaction>) => {
    setTransactions(prev => prev.map(item => item.id === id ? { ...item, ...t } : item));
  };

  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(item => item.id !== id));

  const addOS = (os: Omit<ServiceOrder, 'id' | 'progress' | 'createdAt'>) => {
    setServiceOrders(prev => [{ ...os, id: `OS-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, progress: 0, createdAt: new Date().toISOString() }, ...prev]);
  };

  const updateOS = (id: string, updates: Partial<ServiceOrder>) => {
    setServiceOrders(prev => prev.map(os => os.id === id ? { ...os, ...updates } : os));
  };

  const deleteOS = (id: string) => {
    setServiceOrders(prev => prev.filter(os => os.id !== id));
  };

  const updateOSStatus = (id: string, status: OSStatus) => {
    setServiceOrders(prev => prev.map(os => {
      if (os.id === id) {
        let progress = 0;
        if (status === OSStatus.QUOTED) progress = 10;
        else if (status === OSStatus.APPROVED) progress = 30;
        else if (status === OSStatus.IN_PROGRESS) progress = 60;
        else if (status === OSStatus.FINISHED || status === OSStatus.PAID) progress = 100;
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
      description: quote.items.map(i => `${i.quantity}x ${i.name}`).join(', ') + (quote.observations ? ` | Obs: ${quote.observations}` : ''),
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
    setQuotes(prev => [{ ...q, id: `ORC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, createdAt: new Date().toISOString(), status: 'PENDING' }, ...prev]);
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const updateQuoteStatus = (id: string, status: Quote['status']) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  const addCatalogItem = (item: Omit<CatalogItem, 'id'>) => {
    setCatalog(prev => [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const updateCatalogItem = (id: string, item: Partial<CatalogItem>) => {
    setCatalog(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
  };

  const removeCatalogItem = (id: string) => setCatalog(prev => prev.filter(i => i.id !== id));

  const updateCompanySettings = (settings: CompanySettings) => {
    setCompanySettings(settings);
    alert("Dados da empresa atualizados!");
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, login, logout, changePassword, customers, addCustomer,
      transactions, addTransaction, updateTransaction, deleteTransaction,
      serviceOrders, addOS, updateOS, deleteOS, updateOSStatus, createOSFromQuote,
      quotes, addQuote, deleteQuote, updateQuoteStatus,
      catalog, addCatalogItem, updateCatalogItem, removeCatalogItem,
      companySettings, updateCompanySettings
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
