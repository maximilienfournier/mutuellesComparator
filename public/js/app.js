(function () {
  'use strict';

  let mutuelles = [];
  let selectedMutuelle = null;

  const searchInput = document.getElementById('search-input');
  const suggestions = document.getElementById('suggestions');
  const mutuelleInfo = document.getElementById('mutuelle-info');
  const mutuelleNom = document.getElementById('mutuelle-nom');
  const confidenceBadge = document.getElementById('confidence-badge');
  const formuleSelect = document.getElementById('formule-select');
  const stepPlafond = document.getElementById('step-plafond');
  const plafondAmount = document.getElementById('plafond-amount');
  const plafondDetail = document.getElementById('plafond-detail');
  const stepDetail = document.getElementById('step-detail');
  const prixInput = document.getElementById('prix-input');
  const resultDetail = document.getElementById('result-detail');
  const resultSecu = document.getElementById('result-secu');
  const resultMutuelle = document.getElementById('result-mutuelle');
  const resultRac = document.getElementById('result-rac');
  const stepSimulation = document.getElementById('step-simulation');
  const simulationIntro = document.getElementById('simulation-intro');
  const bilanInput = document.getElementById('bilan-input');
  const simulationResult = document.getElementById('simulation-result');
  const simulationGain = document.getElementById('simulation-gain');
  const stepDevis = document.getElementById('step-devis');
  const btnDevis = document.getElementById('btn-devis');
  const patientInput = document.getElementById('patient-input');
  const podologueInput = document.getElementById('podologue-input');

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
    var matches = findMatches(query);
    renderSuggestions(matches);
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

  // Close suggestions on outside click
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
      li.addEventListener('click', function () {
        selectMutuelle(m);
      });
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

    // Populate formules
    formuleSelect.innerHTML = '<option value="">-- Selectionnez une formule --</option>';
    m.formules.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.nom;
      opt.textContent = f.nom + ' (' + f.pourcentageBR + '% BR' + (f.forfaitAnnuel ? ' + ' + f.forfaitAnnuel + ' \u20AC forfait' : '') + ')';
      formuleSelect.appendChild(opt);
    });

    mutuelleInfo.classList.remove('hidden');
    stepPlafond.classList.add('hidden');
    stepDetail.classList.add('hidden');
    stepSimulation.classList.add('hidden');
    stepDevis.classList.add('hidden');
    resultDetail.classList.add('hidden');
    simulationResult.classList.add('hidden');
  }

  function setBadge(dataSource, score) {
    var labels = { official: 'Officiel', scraped: 'Scrape', estimated: 'Estime' };
    var classes = { official: 'badge-official', scraped: 'badge-scraped', estimated: 'badge-estimated' };
    confidenceBadge.textContent = labels[dataSource] || dataSource;
    confidenceBadge.className = 'badge ' + (classes[dataSource] || 'badge-estimated');
  }

  // Formule selection -> show plafond
  formuleSelect.addEventListener('change', function () {
    var formuleNom = formuleSelect.value;
    if (!formuleNom || !selectedMutuelle) {
      stepPlafond.classList.add('hidden');
      stepDetail.classList.add('hidden');
      stepDevis.classList.add('hidden');
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

    stepPlafond.classList.remove('hidden');
    stepDetail.classList.remove('hidden');
    stepSimulation.classList.add('hidden');
    stepDevis.classList.add('hidden');
    resultDetail.classList.add('hidden');
    simulationResult.classList.add('hidden');
    prixInput.value = '';
    bilanInput.value = '';
  });

  // Prix input -> detailed calc
  prixInput.addEventListener('input', function () {
    var prix = parseFloat(prixInput.value);
    if (isNaN(prix) || prix <= 0 || !selectedMutuelle || !formuleSelect.value) {
      resultDetail.classList.add('hidden');
      stepDevis.classList.add('hidden');
      return;
    }

    var params = new URLSearchParams({
      mutuelle: selectedMutuelle.nom,
      formule: formuleSelect.value,
      prix: prix.toString()
    });

    fetch('/api/calcul?' + params.toString())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) {
          resultDetail.classList.add('hidden');
          return;
        }
        resultSecu.textContent = data.remboursementSecu.toFixed(2) + ' \u20AC';
        resultMutuelle.textContent = data.remboursementMutuelle.toFixed(2) + ' \u20AC';
        resultRac.textContent = data.resteACharge.toFixed(2) + ' \u20AC';
        resultDetail.classList.remove('hidden');
        stepDevis.classList.remove('hidden');

        // Show simulation section if forfait podologie is available
        var formule = selectedMutuelle.formules.find(function (f) { return f.nom === formuleSelect.value; });
        if (formule && formule.forfaitPodologie) {
          var fp = formule.forfaitPodologie;
          var desc = 'Forfait podologie disponible : ';
          if (fp.montantParSeance) desc += fp.montantParSeance + ' \u20AC/seance';
          if (fp.montantParSeance && fp.montantAnnuel) desc += ', ';
          if (fp.montantAnnuel) desc += fp.montantAnnuel + ' \u20AC/an max';
          if (fp.nbSeancesMax) desc += ', ' + fp.nbSeancesMax + ' seances/an';
          if (fp.enveloppePartagee) desc += ' (enveloppe partagee : ' + fp.enveloppePartagee + ')';
          simulationIntro.textContent = desc;
          stepSimulation.classList.remove('hidden');
        } else {
          stepSimulation.classList.add('hidden');
        }
      })
      .catch(function () {
        resultDetail.classList.add('hidden');
      });
  });

  // Bilan input -> simulation
  bilanInput.addEventListener('input', function () {
    var prixBilan = parseFloat(bilanInput.value);
    var prixSemelles = parseFloat(prixInput.value);
    if (isNaN(prixBilan) || prixBilan <= 0 || isNaN(prixSemelles) || prixSemelles <= 0 || !selectedMutuelle || !formuleSelect.value) {
      simulationResult.classList.add('hidden');
      return;
    }

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
          simulationResult.classList.add('hidden');
          return;
        }

        document.getElementById('sim-unique-prix').textContent = data.prixTotal.toFixed(2) + ' \u20AC';
        document.getElementById('sim-unique-secu').textContent = data.factureUnique.remboursementSecu.toFixed(2) + ' \u20AC';
        document.getElementById('sim-unique-mutuelle').textContent = data.factureUnique.remboursementMutuelle.toFixed(2) + ' \u20AC';
        document.getElementById('sim-unique-rac').textContent = data.factureUnique.resteACharge.toFixed(2) + ' \u20AC';

        document.getElementById('sim-deux-semelles-rac').textContent = 'RAC ' + data.deuxFactures.semelles.resteACharge.toFixed(2) + ' \u20AC';
        document.getElementById('sim-deux-bilan-remb').textContent = data.deuxFactures.bilan.remboursementPodologie.toFixed(2) + ' \u20AC';
        document.getElementById('sim-deux-rac').textContent = data.deuxFactures.resteACharge.toFixed(2) + ' \u20AC';

        if (data.gain > 0) {
          simulationGain.textContent = 'Gain avec deux factures : ' + data.gain.toFixed(2) + ' \u20AC';
          simulationGain.className = 'simulation-gain gain-positive';
        } else if (data.gain === 0) {
          simulationGain.textContent = 'Pas de difference entre les deux scenarios';
          simulationGain.className = 'simulation-gain gain-zero';
        } else {
          simulationGain.textContent = 'Facture unique plus avantageuse : ' + Math.abs(data.gain).toFixed(2) + ' \u20AC';
          simulationGain.className = 'simulation-gain gain-negative';
        }

        simulationResult.classList.remove('hidden');
      })
      .catch(function () {
        simulationResult.classList.add('hidden');
      });
  });

  // Generate devis
  btnDevis.addEventListener('click', function () {
    var prix = parseFloat(prixInput.value);
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
