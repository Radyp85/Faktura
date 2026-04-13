import { useState, useEffect } from 'react';
import type { Client } from '../types';
import { storage } from '../lib/storage';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function ClientManager() {
    const [clients, setClients] = useState<Client[]>([]);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        setClients(storage.getClients());
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClient) return;

        let newClients = [...clients];
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
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingClient({
            id: '',
            name: '',
            address: '',
            city: '',
            country: 'Česká republika',
            ico: '',
            dic: ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (!confirm('Opravdu smazat tohoto klienta?')) return;
        const newClients = clients.filter(c => c.id !== id);
        setClients(newClients);
        storage.saveClients(newClients);
    };

    if (isFormOpen && editingClient) {
        return (
            <div className="card">
                <h2>{editingClient.id ? 'Upravit klienta' : 'Nový klient'}</h2>
                <form onSubmit={handleSave} style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Název firmy</label>
                        <input
                            required
                            style={{ width: '100%', padding: '0.5rem' }}
                            value={editingClient.name}
                            onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ulice a číslo</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={editingClient.address}
                                onChange={e => setEditingClient({ ...editingClient, address: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Město a PSČ</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={editingClient.city}
                                onChange={e => setEditingClient({ ...editingClient, city: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>IČO</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={editingClient.ico}
                                onChange={e => setEditingClient({ ...editingClient, ico: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>DIČ</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem' }}
                                value={editingClient.dic}
                                onChange={e => setEditingClient({ ...editingClient, dic: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary">Uložit</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Zrušit</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Seznam Klientů</h2>
                <button className="btn btn-primary" onClick={handleCreate}>
                    <Plus size={18} /> Přidat klienta
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
                            <strong>IČO:</strong> {client.ico} <br />
                            <strong>DIČ:</strong> {client.dic}
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
