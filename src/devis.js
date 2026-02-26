const { BASE_SECU } = require('./comparator');

function genererDevisHTML(options) {
  const { calcul, patient, podologue, date } = options;
  const dateStr = date || new Date().toLocaleDateString('fr-FR');

  const forfait = calcul.forfait || 0;
  const totalRembourse = calcul.remboursementSecu + calcul.remboursementMutuelle;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devis semelles orthopédiques</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #2c5282; padding-bottom: 20px; }
    .header-left h1 { font-size: 20px; color: #2c5282; }
    .header-right { text-align: right; color: #666; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info-block { flex: 1; }
    .info-block h3 { font-size: 13px; text-transform: uppercase; color: #666; margin-bottom: 8px; }
    .info-block p { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #2c5282; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:last-child td { border-bottom: 2px solid #2c5282; }
    .amount { text-align: right; font-variant-numeric: tabular-nums; }
    .total-row { font-weight: bold; background: #ebf4ff; }
    .reste-row { font-weight: bold; background: #fff5f5; color: #c53030; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #888; }
    .footer p { margin-bottom: 4px; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>Devis - Semelles orthopédiques</h1>
    </div>
    <div class="header-right">
      <p>Date : ${dateStr}</p>
    </div>
  </div>

  <div class="info-section">
    <div class="info-block">
      <h3>Podologue</h3>
      <p>${escapeHtml(podologue || 'Non renseigne')}</p>
    </div>
    <div class="info-block">
      <h3>Patient</h3>
      <p>${escapeHtml(patient || 'Non renseigne')}</p>
    </div>
    <div class="info-block">
      <h3>Mutuelle</h3>
      <p>${escapeHtml(calcul.nom)}</p>
      <p>Formule : ${escapeHtml(calcul.formule)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="amount">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Prix des semelles orthopédiques</td>
        <td class="amount">${formatEuros(calcul.prixSemelles)}</td>
      </tr>
      <tr>
        <td>Remboursement Securite sociale (${calcul.pourcentageBR}% BR, base ${formatEuros(BASE_SECU)})</td>
        <td class="amount">- ${formatEuros(calcul.remboursementSecu)}</td>
      </tr>
      <tr>
        <td>Remboursement mutuelle${forfait > 0 ? ' (dont forfait ' + formatEuros(forfait) + ')' : ''}</td>
        <td class="amount">- ${formatEuros(calcul.remboursementMutuelle)}</td>
      </tr>
      <tr class="total-row">
        <td>Total rembourse</td>
        <td class="amount">${formatEuros(totalRembourse)}</td>
      </tr>
      <tr class="reste-row">
        <td>Reste a charge patient</td>
        <td class="amount">${formatEuros(calcul.resteACharge)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Ce devis est etabli a titre indicatif. Les montants de remboursement sont bases sur la Base de Remboursement de la Securite Sociale (BRSS) de ${formatEuros(BASE_SECU)} pour les semelles orthopediques (pointure &gt; 37).</p>
    <p>Le remboursement effectif depend du contrat souscrit aupres de votre mutuelle et de votre situation personnelle.</p>
    <p>Frequence : ${escapeHtml(calcul.frequence || 'Non precisee')}</p>
    <p>Conditions : ${escapeHtml(calcul.conditions || 'Sur prescription medicale')}</p>
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatEuros(amount) {
  return Number(amount).toFixed(2) + ' &euro;';
}

module.exports = { genererDevisHTML, escapeHtml, formatEuros };
