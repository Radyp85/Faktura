import { useState, useEffect } from 'react';
import type { Invoice, Client } from '../types';
import { storage } from '../lib/storage';
import { Trash2 } from 'lucide-react';

export function InvoiceHistory() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        setInvoices(storage.getInvoices());
        setClients(storage.getClients());
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Opravdu chcete smazat tuto fakturu z historie?')) {
            const updated = invoices.filter(inv => inv.id !== id);
            storage.saveInvoices(updated);
            setInvoices(updated);
        }
    };

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : 'Neznámý klient';
    };

    const calculateTotal = (invoice: Invoice) => {
        return invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    return (
        <div className="card">
            <h2 style={{ marginBottom: '1.5rem' }}>Historie vystavených faktur</h2>
            
            {invoices.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Zatím nebyly uloženy žádné faktury.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>Číslo (VS)</th>
                            <th style={{ padding: '0.75rem' }}>Datum vystavení</th>
                            <th style={{ padding: '0.75rem' }}>Klient</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Celkem</th>
                            <th style={{ padding: '0.75rem', width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.sort((a,b) => b.number.localeCompare(a.number)).map(inv => (
                            <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{inv.number}</td>
                                <td style={{ padding: '0.75rem' }}>{new Date(inv.issueDate).toLocaleDateString('cs-CZ')}</td>
                                <td style={{ padding: '0.75rem' }}>{getClientName(inv.clientId)}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                    {calculateTotal(inv).toLocaleString('cs-CZ')} Kč
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                    <button 
                                        className="btn btn-secondary" 
                                        style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                        onClick={() => handleDelete(inv.id)}
                                        title="Smazat záznam"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
