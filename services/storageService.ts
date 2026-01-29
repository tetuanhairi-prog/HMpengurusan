
import { AppState, PjsRecord, Client } from '../types';

const STORAGE_KEY = 'hma_sistem_data';

const INITIAL_CLIENT_DATA: Client[] = [
  { id: 'c1', name: 'AMIRA', detail: 'N.Anak', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 2500 }] },
  { id: 'c2', name: 'AMIR', detail: 'Faraid Pusaka', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 4000 }] },
  { id: 'c3', name: 'EZZRY', detail: 'N.Anak', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 3000 }] },
  { id: 'c4', name: 'HAJAR', detail: 'Fasakh', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 4000 }] },
  { id: 'c5', name: 'HIDAYAH LAZIM', detail: 'Hadhanah', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 5000 }] },
  { id: 'c6', name: 'IZWANY', detail: 'Takliq', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 3000 }] },
  { id: 'c7', name: 'AZIZAH-JAHAYA', detail: 'Semakan', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 6000 }] },
  { id: 'c8', name: 'MUSLIHA', detail: 'HDP', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 6000 }] },
  { id: 'c9', name: 'RASHIDI', detail: 'N.Anak', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 4500 }] },
  { id: 'c10', name: 'ROSIDAH', detail: 'Fasakh', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 3000 }] },
  { id: 'c11', name: 'SYAMIMI', detail: 'Fasakh', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 3200 }] },
  { id: 'c12', name: 'S.AMBERI', detail: 'Hadhanah', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 4500 }] },
  { id: 'c13', name: 'SYAFAWANI', detail: 'Fasakh', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 3500 }] },
  { id: 'c14', name: 'SYAHRIZAITUL', detail: 'N.Ank', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 3000 }] },
  { id: 'c15', name: 'SHURAIDA', detail: 'N.Anak', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 3000 }] },
  { id: 'c16', name: 'YAZID', detail: 'Fasakh', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 1500 }] },
  { id: 'c17', name: 'ZAINAB', detail: 'Takliq', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 3200 }] },
  { id: 'c18', name: 'ZULHAZLIN', detail: 'H.Sepencarian', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 5000 }] },
  { id: 'c19', name: 'ZULHAZLIN', detail: 'Rayuan', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 15000 }] },
  { id: 'c20', name: 'ZUL AZRIN', detail: 'Pusaka', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 3000 }] },
  { id: 'c21', name: 'AZMIRA YANTI', detail: 'Khalwat', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 1000 }] },
  { id: 'c22', name: 'NOR RIZA', detail: 'Fasakh', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 3500 }] },
  { id: 'c23', name: 'KAMAL', detail: 'Carian (Pusaka)', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 500 }] },
  { id: 'c24', name: 'HAYATI', detail: 'Hadhanah', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 4500 }] },
  { id: 'c25', name: 'HAYATI', detail: 'N. Anak', ledger: [{ date: '2025-01-01', desc: 'FEE PROFESSIONAL DIPERSETUJUI', amt: 2500 }] },
];

