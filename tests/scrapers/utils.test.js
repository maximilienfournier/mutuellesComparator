const { parsePourcentageBR, buildScrapedEntry } = require('../../src/scrapers/utils');

describe('Scraper Utils', () => {
  describe('parsePourcentageBR', () => {
    test('extrait le pourcentage depuis "semelles orthopédiques"', () => {
      const html = '<div>Semelles orthopédiques remboursées à 230 %</div>';
      expect(parsePourcentageBR(html)).toBe(230);
    });

    test('extrait le pourcentage depuis "orthopédie"', () => {
      const html = '<td>Orthopédie</td><td>350%</td>';
      expect(parsePourcentageBR(html)).toBe(350);
    });

    test('extrait le pourcentage depuis "petit appareillage"', () => {
      const html = '<span>Petit appareillage et accessoires : 150 %</span>';
      expect(parsePourcentageBR(html)).toBe(150);
    });

    test('retourne null si aucun pourcentage trouvé', () => {
      expect(parsePourcentageBR('<div>Rien ici</div>')).toBeNull();
    });

    test('ignore les pourcentages hors limites (< 60)', () => {
      expect(parsePourcentageBR('<div>Semelles orthopédiques : 5 %</div>')).toBeNull();
    });
  });

  describe('buildScrapedEntry', () => {
    test('construit un objet mutuelle complet avec valeurs par défaut', () => {
      const entry = buildScrapedEntry({
        nom: 'Test Mutuelle',
        siren: '123456789',
        formules: { 'Base': { pourcentageBR: 100 } }
      });

      expect(entry.nom).toBe('Test Mutuelle');
      expect(entry.siren).toBe('123456789');
      expect(entry.formules).toEqual({ 'Base': { pourcentageBR: 100 } });
      expect(entry.forfaitAnnuel).toBeNull();
      expect(entry.frequence).toBe('1 paire par an');
      expect(entry.conditions).toBe('Sur prescription médicale');
      expect(entry.dataSource).toBe('estimated');
      expect(entry.confidenceScore).toBe(0.2);
      expect(entry.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('respecte les valeurs fournies', () => {
      const entry = buildScrapedEntry({
        nom: 'Test',
        siren: '999',
        formules: {},
        forfaitAnnuel: 200,
        frequence: '2 paires par an',
        conditions: 'Aucune',
        dataSource: 'official',
        confidenceScore: 1.0
      });

      expect(entry.forfaitAnnuel).toBe(200);
      expect(entry.frequence).toBe('2 paires par an');
      expect(entry.conditions).toBe('Aucune');
      expect(entry.dataSource).toBe('official');
      expect(entry.confidenceScore).toBe(1.0);
    });
  });
});
