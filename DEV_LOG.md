# Vývojový Log - Fakturační Aplikace

Tento dokument slouží jako záznam o vývoji aplikace, použitých technologiích a postupu prací. Slouží pro snadné navázání na projekt v budoucnu.

## 📋 Přehled Projektu
**Cíl:** Vytvořit jednoduchou webovou aplikaci pro generování faktur pro neplátce DPH s možností tisku do PDF.
**Datum vytvoření:** 2. 2. 2026

## 🛠 Použité Technologie
- **Frontend Framework:** React 18+ (s TypeScriptem)
- **Build Tool:** Vite
- **Stylování:** Vanilla CSS (CSS Variables, Flexbox, Grid) + Google Fonts (Inter, Dancing Script)
- **Ikony:** Lucide React
- **QR Kódy:** `qrcode.react` (Generování SPAYD řetězců pro bankovní platby)
- **Ukládání dat:** `localStorage` (Data jsou uložena pouze v prohlížeči uživatele)

## 🚀 Klíčové Funkce
1. **Správa Klientů:** Přidávání, editace a mazání odběratelů. Data se ukládají.
2. **Generátor Faktur:**
   - Automatické předvyplnění čísla faktury a datumu.
   - Výběr bankovního účtu (Osobní / Společný) s automatickým doplněním IBAN.
   - Výpočet celkové ceny.
3. **Tisková Sestava (PDF):**
   - Skryté prvky rozhraní při tisku (`@media print`).
   - Profesionální vzhled na A4.
   - **QR Platba:** Automaticky generovaný QR kód dle standardu SPAYD.
   - **Podpis:** Vložený obrázek podpisu.

## 📅 Historie Změn

### Fáze 1: Plánování a Setup
- Vytvořen plán implementace.
- Inicializace projektu přes `npm create vite@latest`.
- Nastavení základních CSS stylů pro "clean look".

### Fáze 2: Implementace Jádra
- Vytvořeny TypeScript definice (`types.ts`) pro Klienty a Faktury.
- Implementována vrstva pro ukládání dat (`storage.ts`) využívající LocalStorage.
- Vytvořen `ClientManager` pro správu adresáře.

### Fáze 3: Fakturace a Tisk
- Vytvořen `InvoiceEditor` pro zadávání dat.
- Vytvořena komponenta `PrintableInvoice` pro tiskový náhled.
- Napojení na reálná data (Medi Evolution s.r.o. jako první klient).

### Fáze 4: Ladění a Design
- **QR Kód:** Implementace knihovny `qrcode.react` a oprava formátu IBAN pro správné načtení bankovní aplikací.
- **Design:**
  - Zmenšení písma v tisku o 30% pro elegantnější vzhled.
  - Skrytí hlaviček a patiček prohlížeče pomocí `@page { margin: 0 }`.
  - Přidání podpisu (obrázek) a jeho zvětšení/pozicování na linku.
  - Přidání kontaktních údajů (telefon, email) do hlavičky faktury.
  - *Pokus o "vtipný text" v patičce (následně na přání odstraněn).*

## 💡 Nápady pro budoucí rozvoj
- [ ] Export/Import dat (záloha JSON souboru).
- [x] Historie vystavených faktur (seznam).
- [x] Automatické navyšování čísla faktury dle poslední vystavené.
- [ ] Podpora pro více dodavatelů (pokud byste chtěl fakturovat na jiné IČO).
- [ ] Odeslání faktury emailem přímo z aplikace (vyžaduje backend).

---
*Vygenerováno AI asistentem (Antigravity)*
