const { getVerifiedData } = require('../../src/scrapers/axa');

describe('AXA Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('AXA');
      expect(data.siren).toBe('310499959');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 5 formules Modulango', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(5);
      expect(formules).toContain('Modulango 100');
      expect(formules).toContain('Modulango 125');
      expect(formules).toContain('Modulango 150');
      expect(formules).toContain('Modulango 200');
      expect(formules).toContain('Modulango 400');
    });

    test('les pourcentages sont croissants', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
    });

    test('confidenceScore reflète l\'incertitude (données déduites des noms de formules)', () => {
      expect(data.dataSource).toBe('estimated');
      expect(data.confidenceScore).toBeLessThanOrEqual(0.5);
    });

    test('lastUpdated est renseigné', () => {
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const axaJson = mutuelles.find(m => m.nom === 'AXA');
    const verified = getVerifiedData();

    test('les données JSON correspondent aux données vérifiées', () => {
      expect(axaJson.formules).toEqual(verified.formules);
    });

    test('lastUpdated est renseigné', () => {
      expect(axaJson.lastUpdated).not.toBeNull();
    });
  });
});
