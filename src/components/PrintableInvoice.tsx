import type { Invoice, Client, BankAccount } from '../types';
import { SUPPLIER } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import signatureImg from '../assets/signature.png';

interface InternalProps {
    invoice: Invoice;
    client?: Client;
    bankAccounts?: BankAccount[];
}

export function PrintableInvoice({ invoice, client, bankAccounts = [] }: InternalProps) {
    const bankAccount = bankAccounts.find(b => b.id === invoice.bankAccount) || bankAccounts[0] || { id: '', label: '', number: '', bank: '', iban: '' };
    const total = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Format date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}.${m}.${y}`;
    };

    // Generate SPAYD String for QR Code
    const generateSpayd = () => {
        if (!bankAccount.iban) return '';
        const amount = total.toFixed(2);
        const message = `Faktura ${invoice.number}`;
        return `SPD*1.0*ACC:${bankAccount.iban}*AM:${amount}*CC:CZK*MSG:${message}*X-VS:${invoice.number}`;
    };

    return (
        <div className="printable-container" style={{
            fontFamily: 'serif',
            padding: '40px',
            color: 'black',
            background: 'white',
            minHeight: '100vh',
            display: 'none',
            fontSize: '0.75rem'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Faktura \u010d. {invoice.number}</h1>
                {/* Note moved from here */}
            </div>

            {/* Addresses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '2rem' }}>
                {/* Supplier */}
                <div>
                    <h2 style={{ fontSize: '0.9rem', borderBottom: '1px solid black', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>Dodavatel</h2>
                    <div style={{ fontWeight: 'bold' }}>{SUPPLIER.name}</div>
                    <div>{SUPPLIER.address}</div>
                    <div>{SUPPLIER.city}</div>
                    <div>{SUPPLIER.country}</div>
                    <div style={{ marginTop: '0.5rem' }}>I\u010cO: {SUPPLIER.ico}</div>
                    <div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>{SUPPLIER.note}</div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85em' }}>
                        <div>Kontakt:</div>
                        <div>Telefon: {SUPPLIER.phone}</div>
                        <div>Email: {SUPPLIER.email}</div>
                    </div>
                </div>

                {/* Customer */}
                <div>
                    <h2 style={{ fontSize: '0.9rem', borderBottom: '1px solid black', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>Odb\u011bratel</h2>
                    {client ? (
                        <>
                            <div style={{ fontWeight: 'bold' }}>{client.name}</div>
                            <div>{client.address}</div>
                            <div>{client.city}</div>
                            <div>{client.country}</div>
                            <div style={{ marginTop: '0.5rem' }}>
                                I\u010cO: {client.ico}<br />
                                DI\u010c: {client.dic}
                            </div>
                        </>
                    ) : (
                        <div>(Nen\u00ed vybr\u00e1n odb\u011bratel)</div>
                    )}
                </div>
            </div>

            {/* Payment Details */}
            <div style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '1rem 0', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>Zp\u016fsob platby: Bankovn\u00ed p\u0159evod</div>
                    <div>Datum vystaven\u00ed: {formatDate(invoice.issueDate)}</div>
                    <div>Datum splatnosti: {formatDate(invoice.dueDate)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>\u010c\u00edslo \u00fa\u010dtu: {bankAccount.number}</div>
                    <div>Variabiln\u00ed symbol: {invoice.number}</div>
                </div>
                <div style={{ width: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Real QR Code */}
                    {bankAccount.iban ? (
                        <QRCodeSVG value={generateSpayd()} size={100} level="M" />
                    ) : (
                        <div style={{ width: '100px', height: '100px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            No IBAN
                        </div>
                    )}
                    <span style={{ fontSize: '0.6rem', textAlign: 'center', marginTop: '0.25rem' }}>QR Platba</span>
                </div>
            </div>

            {/* Intro Text */}
            <div style={{ marginBottom: '1rem' }}>
                Fakturuji v\u00e1m dle dohody:
            </div>

            {/* Items */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid black' }}>
                        <th style={{ textAlign: 'left', padding: '0.25rem' }}>Popis</th>
                        <th style={{ textAlign: 'right', padding: '0.25rem' }}>Mno\u017estv\u00ed</th>
                        <th style={{ textAlign: 'right', padding: '0.25rem' }}>Cena za mj.</th>
                        <th style={{ textAlign: 'right', padding: '0.25rem' }}>Celkem</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '0.25rem' }}>{item.description}</td>
                            <td style={{ textAlign: 'right', padding: '0.25rem' }}>{item.quantity} {item.unit}</td>
                            <td style={{ textAlign: 'right', padding: '0.25rem' }}>{item.unitPrice.toLocaleString('cs-CZ', { minimumFractionDigits: 2 })}</td>
                            <td style={{ textAlign: 'right', padding: '0.25rem' }}>
                                {(item.quantity * item.unitPrice).toLocaleString('cs-CZ', { minimumFractionDigits: 2 })} K\u010d
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Total */}
            <div style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1rem' }}>
                Celkem k \u00fahrad\u011b: {total.toLocaleString('cs-CZ', { minimumFractionDigits: 2 })} K\u010d
            </div>

            {/* Footer: Signature only */}
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', paddingRight: '2rem' }}>
                {/* Signature */}
                <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: '150px' }}>
                    <img src={signatureImg} alt="Podpis" style={{ height: '200px', marginBottom: '-60px', zIndex: 1 }} />
                    <div style={{ borderTop: '1px solid black', width: '100%', textAlign: 'center', paddingTop: '0.5rem', fontSize: '0.8rem' }}>
                        Podpis
                    </div>
                </div>
            </div>

            {/* Footer / Style Override */}
            <style>{`
        @media print {
          body {
            visibility: hidden;
            background: white;
          }
          .printable-container {
            visibility: visible;
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 1.5cm !important;
            background: white;
            color: black;
          }
          .no-print, .btn, header {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
}
