import { FileText, Users, PlusCircle, History, BarChart3, AlertCircle, Landmark } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { Invoice } from './types';
import { storage } from './lib/storage';
import { ClientManager } from './components/ClientManager';
import { BankAccountManager } from './components/BankAccountManager';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoiceHistory } from './components/InvoiceHistory';
import { InvoiceStats } from './components/InvoiceStats';

function App() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'clients' | 'accounts' | 'history' | 'stats'>('invoices');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [overdueCount, setOverdueCount] = useState(0);

  const updateOverdueCount = useCallback(() => {
    const invoices = storage.getInvoices();
    const today = new Date().toISOString().split('T')[0];
    const count = invoices.filter(inv => !inv.paid && inv.dueDate < today).length;
    setOverdueCount(count);
  }, []);

  useEffect(() => {
    updateOverdueCount();
  }, [activeTab, updateOverdueCount]);

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setActiveTab('invoices');
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const duplicated: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      number: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paid: false,
      items: invoice.items.map(item => ({ ...item, id: crypto.randomUUID() }))
    };
    setEditingInvoice(duplicated);
    setActiveTab('invoices');
  };

  const handleInvoiceSaved = () => {
    updateOverdueCount();
  };

  const handleClearEdit = () => {
    setEditingInvoice(null);
  };

  return (
    <div className="container">
      <header className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="logo">
          <FileText />
          <span>Faktura\u010dn\u00ed Syst\u00e9m</span>
        </div>
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setEditingInvoice(null); setActiveTab('invoices'); }}
          >
            <PlusCircle size={18} />
            Nov\u00e1 Faktura
          </button>
          <button
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('history')}
            style={{ position: 'relative' }}
          >
            <History size={18} />
            Historie
            {overdueCount > 0 && (
              <span className="badge-overdue" title={`${overdueCount} faktur po splatnosti`}>
                <AlertCircle size={14} />
                {overdueCount}
              </span>
            )}
          </button>
          <button
            className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={18} />
            Statistiky
          </button>
          <button
            className={`btn ${activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('clients')}
          >
            <Users size={18} />
            Klienti
          </button>
          <button
            className={`btn ${activeTab === 'accounts' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('accounts')}
          >
            <Landmark size={18} />
            \u00da\u010dty
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'invoices' && (
          <InvoiceEditor
            initialInvoice={editingInvoice}
            onInvoiceSaved={handleInvoiceSaved}
            onClearEdit={handleClearEdit}
          />
        )}

        {activeTab === 'history' && (
          <InvoiceHistory
            onEdit={handleEditInvoice}
            onDuplicate={handleDuplicateInvoice}
            onDataChange={updateOverdueCount}
          />
        )}

        {activeTab === 'stats' && (
          <InvoiceStats />
        )}

        {activeTab === 'clients' && (
          <ClientManager />
        )}

        {activeTab === 'accounts' && (
          <BankAccountManager />
        )}
      </main>
    </div>
  );
}

export default App;
