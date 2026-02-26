const {
  calculerRemboursement,
  comparerRemboursements,
  trouverMeilleure,
  listerFormules,
  BASE_SECU,
  TAUX_SECU
} = require('../src/comparator');

const mutuelleA = {
  nom: 'Mutuelle A',
  siren: '000000001',
  formules: {
    'Basique': { pourcentageBR: 100 },
    'Premium': { pourcentageBR: 300 }
  },
  forfaitAnnuel: null,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale'
};

const mutuelleB = {
  nom: 'Mutuelle B',
  siren: '000000002',
  formules: {
    'Standard': { pourcentageBR: 150 },
    'Confort': { pourcentageBR: 500 }
  },
  forfaitAnnuel: null,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale'
};

const mutuelleAvecForfait = {
  nom: 'Mutuelle C',
  siren: '000000003',
  formules: {
    'Unique': { pourcentageBR: 100 }
  },
  forfaitAnnuel: 50,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale'
};

const mutuelleAvecForfaitFormule = {
  nom: 'Mutuelle D',
  siren: '000000004',
  formules: {
    'SansForfait': { pourcentageBR: 100, forfaitAnnuel: 0 },
    'AvecForfait': { pourcentageBR: 100, forfaitAnnuel: 150 }
  },
  forfaitAnnuel: null,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale'
};

describe('calculerRemboursement', () => {
  test('calcule correctement le remboursement sécu (60% de la base)', () => {
    const result = calculerRemboursement(mutuelleA, 'Basique', 150);
    expect(result.remboursementSecu).toBeCloseTo(BASE_SECU * TAUX_SECU, 2);
  });

  test('100% BR = la mutuelle complète jusquà la base, reste à charge = prix - base', () => {
    const result = calculerRemboursement(mutuelleA, 'Basique', 150);
    // 100% BR => total remboursé = 28.86€, part sécu = 17.32€, part mutuelle = 11.54€
    expect(result.remboursementMutuelle).toBeCloseTo(BASE_SECU - BASE_SECU * TAUX_SECU, 2);
    expect(result.resteACharge).toBeCloseTo(150 - BASE_SECU, 2);
  });

  test('300% BR = remboursement total = 3 * base', () => {
    const result = calculerRemboursement(mutuelleA, 'Premium', 150);
    const totalAttendu = BASE_SECU * 3;
    const partMutuelle = totalAttendu - BASE_SECU * TAUX_SECU;
    expect(result.remboursementMutuelle).toBeCloseTo(partMutuelle, 2);
    expect(result.resteACharge).toBeCloseTo(150 - totalAttendu, 2);
  });

  test('le reste à charge ne peut pas être négatif', () => {
    // 500% BR sur un prix bas => le remboursement ne dépasse pas le prix
    const result = calculerRemboursement(mutuelleB, 'Confort', 30);
    expect(result.resteACharge).toBe(0);
  });

  test('la mutuelle ne rembourse pas plus que le reste après sécu', () => {
    const result = calculerRemboursement(mutuelleB, 'Confort', 30);
    const resteApresSecu = 30 - BASE_SECU * TAUX_SECU;
    expect(result.remboursementMutuelle).toBeCloseTo(Math.max(0, resteApresSecu), 2);
  });

  test('inclut le forfait annuel dans le remboursement mutuelle', () => {
    const result = calculerRemboursement(mutuelleAvecForfait, 'Unique', 150);
    const sansF = calculerRemboursement(mutuelleA, 'Basique', 150);
    expect(result.remboursementMutuelle).toBeGreaterThan(sansF.remboursementMutuelle);
  });

  test('utilise le forfait au niveau formule plutôt que mutuelle', () => {
    const avecForfait = calculerRemboursement(mutuelleAvecForfaitFormule, 'AvecForfait', 200);
    const sansForfait = calculerRemboursement(mutuelleAvecForfaitFormule, 'SansForfait', 200);
    // AvecForfait: 100% BR (28.86) + 150€ forfait vs SansForfait: 100% BR (28.86) + 0€
    expect(avecForfait.remboursementMutuelle).toBeGreaterThan(sansForfait.remboursementMutuelle);
    expect(sansForfait.remboursementMutuelle).toBeCloseTo(BASE_SECU - BASE_SECU * TAUX_SECU, 2);
  });

  test('retourne les métadonnées de la mutuelle', () => {
    const result = calculerRemboursement(mutuelleA, 'Premium', 150);
    expect(result.nom).toBe('Mutuelle A');
    expect(result.formule).toBe('Premium');
    expect(result.pourcentageBR).toBe(300);
    expect(result.frequence).toBe('1 paire par an');
    expect(result.conditions).toBe('Sur prescription médicale');
  });

  test('lance une erreur si la formule nexiste pas', () => {
    expect(() => calculerRemboursement(mutuelleA, 'Inexistante', 150))
      .toThrow('Formule "Inexistante" introuvable');
  });
});

describe('comparerRemboursements', () => {
  test('trie par reste à charge croissant', () => {
    const resultats = comparerRemboursements([mutuelleA, mutuelleB], 150);
    for (let i = 1; i < resultats.length; i++) {
      expect(resultats[i].resteACharge).toBeGreaterThanOrEqual(resultats[i - 1].resteACharge);
    }
  });

  test('retourne une entrée par formule de chaque mutuelle', () => {
    const resultats = comparerRemboursements([mutuelleA, mutuelleB], 150);
    // mutuelleA a 2 formules, mutuelleB a 2 formules => 4 résultats
    expect(resultats).toHaveLength(4);
  });

  test('peut filtrer par nom de formule', () => {
    const resultats = comparerRemboursements([mutuelleA], 150, 'Premium');
    expect(resultats).toHaveLength(1);
    expect(resultats[0].formule).toBe('Premium');
  });
});

describe('trouverMeilleure', () => {
  test('retourne la formule avec le meilleur remboursement', () => {
    const meilleure = trouverMeilleure([mutuelleA, mutuelleB], 150);
    expect(meilleure.nom).toBe('Mutuelle B');
    expect(meilleure.formule).toBe('Confort');
  });

  test('retourne null si aucune mutuelle', () => {
    const meilleure = trouverMeilleure([], 150);
    expect(meilleure).toBeNull();
  });
});

describe('listerFormules', () => {
  test('retourne les noms des formules', () => {
    const formules = listerFormules(mutuelleA);
    expect(formules).toEqual(['Basique', 'Premium']);
  });
});
