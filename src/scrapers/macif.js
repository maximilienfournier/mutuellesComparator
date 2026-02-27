const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les PDFs officiels Apivia Macif Mutuelle (février 2026).
 * Gamme actuelle : Vitamin 3, 5 formules (en vigueur au 01/01/2023).
 * Ligne de garantie : "Matériel médical : Prothèses orthopédiques, capillaires,
 * mammaires, tout appareillage, hors auditif et optique".
 *
 * Sources :
 * - Plaquette Apivia Vitamin' (ancienne gamme, 2019) :
 *   https://www.aquaverde-assurance.fr/wp-content/uploads/2024/10/plaquette_apivia_vitamin.pdf
 * - Annexe conditions générales Vitamin 3 (en vigueur 01/01/2023) :
 *   https://www.mutuelle-senior.com/wp-content/uploads/2023/03/tableau-garantie-apivia-vitamin3-.pdf
 *
 * Les deux tableaux concordent parfaitement pour les niveaux 1 à 5.
 * SIREN : 779558501 (Apivia Macif Mutuelle, confirmé dans le PDF Vitamin 3).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Macif (Apivia)',
    siren: '779558501',
    formules: {
      'Vitamin V1': { pourcentageBR: 100 },
      'Vitamin V2': { pourcentageBR: 125, forfaitPodologie: { montantAnnuel: 40, montantParSeance: 20, nbSeancesMax: 2, enveloppePartagee: 'médecines douces' } },
      'Vitamin V3': { pourcentageBR: 150, forfaitPodologie: { montantAnnuel: 75, montantParSeance: 25, nbSeancesMax: 3, enveloppePartagee: 'médecines douces' } },
      'Vitamin V4': { pourcentageBR: 175, forfaitPodologie: { montantAnnuel: 120, montantParSeance: 30, nbSeancesMax: 4, enveloppePartagee: 'médecines douces' } },
      'Vitamin V5': { pourcentageBR: 200, forfaitPodologie: { montantAnnuel: 175, montantParSeance: 35, nbSeancesMax: 5, enveloppePartagee: 'médecines douces' } }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
