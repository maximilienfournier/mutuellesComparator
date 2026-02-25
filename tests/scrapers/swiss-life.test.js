const { getVerifiedData } = require('../../src/scrapers/swiss-life');

describe('Swiss Life Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Swiss Life');
      expect(data.siren).toBe('322215021');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 9 niveaux', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(9);
      expect(formules).toContain('Niveau 1');
      expect(formules).toContain('Niveau 9');
    });

    test('Niveau 1 rembourse à 100% BR', () => {
      expect(data.formules['Niveau 1'].pourcentageBR).toBe(100);
    });

    test('Niveau 3 rembourse à 125% BR', () => {
      expect(data.formules['Niveau 3'].pourcentageBR).toBe(125);
    });

    test('Niveau 9 rembourse à 400% BR', () => {
      expect(data.formules['Niveau 9'].pourcentageBR).toBe(400);
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
    const jsonEntry = mutuelles.find(m => m.nom === 'Swiss Life');
    const verified = getVerifiedData();

    test('les données JSON correspondent aux données vérifiées', () => {
      expect(jsonEntry.formules).toEqual(verified.formules);
    });

    test('le dataSource est "scraped" dans le JSON', () => {
      expect(jsonEntry.dataSource).toBe('scraped');
    });

    test('le SIREN est corrigé dans le JSON', () => {
      expect(jsonEntry.siren).toBe('322215021');
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(jsonEntry.lastUpdated).not.toBeNull();
    });
  });
});
