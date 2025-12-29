
import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Transaction, ServiceOrder, Quote, AppContextType, OSStatus, CatalogItem, Customer } from './types';

// Credenciais do projeto Supabase fornecidas
const SUPABASE_URL = 'https://kerwyrvstnziyusstgkg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_17HEmrQdsefxmirq89rMhw_ftCdJjOU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const AppContext = createContext<AppContextType | undefined>(undefined);

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

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);

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
      console.error('Erro de sincronização Supabase:', e);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  useEffect(() => {
    // Escuta mudanças de autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const userEmail = session.user.email?.toLowerCase();
        const allowedUser = users.find(u => u.email.toLowerCase() === userEmail);
        
        if (allowedUser) {
          const userSession = { 
            ...allowedUser, 
            id: session.user.id, 
            avatar: session.user.user_metadata.avatar_url || allowedUser.avatar 
          };
          setCurrentUser(userSession);
          localStorage.setItem('jp_user_session', JSON.stringify(userSession));
        } else {
          supabase.auth.signOut();
          alert('Acesso negado. Apenas Ivo e Pedro podem acessar este sistema.');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [users]);

  useEffect(() => {
    if (!currentUser) return;
    fetchAllData();

    // Canal de Realtime para sincronização simultânea
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const login = async (emailInput: string, passwordInput: string) => {
    // Simulação ou login via Supabase Auth
    const user = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
    if (!user) throw new Error("Usuário não cadastrado.");
    if (user.password === passwordInput) {
      setCurrentUser(user);
      localStorage.setItem('jp_user_session', JSON.stringify(user));
    } else throw new Error("Senha incorreta.");
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('jp_user_session');
  };

  const saveToCloud = async (table: string, payload: any) => {
    try {
      const { error } = await supabase.from(table).upsert(payload);
      if (error) throw error;
    } catch (e) {
      console.error(`Erro ao salvar em ${table}:`, e);
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

  const updateTransaction = async (id: string, t: Partial<Transaction>) => {
    setTransactions(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...t } : item);
      const itemToSave = updated.find(i => i.id === id);
      if (itemToSave) saveToCloud('transactions', itemToSave);
      return updated;
    });
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
    await supabase.from('transactions').delete().eq('id', id);
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
    const newQuote = { 
      ...q, 
      id: `ORC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, 
      createdAt: new Date().toISOString(), 
      status: 'PENDING' as const 
    };
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
      currentUser, users, login, loginWithGoogle, logout, isCloudSyncing,
      customers, addCustomer,
      transactions, addTransaction, updateTransaction, deleteTransaction,
      serviceOrders, addOS, updateOS, deleteOS, archiveOS, updateOSStatus, createOSFromQuote,
      quotes, addQuote, deleteQuote, updateQuoteStatus,
      catalog, addCatalogItem, updateCatalogItem, removeCatalogItem,
    } as any}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider');
  return context;
};
