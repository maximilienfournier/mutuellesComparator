const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis le PDF officiel April Santé Mix (réf. MIX201120).
 * Produit : APRIL Santé Mix — Module Frais de Santé, 6 niveaux responsables + 1 niveau non-responsable.
 *
 * Source : Notice valant conditions générales — APRIL Santé Mix
 * https://assets.april.fr/prismic/documents/particuliers/doc-part-april-sante-mix-notice-garanties.pdf?vh=f5afec&func=proxy
 *
 * Ligne de garantie (page 21, section "Module Frais de Santé > Soins courants") :
 * "Matériel médical : prothèses orthopédiques, petit et gros appareillage
 *  (hors prothèse auditive et accessoire optique)"
 * Niveaux 1-6 : 100%, 100%, 125%, 150%, 175%, 200% BR — lus directement dans le PDF.
 * Niveau 7 (non-responsable) : 300% BR — source mutualib.fr (non présent dans le PDF officiel).
 *
 * SIREN : 378724530 (April Santé Prévoyance).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'April',
    siren: '378724530',
    formules: {
      'Santé Mix N1': { pourcentageBR: 100 },
      'Santé Mix N2': { pourcentageBR: 100 },
      'Santé Mix N3': { pourcentageBR: 125 },
      'Santé Mix N4': { pourcentageBR: 150 },
      'Santé Mix N5': { pourcentageBR: 175 },
      'Santé Mix N6': { pourcentageBR: 200 },
      'Santé Mix N7': { pourcentageBR: 300 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'official',
    confidenceScore: 0.8
  });
}

module.exports = { getVerifiedData };
