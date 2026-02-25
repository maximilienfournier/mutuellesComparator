const {
  parseRemboursementData,
  buildAlanData,
  updateMutuellesJson,
  ALAN_SIREN
} = require('../../src/scrapers/alan');

const fs = require('fs');
const path = require('path');

describe('parseRemboursementData', () => {
  test('extracts generic BR percentages from HTML content', () => {
    const html = 'Le remboursement est de 200 % BR pour le petit appareillage';
    const result = parseRemboursementData(html);
    expect(result.foundBRValues).toContain(200);
  });

  test('extracts multiple BR values', () => {
    const html = 'Green: 200% BR, Blue: 250 % BR, Purple: 300 % de la BRSS';
    const result = parseRemboursementData(html);
    expect(result.foundBRValues).toEqual(expect.arrayContaining([200, 250, 300]));
  });

  test('extracts formula-specific BR values when format is explicit', () => {
    const html = 'Alan Green : 200 % BR pour appareillage. Alan Blue : 300 % BR.';
    const result = parseRemboursementData(html);
    expect(result.formulaBRValues).toEqual({ Green: 200, Blue: 300 });
  });

  test('does NOT promote generic BR values to formula-specific', () => {
    const html = 'Le taux Sécu est de 60 % BR. Les mutuelles proposent entre 100 % BRSS et 300 % BRSS.';
    const result = parseRemboursementData(html);
    expect(result.foundBRValues).toBeDefined();
    expect(result.formulaBRValues).toBeUndefined();
  });

  test('extracts confirmed forfait near semelle/orthopédie context', () => {
    const html = 'Les semelles orthopédiques bénéficient d\'un forfait de 100 € par an.';
    const result = parseRemboursementData(html);
    expect(result.confirmedForfait).toBe(100);
  });

  test('extracts generic forfait separately', () => {
    const html = 'un forfait de 100 € pour les soins dentaires';
    const result = parseRemboursementData(html);
    expect(result.forfaitAnnuel).toBe(100);
    expect(result.confirmedForfait).toBeNull();
  });

  test('extracts forfait with "par an" pattern', () => {
    const html = 'remboursement de 150 € par an pour les orthèses';
    const result = parseRemboursementData(html);
    expect(result.forfaitAnnuel).toBe(150);
  });

  test('extracts frequency', () => {
    const html = 'prise en charge limitée à 1 paire par an';
    const result = parseRemboursementData(html);
    expect(result.frequence).toBe('1 paire par an');
  });

  test('finds Alan formula names', () => {
    const html = 'Avec Alan Green vous bénéficiez... Alan Blue offre... Alan Purple couvre...';
    const result = parseRemboursementData(html);
    expect(result.foundFormulas).toEqual(expect.arrayContaining(['Green', 'Blue', 'Purple']));
  });

  test('returns empty results for irrelevant HTML', () => {
    const html = '<div>Bienvenue sur notre site de cuisine</div>';
    const result = parseRemboursementData(html);
    expect(result.foundBRValues).toBeUndefined();
    expect(result.forfaitAnnuel).toBeNull();
    expect(result.confirmedForfait).toBeNull();
    expect(result.frequence).toBeNull();
  });
});

describe('buildAlanData', () => {
  test('returns estimated data with low confidence when no scraping results', () => {
    const data = buildAlanData(null);
    expect(data.nom).toBe('Alan');
    expect(data.siren).toBe(ALAN_SIREN);
    expect(data.formules.Blue.pourcentageBR).toBe(250);
    expect(data.formules.Green.pourcentageBR).toBe(200);
    expect(data.formules.Purple.pourcentageBR).toBe(300);
    expect(data.dataSource).toBe('estimated');
    expect(data.confidenceScore).toBe(0.2);
  });

  test('stays estimated with slightly higher confidence when generic BR values found', () => {
    const scrapedData = { foundBRValues: [60, 200, 300], forfaitAnnuel: 50 };
    const data = buildAlanData(scrapedData);
    expect(data.dataSource).toBe('estimated');
    expect(data.confidenceScore).toBe(0.3);
    // Still uses estimated formules, not the generic BR values
    expect(data.formules.Blue.pourcentageBR).toBe(250);
  });

  test('upgrades to scraped only when formula-specific BR values are found', () => {
    const scrapedData = {
      formulaBRValues: { Green: 180, Blue: 280, Purple: 350 }
    };
    const data = buildAlanData(scrapedData);
    expect(data.dataSource).toBe('scraped');
    expect(data.confidenceScore).toBe(0.8);
    expect(data.formules.Green.pourcentageBR).toBe(180);
    expect(data.formules.Blue.pourcentageBR).toBe(280);
    expect(data.formules.Purple.pourcentageBR).toBe(350);
  });

  test('ignores generic forfait, only uses confirmed forfait', () => {
    const scrapedData = { forfaitAnnuel: 50, confirmedForfait: null };
    const data = buildAlanData(scrapedData);
    expect(data.forfaitAnnuel).toBeNull();
  });

  test('uses confirmed forfait when found in orthopedic context', () => {
    const scrapedData = { confirmedForfait: 100 };
    const data = buildAlanData(scrapedData);
    expect(data.forfaitAnnuel).toBe(100);
  });

  test('includes lastUpdated date', () => {
    const data = buildAlanData(null);
    expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('defaults to standard conditions', () => {
    const data = buildAlanData(null);
    expect(data.frequence).toBe('1 paire par an');
    expect(data.conditions).toBe('Sur prescription médicale');
  });
});

describe('updateMutuellesJson', () => {
  const testFile = path.join(__dirname, '..', '..', 'data', 'mutuelles.json');
  let originalContent;

  beforeAll(() => {
    originalContent = fs.readFileSync(testFile, 'utf-8');
  });

  afterAll(() => {
    fs.writeFileSync(testFile, originalContent, 'utf-8');
  });

  test('updates existing Alan entry in mutuelles.json', () => {
    const alanData = buildAlanData(null);
    updateMutuellesJson(alanData);

    const mutuelles = JSON.parse(fs.readFileSync(testFile, 'utf-8'));
    const alan = mutuelles.find(m => m.siren === ALAN_SIREN);

    expect(alan).toBeDefined();
    expect(alan.nom).toBe('Alan');
    expect(alan.dataSource).toBe('estimated');
    expect(alan.confidenceScore).toBe(0.2);
  });

  test('preserves other mutuelles when updating', () => {
    const mutuellesBefore = JSON.parse(fs.readFileSync(testFile, 'utf-8'));
    const countBefore = mutuellesBefore.length;

    const alanData = buildAlanData(null);
    updateMutuellesJson(alanData);

    const mutuellesAfter = JSON.parse(fs.readFileSync(testFile, 'utf-8'));
    expect(mutuellesAfter.length).toBe(countBefore);
  });
});
