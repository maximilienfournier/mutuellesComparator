const { formaterResultat, formaterResultats } = require('../src/formatter');

const exempleResultat = {
  nom: 'Mutuelle Test',
  formule: 'Premium',
  pourcentageBR: 300,
  prixSemelles: 150,
  remboursementSecu: 17.32,
  remboursementMutuelle: 69.26,
  resteACharge: 63.42,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale'
};

describe('formaterResultat', () => {
  test('contient le nom de la mutuelle et la formule', () => {
    const result = formaterResultat(exempleResultat);
    expect(result).toContain('Mutuelle Test');
    expect(result).toContain('Premium');
  });

  test('contient le pourcentage BR', () => {
    const result = formaterResultat(exempleResultat);
    expect(result).toContain('300% BR');
  });

  test('contient le reste à charge', () => {
    const result = formaterResultat(exempleResultat);
    expect(result).toContain('63.42');
  });
});

describe('formaterResultats', () => {
  test('affiche un message si aucune mutuelle', () => {
    expect(formaterResultats([])).toBe('Aucune mutuelle à comparer.');
  });

  test('affiche la meilleure option avec formule', () => {
    const result = formaterResultats([exempleResultat]);
    expect(result).toContain('Meilleure option');
    expect(result).toContain('Mutuelle Test');
    expect(result).toContain('Premium');
  });
});
