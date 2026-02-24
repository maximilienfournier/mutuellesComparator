const { calculerRemboursement, comparerRemboursements, trouverMeilleure } = require('../src/comparator');

const mutuelleA = {
  nom: 'Mutuelle A',
  remboursementMax: 120,
  pourcentage: 100,
  plafondAnnuel: 240,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale',
  baseSecu: 28.86
};

const mutuelleB = {
  nom: 'Mutuelle B',
  remboursementMax: 80,
  pourcentage: 75,
  plafondAnnuel: 160,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale',
  baseSecu: 28.86
};

describe('calculerRemboursement', () => {
  test('calcule correctement le remboursement sécu', () => {
    const result = calculerRemboursement(mutuelleA, 150);
    expect(result.remboursementSecu).toBeCloseTo(17.32, 2);
  });

  test('calcule le reste à charge', () => {
    const result = calculerRemboursement(mutuelleA, 150);
    expect(result.resteACharge).toBeGreaterThanOrEqual(0);
  });

  test('le remboursement mutuelle ne dépasse pas le max', () => {
    const result = calculerRemboursement(mutuelleA, 500);
    expect(result.remboursementMutuelle).toBeLessThanOrEqual(mutuelleA.remboursementMax);
  });

  test('retourne les métadonnées de la mutuelle', () => {
    const result = calculerRemboursement(mutuelleA, 150);
    expect(result.nom).toBe('Mutuelle A');
    expect(result.frequence).toBe('1 paire par an');
    expect(result.conditions).toBe('Sur prescription médicale');
  });
});

describe('comparerRemboursements', () => {
  test('trie par reste à charge croissant', () => {
    const resultats = comparerRemboursements([mutuelleA, mutuelleB], 150);
    expect(resultats[0].resteACharge).toBeLessThanOrEqual(resultats[1].resteACharge);
  });

  test('retourne un résultat par mutuelle', () => {
    const resultats = comparerRemboursements([mutuelleA, mutuelleB], 150);
    expect(resultats).toHaveLength(2);
  });
});

describe('trouverMeilleure', () => {
  test('retourne la mutuelle avec le meilleur remboursement', () => {
    const meilleure = trouverMeilleure([mutuelleA, mutuelleB], 150);
    expect(meilleure.nom).toBe('Mutuelle A');
  });

  test('retourne null si aucune mutuelle', () => {
    const meilleure = trouverMeilleure([], 150);
    expect(meilleure).toBeNull();
  });
});
