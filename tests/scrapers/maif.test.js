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

    test('Optimale rembourse à 150% BR (confirmé sur mgen.fr)', () => {
      expect(data.formules['Optimale'].pourcentageBR).toBe(150);
    });

    test('Extension rembourse à 150% BR', () => {
      expect(data.formules['Extension'].pourcentageBR).toBe(150);
    });

    test('les pourcentages sont cohérents (ordre croissant)', () => {
      const pcts = Object.values(data.formules).map(f => f.pourcentageBR);
      for (let i = 1; i < pcts.length; i++) {
        expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1]);
      }
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('scraped');
      expect(data.confidenceScore).toBeGreaterThanOrEqual(0.4);
      expect(data.confidenceScore).toBeLessThanOrEqual(1.0);
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('confidenceScore reflète l\'incertitude (< 0.8)', () => {
      // Seule Optimale est confirmée, les autres sont déduites
      expect(data.confidenceScore).toBeLessThan(0.8);
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

    test('le dataSource est "scraped" dans le JSON', () => {
      expect(maifJson.dataSource).toBe('scraped');
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(maifJson.lastUpdated).not.toBeNull();
    });
  });
});
