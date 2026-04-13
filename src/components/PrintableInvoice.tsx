import type { Invoice, Client } from '../types';
import { SUPPLIER, BANK_ACCOUNTS } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import signatureImg from '../assets/signature.png';

interface InternalProps {
    invoice: Invoice;
    client?: Client;
}

export function PrintableInvoice({ invoice, client }: InternalProps) {
    const bankAccount = BANK_ACCOUNTS.find(b => b.id === invoice.bankAccount) || BANK_ACCOUNTS[0];
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
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Faktura č. {invoice.number}</h1>
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
                    <div style={{ marginTop: '0.5rem' }}>IČO: {SUPPLIER.ico}</div>
                    <div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>{SUPPLIER.note}</div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85em' }}>
                        <div>Kontakt:</div>
                        <div>Telefon: {SUPPLIER.phone}</div>
                        <div>Email: {SUPPLIER.email}</div>
                    </div>
                </div>

                {/* Customer */}
                <div>
                    <h2 style={{ fontSize: '0.9rem', borderBottom: '1px solid black', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>Odběratel</h2>
                    {client ? (
                        <>
                            <div style={{ fontWeight: 'bold' }}>{client.name}</div>
                            <div>{client.address}</div>
                            <div>{client.city}</div>
                            <div>{client.country}</div>
                            <div style={{ marginTop: '0.5rem' }}>
                                IČO: {client.ico}<br />
                                DIČ: {client.dic}
                            </div>
                        </>
                    ) : (
                        <div>(Není vybrán odběratel)</div>
                    )}
                </div>
            </div>

            {/* Payment Details */}
            <div style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '1rem 0', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>Způsob platby: Bankovní převod</div>
                    <div>Datum vystavení: {formatDate(invoice.issueDate)}</div>
                    <div>Datum splatnosti: {formatDate(invoice.dueDate)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>Číslo účtu: {bankAccount.number}</div>
                    <div>Variabilní symbol: {invoice.number}</div>
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
                Fakturuji vám dle dohody:
            </div>

            {/* Items */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid black' }}>
                        <th style={{ textAlign: 'left', padding: '0.25rem' }}>Popis</th>
                        <th style={{ textAlign: 'right', padding: '0.25rem' }}>Množství</th>
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
                                {(item.quantity * item.unitPrice).toLocaleString('cs-CZ', { minimumFractionDigits: 2 })} Kč
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Total */}
            <div style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1rem' }}>
                Celkem k úhradě: {total.toLocaleString('cs-CZ', { minimumFractionDigits: 2 })} Kč
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
