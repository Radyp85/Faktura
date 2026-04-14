import { useState, useEffect } from 'react';
import type { BankAccount } from '../types';
import { storage } from '../lib/storage';
import { Plus, Pencil, Trash2, Landmark } from 'lucide-react';

export function BankAccountManager() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        setAccounts(storage.getBankAccounts());
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAccount) return;

        const newAccounts = [...accounts];
        const index = newAccounts.findIndex(a => a.id === editingAccount.id);

        if (index >= 0) {
            newAccounts[index] = editingAccount;
        } else {
            newAccounts.push({ ...editingAccount, id: crypto.randomUUID() });
        }

        setAccounts(newAccounts);
        storage.saveBankAccounts(newAccounts);
        setIsFormOpen(false);
        setEditingAccount(null);
    };

    const handleEdit = (account: BankAccount) => {
        setEditingAccount(account);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingAccount({
            id: '',
            label: '',
            number: '',
            bank: '',
            iban: ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (accounts.length <= 1) {
            alert('Mus\u00edte m\u00edt alespo\u0148 jeden bankovn\u00ed \u00fa\u010det.');
            return;
        }
        if (!confirm('Opravdu smazat tento \u00fa\u010det?')) return;
        const newAccounts = accounts.filter(a => a.id !== id);
        setAccounts(newAccounts);
        storage.saveBankAccounts(newAccounts);
    };

    if (isFormOpen && editingAccount) {
        return (
            <div className="card">
                <h2>{editingAccount.id ? 'Upravit \u00fa\u010det' : 'Nov\u00fd \u00fa\u010det'}</h2>
                <form onSubmit={handleSave} style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>N\u00e1zev (\u0161t\u00edtek)</label>
                            <input
                                required
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={editingAccount.label}
                                onChange={e => setEditingAccount({ ...editingAccount, label: e.target.value })}
                                placeholder="nap\u0159. Osobn\u00ed, Firemn\u00ed..."
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Banka</label>
                            <input
                                required
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={editingAccount.bank}
                                onChange={e => setEditingAccount({ ...editingAccount, bank: e.target.value })}
                                placeholder="nap\u0159. \u010cesk\u00e1 Spo\u0159itelna"
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>\u010c\u00edslo \u00fa\u010dtu</label>
                        <input
                            required
                            style={{ width: '100%', padding: '0.5rem' }}
                            value={editingAccount.number}
                            onChange={e => setEditingAccount({ ...editingAccount, number: e.target.value })}
                            placeholder="nap\u0159. 1234567890 / 0800"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>IBAN</label>
                        <input
                            style={{ width: '100%', padding: '0.5rem' }}
                            value={editingAccount.iban}
                            onChange={e => setEditingAccount({ ...editingAccount, iban: e.target.value })}
                            placeholder="nap\u0159. CZ2608000000001234567890"
                        />
                        <small style={{ color: 'var(--text-secondary)' }}>IBAN je pot\u0159eba pro generov\u00e1n\u00ed QR k\u00f3du platby.</small>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary">Ulo\u017eit</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Zru\u0161it</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Bankovn\u00ed \u00fa\u010dty</h2>
                <button className="btn btn-primary" onClick={handleCreate}>
                    <Plus size={18} /> P\u0159idat \u00fa\u010det
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {accounts.map(account => (
                    <div key={account.id} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Landmark size={20} style={{ color: 'var(--primary)' }} />
                            <h3 style={{ margin: 0 }}>{account.label}</h3>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <div><strong>Banka:</strong> {account.bank}</div>
                            <div><strong>\u010c\u00edslo \u00fa\u010dtu:</strong> {account.number}</div>
                            {account.iban && <div><strong>IBAN:</strong> {account.iban}</div>}
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => handleEdit(account)}>
                                <Pencil size={16} /> Upravit
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                onClick={() => handleDelete(account.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
