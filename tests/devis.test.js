const { genererDevisHTML, escapeHtml, formatEuros } = require('../src/devis');

describe('escapeHtml', () => {
  test('echappe les caracteres HTML', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  test('retourne une chaine vide pour null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('formatEuros', () => {
  test('formate les montants en euros', () => {
    expect(formatEuros(28.86)).toBe('28.86 &euro;');
    expect(formatEuros(0)).toBe('0.00 &euro;');
    expect(formatEuros(150)).toBe('150.00 &euro;');
  });
});

describe('genererDevisHTML', () => {
  const calcul = {
    nom: 'MGEN',
    formule: 'Reference',
    pourcentageBR: 230,
    prixSemelles: 150,
    remboursementSecu: 17.32,
    remboursementMutuelle: 49.06,
    resteACharge: 83.62,
    frequence: '1 paire par an',
    conditions: 'Sur prescription medicale',
    forfait: 0
  };

  test('genere du HTML valide', () => {
    const html = genererDevisHTML({ calcul, patient: 'Dupont', podologue: 'Dr Martin', date: '26/02/2026' });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  test('contient les informations du devis', () => {
    const html = genererDevisHTML({ calcul, patient: 'Dupont', podologue: 'Dr Martin', date: '26/02/2026' });
    expect(html).toContain('Dupont');
    expect(html).toContain('Dr Martin');
    expect(html).toContain('MGEN');
    expect(html).toContain('Reference');
    expect(html).toContain('150.00');
    expect(html).toContain('17.32');
    expect(html).toContain('83.62');
  });

  test('contient la date', () => {
    const html = genererDevisHTML({ calcul, patient: 'Test', podologue: 'Test', date: '01/01/2026' });
    expect(html).toContain('01/01/2026');
  });

  test('echappe les caracteres HTML dans les noms', () => {
    const html = genererDevisHTML({ calcul, patient: '<script>alert(1)</script>', podologue: 'Dr "Test"' });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  test('contient la mention legale', () => {
    const html = genererDevisHTML({ calcul, patient: 'Test', podologue: 'Test' });
    expect(html).toContain('indicatif');
    expect(html).toContain('28.86');
  });

  test('affiche le forfait si present', () => {
    const calculAvecForfait = { ...calcul, forfait: 100 };
    const html = genererDevisHTML({ calcul: calculAvecForfait, patient: 'Test', podologue: 'Test' });
    expect(html).toContain('forfait');
    expect(html).toContain('100.00');
  });

  test('gere les valeurs manquantes', () => {
    const html = genererDevisHTML({ calcul });
    expect(html).toContain('Non renseigne');
  });
});
