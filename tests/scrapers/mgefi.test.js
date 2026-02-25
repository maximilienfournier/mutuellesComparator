const { getVerifiedData } = require('../../src/scrapers/mgefi');

describe('MGEFI Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('MGEFI');
      expect(data.siren).toBe('499982098');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 3 formules Mgéfi Santé', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(3);
      expect(formules).toContain('Mgéfi Maitri');
      expect(formules).toContain('Mgéfi Vita 2');
      expect(formules).toContain('Mgéfi Multi 2');
    });

    test('Maitri rembourse à 100% BR', () => {
      expect(data.formules['Mgéfi Maitri'].pourcentageBR).toBe(100);
    });

    test('Vita 2 rembourse à 200% BR', () => {
      expect(data.formules['Mgéfi Vita 2'].pourcentageBR).toBe(200);
    });

    test('Multi 2 rembourse à 200% BR', () => {
      expect(data.formules['Mgéfi Multi 2'].pourcentageBR).toBe(200);
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
    const jsonEntry = mutuelles.find(m => m.nom === 'MGEFI');
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
