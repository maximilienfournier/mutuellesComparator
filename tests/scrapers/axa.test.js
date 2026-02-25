const { getVerifiedData } = require('../../src/scrapers/axa');

describe('AXA Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('AXA');
      expect(data.siren).toBe('310499959');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 6 formules Ma Santé (hors Hospi Tradi non couverte)', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(6);
      expect(formules).toContain('Ma Santé Eco Tradi');
      expect(formules).toContain('Ma Santé 100% Néo');
      expect(formules).toContain('Ma Santé 125% Néo');
      expect(formules).toContain('Ma Santé 150% Néo');
      expect(formules).toContain('Ma Santé 200% Néo');
      expect(formules).toContain('Ma Santé 400% Tradi');
    });

    test('Eco Tradi rembourse à 95% BR', () => {
      expect(data.formules['Ma Santé Eco Tradi'].pourcentageBR).toBe(95);
    });

    test('100% Néo rembourse à 100% BR', () => {
      expect(data.formules['Ma Santé 100% Néo'].pourcentageBR).toBe(100);
    });

    test('125% Néo rembourse à 125% BR', () => {
      expect(data.formules['Ma Santé 125% Néo'].pourcentageBR).toBe(125);
    });

    test('150% Néo rembourse à 150% BR', () => {
      expect(data.formules['Ma Santé 150% Néo'].pourcentageBR).toBe(150);
    });

    test('200% Néo rembourse à 200% BR', () => {
      expect(data.formules['Ma Santé 200% Néo'].pourcentageBR).toBe(200);
    });

    test('400% Tradi rembourse à 400% BR', () => {
      expect(data.formules['Ma Santé 400% Tradi'].pourcentageBR).toBe(400);
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
      expect(data.confidenceScore).toBeLessThanOrEqual(1.0);
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

    test('le dataSource est "scraped" dans le JSON', () => {
      expect(axaJson.dataSource).toBe('scraped');
    });

    test('le confidenceScore est >= 0.5 dans le JSON', () => {
      expect(axaJson.confidenceScore).toBeGreaterThanOrEqual(0.5);
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(axaJson.lastUpdated).not.toBeNull();
    });
  });
});
