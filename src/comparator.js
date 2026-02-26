const fs = require('fs');
const path = require('path');

const BASE_SECU = 28.86;
const TAUX_SECU = 0.6;

function loadMutuelles(filePath) {
  const defaultPath = path.join(__dirname, '..', 'data', 'mutuelles.json');
  const data = fs.readFileSync(filePath || defaultPath, 'utf-8');
  return JSON.parse(data);
}

function calculerRemboursement(mutuelle, formuleNom, prixSemelles) {
  const formule = mutuelle.formules[formuleNom];
  if (!formule) {
    throw new Error(`Formule "${formuleNom}" introuvable pour ${mutuelle.nom}`);
  }

  const remboursementSecu = BASE_SECU * TAUX_SECU;

  // Le pourcentage BR inclut la part Sécu : remboursement total = pourcentageBR% * BASE_SECU
  // La part mutuelle = total - part Sécu
  const remboursementTotal = BASE_SECU * (formule.pourcentageBR / 100);
  const partMutuelle = Math.max(0, remboursementTotal - remboursementSecu);

  // La mutuelle ne peut pas rembourser plus que ce qui reste après la Sécu
  const resteApresSecu = prixSemelles - remboursementSecu;
  const remboursementMutuelle = Math.min(partMutuelle, resteApresSecu);

  // Ajouter le forfait annuel si disponible
  const forfait = formule.forfaitAnnuel ?? mutuelle.forfaitAnnuel ?? 0;
  const totalMutuelle = remboursementMutuelle + forfait;
  const totalRembourseMutuelle = Math.min(totalMutuelle, resteApresSecu);

  const resteACharge = prixSemelles - remboursementSecu - totalRembourseMutuelle;

  return {
    nom: mutuelle.nom,
    formule: formuleNom,
    pourcentageBR: formule.pourcentageBR,
    prixSemelles,
    remboursementSecu: arrondir(remboursementSecu),
    remboursementMutuelle: arrondir(totalRembourseMutuelle),
    resteACharge: arrondir(Math.max(0, resteACharge)),
    frequence: mutuelle.frequence,
    conditions: mutuelle.conditions
  };
}

function comparerRemboursements(mutuelles, prixSemelles, formuleFilter) {
  const resultats = [];

  for (const mutuelle of mutuelles) {
    for (const [formuleNom, formule] of Object.entries(mutuelle.formules)) {
      if (formuleFilter && formuleFilter !== formuleNom) continue;
      resultats.push(calculerRemboursement(mutuelle, formuleNom, prixSemelles));
    }
  }

  return resultats.sort((a, b) => a.resteACharge - b.resteACharge);
}

function trouverMeilleure(mutuelles, prixSemelles) {
  const resultats = comparerRemboursements(mutuelles, prixSemelles);
  return resultats[0] || null;
}

function listerFormules(mutuelle) {
  return Object.keys(mutuelle.formules);
}

function arrondir(val) {
  return Math.round(val * 100) / 100;
}

module.exports = {
  loadMutuelles,
  calculerRemboursement,
  comparerRemboursements,
  trouverMeilleure,
  listerFormules,
  BASE_SECU,
  TAUX_SECU
};
