const { getVerifiedData, parsePourcentageBR } = require('../../src/scrapers/maif');

describe('MAIF Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('MAIF');
      expect(data.siren).toBe('781974267');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 5 formules Efficience Santé', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(5);
      expect(formules).toContain('Essentielle');
      expect(formules).toContain('Découverte');
      expect(formules).toContain('Évolution');
      expect(formules).toContain('Extension');
      expect(formules).toContain('Optimale');
    });

    test('Essentielle à Évolution et Extension remboursent à 100% BR', () => {
      expect(data.formules['Essentielle'].pourcentageBR).toBe(100);
      expect(data.formules['Découverte'].pourcentageBR).toBe(100);
      expect(data.formules['Évolution'].pourcentageBR).toBe(100);
      expect(data.formules['Extension'].pourcentageBR).toBe(100);
    });

    test('Optimale rembourse à 150% BR (seule formule supérieure)', () => {
      expect(data.formules['Optimale'].pourcentageBR).toBe(150);
    });

    test('les pourcentages sont cohérents (ordre croissant)', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('official');
      expect(data.confidenceScore).toBe(0.85);
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('parsePourcentageBR', () => {
    test('extrait le pourcentage depuis un HTML contenant "semelles orthopédiques"', () => {
      const html = '<div>Semelles orthopédiques remboursées à 150 %</div>';
      expect(parsePourcentageBR(html)).toBe(150);
    });

    test('retourne null si aucun pourcentage trouvé', () => {
      const html = '<div>Pas de données pertinentes ici</div>';
      expect(parsePourcentageBR(html)).toBeNull();
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const maifJson = mutuelles.find(m => m.nom === 'MAIF');
    const verified = getVerifiedData();

    test('les données JSON correspondent aux données vérifiées', () => {
      expect(maifJson.formules).toEqual(verified.formules);
    });

    test('le dataSource est "official" dans le JSON', () => {
      expect(maifJson.dataSource).toBe('official');
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(maifJson.lastUpdated).not.toBeNull();
    });
  });
});
