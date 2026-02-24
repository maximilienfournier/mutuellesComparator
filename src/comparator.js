const fs = require('fs');
const path = require('path');

function loadMutuelles(filePath) {
  const defaultPath = path.join(__dirname, '..', 'data', 'mutuelles.json');
  const data = fs.readFileSync(filePath || defaultPath, 'utf-8');
  return JSON.parse(data);
}

function calculerRemboursement(mutuelle, prixSemelles) {
  const remboursementSecu = mutuelle.baseSecu * 0.6;
  const resteApresSecu = prixSemelles - remboursementSecu;

  const remboursementMutuelle = Math.min(
    resteApresSecu,
    mutuelle.remboursementMax,
    resteApresSecu * (mutuelle.pourcentage / 100)
  );

  const resteACharge = prixSemelles - remboursementSecu - remboursementMutuelle;

  return {
    nom: mutuelle.nom,
    prixSemelles,
    remboursementSecu: Math.round(remboursementSecu * 100) / 100,
    remboursementMutuelle: Math.round(remboursementMutuelle * 100) / 100,
    resteACharge: Math.round(Math.max(0, resteACharge) * 100) / 100,
    frequence: mutuelle.frequence,
    conditions: mutuelle.conditions
  };
}

function comparerRemboursements(mutuelles, prixSemelles) {
  return mutuelles
    .map(m => calculerRemboursement(m, prixSemelles))
    .sort((a, b) => a.resteACharge - b.resteACharge);
}

function trouverMeilleure(mutuelles, prixSemelles) {
  const resultats = comparerRemboursements(mutuelles, prixSemelles);
  return resultats[0] || null;
}

module.exports = { loadMutuelles, calculerRemboursement, comparerRemboursements, trouverMeilleure };
