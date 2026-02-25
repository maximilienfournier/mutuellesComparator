const { getVerifiedData } = require('../../src/scrapers/aesio');

describe('Aésio Mutuelle Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Aésio Mutuelle');
      expect(data.siren).toBe('775627391');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 3 formules représentatives', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(3);
      expect(formules).toContain('Santé Particuliers N3');
      expect(formules).toContain('Santé Pro N5');
      expect(formules).toContain('Santé Pro N6');
    });

    test('Particuliers N3 rembourse à 150% BR', () => {
      expect(data.formules['Santé Particuliers N3'].pourcentageBR).toBe(150);
    });

    test('Pro N5 rembourse à 350% BR', () => {
      expect(data.formules['Santé Pro N5'].pourcentageBR).toBe(350);
    });

    test('Pro N6 rembourse à 500% BR', () => {
      expect(data.formules['Santé Pro N6'].pourcentageBR).toBe(500);
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
    const jsonEntry = mutuelles.find(m => m.nom === 'Aésio Mutuelle');
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
