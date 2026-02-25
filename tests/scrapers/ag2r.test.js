const { getVerifiedData } = require('../../src/scrapers/ag2r');

describe('AG2R La Mondiale Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('AG2R La Mondiale');
      expect(data.siren).toBe('486197757');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 5 formules Protecvia', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(5);
      expect(formules).toContain('Protecvia Indice 30');
      expect(formules).toContain('Protecvia Indice 45');
      expect(formules).toContain('Protecvia Indice 60');
      expect(formules).toContain('Protecvia Indice 90');
      expect(formules).toContain('Protecvia Indice 120');
    });

    test('Indice 30 rembourse à 100% BR', () => {
      expect(data.formules['Protecvia Indice 30'].pourcentageBR).toBe(100);
    });

    test('Indice 60 rembourse à 150% BR', () => {
      expect(data.formules['Protecvia Indice 60'].pourcentageBR).toBe(150);
    });

    test('Indice 120 rembourse à 250% BR', () => {
      expect(data.formules['Protecvia Indice 120'].pourcentageBR).toBe(250);
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
    const jsonEntry = mutuelles.find(m => m.nom === 'AG2R La Mondiale');
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
