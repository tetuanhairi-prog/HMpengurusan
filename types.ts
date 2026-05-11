
export interface LedgerEntry {
  date: string;
  desc: string;
  amt: number;
}

export interface Client {
  id: string;
  name: string;
  detail: string;
  phone?: string;
  address?: string;
  ledger: LedgerEntry[];
}

export interface PjsRecord {
  id: string;
  date: string;
  name: string;
  detail: string;
  amount: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
}

export type PageId = 'guaman' | 'invoice';
export type ThemeMode = 'light' | 'dark';

export interface GeneratedDocument {
  id: string;
  docType: string;
  docNo: string;
  date: string;
  customer: string;
  details: string;
  total: number;
}

export interface AppState {
  clients: Client[];
  pjsRecords: PjsRecord[];
  inventory: ServiceItem[];
  generatedDocs: GeneratedDocument[];
  invCounter: number;
  firmLogo: string | null;
  customHeader: string;
  customFooter: string;
  companyAddress?: string;
  companyContact?: string;
  defaultPrintMode?: 'standard' | 'thermal';
  currentPage: PageId;
  activeClientIdx: number | null;
  theme: ThemeMode;
}
