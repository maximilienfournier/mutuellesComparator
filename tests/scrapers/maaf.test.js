const { getVerifiedData } = require('../../src/scrapers/maaf');

describe('MAAF Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('MAAF');
      expect(data.siren).toBe('542073580');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 5 niveaux Vivazen', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(5);
      expect(formules).toEqual(['Vivazen 1', 'Vivazen 2', 'Vivazen 3', 'Vivazen 4', 'Vivazen 5']);
    });

    test('Vivazen 1 et 2 remboursent à 100% BR', () => {
      expect(data.formules['Vivazen 1'].pourcentageBR).toBe(100);
      expect(data.formules['Vivazen 2'].pourcentageBR).toBe(100);
    });

    test('Vivazen 3 rembourse à 150% BR', () => {
      expect(data.formules['Vivazen 3'].pourcentageBR).toBe(150);
    });

    test('Vivazen 4 rembourse à 200% BR', () => {
      expect(data.formules['Vivazen 4'].pourcentageBR).toBe(200);
    });

    test('Vivazen 5 rembourse à 250% BR', () => {
      expect(data.formules['Vivazen 5'].pourcentageBR).toBe(250);
    });

    test('les pourcentages sont croissants', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('scraped');
      expect(data.confidenceScore).toBe(0.8);
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const maafJson = mutuelles.find(m => m.nom === 'MAAF');
    const verified = getVerifiedData();

    test('les données JSON correspondent aux données vérifiées', () => {
      expect(maafJson.formules).toEqual(verified.formules);
    });

    test('le dataSource est "scraped"', () => {
      expect(maafJson.dataSource).toBe('scraped');
    });

    test('lastUpdated est renseigné', () => {
      expect(maafJson.lastUpdated).not.toBeNull();
    });
  });
});
