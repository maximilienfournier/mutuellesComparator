const { getVerifiedData } = require('../../src/scrapers/groupama');

describe('Groupama Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Groupama');
      expect(data.siren).toBe('343115135');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 5 niveaux Santé Active', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(5);
      expect(formules).toContain('Santé Active Niveau 1');
      expect(formules).toContain('Santé Active Niveau 5');
    });

    test('Niveau 1 rembourse à 100% BR', () => {
      expect(data.formules['Santé Active Niveau 1'].pourcentageBR).toBe(100);
    });

    test('Niveau 2 rembourse à 130% BR', () => {
      expect(data.formules['Santé Active Niveau 2'].pourcentageBR).toBe(130);
    });

    test('Niveau 5 rembourse à 300% BR', () => {
      expect(data.formules['Santé Active Niveau 5'].pourcentageBR).toBe(300);
    });

    test('les pourcentages sont croissants', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
    });

    test('confidenceScore est 0.9 (PDF officiel Groupama)', () => {
      expect(data.confidenceScore).toBe(0.9);
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('official');
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const jsonEntry = mutuelles.find(m => m.nom === 'Groupama');
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
