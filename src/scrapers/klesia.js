const { buildScrapedEntry } = require('./utils');

/**
 * Donnees verifiees depuis le PDF officiel Ma Sante KLESIA Mut' (MKM) 2023.
 * Contrat individuel, 4 formules, date d'effet 01/07/2023.
 * Format hybride : %BR + forfait annuel par beneficiaire pour le materiel medical.
 *
 * Source principale :
 * - Grille de garanties Ma Sante KLESIA Mut' (MKM) 2023, page 1 :
 *   https://www.klesiamut.fr/sites/klesiamut/files/media/documents/2024/01/GRILLE_GARANTIE_MA_SANTE_KLESIA_MUT_V01072023.pdf
 *
 * Sources complementaires (confirment le pattern %BR + forfait) :
 * - Klesia Sante Kle (KSK) 2025 — Formules 1-2-3 et 2-3-4 :
 *   https://www.klesiamut.fr/sites/klesiamut/files/media/documents/2025/03/140-403_25-tg-formules-ksk.pdf
 * - Klesia Pro Sante — Tableau des garanties (7 niveaux, TNS) :
 *   https://www.klesia.fr/sites/default/files/media/documents/2022/08/TNS%20044_19-2%20Klesia%20Pro%20Sant%C3%A9%20Tableau%20des%20garanties%20.pdf
 *
 * Ligne de garantie (PDF MKM p.1, section "MATERIEL MEDICAL INSCRIT A LA LISTE
 * DES PRODUITS ET PRESTATIONS (LPP)") :
 * "Materiel medical rembourse par la Securite Sociale (hors aide auditive et
 * prothese dentaire) - Attelles, lits medicaux, accessoires..."
 *
 * Resultats lus directement dans le PDF :
 * - Essentiel : 100% BR (pas de forfait)
 * - Equilibre : 150% BR + 100 EUR par an et par beneficiaire
 * - Confort : 200% BR + 150 EUR par an et par beneficiaire
 * - Premium : 300% BR + 300 EUR par an et par beneficiaire
 *
 * Note : le forfait complementaire est un forfait annuel global pour tout le
 * materiel medical LPP (pas uniquement les semelles orthopediques).
 *
 * SIREN : 529168007 (confirme en pied de page du PDF MKM).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Klesia',
    siren: '529168007',
    formules: {
      'Essentiel': { pourcentageBR: 100, forfaitAnnuel: 0 },
      'Équilibre': { pourcentageBR: 150, forfaitAnnuel: 100 },
      'Confort': { pourcentageBR: 200, forfaitAnnuel: 150 },
      'Premium': { pourcentageBR: 300, forfaitAnnuel: 300 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.95
  });
}

module.exports = { getVerifiedData };
