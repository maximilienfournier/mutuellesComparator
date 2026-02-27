const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis le PDF officiel Viasante / AG2R La Mondiale (février 2026).
 * Source : « Grille de garanties PROTECVIA » — Viasante Mutuelle (DDE 06/2025, réf. AGI-20250211)
 * https://www.viasante.fr/app/uploads/2025/06/GARANTIE-PROTECVIA.pdf
 *
 * Ligne de garantie : « Autres prothèses et appareillages » dans la section MATÉRIEL MÉDICAL.
 * 5 indices confirmés (30, 45, 60, 90, 120) — chacun sur 2 pages du PDF.
 *
 * Sources par formule :
 * - Indice 30 : PDF p.1, « Autres prothèses et appareillages » = 100% — lue directement
 * - Indice 45 : PDF p.3, « Autres prothèses et appareillages » = 125% — lue directement
 * - Indice 60 : PDF p.5, « Autres prothèses et appareillages » = 150% — lue directement
 * - Indice 90 : PDF p.7, « Autres prothèses et appareillages » = 200% — lue directement
 * - Indice 120 : PDF p.9, « Autres prothèses et appareillages » = 250% — lue directement
 *
 * Note : Indice 20 absent du PDF (pas de fiche garantie Indice 20).
 * SIREN : 486197757 (AG2R La Mondiale), distribué via Viasante Mutuelle (SIREN 777927120).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'AG2R La Mondiale',
    siren: '486197757',
    formules: {
      'Protecvia Indice 30': { pourcentageBR: 100 },
      'Protecvia Indice 45': { pourcentageBR: 125, forfaitPodologie: { montantAnnuel: 80, montantParSeance: 20, nbSeancesMax: 4, enveloppePartagee: 'médecines douces' } },
      'Protecvia Indice 60': { pourcentageBR: 150, forfaitPodologie: { montantAnnuel: 100, montantParSeance: 25, nbSeancesMax: 4, enveloppePartagee: 'médecines douces' } },
      'Protecvia Indice 90': { pourcentageBR: 200, forfaitPodologie: { montantAnnuel: 120, montantParSeance: 30, nbSeancesMax: 4, enveloppePartagee: 'médecines douces' } },
      'Protecvia Indice 120': { pourcentageBR: 250, forfaitPodologie: { montantAnnuel: 160, montantParSeance: 40, nbSeancesMax: 4, enveloppePartagee: 'médecines douces' } }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
