import { useState, useEffect, useMemo } from 'react';
import type { Invoice, Client } from '../types';
import { storage } from '../lib/storage';

export function InvoiceStats() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

    useEffect(() => {
        setInvoices(storage.getInvoices());
        setClients(storage.getClients());
    }, []);

    const availableYears = useMemo(() => {
        const years = new Set(invoices.map(inv => new Date(inv.issueDate).getFullYear()));
        years.add(new Date().getFullYear());
        return Array.from(years).sort((a, b) => b - a);
    }, [invoices]);

    const monthNames = [
        'Leden', '\u00danor', 'B\u0159ezen', 'Duben', 'Kv\u011bten', '\u010cerven',
        '\u010cervenec', 'Srpen', 'Z\u00e1\u0159\u00ed', '\u0158\u00edjen', 'Listopad', 'Prosinec'
    ];

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const date = new Date(inv.issueDate);
            if (date.getFullYear() !== selectedYear) return false;
            if (selectedMonth !== 'all' && date.getMonth() !== selectedMonth) return false;
            return true;
        });
    }, [invoices, selectedYear, selectedMonth]);

    const totalRevenue = useMemo(() => {
        return filteredInvoices.reduce((sum, inv) =>
            sum + inv.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0), 0);
    }, [filteredInvoices]);

    const paidRevenue = useMemo(() => {
        return filteredInvoices.filter(inv => inv.paid).reduce((sum, inv) =>
            sum + inv.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0), 0);
    }, [filteredInvoices]);

    const monthlyData = useMemo(() => {
        const data = Array.from({ length: 12 }, (_, i) => ({
            month: i,
            name: monthNames[i],
            total: 0,
            count: 0
        }));

        invoices
            .filter(inv => new Date(inv.issueDate).getFullYear() === selectedYear)
            .forEach(inv => {
                const month = new Date(inv.issueDate).getMonth();
                const total = inv.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
                data[month].total += total;
                data[month].count += 1;
            });

        return data;
    }, [invoices, selectedYear]);

    const maxMonthlyTotal = useMemo(() => {
        return Math.max(...monthlyData.map(d => d.total), 1);
    }, [monthlyData]);

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : 'Nezn\u00e1m\u00fd klient';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Filters */}
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label style={{ fontWeight: 'bold' }}>Obdob\u00ed:</label>
                <select
                    style={{ padding: '0.5rem' }}
                    value={selectedYear}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                >
                    {availableYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <select
                    style={{ padding: '0.5rem' }}
                    value={selectedMonth === 'all' ? 'all' : selectedMonth}
                    onChange={e => {
                        const val = e.target.value;
                        setSelectedMonth(val === 'all' ? 'all' : Number(val));
                    }}
                >
                    <option value="all">Cel\u00fd rok</option>
                    {monthNames.map((name, i) => (
                        <option key={i} value={i}>{name}</option>
                    ))}
                </select>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Celkov\u00e9 p\u0159\u00edjmy
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {totalRevenue.toLocaleString('cs-CZ')} K\u010d
                    </div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Zaplaceno
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)' }}>
                        {paidRevenue.toLocaleString('cs-CZ')} K\u010d
                    </div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Po\u010det faktur
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                        {filteredInvoices.length}
                    </div>
                </div>
            </div>

            {/* Monthly Bar Chart */}
            {selectedMonth === 'all' && (
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>P\u0159ehled po m\u011bs\u00edc\u00edch \u2014 {selectedYear}</h3>
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'flex-end', height: '200px' }}>
                        {monthlyData.map(d => (
                            <div
                                key={d.month}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: '100%',
                                    justifyContent: 'flex-end'
                                }}
                            >
                                {d.total > 0 && (
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>
                                        {(d.total / 1000).toFixed(0)}k
                                    </div>
                                )}
                                <div
                                    style={{
                                        width: '100%',
                                        maxWidth: '60px',
                                        height: `${Math.max((d.total / maxMonthlyTotal) * 160, d.total > 0 ? 4 : 0)}px`,
                                        background: d.total > 0
                                            ? `linear-gradient(to top, var(--primary), #60a5fa)`
                                            : '#e2e8f0',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.3s ease',
                                        minHeight: d.total > 0 ? '4px' : '2px',
                                        cursor: d.total > 0 ? 'pointer' : 'default'
                                    }}
                                    title={`${d.name}: ${d.total.toLocaleString('cs-CZ')} K\u010d (${d.count} faktur)`}
                                    onClick={() => d.total > 0 && setSelectedMonth(d.month)}
                                />
                                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                                    {d.name.slice(0, 3)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filtered Invoice List */}
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>
                    Faktury \u2014 {selectedMonth === 'all' ? selectedYear : `${monthNames[selectedMonth]} ${selectedYear}`}
                </h3>
                {filteredInvoices.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>\u017d\u00e1dn\u00e9 faktury v tomto obdob\u00ed.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>\u010c\u00edslo</th>
                                <th style={{ padding: '0.5rem' }}>Datum</th>
                                <th style={{ padding: '0.5rem' }}>Klient</th>
                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>\u010c\u00e1stka</th>
                                <th style={{ padding: '0.5rem', textAlign: 'center' }}>Stav</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.sort((a, b) => b.number.localeCompare(a.number)).map(inv => {
                                const total = inv.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
                                return (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{inv.number}</td>
                                        <td style={{ padding: '0.5rem' }}>{new Date(inv.issueDate).toLocaleDateString('cs-CZ')}</td>
                                        <td style={{ padding: '0.5rem' }}>{getClientName(inv.clientId)}</td>
                                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{total.toLocaleString('cs-CZ')} K\u010d</td>
                                        <td style={{ padding: '0.5rem', textAlign: 'center', color: inv.paid ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {inv.paid ? '\u2713 Zaplaceno' : 'Nezaplaceno'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
