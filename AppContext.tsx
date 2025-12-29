
import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Transaction, ServiceOrder, Quote, AppContextType, OSStatus, CatalogItem, Customer } from './types';

// IMPORTANTE: Para sincronização simultânea, crie uma conta gratuita no Supabase e cole os dados aqui.
const SUPABASE_URL = 'https://SUA_URL_AQUI.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_KEY_AQUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const AppContext = createContext<AppContextType | undefined>(undefined);
const DB_PREFIX = 'jp_db_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('jp_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [users] = useState<User[]>([
    { id: 'socio-1', name: 'Ivo junior', email: 'ivo@jpforro.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivo', password: '123456' },
    { id: 'socio-2', name: 'Pedro Augusto', email: 'pedro@jpforro.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro', password: '123456' }
  ]);

  const [customers, setCustomers] = useState<Customer[]>(() => JSON.parse(localStorage.getItem(`${DB_PREFIX}customers`) || '[]'));
  const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(localStorage.getItem(`${DB_PREFIX}transactions`) || '[]'));
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => JSON.parse(localStorage.getItem(`${DB_PREFIX}os`) || '[]'));
  const [quotes, setQuotes] = useState<Quote[]>(() => JSON.parse(localStorage.getItem(`${DB_PREFIX}quotes`) || '[]'));
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => JSON.parse(localStorage.getItem(`${DB_PREFIX}catalog`) || '[]'));

  // Função central de busca
  const fetchAllData = async () => {
    if (!currentUser) return;
    setIsCloudSyncing(true);
    try {
      const [
        { data: os }, { data: tr }, { data: cu }, { data: qu }, { data: ca }
      ] = await Promise.all([
        supabase.from('service_orders').select('*').order('createdAt', { ascending: false }),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('customers').select('*'),
        supabase.from('quotes').select('*').order('createdAt', { ascending: false }),
        supabase.from('catalog').select('*')
      ]);

      if (os) setServiceOrders(os);
      if (tr) setTransactions(tr);
      if (cu) setCustomers(cu);
      if (qu) setQuotes(qu);
      if (ca) setCatalog(ca);
    } catch (e) {
      console.warn('Erro na nuvem. Verifique suas chaves Supabase:', e);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Efeito de escuta simultânea (REALTIME)
  useEffect(() => {
    if (!currentUser) return;

    fetchAllData();

    // Inscrição em tempo real para todas as tabelas
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchAllData(); // Recarrega tudo instantaneamente ao detectar mudança externa
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Backup Local (Redundância caso fique sem internet)
  useEffect(() => { localStorage.setItem(`${DB_PREFIX}customers`, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(`${DB_PREFIX}transactions`, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(`${DB_PREFIX}os`, JSON.stringify(serviceOrders)); }, [serviceOrders]);
  useEffect(() => { localStorage.setItem(`${DB_PREFIX}quotes`, JSON.stringify(quotes)); }, [quotes]);
  useEffect(() => { localStorage.setItem(`${DB_PREFIX}catalog`, JSON.stringify(catalog)); }, [catalog]);

  const login = (emailInput: string, passwordInput: string) => {
    const user = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
    if (!user) throw new Error("Usuário não cadastrado.");
    if (user.password === passwordInput) {
      setCurrentUser(user);
      localStorage.setItem('jp_user_session', JSON.stringify(user));
    } else throw new Error("Senha incorreta.");
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('jp_user_session');
  };

  const saveToCloud = async (table: string, payload: any) => {
    try {
      await supabase.from(table).upsert(payload);
    } catch (e) {
      console.error('Falha ao salvar nuvem:', e);
    }
  };

  const addCustomer = (c: Omit<Customer, 'id' | 'createdAt'>): string => {
    const id = `CUST-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const newCust = { ...c, id, createdAt: new Date().toISOString() };
    setCustomers(prev => [...prev, newCust]);
    saveToCloud('customers', newCust);
    return id;
  };

  const addTransaction = (t: Omit<Transaction, 'id' | 'userId' | 'userName'>) => {
    if (!currentUser) return;
    const newTrans = { 
      ...t, 
      id: `TR-${Math.random().toString(36).substr(2, 7).toUpperCase()}`, 
      userId: currentUser.id, 
      userName: currentUser.name 
    };
    setTransactions(prev => [newTrans, ...prev]);
    saveToCloud('transactions', newTrans);
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
    await supabase.from('transactions').delete().eq('id', id);
  };

  const updateTransaction = async (id: string, t: Partial<Transaction>) => {
    setTransactions(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...t } : item);
      const itemToSave = updated.find(i => i.id === id);
      if (itemToSave) saveToCloud('transactions', itemToSave);
      return updated;
    });
  };

  const addOS = (os: Omit<ServiceOrder, 'id' | 'progress' | 'createdAt'>) => {
    const newOS = { 
      ...os, 
      id: `OS-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, 
      progress: 0, 
      createdAt: new Date().toISOString(),
      archived: false 
    };
    setServiceOrders(prev => [newOS, ...prev]);
    saveToCloud('service_orders', newOS);
  };

  const updateOS = (id: string, updates: Partial<ServiceOrder>) => {
    setServiceOrders(prev => {
      const updated = prev.map(os => os.id === id ? { ...os, ...updates } : os);
      const osToSave = updated.find(i => i.id === id);
      if (osToSave) saveToCloud('service_orders', osToSave);
      return updated;
    });
  };

  const archiveOS = (id: string, archived: boolean) => {
    setServiceOrders(prev => {
      const updated = prev.map(os => os.id === id ? { ...os, archived } : os);
      const osToSave = updated.find(i => i.id === id);
      if (osToSave) saveToCloud('service_orders', osToSave);
      return updated;
    });
  };

  const deleteOS = async (id: string) => {
    setServiceOrders(prev => prev.filter(os => os.id !== id));
    await supabase.from('service_orders').delete().eq('id', id);
  };

  const updateOSStatus = (id: string, status: OSStatus) => {
    setServiceOrders(prev => {
      const updated = prev.map(os => {
        if (os.id === id) {
          let progress = os.progress;
          if (status === OSStatus.QUOTED) progress = 10;
          else if (status === OSStatus.APPROVED) progress = 30;
          else if (status === OSStatus.IN_PROGRESS) progress = 60;
          else if (status === OSStatus.FINISHED || status === OSStatus.PAID) progress = 100;
          const updatedOS = { ...os, status, progress };
          saveToCloud('service_orders', updatedOS);
          return updatedOS;
        }
        return os;
      });
      return updated;
    });
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
      description: quote.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
      status: OSStatus.APPROVED,
      progress: 30,
      createdAt: new Date().toISOString(),
      expectedDate: new Date().toISOString().split('T')[0],
      totalValue: quote.total,
      archived: false
    };
    setServiceOrders(prev => [newOS, ...prev]);
    saveToCloud('service_orders', newOS);
    updateQuoteStatus(quote.id, 'APPROVED');
  };

  const addQuote = (q: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
    const newQuote = { ...q, id: `ORC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, createdAt: new Date().toISOString(), status: 'PENDING' as const };
    setQuotes(prev => [newQuote, ...prev]);
    saveToCloud('quotes', newQuote);
  };

  const deleteQuote = async (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    await supabase.from('quotes').delete().eq('id', id);
  };

  const updateQuoteStatus = (id: string, status: Quote['status']) => {
    setQuotes(prev => {
      const updated = prev.map(q => {
        if (q.id === id) {
          const updatedQuote = { ...q, status };
          saveToCloud('quotes', updatedQuote);
          return updatedQuote;
        }
        return q;
      });
      return updated;
    });
  };

  const addCatalogItem = (item: Omit<CatalogItem, 'id'>) => {
    const newItem = { ...item, id: `CAT-${Math.random().toString(36).substr(2, 5).toUpperCase()}` };
    setCatalog(prev => [...prev, newItem]);
    saveToCloud('catalog', newItem);
  };

  const updateCatalogItem = (id: string, item: Partial<CatalogItem>) => {
    setCatalog(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, ...item } : i);
      const itemToSave = updated.find(i => i.id === id);
      if (itemToSave) saveToCloud('catalog', itemToSave);
      return updated;
    });
  };

  const removeCatalogItem = async (id: string) => {
    setCatalog(prev => prev.filter(i => i.id !== id));
    await supabase.from('catalog').delete().eq('id', id);
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, login, logout, isCloudSyncing,
      customers, addCustomer,
      transactions, addTransaction, updateTransaction, deleteTransaction,
      serviceOrders, addOS, updateOS, deleteOS, archiveOS, updateOSStatus, createOSFromQuote,
      quotes, addQuote, deleteQuote, updateQuoteStatus,
      catalog, addCatalogItem, updateCatalogItem, removeCatalogItem,
      changePassword: () => {}
    } as any}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp error');
  return context;
};
