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

function calculerRemboursementBilan(mutuelle, formuleNom, prixBilan) {
  const formule = mutuelle.formules[formuleNom];
  if (!formule) {
    throw new Error(`Formule "${formuleNom}" introuvable pour ${mutuelle.nom}`);
  }

  const fp = formule.forfaitPodologie;
  if (!fp) {
    return {
      nom: mutuelle.nom,
      formule: formuleNom,
      prixBilan,
      remboursementPodologie: 0,
      resteACharge: arrondir(prixBilan),
      forfaitDisponible: false
    };
  }

  // Plafonner par séance si applicable
  let remboursement = prixBilan;
  if (fp.montantParSeance != null) {
    remboursement = Math.min(remboursement, fp.montantParSeance);
  }
  // Plafonner par le montant annuel si applicable
  if (fp.montantAnnuel != null) {
    remboursement = Math.min(remboursement, fp.montantAnnuel);
  }

  remboursement = Math.min(remboursement, prixBilan);

  return {
    nom: mutuelle.nom,
    formule: formuleNom,
    prixBilan,
    remboursementPodologie: arrondir(remboursement),
    resteACharge: arrondir(Math.max(0, prixBilan - remboursement)),
    forfaitDisponible: true,
    forfaitPodologie: fp
  };
}

function simulerDeuxFactures(mutuelle, formuleNom, prixSemelles, prixBilan) {
  const prixTotal = prixSemelles + prixBilan;

  // Scénario A : facture unique (tout en semelles)
  const factureUnique = calculerRemboursement(mutuelle, formuleNom, prixTotal);

  // Scénario B : deux factures séparées
  const factureSemelles = calculerRemboursement(mutuelle, formuleNom, prixSemelles);
  const factureBilan = calculerRemboursementBilan(mutuelle, formuleNom, prixBilan);
  const racDeuxFactures = arrondir(factureSemelles.resteACharge + factureBilan.resteACharge);

  return {
    prixTotal,
    prixSemelles,
    prixBilan,
    factureUnique: {
      resteACharge: factureUnique.resteACharge,
      remboursementSecu: factureUnique.remboursementSecu,
      remboursementMutuelle: factureUnique.remboursementMutuelle
    },
    deuxFactures: {
      resteACharge: racDeuxFactures,
      semelles: {
        resteACharge: factureSemelles.resteACharge,
        remboursementSecu: factureSemelles.remboursementSecu,
        remboursementMutuelle: factureSemelles.remboursementMutuelle
      },
      bilan: {
        resteACharge: factureBilan.resteACharge,
        remboursementPodologie: factureBilan.remboursementPodologie
      }
    },
    gain: arrondir(factureUnique.resteACharge - racDeuxFactures),
    forfaitPodologieDisponible: factureBilan.forfaitDisponible
  };
}

function optimiserRepartition(mutuelle, formuleNom, prixTotal) {
  const formule = mutuelle.formules[formuleNom];
  if (!formule) {
    throw new Error(`Formule "${formuleNom}" introuvable pour ${mutuelle.nom}`);
  }

  // Base : facture unique (tout en semelles)
  const factureUnique = calculerRemboursement(mutuelle, formuleNom, prixTotal);

  if (!formule.forfaitPodologie) {
    return {
      prixTotal,
      optimisationPossible: false,
      factureUnique: {
        resteACharge: factureUnique.resteACharge,
        remboursementSecu: factureUnique.remboursementSecu,
        remboursementMutuelle: factureUnique.remboursementMutuelle
      },
      meilleureSolution: 'unique',
      repartitionOptimale: null,
      gain: 0
    };
  }

  // Itérer sur les répartitions possibles (pas de 1€)
  let meilleurRAC = factureUnique.resteACharge;
  let meilleurPrixBilan = 0;

  for (let prixBilan = 1; prixBilan <= prixTotal; prixBilan++) {
    const prixSemelles = prixTotal - prixBilan;
    const racSemelles = calculerRemboursement(mutuelle, formuleNom, prixSemelles).resteACharge;
    const racBilan = calculerRemboursementBilan(mutuelle, formuleNom, prixBilan).resteACharge;
    const racTotal = arrondir(racSemelles + racBilan);

    if (racTotal < meilleurRAC) {
      meilleurRAC = racTotal;
      meilleurPrixBilan = prixBilan;
    }
  }

  const gain = arrondir(factureUnique.resteACharge - meilleurRAC);

  if (meilleurPrixBilan === 0) {
    return {
      prixTotal,
      optimisationPossible: true,
      factureUnique: {
        resteACharge: factureUnique.resteACharge,
        remboursementSecu: factureUnique.remboursementSecu,
        remboursementMutuelle: factureUnique.remboursementMutuelle
      },
      meilleureSolution: 'unique',
      repartitionOptimale: null,
      gain: 0
    };
  }

  const prixSemelles = prixTotal - meilleurPrixBilan;
  const detailSemelles = calculerRemboursement(mutuelle, formuleNom, prixSemelles);
  const detailBilan = calculerRemboursementBilan(mutuelle, formuleNom, meilleurPrixBilan);

  return {
    prixTotal,
    optimisationPossible: true,
    factureUnique: {
      resteACharge: factureUnique.resteACharge,
      remboursementSecu: factureUnique.remboursementSecu,
      remboursementMutuelle: factureUnique.remboursementMutuelle
    },
    meilleureSolution: 'deuxFactures',
    repartitionOptimale: {
      prixBilan: meilleurPrixBilan,
      prixSemelles,
      resteACharge: meilleurRAC,
      semelles: {
        resteACharge: detailSemelles.resteACharge,
        remboursementSecu: detailSemelles.remboursementSecu,
        remboursementMutuelle: detailSemelles.remboursementMutuelle
      },
      bilan: {
        resteACharge: detailBilan.resteACharge,
        remboursementPodologie: detailBilan.remboursementPodologie
      }
    },
    gain
  };
}

function arrondir(val) {
  return Math.round(val * 100) / 100;
}

module.exports = {
  loadMutuelles,
  calculerRemboursement,
  calculerRemboursementBilan,
  simulerDeuxFactures,
  optimiserRepartition,
  comparerRemboursements,
  trouverMeilleure,
  listerFormules,
  BASE_SECU,
  TAUX_SECU
};
