const { getVerifiedData } = require('../../src/scrapers/april');

describe('April Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('April');
      expect(data.siren).toBe('378724530');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 7 formules Santé Mix', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(7);
      expect(formules).toContain('Santé Mix N1');
      expect(formules).toContain('Santé Mix N7');
    });

    test('N1 rembourse à 100% BR', () => {
      expect(data.formules['Santé Mix N1'].pourcentageBR).toBe(100);
    });

    test('N4 rembourse à 150% BR', () => {
      expect(data.formules['Santé Mix N4'].pourcentageBR).toBe(150);
    });

    test('N7 rembourse à 300% BR', () => {
      expect(data.formules['Santé Mix N7'].pourcentageBR).toBe(300);
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
    const jsonEntry = mutuelles.find(m => m.nom === 'April');
    const verified = getVerifiedData();

    test('les données JSON correspondent aux données vérifiées', () => {
      expect(jsonEntry.formules).toEqual(verified.formules);
    });

    test('le SIREN est corrigé dans le JSON', () => {
      expect(jsonEntry.siren).toBe('378724530');
    });

    test('le dataSource est "scraped" dans le JSON', () => {
      expect(jsonEntry.dataSource).toBe('scraped');
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(jsonEntry.lastUpdated).not.toBeNull();
    });
  });
});
