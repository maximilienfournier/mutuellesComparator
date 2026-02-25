const { getVerifiedData } = require('../../src/scrapers/generali');

describe('Generali Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Generali');
      expect(data.siren).toBe('552062663');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 6 formules Santé Pro', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(6);
      expect(formules).toContain('Santé Pro P0');
      expect(formules).toContain('Santé Pro P5');
    });

    test('P0 rembourse à 100% BR', () => {
      expect(data.formules['Santé Pro P0'].pourcentageBR).toBe(100);
    });

    test('P3 rembourse à 200% BR', () => {
      expect(data.formules['Santé Pro P3'].pourcentageBR).toBe(200);
    });

    test('P5 rembourse à 500% BR', () => {
      expect(data.formules['Santé Pro P5'].pourcentageBR).toBe(500);
    });

    test('les pourcentages sont croissants', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
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
    const jsonEntry = mutuelles.find(m => m.nom === 'Generali');
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
