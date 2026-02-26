const request = require('supertest');
const app = require('../src/server');

describe('GET /api/mutuelles', () => {
  test('retourne la liste des mutuelles', async () => {
    const res = await request(app).get('/api/mutuelles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('chaque mutuelle a les champs requis', async () => {
    const res = await request(app).get('/api/mutuelles');
    const m = res.body[0];
    expect(m).toHaveProperty('nom');
    expect(m).toHaveProperty('formules');
    expect(m).toHaveProperty('codesAMC');
    expect(m).toHaveProperty('dataSource');
    expect(m).toHaveProperty('confidenceScore');
    expect(Array.isArray(m.formules)).toBe(true);
    expect(Array.isArray(m.codesAMC)).toBe(true);
  });

  test('chaque formule a pourcentageBR et nom', async () => {
    const res = await request(app).get('/api/mutuelles');
    const formule = res.body[0].formules[0];
    expect(formule).toHaveProperty('nom');
    expect(formule).toHaveProperty('pourcentageBR');
    expect(typeof formule.pourcentageBR).toBe('number');
  });
});

describe('GET /api/calcul', () => {
  test('calcule le remboursement MGEN Reference', async () => {
    const res = await request(app)
      .get('/api/calcul')
      .query({ mutuelle: 'MGEN', formule: 'Référence', prix: '150' });
    expect(res.status).toBe(200);
    expect(res.body.remboursementSecu).toBeCloseTo(17.32, 1);
    expect(res.body.resteACharge).toBeGreaterThanOrEqual(0);
    expect(res.body).toHaveProperty('plafond');
  });

  test('retourne le plafond meme sans prix', async () => {
    const res = await request(app)
      .get('/api/calcul')
      .query({ mutuelle: 'MGEN', formule: 'Référence' });
    expect(res.status).toBe(200);
    expect(res.body.plafond).toBeCloseTo(28.86 * 2.3, 1);
  });

  test('retourne 400 si mutuelle manquante', async () => {
    const res = await request(app)
      .get('/api/calcul')
      .query({ formule: 'Reference' });
    expect(res.status).toBe(400);
  });

  test('retourne 404 si mutuelle introuvable', async () => {
    const res = await request(app)
      .get('/api/calcul')
      .query({ mutuelle: 'Inexistante', formule: 'X' });
    expect(res.status).toBe(404);
  });

  test('retourne 400 si formule inexistante', async () => {
    const res = await request(app)
      .get('/api/calcul')
      .query({ mutuelle: 'MGEN', formule: 'Inexistante', prix: '150' });
    expect(res.status).toBe(400);
  });

  test('prend en compte le forfait formule (Harmonie)', async () => {
    const res = await request(app)
      .get('/api/calcul')
      .query({ mutuelle: 'Harmonie Mutuelle', formule: 'Équipement 3★', prix: '250' });
    expect(res.status).toBe(200);
    expect(res.body.forfait).toBe(200);
    expect(res.body.plafond).toBeCloseTo(28.86 + 200, 1);
  });
});

describe('GET /api/devis', () => {
  test('retourne du HTML', async () => {
    const res = await request(app)
      .get('/api/devis')
      .query({ mutuelle: 'MGEN', formule: 'Référence', prix: '150', patient: 'Test', podologue: 'Dr X' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('html');
    expect(res.text).toContain('<!DOCTYPE html>');
    expect(res.text).toContain('MGEN');
    expect(res.text).toContain('Test');
  });

  test('retourne 400 si prix manquant', async () => {
    const res = await request(app)
      .get('/api/devis')
      .query({ mutuelle: 'MGEN', formule: 'Référence' });
    expect(res.status).toBe(400);
  });

  test('retourne 400 si prix invalide', async () => {
    const res = await request(app)
      .get('/api/devis')
      .query({ mutuelle: 'MGEN', formule: 'Référence', prix: '-10' });
    expect(res.status).toBe(400);
  });
});

describe('GET /', () => {
  test('sert la page HTML', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('html');
  });
});
