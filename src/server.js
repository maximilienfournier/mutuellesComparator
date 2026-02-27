const express = require('express');
const path = require('path');
const { loadMutuelles, calculerRemboursement, simulerDeuxFactures, BASE_SECU, TAUX_SECU } = require('./comparator');
const { genererDevisHTML } = require('./devis');

const app = express();
const mutuelles = loadMutuelles();

app.use(express.static(path.join(__dirname, '..', 'public')));

// GET /api/mutuelles — list all mutuelles
app.get('/api/mutuelles', (req, res) => {
  const result = mutuelles.map(m => ({
    nom: m.nom,
    siren: m.siren,
    codesAMC: m.codesAMC || [],
    formules: Object.keys(m.formules).map(nom => ({
      nom,
      pourcentageBR: m.formules[nom].pourcentageBR,
      forfaitAnnuel: m.formules[nom].forfaitAnnuel || 0,
      forfaitPodologie: m.formules[nom].forfaitPodologie || null
    })),
    frequence: m.frequence,
    conditions: m.conditions,
    dataSource: m.dataSource,
    confidenceScore: m.confidenceScore
  }));
  res.json(result);
});

// GET /api/calcul?mutuelle=X&formule=Y&prix=Z
app.get('/api/calcul', (req, res) => {
  const { mutuelle: nomMutuelle, formule, prix } = req.query;

  if (!nomMutuelle || !formule) {
    return res.status(400).json({ error: 'Parametres requis: mutuelle, formule' });
  }

  const mut = mutuelles.find(m => m.nom === nomMutuelle);
  if (!mut) {
    return res.status(404).json({ error: `Mutuelle "${nomMutuelle}" introuvable` });
  }

  const prixSemelles = parseFloat(prix) || 0;

  try {
    const calcul = calculerRemboursement(mut, formule, prixSemelles);
    const formuleData = mut.formules[formule];
    const forfait = formuleData.forfaitAnnuel ?? mut.forfaitAnnuel ?? 0;
    const plafond = BASE_SECU * (formuleData.pourcentageBR / 100) + forfait;

    res.json({
      ...calcul,
      forfait,
      plafond: Math.round(plafond * 100) / 100,
      dataSource: mut.dataSource,
      confidenceScore: mut.confidenceScore
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/simulation?mutuelle=X&formule=Y&prixSemelles=S&prixBilan=B
app.get('/api/simulation', (req, res) => {
  const { mutuelle: nomMutuelle, formule, prixSemelles, prixBilan } = req.query;

  if (!nomMutuelle || !formule || !prixSemelles || !prixBilan) {
    return res.status(400).json({ error: 'Parametres requis: mutuelle, formule, prixSemelles, prixBilan' });
  }

  const mut = mutuelles.find(m => m.nom === nomMutuelle);
  if (!mut) {
    return res.status(404).json({ error: `Mutuelle "${nomMutuelle}" introuvable` });
  }

  const ps = parseFloat(prixSemelles);
  const pb = parseFloat(prixBilan);
  if (isNaN(ps) || ps <= 0 || isNaN(pb) || pb <= 0) {
    return res.status(400).json({ error: 'Prix invalides' });
  }

  try {
    const simulation = simulerDeuxFactures(mut, formule, ps, pb);
    res.json(simulation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/devis?mutuelle=X&formule=Y&prix=Z&patient=N&podologue=P
app.get('/api/devis', (req, res) => {
  const { mutuelle: nomMutuelle, formule, prix, patient, podologue } = req.query;

  if (!nomMutuelle || !formule || !prix) {
    return res.status(400).json({ error: 'Parametres requis: mutuelle, formule, prix' });
  }

  const mut = mutuelles.find(m => m.nom === nomMutuelle);
  if (!mut) {
    return res.status(404).json({ error: `Mutuelle "${nomMutuelle}" introuvable` });
  }

  const prixSemelles = parseFloat(prix);
  if (isNaN(prixSemelles) || prixSemelles <= 0) {
    return res.status(400).json({ error: 'Prix invalide' });
  }

  try {
    const calcul = calculerRemboursement(mut, formule, prixSemelles);
    const formuleData = mut.formules[formule];
    calcul.forfait = formuleData.forfaitAnnuel ?? mut.forfaitAnnuel ?? 0;

    const html = genererDevisHTML({ calcul, patient, podologue });
    res.type('html').send(html);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Serveur demarre sur http://localhost:${PORT}`);
  });
}

module.exports = app;
