import { useState, useEffect } from 'react';
import type { Invoice, InvoiceItem, Client } from '../types';
import { BANK_ACCOUNTS } from '../types';
import { storage } from '../lib/storage';
import { Plus, Trash2, Printer, Save } from 'lucide-react';
import { PrintableInvoice } from './PrintableInvoice';

export function InvoiceEditor() {
    const [clients, setClients] = useState<Client[]>([]);

    const generateNextInvoiceNumber = () => {
        const invoices = storage.getInvoices();
        const currentYear = new Date().getFullYear().toString();
        
        if (invoices.length === 0) {
            return currentYear + '001';
        }

        // Zkusíme najít nejvyšší číslo faktury pro aktuální rok
        const thisYearInvoices = invoices.filter(inv => inv.number.startsWith(currentYear));
        
        if (thisYearInvoices.length === 0) {
            return currentYear + '001';
        }

        const highestNumber = Math.max(...thisYearInvoices.map(inv => parseInt(inv.number.slice(-3)) || 0));
        const nextSequence = (highestNumber + 1).toString().padStart(3, '0');
        
        return currentYear + nextSequence;
    };

    // Invoice State
    const [invoice, setInvoice] = useState<Invoice>({
        id: crypto.randomUUID(),
        number: generateNextInvoiceNumber(),
        clientId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bankAccount: 'personal',
        items: [
            { id: crypto.randomUUID(), description: '', quantity: 1, unit: 'ks', unitPrice: 0 }
        ]
    });

    useEffect(() => {
        const loadedClients = storage.getClients();
        setClients(loadedClients);
        if (loadedClients.length > 0 && !invoice.clientId) {
            setInvoice(prev => ({ ...prev, clientId: loadedClients[0].id }));
        }
    }, []);

    const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const addItem = () => {
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, unit: 'ks', unitPrice: 0 }]
        }));
    };

    const removeItem = (id: string) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const calculateTotal = () => {
        return invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSave = () => {
        if (!invoice.clientId) {
            alert('Vyberte prosím klienta.');
            return;
        }
        
        const invoices = storage.getInvoices();
        
        // Zjistíme, jestli upravujeme existující (pokud bychom měli editaci) nebo přidáváme novou
        const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
        
        if (existingIndex >= 0) {
            invoices[existingIndex] = invoice;
        } else {
            invoices.push(invoice);
        }
        
        storage.saveInvoices(invoices);
        alert(`Faktura č. ${invoice.number} byla úspěšně uložena do historie!`);
        
        // Připravíme čistou fakturu s novým číslem
        setInvoice(prev => ({
            id: crypto.randomUUID(),
            number: generateNextInvoiceNumber(),
            clientId: prev.clientId, // necháme vybraného klienta
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            bankAccount: prev.bankAccount,
            items: [
                { id: crypto.randomUUID(), description: '', quantity: 1, unit: 'ks', unitPrice: 0 }
            ]
        }));
    };

    return (
        <div>
            <div className="card no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Nová Faktura</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" onClick={handleSave}>
                            <Save size={18} /> Uložit rozpracovanou
                        </button>
                        <button className="btn btn-primary" onClick={handlePrint}>
                            <Printer size={18} /> Tisk / PDF
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left Column: Basic Info */}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Číslo faktury (VS)</label>
                            <input
                                type="text"
                                style={{ width: '100%', padding: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}
                                value={invoice.number}
                                onChange={e => setInvoice({ ...invoice, number: e.target.value })}
                            />
                            <small style={{ color: 'var(--text-secondary)' }}>Variabilní symbol bude shodný.</small>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Datum vystavení</label>
                                <input
                                    type="date"
                                    style={{ width: '100%', padding: '0.5rem' }}
                                    value={invoice.issueDate}
                                    onChange={e => setInvoice({ ...invoice, issueDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Datum splatnosti</label>
                                <input
                                    type="date"
                                    style={{ width: '100%', padding: '0.5rem' }}
                                    value={invoice.dueDate}
                                    onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bankovní účet</label>
                            <select
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={invoice.bankAccount}
                                onChange={e => setInvoice({ ...invoice, bankAccount: e.target.value })}
                            >
                                {BANK_ACCOUNTS.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.label} ({acc.bank})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Right Column: Client Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Klient</label>
                        <select
                            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                            value={invoice.clientId}
                            onChange={e => setInvoice({ ...invoice, clientId: e.target.value })}
                        >
                            <option value="">-- Vyberte klienta --</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        {invoice.clientId && (
                            <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                                {clients.find(c => c.id === invoice.clientId) && (() => {
                                    const c = clients.find(cl => cl.id === invoice.clientId)!;
                                    return (
                                        <>
                                            <strong>{c.name}</strong><br />
                                            {c.address}<br />
                                            {c.city}<br />
                                            {c.country}<br />
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                                IČO: {c.ico} / DIČ: {c.dic}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Section */}
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Položky faktury</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>Popis</th>
                                <th style={{ padding: '0.5rem', width: '100px' }}>Mn.</th>
                                <th style={{ padding: '0.5rem', width: '100px' }}>Jedn.</th>
                                <th style={{ padding: '0.5rem', width: '150px' }}>Cena/j.</th>
                                <th style={{ padding: '0.5rem', width: '150px', textAlign: 'right' }}>Celkem</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input
                                            style={{ width: '100%', padding: '0.5rem' }}
                                            value={item.description}
                                            onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                                            placeholder="Popis služby"
                                        />
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input
                                            type="number"
                                            style={{ width: '100%', padding: '0.5rem' }}
                                            value={item.quantity}
                                            onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                                        />
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <select
                                            style={{ width: '100%', padding: '0.5rem' }}
                                            value={item.unit}
                                            onChange={e => handleItemChange(item.id, 'unit', e.target.value)}
                                        >
                                            <option value="ks">ks</option>
                                            <option value="hod">hod</option>
                                            <option value="paušál">paušál</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input
                                            type="number"
                                            style={{ width: '100%', padding: '0.5rem' }}
                                            value={item.unitPrice}
                                            onChange={e => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                                        />
                                    </td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                        {(item.quantity * item.unitPrice).toLocaleString('cs-CZ')} Kč
                                    </td>
                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={addItem}>
                        <Plus size={16} /> Přidat položku
                    </button>

                    <div style={{ marginTop: '2rem', textAlign: 'right', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Celkem k úhradě: {calculateTotal().toLocaleString('cs-CZ')} Kč
                    </div>
                </div>
            </div>

            {/* Printable View - Hidden on screen, Visible on print */}
            <div className="only-print">
                <PrintableInvoice
                    invoice={invoice}
                    client={clients.find(c => c.id === invoice.clientId)}
                />
            </div>
        </div>
    );
}
