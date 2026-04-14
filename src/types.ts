export interface Client {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    ico: string;
    dic: string;
}

export interface BankAccount {
    id: string;
    label: string;
    number: string;
    bank: string;
    iban: string;
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
    bankAccount: string; // ID of BankAccount
    items: InvoiceItem[];
    paid?: boolean;
}

export const SUPPLIER = {
    name: 'Radom\u00edr Pe\u0161ek',
    address: 'Jezuitsk\u00e1 8/5a',
    city: '60200 Brno',
    country: '\u010cesk\u00e1 republika',
    ico: '75598345',
    note: 'Nepl\u00e1tce DPH',
    phone: '+420 732 852 064',
    email: 'pesek.radomir@gmail.com'
};

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
    { id: 'personal', label: 'Osobn\u00ed', number: '1721765083 / 0800', bank: '\u010cesk\u00e1 Spo\u0159itelna', iban: 'CZ2608000000001721765083' },
    { id: 'joint', label: 'Spole\u010dn\u00fd', number: '4562085083 / 0800', bank: '\u010cesk\u00e1 Spo\u0159itelna', iban: 'CZ1808000000004562085083' }
];

export const INITIAL_CLIENT: Client = {
    id: 'medi-evolution',
    name: 'Medi Evolution s.r.o.',
    address: 'Dobrovsk\u00e9ho 1310/64',
    city: '61200 Brno',
    country: '\u010cesk\u00e1 republika',
    ico: '29183693',
    dic: 'CZ29183693'
};
