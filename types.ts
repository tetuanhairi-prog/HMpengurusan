
export interface LedgerEntry {
  date: string;
  desc: string;
  amt: number;
}

export interface Client {
  id: string;
  name: string;
  detail: string;
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

export type PageId = 'guaman' | 'pjs' | 'inventory' | 'invoice';

export interface AppState {
  clients: Client[];
  pjsRecords: PjsRecord[];
  inventory: ServiceItem[];
  invCounter: number;
  firmLogo: string | null;
  currentPage: PageId;
  activeClientIdx: number | null;
}
