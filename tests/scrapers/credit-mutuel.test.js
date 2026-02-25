const { getVerifiedData } = require('../../src/scrapers/credit-mutuel');

describe('Crédit Mutuel (ACM) Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Crédit Mutuel (ACM)');
      expect(data.siren).toBe('353073075');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 6 niveaux', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(6);
      expect(formules).toContain('Niveau 1');
      expect(formules).toContain('Niveau 6');
    });

    test('tous les niveaux remboursent à 100% BR', () => {
      for (const formule of Object.values(data.formules)) {
        expect(formule.pourcentageBR).toBe(100);
      }
    });

    test('les forfaits annuels sont croissants', () => {
      const forfaits = Object.values(data.formules).map(f => f.forfaitAnnuel);
      for (let i = 1; i < forfaits.length; i++) {
        expect(forfaits[i]).toBeGreaterThanOrEqual(forfaits[i - 1]);
      }
    });

    test('Niveau 1 a un forfait de 0€', () => {
      expect(data.formules['Niveau 1'].forfaitAnnuel).toBe(0);
    });

    test('Niveau 6 a un forfait de 300€', () => {
      expect(data.formules['Niveau 6'].forfaitAnnuel).toBe(300);
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('scraped');
      expect(data.confidenceScore).toBeGreaterThanOrEqual(0.5);
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const jsonEntry = mutuelles.find(m => m.nom === 'Crédit Mutuel (ACM)');
    const verified = getVerifiedData();

    test('les données JSON correspondent aux données vérifiées', () => {
      expect(jsonEntry.formules).toEqual(verified.formules);
    });

    test('le dataSource est "scraped" dans le JSON', () => {
      expect(jsonEntry.dataSource).toBe('scraped');
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(jsonEntry.lastUpdated).not.toBeNull();
    });
  });
});
