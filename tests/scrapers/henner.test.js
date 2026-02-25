const { getVerifiedData } = require('../../src/scrapers/henner');

describe('Henner Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Henner');
      expect(data.siren).toBe('323377739');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 7 formules Privilèges', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(7);
      expect(formules).toContain('Privilèges F1');
      expect(formules).toContain('Privilèges F7');
    });

    test('F1 rembourse à 100% BR', () => {
      expect(data.formules['Privilèges F1'].pourcentageBR).toBe(100);
    });

    test('F4 rembourse à 170% BR', () => {
      expect(data.formules['Privilèges F4'].pourcentageBR).toBe(170);
    });

    test('F7 rembourse à 300% BR', () => {
      expect(data.formules['Privilèges F7'].pourcentageBR).toBe(300);
    });

    test('les pourcentages sont croissants', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('official');
      expect(data.confidenceScore).toBeGreaterThanOrEqual(0.9);
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const jsonEntry = mutuelles.find(m => m.nom === 'Henner');
    const verified = getVerifiedData();

    test('les données JSON correspondent aux données vérifiées', () => {
      expect(jsonEntry.formules).toEqual(verified.formules);
    });

    test('le dataSource est "official" dans le JSON', () => {
      expect(jsonEntry.dataSource).toBe('official');
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(jsonEntry.lastUpdated).not.toBeNull();
    });
  });
});
