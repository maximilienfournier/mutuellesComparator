const { getVerifiedData } = require('../../src/scrapers/pro-btp');

describe('Pro BTP Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Pro BTP');
      expect(data.siren).toBe('784621468');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 6 niveaux S (S1, S2, S3, S3+, S4, S5/S6)', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(6);
      expect(formules).toContain('S1');
      expect(formules).toContain('S2');
      expect(formules).toContain('S3');
      expect(formules).toContain('S3+');
      expect(formules).toContain('S4');
      expect(formules).toContain('S5/S6');
    });

    test('S1 rembourse à 100% BR', () => {
      expect(data.formules['S1'].pourcentageBR).toBe(100);
    });

    test('S3 rembourse à 350% BR', () => {
      expect(data.formules['S3'].pourcentageBR).toBe(350);
    });

    test('S4 rembourse à 550% BR', () => {
      expect(data.formules['S4'].pourcentageBR).toBe(550);
    });

    test('S5/S6 (retraités) rembourse à 650% BR', () => {
      expect(data.formules['S5/S6'].pourcentageBR).toBe(650);
    });

    test('les pourcentages sont croissants', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
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
    const jsonEntry = mutuelles.find(m => m.nom === 'Pro BTP');
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
