import type { Client, Invoice } from '../types';
import { INITIAL_CLIENT } from '../types';

const CLIENTS_KEY = 'invoice_app_clients';
const INVOICES_KEY = 'invoice_app_invoices';
const DRAFT_KEY = 'invoice_app_draft';

export const storage = {
    getClients: (): Client[] => {
        const data = localStorage.getItem(CLIENTS_KEY);
        if (!data) {
            storage.saveClients([INITIAL_CLIENT]);
            return [INITIAL_CLIENT];
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse clients', e);
            return [];
        }
    },

    saveClients: (clients: Client[]) => {
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    },

    getInvoices: (): Invoice[] => {
        const data = localStorage.getItem(INVOICES_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse invoices', e);
            return [];
        }
    },

    saveInvoices: (invoices: Invoice[]) => {
        localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    },

    saveDraft: (invoice: Invoice) => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(invoice));
    },

    getDraft: (): Invoice | null => {
        const data = localStorage.getItem(DRAFT_KEY);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse draft', e);
            return null;
        }
    },

    clearDraft: () => {
        localStorage.removeItem(DRAFT_KEY);
    }
};
