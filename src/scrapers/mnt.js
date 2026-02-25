const { buildScrapedEntry } = require('./utils');

/**
 * Données vérifiées depuis les pages officielles MGEN pour MNT Santé (février 2026).
 * MNT distribue ses complémentaires santé via MGEN.
 * 5 formules individuelles : Essentielle, Équilibre, Confort, Optimale, Intégrale.
 * Ligne de garantie : "Matériel médical" dans le tableau de garanties de chaque formule.
 *
 * Sources par formule :
 * - Essentielle (100% BR) : https://www.mgen.fr/offres-sante-prevoyance/mnt-sante/essentielle/
 *   — donnée lue directement : RO 60% + MNT 40% = 100% total
 * - Équilibre (100% BR) : https://www.mgen.fr/offres-sante-prevoyance/mnt-sante/equilibre/
 *   — donnée lue directement : RO 60% + MNT 40% = 100% total
 * - Confort (160% BR) : https://www.mgen.fr/offres-sante-prevoyance/mnt-sante/confort/
 *   — donnée lue directement : RO 60% + MNT 100% = 160% total
 * - Optimale (160% BR) : https://www.mgen.fr/offres-sante-prevoyance/mnt-sante/optimale/
 *   — donnée lue directement : RO 60% + MNT 100% = 160% total
 * - Intégrale (210% BR) : https://www.mgen.fr/offres-sante-prevoyance/mnt-sante/integrale/
 *   — donnée lue directement : RO 60% + MNT 150% = 210% total
 *
 * Contrat collectif (CDG60, non inclus dans les formules ci-dessus) :
 *   https://www.cdg60.com/wp-content/uploads/2025/03/TABLEAU-DES-PRESTATIONS-MNT.pdf
 *   — N1/N2/N3 : 100% BR appareillage + forfait orthopédie 200€/300€/400€ par an
 *
 * Note : les anciens noms "S1/S2/S3" étaient des estimations incorrectes.
 * SIREN : 775678584 (MNT - Mutuelle Nationale Territoriale).
 */
function getVerifiedData() {
  return buildScrapedEntry({
    nom: 'MNT',
    siren: '775678584',
    formules: {
      'Essentielle': { pourcentageBR: 100 },
      'Équilibre': { pourcentageBR: 100 },
      'Confort': { pourcentageBR: 160 },
      'Optimale': { pourcentageBR: 160 },
      'Intégrale': { pourcentageBR: 210 }
    },
    forfaitAnnuel: null,
    frequence: '1 paire par an',
    conditions: 'Sur prescription médicale. Distribué via MGEN.',
    dataSource: 'official',
    confidenceScore: 0.9
  });
}

module.exports = { getVerifiedData };
