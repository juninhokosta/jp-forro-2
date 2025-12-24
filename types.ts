
export type TransactionType = 'INCOME' | 'EXPENSE';

export enum OSStatus {
  QUOTED = 'Orçado',
  APPROVED = 'Aprovado',
  IN_PROGRESS = 'Em Execução',
  FINISHED = 'Concluído',
  PAID = 'Pago'
}

export type CatalogType = 'PRODUCT' | 'SERVICE';

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  type: CatalogType;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  password?: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  address: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  userId: string;
  userName: string;
  date: string;
  osId?: string;
  notes?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Quote {
  id: string;
  customerId?: string;
  customerName: string;
  customerContact: string;
  items: ProductItem[];
  total: number;
  observations?: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ServiceOrder {
  id: string;
  quoteId?: string;
  customerId?: string;
  customerName: string;
  customerContact?: string;
  customerAddress?: string;
  description: string;
  additionalInfo?: string;
  status: OSStatus;
  progress: number;
  createdAt: string;
  expectedDate?: string;
  totalValue: number;
}

export interface AppContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => void;
  logout: () => void;
  changePassword: (newPassword: string) => void;
  customers: Customer[];
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => string;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'userId' | 'userName'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  serviceOrders: ServiceOrder[];
  addOS: (os: Omit<ServiceOrder, 'id' | 'progress' | 'createdAt'>) => void;
  updateOS: (id: string, os: Partial<ServiceOrder>) => void;
  deleteOS: (id: string) => void;
  updateOSStatus: (id: string, status: OSStatus) => void;
  createOSFromQuote: (quote: Quote) => void;
  quotes: Quote[];
  addQuote: (q: Omit<Quote, 'id' | 'createdAt' | 'status'>) => void;
  deleteQuote: (id: string) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
  catalog: CatalogItem[];
  addCatalogItem: (item: Omit<CatalogItem, 'id'>) => void;
  updateCatalogItem: (id: string, item: Partial<CatalogItem>) => void;
  removeCatalogItem: (id: string) => void;
}
