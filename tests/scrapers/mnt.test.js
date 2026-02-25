const { getVerifiedData } = require('../../src/scrapers/mnt');

describe('MNT Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('MNT');
      expect(data.siren).toBe('775678584');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 5 formules', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(5);
      expect(formules).toContain('Essentielle');
      expect(formules).toContain('Équilibre');
      expect(formules).toContain('Confort');
      expect(formules).toContain('Optimale');
      expect(formules).toContain('Intégrale');
    });

    test('Essentielle rembourse à 100% BR', () => {
      expect(data.formules['Essentielle'].pourcentageBR).toBe(100);
    });

    test('Confort rembourse à 160% BR', () => {
      expect(data.formules['Confort'].pourcentageBR).toBe(160);
    });

    test('Intégrale rembourse à 210% BR', () => {
      expect(data.formules['Intégrale'].pourcentageBR).toBe(210);
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
    const jsonEntry = mutuelles.find(m => m.nom === 'MNT');
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
