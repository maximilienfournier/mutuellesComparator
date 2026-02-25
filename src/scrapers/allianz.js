const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les documents Allianz (février 2026).
 * Produit : Composio, 7 niveaux (Eco + Niv.1 à Niv.6).
 * Ligne de garantie : "Petit appareillage / orthopédie".
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'Allianz France',
    siren: '303265128',
    formules: {
      'Composio Eco': { pourcentageBR: 100 },
      'Composio Niveau 1': { pourcentageBR: 100 },
      'Composio Niveau 2': { pourcentageBR: 100 },
      'Composio Niveau 3': { pourcentageBR: 125 },
      'Composio Niveau 4': { pourcentageBR: 150 },
      'Composio Niveau 5': { pourcentageBR: 200 },
      'Composio Niveau 6': { pourcentageBR: 300 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale',
    dataSource: 'scraped',
    confidenceScore: 0.7
  });
}

module.exports = { getVerifiedData };
