const { getVerifiedData } = require('../../src/scrapers/gmf');

describe('GMF Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('GMF');
      expect(data.siren).toBe('398972901');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 3 niveaux Santé Pass', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(3);
      expect(formules).toContain('Santé Pass Niveau 1');
      expect(formules).toContain('Santé Pass Niveau 2');
      expect(formules).toContain('Santé Pass Niveau 3');
    });

    test('Niveau 1 rembourse à 100% BR', () => {
      expect(data.formules['Santé Pass Niveau 1'].pourcentageBR).toBe(100);
    });

    test('Niveau 3 rembourse à 175% BR', () => {
      expect(data.formules['Santé Pass Niveau 3'].pourcentageBR).toBe(175);
    });

    test('les pourcentages sont croissants', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
    });

    test('confidenceScore est faible (0.4) car source tiers uniquement', () => {
      expect(data.confidenceScore).toBe(0.4);
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('scraped');
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const jsonEntry = mutuelles.find(m => m.nom === 'GMF');
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
