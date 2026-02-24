const { loadMutuelles, comparerRemboursements } = require('./comparator');
const { formaterResultats } = require('./formatter');

const prixSemelles = parseFloat(process.argv[2]) || 150;

const mutuelles = loadMutuelles();
const resultats = comparerRemboursements(mutuelles, prixSemelles);

console.log(formaterResultats(resultats));
