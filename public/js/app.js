(function () {
  'use strict';

  var mutuelles = [];
  var selectedMutuelle = null;
  var hasForfaitPodo = false;

  var searchInput = document.getElementById('search-input');
  var suggestions = document.getElementById('suggestions');
  var mutuelleInfo = document.getElementById('mutuelle-info');
  var mutuelleNom = document.getElementById('mutuelle-nom');
  var confidenceBadge = document.getElementById('confidence-badge');
  var formuleSelect = document.getElementById('formule-select');
  var stepPlafond = document.getElementById('step-plafond');
  var plafondAmount = document.getElementById('plafond-amount');
  var plafondDetail = document.getElementById('plafond-detail');
  var stepPrix = document.getElementById('step-prix');
  var prixFieldsSingle = document.getElementById('prix-fields-single');
  var prixFieldsDouble = document.getElementById('prix-fields-double');
  var prixInput = document.getElementById('prix-input');
  var prixTotalInput = document.getElementById('prix-total-input');
  var bilanInput = document.getElementById('bilan-input');
  var simulationIntro = document.getElementById('simulation-intro');
  var stepResults = document.getElementById('step-results');
  var resultSimple = document.getElementById('result-simple');
  var resultComparison = document.getElementById('result-comparison');
  var simulationGain = document.getElementById('simulation-gain');
  var stepDevis = document.getElementById('step-devis');
  var btnDevis = document.getElementById('btn-devis');
  var patientInput = document.getElementById('patient-input');
  var podologueInput = document.getElementById('podologue-input');

  // Load mutuelles on startup
  fetch('/api/mutuelles')
    .then(function (r) { return r.json(); })
    .then(function (data) { mutuelles = data; })
    .catch(function (err) { console.error('Erreur chargement mutuelles:', err); });

  // Search input handler
  searchInput.addEventListener('input', function () {
    var query = searchInput.value.trim();
    if (query.length < 2) {
      suggestions.classList.add('hidden');
      return;
    }
    renderSuggestions(findMatches(query));
  });

  searchInput.addEventListener('keydown', function (e) {
    var items = suggestions.querySelectorAll('li');
    var active = suggestions.querySelector('li.active');
    var idx = Array.prototype.indexOf.call(items, active);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (active) active.classList.remove('active');
      idx = (idx + 1) % items.length;
      items[idx].classList.add('active');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (active) active.classList.remove('active');
      idx = idx <= 0 ? items.length - 1 : idx - 1;
      items[idx].classList.add('active');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active) active.click();
    } else if (e.key === 'Escape') {
      suggestions.classList.add('hidden');
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-group')) {
      suggestions.classList.add('hidden');
    }
  });

  function findMatches(query) {
    var q = query.toLowerCase();
    var isNumeric = /^\d+$/.test(query);
    return mutuelles.filter(function (m) {
      if (isNumeric) {
        return m.codesAMC && m.codesAMC.some(function (code) {
          return code.indexOf(query) === 0;
        });
      }
      return m.nom.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 8);
  }

  function renderSuggestions(matches) {
    if (matches.length === 0) {
      suggestions.classList.add('hidden');
      return;
    }
    suggestions.innerHTML = '';
    matches.forEach(function (m) {
      var li = document.createElement('li');
      var amcText = m.codesAMC && m.codesAMC.length > 0
        ? '<span class="amc-hint">AMC: ' + m.codesAMC.join(', ') + '</span>'
        : '';
      li.innerHTML = m.nom + amcText;
      li.addEventListener('click', function () { selectMutuelle(m); });
      suggestions.appendChild(li);
    });
    suggestions.classList.remove('hidden');
  }

  function selectMutuelle(m) {
    selectedMutuelle = m;
    searchInput.value = m.nom;
    suggestions.classList.add('hidden');

    mutuelleNom.textContent = m.nom;
    setBadge(m.dataSource, m.confidenceScore);

    formuleSelect.innerHTML = '<option value="">-- Selectionnez une formule --</option>';
    m.formules.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.nom;
      opt.textContent = f.nom + ' (' + f.pourcentageBR + '% BR' + (f.forfaitAnnuel ? ' + ' + f.forfaitAnnuel + ' \u20AC forfait' : '') + ')';
      formuleSelect.appendChild(opt);
    });

    mutuelleInfo.classList.remove('hidden');
    hideSteps();
  }

  function setBadge(dataSource) {
    var labels = { official: 'Officiel', scraped: 'Scrape', estimated: 'Estime' };
    var classes = { official: 'badge-official', scraped: 'badge-scraped', estimated: 'badge-estimated' };
    confidenceBadge.textContent = labels[dataSource] || dataSource;
    confidenceBadge.className = 'badge ' + (classes[dataSource] || 'badge-estimated');
  }

  function hideSteps() {
    stepPlafond.classList.add('hidden');
    stepPrix.classList.add('hidden');
    stepResults.classList.add('hidden');
    stepDevis.classList.add('hidden');
    resultSimple.classList.add('hidden');
    resultComparison.classList.add('hidden');
  }

  // Formule selection
  formuleSelect.addEventListener('change', function () {
    var formuleNom = formuleSelect.value;
    if (!formuleNom || !selectedMutuelle) {
      hideSteps();
      return;
    }

    var formule = selectedMutuelle.formules.find(function (f) { return f.nom === formuleNom; });
    if (!formule) return;

    var BASE_SECU = 28.86;
    var plafond = BASE_SECU * (formule.pourcentageBR / 100) + (formule.forfaitAnnuel || 0);

    plafondAmount.textContent = plafond.toFixed(2) + ' \u20AC';
    plafondDetail.textContent = formule.pourcentageBR + '% BR'
      + (formule.forfaitAnnuel ? ' + forfait ' + formule.forfaitAnnuel + ' \u20AC' : '')
      + ' | Base Secu : ' + BASE_SECU.toFixed(2) + ' \u20AC';

    // Check if this formule has forfait podologie
    hasForfaitPodo = !!(formule.forfaitPodologie);

    if (hasForfaitPodo) {
      var fp = formule.forfaitPodologie;
      var desc = 'Forfait podologie : ';
      var parts = [];
      if (fp.montantParSeance) parts.push(fp.montantParSeance + ' \u20AC/seance');
      if (fp.montantAnnuel) parts.push(fp.montantAnnuel + ' \u20AC/an max');
      if (fp.nbSeancesMax) parts.push(fp.nbSeancesMax + ' seances/an');
      desc += parts.join(', ');
      if (fp.enveloppePartagee) desc += ' (enveloppe partagee : ' + fp.enveloppePartagee + ')';
      simulationIntro.textContent = desc;
      prixFieldsSingle.classList.add('hidden');
      prixFieldsDouble.classList.remove('hidden');
    } else {
      prixFieldsSingle.classList.remove('hidden');
      prixFieldsDouble.classList.add('hidden');
    }

    stepPlafond.classList.remove('hidden');
    stepPrix.classList.remove('hidden');
    stepResults.classList.add('hidden');
    stepDevis.classList.add('hidden');
    resultSimple.classList.add('hidden');
    resultComparison.classList.add('hidden');
    prixInput.value = '';
    prixTotalInput.value = '';
    bilanInput.value = '';
  });

  // Simple mode: prix input
  prixInput.addEventListener('input', function () {
    var prix = parseFloat(prixInput.value);
    if (isNaN(prix) || prix <= 0 || !selectedMutuelle || !formuleSelect.value) {
      stepResults.classList.add('hidden');
      stepDevis.classList.add('hidden');
      return;
    }
    fetchSimpleCalc(prix);
  });

  function fetchSimpleCalc(prix) {
    var params = new URLSearchParams({
      mutuelle: selectedMutuelle.nom,
      formule: formuleSelect.value,
      prix: prix.toString()
    });

    fetch('/api/calcul?' + params.toString())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) {
          stepResults.classList.add('hidden');
          return;
        }
        document.getElementById('result-secu').textContent = data.remboursementSecu.toFixed(2) + ' \u20AC';
        document.getElementById('result-mutuelle').textContent = data.remboursementMutuelle.toFixed(2) + ' \u20AC';
        document.getElementById('result-rac').textContent = data.resteACharge.toFixed(2) + ' \u20AC';
        resultSimple.classList.remove('hidden');
        resultComparison.classList.add('hidden');
        stepResults.classList.remove('hidden');
        stepDevis.classList.remove('hidden');
      })
      .catch(function () {
        stepResults.classList.add('hidden');
      });
  }

  // Double mode: prix total + bilan → triggers comparison
  function onDoubleInput() {
    var prixTotal = parseFloat(prixTotalInput.value);
    var prixBilan = parseFloat(bilanInput.value);

    if (isNaN(prixTotal) || prixTotal <= 0 || !selectedMutuelle || !formuleSelect.value) {
      stepResults.classList.add('hidden');
      stepDevis.classList.add('hidden');
      return;
    }

    // If no bilan entered yet, show simple calc with the total price
    if (isNaN(prixBilan) || prixBilan <= 0) {
      var params = new URLSearchParams({
        mutuelle: selectedMutuelle.nom,
        formule: formuleSelect.value,
        prix: prixTotal.toString()
      });

      fetch('/api/calcul?' + params.toString())
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.error) {
            stepResults.classList.add('hidden');
            return;
          }
          document.getElementById('result-secu').textContent = data.remboursementSecu.toFixed(2) + ' \u20AC';
          document.getElementById('result-mutuelle').textContent = data.remboursementMutuelle.toFixed(2) + ' \u20AC';
          document.getElementById('result-rac').textContent = data.resteACharge.toFixed(2) + ' \u20AC';
          resultSimple.classList.remove('hidden');
          resultComparison.classList.add('hidden');
          stepResults.classList.remove('hidden');
          stepDevis.classList.remove('hidden');
        })
        .catch(function () { stepResults.classList.add('hidden'); });
      return;
    }

    if (prixBilan >= prixTotal) {
      stepResults.classList.add('hidden');
      return;
    }

    var prixSemelles = prixTotal - prixBilan;
    var params = new URLSearchParams({
      mutuelle: selectedMutuelle.nom,
      formule: formuleSelect.value,
      prixSemelles: prixSemelles.toString(),
      prixBilan: prixBilan.toString()
    });

    fetch('/api/simulation?' + params.toString())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) {
          stepResults.classList.add('hidden');
          return;
        }

        document.getElementById('sim-unique-prix').textContent = data.prixTotal.toFixed(2) + ' \u20AC';
        document.getElementById('sim-unique-secu').textContent = data.factureUnique.remboursementSecu.toFixed(2) + ' \u20AC';
        document.getElementById('sim-unique-mutuelle').textContent = data.factureUnique.remboursementMutuelle.toFixed(2) + ' \u20AC';
        document.getElementById('sim-unique-rac').textContent = data.factureUnique.resteACharge.toFixed(2) + ' \u20AC';

        document.getElementById('sim-deux-semelles-rac').textContent = data.deuxFactures.semelles.resteACharge.toFixed(2) + ' \u20AC';
        document.getElementById('sim-deux-bilan-remb').textContent = data.deuxFactures.bilan.remboursementPodologie.toFixed(2) + ' \u20AC';
        document.getElementById('sim-deux-rac').textContent = data.deuxFactures.resteACharge.toFixed(2) + ' \u20AC';

        if (data.gain > 0) {
          simulationGain.textContent = 'Deux factures : economie de ' + data.gain.toFixed(2) + ' \u20AC pour le patient';
          simulationGain.className = 'simulation-gain gain-positive';
        } else if (data.gain === 0) {
          simulationGain.textContent = 'Aucune difference entre les deux scenarios';
          simulationGain.className = 'simulation-gain gain-zero';
        } else {
          simulationGain.textContent = 'Facture unique plus avantageuse (' + Math.abs(data.gain).toFixed(2) + ' \u20AC)';
          simulationGain.className = 'simulation-gain gain-negative';
        }

        resultSimple.classList.add('hidden');
        resultComparison.classList.remove('hidden');
        stepResults.classList.remove('hidden');
        stepDevis.classList.remove('hidden');
      })
      .catch(function () {
        stepResults.classList.add('hidden');
      });
  }

  prixTotalInput.addEventListener('input', onDoubleInput);
  bilanInput.addEventListener('input', onDoubleInput);

  // Generate devis
  btnDevis.addEventListener('click', function () {
    var prix = hasForfaitPodo ? parseFloat(prixTotalInput.value) : parseFloat(prixInput.value);
    if (isNaN(prix) || prix <= 0 || !selectedMutuelle || !formuleSelect.value) return;

    var params = new URLSearchParams({
      mutuelle: selectedMutuelle.nom,
      formule: formuleSelect.value,
      prix: prix.toString(),
      patient: patientInput.value || '',
      podologue: podologueInput.value || ''
    });

    window.open('/api/devis?' + params.toString(), '_blank');
  });
})();
