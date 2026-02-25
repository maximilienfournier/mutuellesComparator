const { getVerifiedData } = require('../../src/scrapers/generali');

describe('Generali Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Generali');
      expect(data.siren).toBe('552062663');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 12 formules (6 Santé Pro + 6 Seniors)', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(12);
      expect(formules).toContain('Santé Pro P0');
      expect(formules).toContain('Santé Pro P5');
      expect(formules).toContain('Seniors 1S');
      expect(formules).toContain('Seniors 5S');
    });

    test('Santé Pro P0 rembourse à 100% BR', () => {
      expect(data.formules['Santé Pro P0'].pourcentageBR).toBe(100);
    });

    test('Santé Pro P3 rembourse à 200% BR', () => {
      expect(data.formules['Santé Pro P3'].pourcentageBR).toBe(200);
    });

    test('Santé Pro P5 rembourse à 500% BR', () => {
      expect(data.formules['Santé Pro P5'].pourcentageBR).toBe(500);
    });

    test('Seniors 1S rembourse à 100% BR', () => {
      expect(data.formules['Seniors 1S'].pourcentageBR).toBe(100);
    });

    test('Seniors 3S Hospitalisation/Soins rembourse à 250% BR', () => {
      expect(data.formules['Seniors 3S Hospitalisation/Soins'].pourcentageBR).toBe(250);
    });

    test('Seniors 5S rembourse à 500% BR', () => {
      expect(data.formules['Seniors 5S'].pourcentageBR).toBe(500);
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
    const jsonEntry = mutuelles.find(m => m.nom === 'Generali');
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
