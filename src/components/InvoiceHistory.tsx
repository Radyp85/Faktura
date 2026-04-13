import { useState, useEffect } from 'react';
import type { Invoice, Client } from '../types';
import { storage } from '../lib/storage';
import { Trash2, FileEdit, Copy, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
    onEdit: (invoice: Invoice) => void;
    onDuplicate: (invoice: Invoice) => void;
    onDataChange?: () => void;
}

export function InvoiceHistory({ onEdit, onDuplicate, onDataChange }: Props) {
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
            onDataChange?.();
        }
    };

    const handleTogglePaid = (id: string) => {
        const updated = invoices.map(inv =>
            inv.id === id ? { ...inv, paid: !inv.paid } : inv
        );
        storage.saveInvoices(updated);
        setInvoices(updated);
        onDataChange?.();
    };

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : 'Nezn\u00e1m\u00fd klient';
    };

    const calculateTotal = (invoice: Invoice) => {
        return invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const getStatus = (inv: Invoice): { label: string; color: string; icon: 'paid' | 'overdue' | 'pending' } => {
        if (inv.paid) {
            return { label: 'Zaplaceno', color: 'var(--success)', icon: 'paid' };
        }
        const today = new Date().toISOString().split('T')[0];
        if (inv.dueDate < today) {
            return { label: 'Po splatnosti', color: 'var(--danger)', icon: 'overdue' };
        }
        return { label: '\u010cek\u00e1 na platbu', color: 'var(--text-secondary)', icon: 'pending' };
    };

    return (
        <div className="card">
            <h2 style={{ marginBottom: '1.5rem' }}>Historie vystaven\u00fdch faktur</h2>

            {invoices.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Zat\u00edm nebyly ulo\u017eeny \u017e\u00e1dn\u00e9 faktury.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>\u010c\u00edslo (VS)</th>
                            <th style={{ padding: '0.75rem' }}>Datum</th>
                            <th style={{ padding: '0.75rem' }}>Splatnost</th>
                            <th style={{ padding: '0.75rem' }}>Klient</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Celkem</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Stav</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.sort((a, b) => b.number.localeCompare(a.number)).map(inv => {
                            const status = getStatus(inv);
                            const isOverdue = status.icon === 'overdue';

                            return (
                                <tr
                                    key={inv.id}
                                    style={{
                                        borderBottom: '1px solid var(--border)',
                                        background: isOverdue ? '#fef2f2' : 'transparent',
                                    }}
                                >
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{inv.number}</td>
                                    <td style={{ padding: '0.75rem' }}>{new Date(inv.issueDate).toLocaleDateString('cs-CZ')}</td>
                                    <td style={{ padding: '0.75rem', color: isOverdue ? 'var(--danger)' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
                                        {new Date(inv.dueDate).toLocaleDateString('cs-CZ')}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{getClientName(inv.clientId)}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        {calculateTotal(inv).toLocaleString('cs-CZ')} K\u010d
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{
                                                padding: '0.2rem 0.5rem',
                                                fontSize: '0.75rem',
                                                color: status.color,
                                                borderColor: status.color,
                                                gap: '0.25rem'
                                            }}
                                            onClick={() => handleTogglePaid(inv.id)}
                                            title={inv.paid ? 'Ozna\u010dit jako nezaplacenou' : 'Ozna\u010dit jako zaplacenou'}
                                        >
                                            {status.icon === 'paid' && <CheckCircle size={14} />}
                                            {status.icon === 'overdue' && <AlertTriangle size={14} />}
                                            {status.label}
                                        </button>
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem' }}
                                                onClick={() => onEdit(inv)}
                                                title="Otev\u0159\u00edt a upravit"
                                            >
                                                <FileEdit size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem' }}
                                                onClick={() => onDuplicate(inv)}
                                                title="Duplikovat"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                                onClick={() => handleDelete(inv.id)}
                                                title="Smazat"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
