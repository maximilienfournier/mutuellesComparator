const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les PDFs officiels CNP Assurances / La Mutuelle Générale (février 2026).
 * Produit principal : Itineo santé DYNAMISME, 4 formules (en vigueur au 01/01/2025).
 * Ligne de garantie : "Petit appareillage pris en charge par la Sécurité sociale"
 * Section : MATERIEL MEDICAL, page 3 du PDF.
 *
 * Sources :
 * - Itineo Eco (100% BR) : PDF Itineo Dynamisme 2025, p.3 — donnée lue directement
 *   https://www.lamutuellegenerale.fr/sites/www.lamutuellegenerale.fr/files/2024/12/13/cnp_tableau-de-garanties_itineo-sante-dynamisme_2025.pdf
 * - Itineo Essentiel (100% BR) : PDF Itineo Dynamisme 2025, p.3 — donnée lue directement
 *   https://www.lamutuellegenerale.fr/sites/www.lamutuellegenerale.fr/files/2024/12/13/cnp_tableau-de-garanties_itineo-sante-dynamisme_2025.pdf
 * - Itineo Renfort (100% BR) : PDF Itineo Dynamisme 2025, p.3 — donnée lue directement
 *   https://www.lamutuellegenerale.fr/sites/www.lamutuellegenerale.fr/files/2024/12/13/cnp_tableau-de-garanties_itineo-sante-dynamisme_2025.pdf
 * - Itineo Exigence (115% BR) : PDF Itineo Dynamisme 2025, p.3 — donnée lue directement
 *   https://www.lamutuellegenerale.fr/sites/www.lamutuellegenerale.fr/files/2024/12/13/cnp_tableau-de-garanties_itineo-sante-dynamisme_2025.pdf
 *
 * Vérification croisée avec Itineo santé TRIBU (même grille sauf Renfort=115% BR en Tribu) :
 *   https://www.lamutuellegenerale.fr/sites/www.lamutuellegenerale.fr/files/2024/12/13/cnp_tableau-de-garanties_itineo-sante-tribu_2025.pdf
 *
 * Note : les estimations initiales surestimaient largement les taux (200-300% BR).
 * En réalité, le max est 115% BR pour la formule Exigence.
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'La Mutuelle Générale',
    siren: '775685340',
    formules: {
      'Itineo Eco': { pourcentageBR: 100 },
      'Itineo Essentiel': { pourcentageBR: 100 },
      'Itineo Renfort': { pourcentageBR: 100 },
      'Itineo Exigence': { pourcentageBR: 115 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