const INITIAL_PJS_DATA: PjsRecord[] = [
  { id: '1', date: '2025-11-02', name: 'AHMAD SUBRI BIN HARUN', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '2', date: '2025-10-19', name: 'ABDUL RAHIM BIN MAT ISA', detail: 'AFIDAVIT', amount: 90 },
  { id: '3', date: '2025-10-19', name: 'ABU MANSOR BIN HAMID', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '4', date: '2025-10-19', name: 'AFIF ULWAN BIN SAIFUL ADLI', detail: 'AKUAN BERKANUN', amount: 20 },
  { id: '5', date: '2025-11-06', name: 'FATIMAH BINTI ISMAIL', detail: 'AMANAHRAYA', amount: 10 },
  { id: '6', date: '2025-11-02', name: 'HASIAH BINTI AHMAD', detail: 'DDA', amount: 10 },
  { id: '7', date: '2025-11-27', name: 'KHOTIJAH BINTI AHMAD', detail: 'DDA', amount: 10 },
  { id: '8', date: '2025-11-06', name: 'MUHAMMAD HAFIZ ADZIM AZHAR', detail: 'AMANAHRAYA', amount: 0 },
  { id: '9', date: '2025-11-06', name: 'SITI NURSYAFIQAH BINTI AZHAR', detail: 'AMANAHRAYA', amount: 0 },
  { id: '10', date: '2025-11-06', name: 'SITI ROKIAH BINTI ABU BAKAR', detail: 'AMANAHRAYA', amount: 0 },
  { id: '11', date: '2025-11-02', name: 'MAT REJAB BIN AHMAD', detail: 'DDA', amount: 10 },
  { id: '12', date: '2025-11-02', name: 'NAZLIZA BINTI CHE ROOS', detail: 'DDA', amount: 10 },
  { id: '13', date: '2025-10-27', name: 'NUR FAIRINA BT ABDULLAH', detail: 'AKUAN (AMANAHRAYA)', amount: 0 },
  { id: '14', date: '2025-10-27', name: 'NUR MASSITAH BT ZAIDI', detail: 'AKUAN (GADAIAN) EKSHIBIT', amount: 10 },
  { id: '15', date: '2025-10-23', name: 'SUPIAN A/L SULIM', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '16', date: '2025-10-26', name: 'ZUL AZRIN BIN HAIROL FADILAH', detail: 'BORANG A', amount: 10 },
  { id: '17', date: '2025-11-13', name: 'NUR NABILAH BINTI ABDUL RAZAK', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '18', date: '2025-11-13', name: 'NOOR AISHAH BINTI MOHAMAD', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '19', date: '2025-11-13', name: 'AMAR HAIKAL BIN MOHD SHARUL', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '20', date: '2025-11-16', name: 'ISMAIL BIN CHE ANI', detail: 'AKUAN BERKANUN', amount: 20 },
  { id: '21', date: '2025-11-16', name: 'AB RAZAK BIN HUSSAIN', detail: 'BORANG A', amount: 10 },
  { id: '22', date: '2025-11-16', name: 'NORMADIAH BINTI ZAKARIA', detail: 'AKUAN BERKANUN', amount: 30 },
  { id: '23', date: '2025-11-16', name: 'AWANG DOI BIN KADER', detail: 'AKUAN BERKANUN', amount: 30 },
  { id: '24', date: '2025-11-16', name: 'ABDUL RAHMAN BIN MUSA', detail: 'AKUAN BERKANUN', amount: 30 },
  { id: '25', date: '2025-11-23', name: 'NURUL SYUHADA BINTI ISMAIL', detail: 'AKUAN BERKANUN', amount: 20 },
  { id: '26', date: '2025-11-26', name: 'ANARD A/L TNOM', detail: 'AKUAN BERKANUN', amount: 20 },
  { id: '27', date: '2025-11-26', name: 'TNOM A/L DIN CHENG', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '28', date: '2025-12-11', name: 'AIMI HUSAINI BIN ABD MANAFF', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '29', date: '2025-12-11', name: 'AIMI HAZWAN BIN ABD MANAFF', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '30', date: '2025-12-11', name: 'AIMI ASHRAF BIN ABD MANAFF', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '31', date: '2025-12-11', name: 'AIMI AMALINA BT ABD MANAFF', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '32', date: '2025-12-11', name: 'ABDULLAH BIN ABD AZIZ', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '33', date: '2025-12-11', name: 'MOHD NOOR BIN MD ISA', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '34', date: '2025-12-09', name: 'ANARD A/L TNOM', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '35', date: '2025-12-07', name: 'MUHAMMAD NAZRUL NAZMI BIN MOHD FUZI', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '36', date: '2025-12-07', name: 'MUHAMAD RAHIMI BIN MOHD FUZI', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '37', date: '2025-12-07', name: 'MIMI WAHIDAH BT MOHD FUZI', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '38', date: '2025-12-04', name: 'KELSUM BIN ABD KHALID', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '39', date: '2025-12-03', name: 'AHMAD TARMIZI BIN MAT', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '40', date: '2025-12-01', name: 'BUKPHA A/P SANANAM', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '41', date: '2025-12-01', name: 'SYAMSUL FETRI BIN RAMLI', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '42', date: '2025-12-01', name: 'ASIAH BINTI MOHD YUSOFF', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '43', date: '2025-12-17', name: 'OMAR BIN AHMAD', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '44', date: '2025-12-18', name: 'JANISYA HAWANI HANAFI', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '45', date: '2025-12-18', name: 'HANAFI BIN ABDUL WAHAB', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '46', date: '2025-12-22', name: 'NORANISAH BT ISHAK', detail: 'DDA', amount: 10 },
  { id: '47', date: '2025-12-22', name: 'MD OSMAN BIN ISHAK', detail: 'DDA', amount: 10 },
  { id: '48', date: '2025-12-23', name: 'TNOM A/L DEN CHENG', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '49', date: '2025-12-25', name: 'JAMILAH BINTI AWANG', detail: 'AKUAN BERKANUN', amount: 10 },
  { id: '50', date: '2025-12-29', name: 'MOHD SHUKRI BIN MOHD YATIM', detail: 'DDA', amount: 10 },
  { id: '51', date: '2025-12-29', name: 'SHAMSIAH BINTI MAT ZAIN', detail: 'DDA', amount: 10 },
  { id: '52', date: '2025-12-29', name: 'MOHD BASRI BIN MOHD YATIM', detail: 'DDA', amount: 10 },
];

export const saveToStorage = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadFromStorage = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      const clients = parsed.clients || [];
      const activeIdx = parsed.activeClientIdx !== undefined ? parsed.activeClientIdx : null;
      
      const validatedIdx = (activeIdx !== null && activeIdx >= 0 && activeIdx < clients.length) 
        ? activeIdx 
        : null;

      return {
        clients: clients.length > 0 ? clients : INITIAL_CLIENT_DATA,
        pjsRecords: parsed.pjsRecords && parsed.pjsRecords.length > 0 ? parsed.pjsRecords : INITIAL_PJS_DATA,
        inventory: parsed.inventory || [],
        invCounter: parsed.invCounter || 1,
        firmLogo: parsed.firmLogo || null,
        currentPage: parsed.currentPage || 'guaman',
        activeClientIdx: validatedIdx,
        theme: parsed.theme || 'dark'
      };
    } catch (e) {
      console.error("Failed to parse stored state", e);
    }
  }
  return {
    clients: INITIAL_CLIENT_DATA,
    pjsRecords: INITIAL_PJS_DATA,
    inventory: [],
    invCounter: 1,
    firmLogo: null,
    currentPage: 'guaman',
    activeClientIdx: null,
    theme: 'dark'
  };
};
