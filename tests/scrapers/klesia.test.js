const { getVerifiedData } = require('../../src/scrapers/klesia');

describe('Klesia Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Klesia');
      expect(data.siren).toBe('529168007');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 4 formules', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(4);
      expect(formules).toContain('Essentiel');
      expect(formules).toContain('Équilibre');
      expect(formules).toContain('Confort');
      expect(formules).toContain('Premium');
    });

    test('Essentiel rembourse à 100% BR sans forfait', () => {
      expect(data.formules['Essentiel'].pourcentageBR).toBe(100);
      expect(data.formules['Essentiel'].forfaitAnnuel).toBe(0);
    });

    test('Équilibre rembourse à 150% BR + 100€/an', () => {
      expect(data.formules['Équilibre'].pourcentageBR).toBe(150);
      expect(data.formules['Équilibre'].forfaitAnnuel).toBe(100);
    });

    test('Confort rembourse à 200% BR + 150€/an', () => {
      expect(data.formules['Confort'].pourcentageBR).toBe(200);
      expect(data.formules['Confort'].forfaitAnnuel).toBe(150);
    });

    test('Premium rembourse à 300% BR + 300€/an', () => {
      expect(data.formules['Premium'].pourcentageBR).toBe(300);
      expect(data.formules['Premium'].forfaitAnnuel).toBe(300);
    });

    test('les pourcentages sont croissants', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
    });

    test('les forfaits annuels sont croissants', () => {
      const forfaits = Object.values(data.formules).map(f => f.forfaitAnnuel);
      for (let i = 1; i < forfaits.length; i++) {
        expect(forfaits[i]).toBeGreaterThanOrEqual(forfaits[i - 1]);
      }
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('official');
      expect(data.confidenceScore).toBe(0.95);
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const jsonEntry = mutuelles.find(m => m.nom === 'Klesia');
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
