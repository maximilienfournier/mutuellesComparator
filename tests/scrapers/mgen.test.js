const { getVerifiedData, parsePourcentageBR } = require('../../src/scrapers/mgen');

describe('MGEN Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('MGEN');
      expect(data.siren).toBe('775685399');
      expect(data.frequence).toBe('1 paire par an');
      expect(data.conditions).toBe('Sur prescription médicale');
    });

    test('contient les 3 formules Initiale, Référence et Intégrale', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(3);
      expect(formules).toContain('Initiale');
      expect(formules).toContain('Référence');
      expect(formules).toContain('Intégrale');
    });

    test('Initiale rembourse à 100% BR', () => {
      expect(data.formules['Initiale'].pourcentageBR).toBe(100);
    });

    test('Référence rembourse à 230% BR', () => {
      expect(data.formules['Référence'].pourcentageBR).toBe(230);
    });

    test('Intégrale rembourse à 350% BR', () => {
      expect(data.formules['Intégrale'].pourcentageBR).toBe(350);
    });

    test('les pourcentages sont cohérents (Initiale < Référence < Intégrale)', () => {
      expect(data.formules['Initiale'].pourcentageBR)
        .toBeLessThan(data.formules['Référence'].pourcentageBR);
      expect(data.formules['Référence'].pourcentageBR)
        .toBeLessThan(data.formules['Intégrale'].pourcentageBR);
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('scraped');
      expect(data.confidenceScore).toBeGreaterThanOrEqual(0.5);
      expect(data.confidenceScore).toBeLessThanOrEqual(1.0);
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('parsePourcentageBR', () => {
    test('extrait le pourcentage depuis un HTML contenant "semelles orthopédiques"', () => {
      const html = '<div>Semelles orthopédiques remboursées à 230 %</div>';
      expect(parsePourcentageBR(html)).toBe(230);
    });

    test('extrait le pourcentage depuis un HTML contenant "orthopédie"', () => {
      const html = '<td>Orthopédie</td><td>350%</td>';
      expect(parsePourcentageBR(html)).toBe(350);
    });

    test('extrait le pourcentage depuis "petit appareillage"', () => {
      const html = '<span>Petit appareillage et accessoires : 150 %</span>';
      expect(parsePourcentageBR(html)).toBe(150);
    });

    test('retourne null si aucun pourcentage trouvé', () => {
      const html = '<div>Pas de données pertinentes ici</div>';
      expect(parsePourcentageBR(html)).toBeNull();
    });

    test('ignore les pourcentages hors limites', () => {
      const html = '<div>Semelles orthopédiques : 5 %</div>';
      expect(parsePourcentageBR(html)).toBeNull();
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const mgenJson = mutuelles.find(m => m.nom === 'MGEN');
    const verified = getVerifiedData();

    test('les données JSON correspondent aux données vérifiées', () => {
      expect(mgenJson.formules).toEqual(verified.formules);
    });

    test('le dataSource est "scraped" dans le JSON', () => {
      expect(mgenJson.dataSource).toBe('scraped');
    });

    test('le confidenceScore est >= 0.5 dans le JSON', () => {
      expect(mgenJson.confidenceScore).toBeGreaterThanOrEqual(0.5);
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(mgenJson.lastUpdated).not.toBeNull();
    });
  });
});
