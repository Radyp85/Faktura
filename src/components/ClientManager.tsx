import { useState, useEffect } from 'react';
import type { Client } from '../types';
import { storage } from '../lib/storage';
import { fetchCompanyByICO } from '../lib/ares';
import { Plus, Pencil, Trash2, Search, Loader } from 'lucide-react';

export function ClientManager() {
    const [clients, setClients] = useState<Client[]>([]);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [aresLoading, setAresLoading] = useState(false);
    const [aresError, setAresError] = useState('');

    useEffect(() => {
        setClients(storage.getClients());
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClient) return;

        const newClients = [...clients];
        const index = newClients.findIndex(c => c.id === editingClient.id);

        if (index >= 0) {
            newClients[index] = editingClient;
        } else {
            newClients.push({ ...editingClient, id: crypto.randomUUID() });
        }

        setClients(newClients);
        storage.saveClients(newClients);
        setIsFormOpen(false);
        setEditingClient(null);
        setAresError('');
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsFormOpen(true);
        setAresError('');
    };

    const handleCreate = () => {
        setEditingClient({
            id: '',
            name: '',
            address: '',
            city: '',
            country: '\u010cesk\u00e1 republika',
            ico: '',
            dic: ''
        });
        setIsFormOpen(true);
        setAresError('');
    };

    const handleDelete = (id: string) => {
        if (!confirm('Opravdu smazat tohoto klienta?')) return;
        const newClients = clients.filter(c => c.id !== id);
        setClients(newClients);
        storage.saveClients(newClients);
    };

    const handleAresLookup = async () => {
        if (!editingClient?.ico) {
            setAresError('Zadejte I\u010cO pro vyhled\u00e1n\u00ed.');
            return;
        }

        setAresLoading(true);
        setAresError('');

        try {
            const company = await fetchCompanyByICO(editingClient.ico);
            setEditingClient(prev => prev ? {
                ...prev,
                name: company.name || prev.name,
                address: company.address || prev.address,
                city: company.city || prev.city,
                dic: company.dic || prev.dic,
                ico: company.ico || prev.ico
            } : prev);
        } catch (err) {
            setAresError(err instanceof Error ? err.message : 'Chyba p\u0159i na\u010d\u00edt\u00e1n\u00ed z ARES.');
        } finally {
            setAresLoading(false);
        }
    };

    if (isFormOpen && editingClient) {
        return (
            <div className="card">
                <h2>{editingClient.id ? 'Upravit klienta' : 'Nov\u00fd klient'}</h2>
                <form onSubmit={handleSave} style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>I\u010cO</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    style={{ flex: 1, padding: '0.5rem' }}
                                    value={editingClient.ico}
                                    onChange={e => setEditingClient({ ...editingClient, ico: e.target.value })}
                                    placeholder="Zadejte I\u010cO"
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}
                                    onClick={handleAresLookup}
                                    disabled={aresLoading}
                                    title="Na\u010d\u00edst \u00fadaje z ARES"
                                >
                                    {aresLoading ? <Loader size={16} className="spin" /> : <Search size={16} />}
                                    {aresLoading ? 'Hled\u00e1m...' : 'ARES'}
                                </button>
                            </div>
                            {aresError && (
                                <small style={{ color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}>
                                    {aresError}
                                </small>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>DI\u010c</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={editingClient.dic}
                                onChange={e => setEditingClient({ ...editingClient, dic: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>N\u00e1zev firmy</label>
                        <input
                            required
                            style={{ width: '100%', padding: '0.5rem' }}
                            value={editingClient.name}
                            onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ulice a \u010d\u00edslo</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={editingClient.address}
                                onChange={e => setEditingClient({ ...editingClient, address: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>M\u011bsto a PS\u010c</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={editingClient.city}
                                onChange={e => setEditingClient({ ...editingClient, city: e.target.value })}
                            />
                        </div>
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
                <h2>Seznam Klient\u016f</h2>
                <button className="btn btn-primary" onClick={handleCreate}>
                    <Plus size={18} /> P\u0159idat klienta
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {clients.map(client => (
                    <div key={client.id} className="card">
                        <h3 style={{ marginBottom: '0.5rem' }}>{client.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {client.address}<br />
                            {client.city}
                        </p>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                            <strong>I\u010cO:</strong> {client.ico} <br />
                            <strong>DI\u010c:</strong> {client.dic}
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => handleEdit(client)}>
                                <Pencil size={16} /> Upravit
                            </button>
                            <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(client.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
