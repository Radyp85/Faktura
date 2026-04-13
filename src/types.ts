export interface Client {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    ico: string;
    dic: string;
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
}

export interface Invoice {
    id: string;
    number: string; // Variable Symbol
    clientId: string;
    issueDate: string;
    dueDate: string;
    bankAccount: string; // 'personal' | 'joint'
    items: InvoiceItem[];
    paid?: boolean;
}

export const SUPPLIER = {
    name: 'Radomír Pešek',
    address: 'Jezuitská 8/5a',
    city: '60200 Brno',
    country: 'Česká republika',
    ico: '75598345',
    note: 'Neplátce DPH',
    phone: '+420 732 852 064',
    email: 'pesek.radomir@gmail.com'
};

export const BANK_ACCOUNTS = [
    { id: 'personal', label: 'Osobní', number: '1721765083 / 0800', bank: 'Česká Spořitelna', iban: 'CZ2608000000001721765083' },
    { id: 'joint', label: 'Společný', number: '4562085083 / 0800', bank: 'Česká Spořitelna', iban: 'CZ1808000000004562085083' }
];

export const INITIAL_CLIENT: Client = {
    id: 'medi-evolution',
    name: 'Medi Evolution s.r.o.',
    address: 'Dobrovského 1310/64',
    city: '61200 Brno',
    country: 'Česká republika',
    ico: '29183693',
    dic: 'CZ29183693'
};
