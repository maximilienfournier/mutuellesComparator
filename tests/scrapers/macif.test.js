const { getVerifiedData } = require('../../src/scrapers/macif');

describe('Macif (Apivia) Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Macif (Apivia)');
      expect(data.siren).toBe('779558501');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 5 formules Vitamin', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(5);
      expect(formules).toContain('Vitamin V1');
      expect(formules).toContain('Vitamin V5');
    });

    test('V1 rembourse à 100% BR', () => {
      expect(data.formules['Vitamin V1'].pourcentageBR).toBe(100);
    });

    test('V3 rembourse à 150% BR', () => {
      expect(data.formules['Vitamin V3'].pourcentageBR).toBe(150);
    });

    test('V5 rembourse à 200% BR', () => {
      expect(data.formules['Vitamin V5'].pourcentageBR).toBe(200);
    });

    test('les pourcentages sont croissants', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('scraped');
      expect(data.confidenceScore).toBeGreaterThanOrEqual(0.4);
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const jsonEntry = mutuelles.find(m => m.nom === 'Macif (Apivia)');
    const verified = getVerifiedData();

    test('les données JSON correspondent aux données vérifiées', () => {
      expect(jsonEntry.formules).toEqual(verified.formules);
    });

    test('le SIREN est corrigé dans le JSON', () => {
      expect(jsonEntry.siren).toBe('779558501');
    });

    test('le dataSource est "scraped" dans le JSON', () => {
      expect(jsonEntry.dataSource).toBe('scraped');
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(jsonEntry.lastUpdated).not.toBeNull();
    });
  });
});
