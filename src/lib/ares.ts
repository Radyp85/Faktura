export interface AresCompany {
    name: string;
    address: string;
    city: string;
    zip: string;
    ico: string;
    dic: string;
}

export async function fetchCompanyByICO(ico: string): Promise<AresCompany> {
    const cleanICO = ico.trim().replace(/\s/g, '');

    if (!/^\d{7,8}$/.test(cleanICO)) {
        throw new Error('IČO musí mít 7-8 číslic.');
    }

    const response = await fetch(
        `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${cleanICO}`,
        {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000)
        }
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Subjekt s IČO ${cleanICO} nebyl nalezen.`);
        }
        throw new Error(`ARES API chyba: ${response.status}`);
    }

    const data = await response.json();

    const sidlo = data.sidlo || {};
    const street = [sidlo.nazevUlice, sidlo.cisloDomovni ? `${sidlo.cisloDomovni}${sidlo.cisloOrientacni ? '/' + sidlo.cisloOrientacni : ''}` : '']
        .filter(Boolean)
        .join(' ');

    return {
        name: data.obchodniJmeno || '',
        address: street || sidlo.textovaAdresa || '',
        city: `${sidlo.psc || ''} ${sidlo.nazevObce || ''}`.trim(),
        zip: sidlo.psc?.toString() || '',
        ico: data.ico?.toString() || cleanICO,
        dic: data.dic || ''
    };
}
