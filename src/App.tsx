import { FileText, Users, PlusCircle, History } from 'lucide-react';
import { useState } from 'react';
import { ClientManager } from './components/ClientManager';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoiceHistory } from './components/InvoiceHistory';

function App() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'clients' | 'history'>('invoices');

  return (
    <div className="container">
      <header className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="logo">
          <FileText />
          <span>Fakturační Systém</span>
        </div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button
            className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('invoices')}
          >
            <PlusCircle size={18} />
            Nová Faktura
          </button>
          <button
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} />
            Historie
          </button>
          <button
            className={`btn ${activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('clients')}
          >
            <Users size={18} />
            Klienti
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'invoices' && (
          <InvoiceEditor />
        )}

        {activeTab === 'history' && (
          <InvoiceHistory />
        )}

        {activeTab === 'clients' && (
          <ClientManager />
        )}
      </main>
    </div>
  );
}

export default App;
