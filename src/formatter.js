function formaterResultat(resultat) {
  return [
    `--- ${resultat.nom} (${resultat.formule}) ---`,
    `  Prix semelles      : ${resultat.prixSemelles.toFixed(2)} €`,
    `  Rembt Sécu         : ${resultat.remboursementSecu.toFixed(2)} €`,
    `  Rembt mutuelle     : ${resultat.remboursementMutuelle.toFixed(2)} € (${resultat.pourcentageBR}% BR)`,
    `  Reste à charge     : ${resultat.resteACharge.toFixed(2)} €`,
    `  Fréquence          : ${resultat.frequence}`,
    `  Conditions         : ${resultat.conditions}`
  ].join('\n');
}

function formaterResultats(resultats) {
  if (!resultats || resultats.length === 0) {
    return 'Aucune mutuelle à comparer.';
  }

  const header = `=== Comparaison pour des semelles à ${resultats[0].prixSemelles.toFixed(2)} € ===\n`;
  const body = resultats.map(formaterResultat).join('\n\n');
  const best = resultats[0];
  const footer = `\n\nMeilleure option : ${best.nom} - ${best.formule} (reste à charge : ${best.resteACharge.toFixed(2)} €)`;

  return header + body + footer;
}

module.exports = { formaterResultat, formaterResultats };
