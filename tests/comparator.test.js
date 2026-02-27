const {
  calculerRemboursement,
  calculerRemboursementBilan,
  simulerDeuxFactures,
  optimiserRepartition,
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

// Mutuelles avec forfait podologie pour les tests
const mutuelleAvecPodo = {
  nom: 'Mutuelle Podo',
  siren: '000000010',
  formules: {
    'Standard': {
      pourcentageBR: 200,
      forfaitPodologie: {
        montantAnnuel: 160,
        montantParSeance: 40,
        nbSeancesMax: null,
        enveloppePartagee: 'médecines douces'
      }
    },
    'SansPodo': { pourcentageBR: 100 }
  },
  forfaitAnnuel: null,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale'
};

const mutuelleAvecPodoSeances = {
  nom: 'Mutuelle Séances',
  siren: '000000011',
  formules: {
    'Blue': {
      pourcentageBR: 400,
      forfaitPodologie: {
        montantAnnuel: null,
        montantParSeance: 70,
        nbSeancesMax: 5,
        enveloppePartagee: 'médecines douces'
      }
    }
  },
  forfaitAnnuel: null,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale'
};

const mutuelleAvecPodoDedié = {
  nom: 'Mutuelle Dédiée',
  siren: '000000012',
  formules: {
    'Top': {
      pourcentageBR: 100,
      forfaitAnnuel: 200,
      forfaitPodologie: {
        montantAnnuel: 35,
        montantParSeance: null,
        nbSeancesMax: null,
        enveloppePartagee: null
      }
    }
  },
  forfaitAnnuel: null,
  frequence: '1 paire par an',
  conditions: 'Sur prescription médicale'
};

describe('calculerRemboursementBilan', () => {
  test('rembourse le bilan plafonné par séance (MGEN-like)', () => {
    const result = calculerRemboursementBilan(mutuelleAvecPodo, 'Standard', 60);
    // plafond par séance = 40€, bilan = 60€ => remboursé 40€
    expect(result.remboursementPodologie).toBe(40);
    expect(result.resteACharge).toBe(20);
    expect(result.forfaitDisponible).toBe(true);
  });

  test('rembourse le bilan plafonné par montant annuel', () => {
    const result = calculerRemboursementBilan(mutuelleAvecPodoDedié, 'Top', 60);
    // plafond annuel = 35€, bilan = 60€ => remboursé 35€
    expect(result.remboursementPodologie).toBe(35);
    expect(result.resteACharge).toBe(25);
  });

  test('rembourse intégralement si bilan < plafonds', () => {
    const result = calculerRemboursementBilan(mutuelleAvecPodoSeances, 'Blue', 50);
    // plafond par séance = 70€, bilan = 50€ => remboursé 50€
    expect(result.remboursementPodologie).toBe(50);
    expect(result.resteACharge).toBe(0);
  });

  test('retourne 0 si pas de forfait podologie', () => {
    const result = calculerRemboursementBilan(mutuelleAvecPodo, 'SansPodo', 60);
    expect(result.remboursementPodologie).toBe(0);
    expect(result.resteACharge).toBe(60);
    expect(result.forfaitDisponible).toBe(false);
  });

  test('retourne 0 si pas de forfait podologie (mutuelle sans champ)', () => {
    const result = calculerRemboursementBilan(mutuelleA, 'Basique', 60);
    expect(result.remboursementPodologie).toBe(0);
    expect(result.forfaitDisponible).toBe(false);
  });
});

describe('simulerDeuxFactures', () => {
  test('deux factures réduisent le RAC quand forfait podo disponible', () => {
    const result = simulerDeuxFactures(mutuelleAvecPodo, 'Standard', 125, 60);
    // Facture unique 185€: sécu 17.32 + mutuelle(200%BR) 40.40 => RAC 127.28
    // Deux factures: semelles 125€ RAC ~67.28 + bilan 60€ remb 40€ RAC 20 => total 87.28
    expect(result.gain).toBeGreaterThan(0);
    expect(result.deuxFactures.resteACharge).toBeLessThan(result.factureUnique.resteACharge);
    expect(result.forfaitPodologieDisponible).toBe(true);
  });

  test('gain = 0 quand pas de forfait podologie', () => {
    const result = simulerDeuxFactures(mutuelleAvecPodo, 'SansPodo', 125, 60);
    // Sans forfait podo, le bilan n'est pas remboursé => RAC identique
    expect(result.gain).toBe(0);
    expect(result.forfaitPodologieDisponible).toBe(false);
  });

  test('prixTotal = prixSemelles + prixBilan', () => {
    const result = simulerDeuxFactures(mutuelleAvecPodo, 'Standard', 125, 60);
    expect(result.prixTotal).toBe(185);
  });

  test('simulation avec forfait dédié (Harmonie-like)', () => {
    const result = simulerDeuxFactures(mutuelleAvecPodoDedié, 'Top', 125, 60);
    // Facture unique 185€: sécu 17.32 + mutuelle(100%BR=28.86-17.32=11.54 + forfait 200) = 167.68 => RAC 0
    // Deux factures: semelles 125€ => 17.32 + 107.68(plafonné) => RAC 0 ; bilan 60€ => remb 35 => RAC 25
    // Gain négatif car la facture unique couvre déjà tout
    expect(result.factureUnique.resteACharge).toBe(0);
    expect(result.deuxFactures.resteACharge).toBeGreaterThanOrEqual(0);
  });
});

describe('optimiserRepartition', () => {
  test('retourne optimisationPossible=false sans forfait podologie', () => {
    const result = optimiserRepartition(mutuelleA, 'Basique', 185);
    expect(result.optimisationPossible).toBe(false);
    expect(result.meilleureSolution).toBe('unique');
    expect(result.repartitionOptimale).toBeNull();
    expect(result.gain).toBe(0);
  });

  test('trouve une répartition avec gain quand forfait podo disponible', () => {
    const result = optimiserRepartition(mutuelleAvecPodo, 'Standard', 185);
    // Avec forfait podo (40€/séance, 160€/an), séparer est avantageux
    expect(result.optimisationPossible).toBe(true);
    expect(result.gain).toBeGreaterThan(0);
    expect(result.meilleureSolution).toBe('deuxFactures');
    expect(result.repartitionOptimale).not.toBeNull();
    expect(result.repartitionOptimale.prixBilan).toBeGreaterThan(0);
    expect(result.repartitionOptimale.prixSemelles).toBeLessThan(185);
    expect(result.repartitionOptimale.prixBilan + result.repartitionOptimale.prixSemelles).toBe(185);
  });

  test('le RAC optimisé est inférieur ou égal au RAC facture unique', () => {
    const result = optimiserRepartition(mutuelleAvecPodo, 'Standard', 185);
    expect(result.repartitionOptimale.resteACharge).toBeLessThanOrEqual(result.factureUnique.resteACharge);
  });

  test('le bilan optimal est plafonné par le montant par séance', () => {
    const result = optimiserRepartition(mutuelleAvecPodo, 'Standard', 185);
    // montantParSeance = 40€ => au-delà de 40€ de bilan, le RAC bilan augmente
    // Le bilan optimal devrait être autour de 40€
    expect(result.repartitionOptimale.prixBilan).toBe(40);
  });

  test('optimisation avec forfait annuel uniquement', () => {
    const result = optimiserRepartition(mutuelleAvecPodoDedié, 'Top', 185);
    // forfaitAnnuel formule = 200€, forfaitPodologie.montantAnnuel = 35€
    // Facture unique couvre déjà tout (100%BR + 200€ forfait) => pas d'intérêt à séparer
    // La facture unique RAC = 0, donc pas de gain possible
    expect(result.factureUnique.resteACharge).toBe(0);
    expect(result.gain).toBe(0);
  });

  test('formule sans forfait podo dans mutuelle qui en a une autre', () => {
    const result = optimiserRepartition(mutuelleAvecPodo, 'SansPodo', 185);
    expect(result.optimisationPossible).toBe(false);
    expect(result.gain).toBe(0);
  });

  test('lance une erreur si formule inexistante', () => {
    expect(() => optimiserRepartition(mutuelleA, 'Inexistante', 185))
      .toThrow('Formule "Inexistante" introuvable');
  });

  test('prixTotal correct dans le résultat', () => {
    const result = optimiserRepartition(mutuelleAvecPodo, 'Standard', 200);
    expect(result.prixTotal).toBe(200);
  });

  test('détail semelles et bilan présents dans la répartition optimale', () => {
    const result = optimiserRepartition(mutuelleAvecPodo, 'Standard', 185);
    expect(result.repartitionOptimale.semelles).toBeDefined();
    expect(result.repartitionOptimale.semelles.resteACharge).toBeDefined();
    expect(result.repartitionOptimale.semelles.remboursementSecu).toBeDefined();
    expect(result.repartitionOptimale.semelles.remboursementMutuelle).toBeDefined();
    expect(result.repartitionOptimale.bilan).toBeDefined();
    expect(result.repartitionOptimale.bilan.resteACharge).toBeDefined();
    expect(result.repartitionOptimale.bilan.remboursementPodologie).toBeDefined();
  });
});
