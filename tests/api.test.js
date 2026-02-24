const { rechercherMutuelles, rechercherParSiren } = require('../src/api');

// Tests d'intégration avec l'API réelle (nécessitent une connexion internet)
// Marqués comme "slow" pour pouvoir les exclure si besoin

describe('API Recherche Entreprises', () => {
  jest.setTimeout(15000);

  test('rechercherMutuelles retourne des résultats', async () => {
    const result = await rechercherMutuelles({ perPage: 5 });
    expect(result.total).toBeGreaterThan(0);
    expect(result.mutuelles).toHaveLength(5);
    expect(result.mutuelles[0]).toHaveProperty('siren');
    expect(result.mutuelles[0]).toHaveProperty('nom');
  });

  test('rechercherMutuelles accepte une query', async () => {
    const result = await rechercherMutuelles({ query: 'MGEN', perPage: 5 });
    expect(result.total).toBeGreaterThan(0);
    const noms = result.mutuelles.map(m => m.nom.toLowerCase());
    expect(noms.some(n => n.includes('mgen'))).toBe(true);
  });

  test('rechercherParSiren trouve une mutuelle connue', async () => {
    // SIREN de la MGEN
    const result = await rechercherParSiren('775685399');
    expect(result).not.toBeNull();
    expect(result.nom.toLowerCase()).toContain('mgen');
  });

  test('rechercherParSiren retourne null si SIREN ne correspond pas', async () => {
    // L'API fait une recherche textuelle ; un SIREN non-numérique ne match rien
    const result = await rechercherParSiren('XXXXXXXXX');
    expect(result).toBeNull();
  });
});
