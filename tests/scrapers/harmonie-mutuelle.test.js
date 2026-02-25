const { getVerifiedData, parseFaqSemelles, SIREN, MUTUELLE_NAME, URLS } = require('../../src/scrapers/harmonie-mutuelle');

describe('Harmonie Mutuelle Scraper', () => {
  describe('getVerifiedData', () => {
    const data = getVerifiedData();

    test('retourne les métadonnées correctes', () => {
      expect(data.nom).toBe('Harmonie Mutuelle');
      expect(data.siren).toBe('538518473');
      expect(data.frequence).toBe('1 paire par an');
      expect(data.conditions).toMatch(/prescription médicale/i);
    });

    test('contient les 3 niveaux d\'équipement', () => {
      const formules = Object.keys(data.formules);
      expect(formules).toHaveLength(3);
      expect(formules).toContain('Équipement 1★');
      expect(formules).toContain('Équipement 2★');
      expect(formules).toContain('Équipement 3★');
    });

    test('tous les niveaux remboursent à 100% BR', () => {
      expect(data.formules['Équipement 1★'].pourcentageBR).toBe(100);
      expect(data.formules['Équipement 2★'].pourcentageBR).toBe(100);
      expect(data.formules['Équipement 3★'].pourcentageBR).toBe(100);
    });

    test('les forfaits annuels sont croissants par niveau', () => {
      expect(data.formules['Équipement 1★'].forfaitAnnuel).toBe(0);
      expect(data.formules['Équipement 2★'].forfaitAnnuel).toBe(100);
      expect(data.formules['Équipement 3★'].forfaitAnnuel).toBe(200);
    });

    test('les champs de traçabilité sont renseignés', () => {
      expect(data.dataSource).toBe('scraped');
      expect(data.confidenceScore).toBeGreaterThanOrEqual(0.5);
      expect(data.confidenceScore).toBeLessThanOrEqual(1.0);
      expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('parseFaqSemelles', () => {
    test('détecte la mention de prescription médicale', () => {
      const html = '<p>Les semelles sont remboursées sur prescription médicale.</p>';
      const result = parseFaqSemelles(html);
      expect(result.mentionsPrescription).toBe(true);
    });

    test('extrait un pourcentage BR dans le contexte orthopédique', () => {
      const html = '<div>Semelles orthopédiques remboursées à 100 % de la base de remboursement</div>';
      const result = parseFaqSemelles(html);
      expect(result.pourcentageBR).toBe(100);
      expect(result.mentionsRemboursement).toBe(true);
    });

    test('extrait un forfait en euros', () => {
      const html = '<span>Forfait annuel de 200 € pour les équipements</span>';
      const result = parseFaqSemelles(html);
      expect(result.forfait).toBe(200);
    });

    test('retourne null pour le pourcentage si rien trouvé', () => {
      const html = '<div>Pas de données pertinentes</div>';
      const result = parseFaqSemelles(html);
      expect(result.pourcentageBR).toBeNull();
      expect(result.mentionsRemboursement).toBe(false);
    });
  });

  describe('URLs sources', () => {
    test('les URLs des PDFs officiels sont définies', () => {
      expect(URLS.pdfEquipement1).toMatch(/harmonie-mutuelle\.fr.*PSI210/);
      expect(URLS.pdfEquipement2).toMatch(/harmonie-mutuelle\.fr.*PSI220/);
      expect(URLS.pdfEquipement3).toMatch(/harmonie-mutuelle\.fr.*PSI230/);
    });

    test('la page FAQ semelles est définie', () => {
      expect(URLS.faqSemelles).toMatch(/harmonie-mutuelle\.fr/);
    });
  });

  describe('cohérence avec mutuelles.json', () => {
    const fs = require('fs');
    const path = require('path');
    const mutuelles = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/mutuelles.json'), 'utf-8')
    );
    const harmonieJson = mutuelles.find(m => m.nom === 'Harmonie Mutuelle');
    const verified = getVerifiedData();

    test('les formules JSON correspondent aux données vérifiées', () => {
      expect(harmonieJson.formules).toEqual(verified.formules);
    });

    test('le dataSource est "scraped" dans le JSON', () => {
      expect(harmonieJson.dataSource).toBe('scraped');
    });

    test('le confidenceScore est >= 0.5 dans le JSON', () => {
      expect(harmonieJson.confidenceScore).toBeGreaterThanOrEqual(0.5);
    });

    test('lastUpdated est renseigné dans le JSON', () => {
      expect(harmonieJson.lastUpdated).not.toBeNull();
    });
  });
});
