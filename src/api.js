const https = require('https');

const API_BASE = 'https://recherche-entreprises.api.gouv.fr/search';
const NATURE_JURIDIQUE_MUTUELLE = '8210';

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function rechercherMutuelles({ page = 1, perPage = 25, query = '' } = {}) {
  let url = `${API_BASE}?nature_juridique=${NATURE_JURIDIQUE_MUTUELLE}&page=${page}&per_page=${perPage}`;
  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }
  const response = await fetchJSON(url);
  return {
    total: response.total_results,
    page: response.page,
    perPage: response.per_page,
    mutuelles: response.results.map(formatResult)
  };
}

async function rechercherParSiren(siren) {
  const url = `${API_BASE}?q=${siren}`;
  const response = await fetchJSON(url);
  const match = response.results.find(r => r.siren === siren);
  return match ? formatResult(match) : null;
}

function formatResult(result) {
  const siege = result.siege || {};
  return {
    siren: result.siren,
    nom: result.nom_complet,
    sigle: result.sigle || null,
    adresse: siege.adresse || null,
    codePostal: siege.code_postal || null,
    commune: siege.libelle_commune || null,
    categorieEntreprise: result.categorie_entreprise || null,
    trancheEffectif: result.tranche_effectif_salarie || null,
    dateCreation: result.date_creation || null,
    etatAdministratif: result.etat_administratif || null
  };
}

async function enrichirMutuelles(mutuelles) {
  const enrichies = [];
  for (const mutuelle of mutuelles) {
    if (!mutuelle.siren) {
      enrichies.push(mutuelle);
      continue;
    }
    try {
      const apiData = await rechercherParSiren(mutuelle.siren);
      if (apiData) {
        enrichies.push({
          ...mutuelle,
          adresse: apiData.adresse,
          codePostal: apiData.codePostal,
          commune: apiData.commune,
          categorieEntreprise: apiData.categorieEntreprise,
          dateCreation: apiData.dateCreation
        });
      } else {
        enrichies.push(mutuelle);
      }
    } catch {
      enrichies.push(mutuelle);
    }
  }
  return enrichies;
}

module.exports = { rechercherMutuelles, rechercherParSiren, enrichirMutuelles, fetchJSON };
