import { useState, useEffect, useRef, useCallback } from 'react';
import type { Invoice, InvoiceItem, Client, BankAccount } from '../types';
import { storage } from '../lib/storage';
import { Plus, Trash2, Printer, Save, FilePlus } from 'lucide-react';
import { PrintableInvoice } from './PrintableInvoice';

interface Props {
    initialInvoice?: Invoice | null;
    onInvoiceSaved?: () => void;
    onClearEdit?: () => void;
}

export function InvoiceEditor({ initialInvoice, onInvoiceSaved, onClearEdit }: Props) {
    const [clients, setClients] = useState<Client[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const draftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialLoad = useRef(true);

    const generateNextInvoiceNumber = useCallback(() => {
        const invoices = storage.getInvoices();
        const currentYear = new Date().getFullYear().toString();

        if (invoices.length === 0) {
            return currentYear + '001';
        }

        const thisYearInvoices = invoices.filter(inv => inv.number.startsWith(currentYear));

        if (thisYearInvoices.length === 0) {
            return currentYear + '001';
        }

        const highestNumber = Math.max(...thisYearInvoices.map(inv => parseInt(inv.number.slice(-3)) || 0));
        const nextSequence = (highestNumber + 1).toString().padStart(3, '0');

        return currentYear + nextSequence;
    }, []);

    const createBlankInvoice = useCallback((keepClientId?: string, keepBankAccount?: string): Invoice => ({
        id: crypto.randomUUID(),
        number: generateNextInvoiceNumber(),
        clientId: keepClientId || '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bankAccount: keepBankAccount || 'personal',
        paid: false,
        items: [
            { id: crypto.randomUUID(), description: '', quantity: 1, unit: 'ks', unitPrice: 0 }
        ]
    }), [generateNextInvoiceNumber]);

    const [invoice, setInvoice] = useState<Invoice>(() => {
        // Check for draft first
        const draft = storage.getDraft();
        if (draft) return draft;
        return createBlankInvoice();
    });

    // Handle initialInvoice prop (edit or duplicate from history)
    useEffect(() => {
        if (initialInvoice) {
            // If number is empty, it's a duplicate \u2014 generate new number
            if (!initialInvoice.number) {
                setInvoice({
                    ...initialInvoice,
                    number: generateNextInvoiceNumber()
                });
            } else {
                setInvoice(initialInvoice);
            }
            storage.clearDraft();
        }
    }, [initialInvoice, generateNextInvoiceNumber]);

    useEffect(() => {
        const loadedClients = storage.getClients();
        setClients(loadedClients);
        setBankAccounts(storage.getBankAccounts());
        if (loadedClients.length > 0 && !invoice.clientId) {
            setInvoice(prev => ({ ...prev, clientId: loadedClients[0].id }));
        }
        isInitialLoad.current = false;
    }, []);

    // Auto-save draft (TASK 3) \u2014 debounced 500ms
    useEffect(() => {
        if (isInitialLoad.current) return;

        if (draftTimeoutRef.current) {
            clearTimeout(draftTimeoutRef.current);
        }

        draftTimeoutRef.current = setTimeout(() => {
            storage.saveDraft(invoice);
        }, 500);

        return () => {
            if (draftTimeoutRef.current) {
                clearTimeout(draftTimeoutRef.current);
            }
        };
    }, [invoice]);

    const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
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

    // Shared save logic (TASK 1)
    const saveInvoiceToHistory = (): boolean => {
        if (!invoice.clientId) {
            alert('Vyberte pros\u00edm klienta.');
            return false;
        }

        const invoices = storage.getInvoices();
        const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);

        if (existingIndex >= 0) {
            invoices[existingIndex] = invoice;
        } else {
            invoices.push(invoice);
        }

        storage.saveInvoices(invoices);
        onInvoiceSaved?.();
        return true;
    };

    // Print: save silently + print (TASK 1)
    const handlePrint = () => {
        if (!saveInvoiceToHistory()) return;
        storage.clearDraft();
        window.print();
    };

    // Save & New: save + reset form (TASK 1)
    const handleSaveAndNew = () => {
        if (!saveInvoiceToHistory()) return;

        storage.clearDraft();
        onClearEdit?.();

        const newInvoice = createBlankInvoice(invoice.clientId, invoice.bankAccount);
        setInvoice(newInvoice);

        alert(`Faktura \u010d. ${invoice.number} ulo\u017eena! Formul\u00e1\u0159 p\u0159ipraven pro novou fakturu.`);
    };

    const isEditing = initialInvoice && initialInvoice.number !== '';

    return (
        <div>
            <div className="card no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>{isEditing ? `\u00daprava faktury \u010d. ${invoice.number}` : 'Nov\u00e1 Faktura'}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" onClick={handleSaveAndNew}>
                            <FilePlus size={18} /> Ulo\u017eit a nov\u00e1
                        </button>
                        <button className="btn btn-secondary" onClick={() => {
                            if (!saveInvoiceToHistory()) return;
                            storage.clearDraft();
                            alert(`Faktura \u010d. ${invoice.number} ulo\u017eena!`);
                        }}>
                            <Save size={18} /> Ulo\u017eit
                        </button>
                        <button className="btn btn-primary" onClick={handlePrint}>
                            <Printer size={18} /> Tisk / PDF
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <div style={{
                        padding: '0.5rem 1rem',
                        marginBottom: '1rem',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.85rem',
                        color: '#1e40af',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>\u270f\ufe0f Upravujete existuj\u00edc\u00ed fakturu. Zm\u011bny se ulo\u017e\u00ed p\u0159i tisku nebo kliknut\u00edm na Ulo\u017eit.</span>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            onClick={() => {
                                onClearEdit?.();
                                setInvoice(createBlankInvoice(invoice.clientId, invoice.bankAccount));
                            }}
                        >
                            Zru\u0161it \u00fapravu
                        </button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left Column: Basic Info */}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>\u010c\u00edslo faktury (VS)</label>
                            <input
                                type="text"
                                style={{ width: '100%', padding: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}
                                value={invoice.number}
                                onChange={e => setInvoice({ ...invoice, number: e.target.value })}
                            />
                            <small style={{ color: 'var(--text-secondary)' }}>Variabiln\u00ed symbol bude shodn\u00fd.</small>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Datum vystaven\u00ed</label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bankovn\u00ed \u00fa\u010det</label>
                            <select
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={invoice.bankAccount}
                                onChange={e => setInvoice({ ...invoice, bankAccount: e.target.value })}
                            >
                                {bankAccounts.map(acc => (
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
                                                I\u010cO: {c.ico} / DI\u010c: {c.dic}
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
                    <h3 style={{ marginBottom: '1rem' }}>Polo\u017eky faktury</h3>
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
                                            placeholder="Popis slu\u017eby"
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
                                            <option value="pau\u0161\u00e1l">pau\u0161\u00e1l</option>
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
                                        {(item.quantity * item.unitPrice).toLocaleString('cs-CZ')} K\u010d
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
                        <Plus size={16} /> P\u0159idat polo\u017eku
                    </button>

                    <div style={{ marginTop: '2rem', textAlign: 'right', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Celkem k \u00fahrad\u011b: {calculateTotal().toLocaleString('cs-CZ')} K\u010d
                    </div>
                </div>
            </div>

            {/* Printable View - Hidden on screen, Visible on print */}
            <div className="only-print">
                <PrintableInvoice
                    invoice={invoice}
                    client={clients.find(c => c.id === invoice.clientId)}
                    bankAccounts={bankAccounts}
                />
            </div>
        </div>
    );
}
