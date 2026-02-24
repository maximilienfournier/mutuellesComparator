const { formaterResultat, formaterResultats } = require('../src/formatter');

const exempleResultat = {
  nom: 'Mutuelle Test',
  prixSemelles: 150,
  remboursementSecu: 17.32,
  remboursementMutuelle: 120,
  resteACharge: 12.68,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale'
};

describe('formaterResultat', () => {
  test('contient le nom de la mutuelle', () => {
    const result = formaterResultat(exempleResultat);
    expect(result).toContain('Mutuelle Test');
  });

  test('contient le reste à charge', () => {
    const result = formaterResultat(exempleResultat);
    expect(result).toContain('12.68');
  });
});

describe('formaterResultats', () => {
  test('affiche un message si aucune mutuelle', () => {
    expect(formaterResultats([])).toBe('Aucune mutuelle à comparer.');
  });

  test('affiche la meilleure option', () => {
    const result = formaterResultats([exempleResultat]);
    expect(result).toContain('Meilleure option');
    expect(result).toContain('Mutuelle Test');
  });
});
