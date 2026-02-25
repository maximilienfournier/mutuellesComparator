const { getVerifiedData } = require('../../src/scrapers/la-mutuelle-generale');

describe('La Mutuelle Générale Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('La Mutuelle Générale');
      expect(data.siren).toBe('775685340');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 4 formules Itineo', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(4);
      expect(formules).toContain('Itineo Eco');
      expect(formules).toContain('Itineo Essentiel');
      expect(formules).toContain('Itineo Renfort');
      expect(formules).toContain('Itineo Exigence');
    });

    test('Eco rembourse à 100% BR', () => {
      expect(data.formules['Itineo Eco'].pourcentageBR).toBe(100);
    });

    test('Exigence rembourse à 115% BR (max)', () => {
      expect(data.formules['Itineo Exigence'].pourcentageBR).toBe(115);
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
    const jsonEntry = mutuelles.find(m => m.nom === 'La Mutuelle Générale');
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
