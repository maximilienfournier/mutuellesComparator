const { getVerifiedData } = require('../../src/scrapers/alan');

describe('Alan Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Alan');
      expect(data.siren).toBe('813369193');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 3 formules', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(3);
      expect(formules).toContain('Green');
      expect(formules).toContain('Blue');
      expect(formules).toContain('Purple');
    });

    test('Green rembourse à 300% BR', () => {
      expect(data.formules['Green'].pourcentageBR).toBe(300);
    });

    test('Blue rembourse à 400% BR', () => {
      expect(data.formules['Blue'].pourcentageBR).toBe(400);
    });

    test('Purple rembourse à 500% BR', () => {
      expect(data.formules['Purple'].pourcentageBR).toBe(500);
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
    const jsonEntry = mutuelles.find(m => m.nom === 'Alan');
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
