const { getVerifiedData } = require('../../src/scrapers/malakoff-humanis');

describe('Malakoff Humanis Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Malakoff Humanis');
      expect(data.siren).toBe('775691732');
      expect(data.frequence).toBe('1 paire par an');
      expect(data.conditions).toBe('Sur prescription médicale');
    });

    test('contient les 5 formules Niveau 1 à 5', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(5);
      expect(formules).toContain('Niveau 1');
      expect(formules).toContain('Niveau 2');
      expect(formules).toContain('Niveau 3');
      expect(formules).toContain('Niveau 4');
      expect(formules).toContain('Niveau 5');
    });

    test('Niveau 1 rembourse à 100% BR', () => {
      expect(data.formules['Niveau 1'].pourcentageBR).toBe(100);
    });

    test('Niveau 2 rembourse à 125% BR', () => {
      expect(data.formules['Niveau 2'].pourcentageBR).toBe(125);
    });

    test('Niveau 3 rembourse à 150% BR', () => {
      expect(data.formules['Niveau 3'].pourcentageBR).toBe(150);
    });

    test('Niveau 4 rembourse à 175% BR', () => {
      expect(data.formules['Niveau 4'].pourcentageBR).toBe(175);
    });

    test('Niveau 5 rembourse à 200% BR', () => {
      expect(data.formules['Niveau 5'].pourcentageBR).toBe(200);
    });

    test('les pourcentages sont croissants (Niveau 1 < 2 < 3 < 4 < 5)', () => {
      expect(data.formules['Niveau 1'].pourcentageBR)
        .toBeLessThan(data.formules['Niveau 2'].pourcentageBR);
      expect(data.formules['Niveau 2'].pourcentageBR)
        .toBeLessThan(data.formules['Niveau 3'].pourcentageBR);
      expect(data.formules['Niveau 3'].pourcentageBR)
        .toBeLessThan(data.formules['Niveau 4'].pourcentageBR);
      expect(data.formules['Niveau 4'].pourcentageBR)
        .toBeLessThan(data.formules['Niveau 5'].pourcentageBR);
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
    const malakoffJson = mutuelles.find(m => m.nom === 'Malakoff Humanis');
    const verified = getVerifiedData();

    test('les données JSON correspondent aux données vérifiées', () => {
      expect(malakoffJson.formules).toEqual(verified.formules);
    });

    test('le dataSource est "scraped" dans le JSON', () => {
      expect(malakoffJson.dataSource).toBe('scraped');
    });

    test('le confidenceScore est >= 0.5 dans le JSON', () => {
      expect(malakoffJson.confidenceScore).toBeGreaterThanOrEqual(0.5);
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(malakoffJson.lastUpdated).not.toBeNull();
    });
  });
});
