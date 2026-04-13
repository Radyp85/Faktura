import type { Client, Invoice } from '../types';
import { INITIAL_CLIENT } from '../types';

const CLIENTS_KEY = 'invoice_app_clients';
const INVOICES_KEY = 'invoice_app_invoices';

export const storage = {
    getClients: (): Client[] => {
        const data = localStorage.getItem(CLIENTS_KEY);
        if (!data) {
            // Seed initial client
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
    }
};
