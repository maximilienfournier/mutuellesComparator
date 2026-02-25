const { getVerifiedData } = require('../../src/scrapers/mma');

describe('MMA Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('MMA');
      expect(data.siren).toBe('440048882');
      expect(data.frequence).toBe('1 paire par an');
    });

    test('contient les 19 formules (5 gammes x niveaux)', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(19);
      expect(formules).toContain('Vitale Niveau 2');
      expect(formules).toContain('Essentielle Niveau 4');
      expect(formules).toContain('Famille Niveau 4');
      expect(formules).toContain('Confort Niveau 4');
      expect(formules).toContain('Senior Niveau 4');
    });

    test('Vitale Niveau 4 rembourse a 150% BR', () => {
      expect(data.formules['Vitale Niveau 4'].pourcentageBR).toBe(150);
    });

    test('Essentielle Niveau 4 rembourse a 200% BR', () => {
      expect(data.formules['Essentielle Niveau 4'].pourcentageBR).toBe(200);
    });

    test('Famille Niveau 1 rembourse a 125% BR', () => {
      expect(data.formules['Famille Niveau 1'].pourcentageBR).toBe(125);
    });

    test('Famille Niveau 4 rembourse a 300% BR', () => {
      expect(data.formules['Famille Niveau 4'].pourcentageBR).toBe(300);
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('official');
      expect(data.confidenceScore).toBeGreaterThanOrEqual(0.7);
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('coherence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const jsonEntry = mutuelles.find(m => m.nom === 'MMA');
    const verified = getVerifiedData();

    test('les donnees JSON correspondent aux donnees verifiees', () => {
      expect(jsonEntry.formules).toEqual(verified.formules);
    });

    test('le dataSource est "official" dans le JSON', () => {
      expect(jsonEntry.dataSource).toBe('official');
    });

    test('lastUpdated est renseigne dans le JSON', () => {
      expect(jsonEntry.lastUpdated).not.toBeNull();
    });
  });
});
