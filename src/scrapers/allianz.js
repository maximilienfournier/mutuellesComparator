const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les PDFs officiels Allianz Composio (février 2026).
 * Produit : Composio, 7 niveaux (Eco + Niv.1 à Niv.6).
 * Ligne de garantie : "Ensemble des fournitures et appareils (ex : petits et grands
 * appareillages, orthopédie...) hors optique et auditif"
 *
 * Sources (barèmes de prestations hébergés sur espaceclient.allianz.fr) :
 * - Composio Niveau 1 (BP-SH1O4D4CS-0415) : 100% BR — lue directement page 1
 *   https://espaceclient.allianz.fr/pdf/22/0415/LN/BPSH1O4D4CSLN.pdf
 * - Composio Niveau 2 (BP-SH2O2D2S-0415) : 100% BR — lue directement page 1
 *   https://espaceclient.allianz.fr/pdf/22/0415/LN/BPSH2O2D2SLN.pdf
 * - Composio Niveau 3 (BP-SH3O1D1S-0415) : 125% BR — lue directement page 1
 *   https://espaceclient.allianz.fr/pdf/22/0415/LN/BPSH3O1D1SLN.pdf
 * - Composio Niveau 4 (BP-SH4O4D4CS-0415) : 150% BR — lue directement page 1
 *   https://espaceclient.allianz.fr/pdf/22/0415/LN/BPSH4O4D4CSLN.pdf
 * - Composio Niveau 5 (BP-SH5O5D5-0415) : 200% BR — lue directement page 1
 *   https://espaceclient.allianz.fr/pdf/22/0415/LN/BPSH5O5D5LN.pdf
 * - Composio Niveau 6 (BP-SH6O6D6-0411) : 300% BR — lue directement page 1
 *   https://espaceclient.allianz.fr/pdf/22/LN/BPSH6O6D6LN.pdf
 * - Composio Eco : 100% BR — pas de PDF dédié, déduit des niveaux 1-2 (même gamme basique)
 *
 * Les 6 PDFs sont marqués "non contractuel" et datent de 2015 (réf. 0415/0411),
 * mais sont toujours hébergés sur le portail client officiel Allianz.
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
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
