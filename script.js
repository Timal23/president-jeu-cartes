// ═══════════════════════════════════════════════════
// VARIABLES GLOBALES (identiques, on ne change rien)
// ═══════════════════════════════════════════════════
const couleurs = ['coeur', 'carreau', 'trèfle', 'pique'];
const valeurs = ['3', '4', '5', '6', '7', '8', '9', '10', 'Valet', 'Dame', 'Roi', 'As', '2'];
const symboles = {
    'coeur':   { symbole: '♥', couleur: 'rouge' },
    'carreau': { symbole: '♦', couleur: 'rouge' },
    'trèfle':  { symbole: '♣', couleur: 'noir' },
    'pique':   { symbole: '♠', couleur: 'noir' }
};
const paquet = [];
let dernierCoup = [];
let joueurs = [
    { nom: "Joueur 1", main: [] },
    { nom: "Joueur 2", main: [] }
];
let cartesSelection = [];
let joueurActif = 0;
let cartesPoseesSurPli = 0;
let valeurPliActuel = '';
let partieTerminer = false;
let president = null;
let trouDuCul = null;
let nbCartesJouees = 1;

// ═══════════════════════════════════════════════════
// RÉFÉRENCES DOM (nouveau HTML)
// ═══════════════════════════════════════════════════
const conteneurJoueur1 = document.getElementById('main-joueur1');
const conteneurJoueur2 = document.getElementById('main-joueur2');
const conteneursJoueur  = [conteneurJoueur1, conteneurJoueur2];
const conteneurPli      = document.getElementById('pli');
const messageZone       = document.getElementById('message-zone');
const indicateurTour    = document.getElementById('texte-tour');
const statutAction      = document.getElementById('statut-action');
const pulseDot          = document.getElementById('pulse-dot');

// ═══════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════
function setMessage(txt) {
    messageZone.textContent = txt;
}

function setStatut(txt) {
    statutAction.textContent = txt;
}

function setIndicateurTour() {
    if (joueurActif === 0) {
        indicateurTour.textContent = 'À toi de jouer';
        pulseDot.style.background = '#ffd23e';
    } else {
        indicateurTour.textContent = "Tour de l'IA…";
        pulseDot.style.background = 'rgba(255,255,255,0.4)';
    }
}

// ═══════════════════════════════════════════════════
// GÉNÉRATION DU PAQUET
// ═══════════════════════════════════════════════════
couleurs.forEach(couleur => {
    valeurs.forEach(valeur => {
        paquet.push({ couleur, valeur });
    });
});

// ═══════════════════════════════════════════════════
// MÉLANGE (Fisher-Yates)
// ═══════════════════════════════════════════════════
function melangerPaquet(paquet) {
    for (let i = paquet.length - 1; i >= 1; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = paquet[i];
        paquet[i] = paquet[j];
        paquet[j] = temp;
    }
}
melangerPaquet(paquet);

// ═══════════════════════════════════════════════════
// DISTRIBUTION
// ═══════════════════════════════════════════════════
function distribuerCartes(joueurs) {
    paquet.forEach((carte, i) => {
        joueurs[i % joueurs.length].main.push(carte);
    });
}
distribuerCartes(joueurs);

// ═══════════════════════════════════════════════════
// CRÉER UNE CARTE HTML
// ═══════════════════════════════════════════════════
function creerCarteElement(carte, classes = []) {
    const el = document.createElement('div');
    el.classList.add('carte', ...classes);
    if (carte === 'dos') {
        el.classList.add('carte-dos');
        return el;
    }
    const info = symboles[carte.couleur];
    const isRouge = info.couleur === 'rouge';
    if (isRouge) el.classList.add('carte-rouge');
    el.innerHTML = `
        <div class="carte-coin-tl">${carte.valeur}<br>${info.symbole}</div>
        <div class="carte-centre">${info.symbole}</div>
        <div class="carte-coin-br">${carte.valeur}<br>${info.symbole}</div>
    `;
    return el;
}

// ═══════════════════════════════════════════════════
// AFFICHER MAIN EN ÉVENTAIL
// ═══════════════════════════════════════════════════
function afficherMain(joueur, conteneur) {
    conteneur.innerHTML = '';
    joueur.main.sort((a, b) => getForce(a) - getForce(b));

    const n = joueur.main.length;
    if (n === 0) return;

    const estActif = joueurs.indexOf(joueur) === joueurActif;
    const spread   = Math.min(5, 80 / n); // degrés entre chaque carte
    const offsetX  = Math.min(52, 560 / n); // px entre chaque carte

    joueur.main.forEach((carte, i) => {
        const milieu  = (n - 1) / 2;
        const delta   = i - milieu;
        const rotation = delta * spread;
        const translateY = Math.abs(delta) * 2.5; // arc léger

        let el;
        if (estActif) {
            el = creerCarteElement(carte);
        } else {
            el = creerCarteElement('dos');
        }

        el.style.left   = `calc(50% + ${delta * offsetX}px - var(--card-w) / 2)`;
        el.style.bottom = `${translateY}px`;
        el.style.transform = `rotate(${rotation}deg)`;
        el.style.zIndex = i;
        el.style.transformOrigin = 'bottom center';

        if (estActif) {
            el.addEventListener('click', () => {
                if (joueurs.indexOf(joueur) !== joueurActif) return;

                if (el.classList.contains('selection')) {
                    cartesSelection = cartesSelection.filter(c => c.carte !== carte);
                    el.classList.remove('selection');
                    el.style.bottom = `${translateY}px`;
                } else {
                    cartesSelection.push({ carte, element: el });
                    el.classList.add('selection');
                    el.style.bottom = `${translateY + 20}px`;
                }
            });
        }

        conteneur.appendChild(el);
    });
}

// ═══════════════════════════════════════════════════
// AFFICHER LE PLI
// ═══════════════════════════════════════════════════
function afficherPli() {
    conteneurPli.innerHTML = '';
    dernierCoup.forEach((item, i) => {
        const el = creerCarteElement(item.carte, ['carte-pli']);
        const delta = i - (dernierCoup.length - 1) / 2;
        el.style.transform = `rotate(${delta * 8}deg)`;
        el.style.position = 'relative';
        el.style.marginLeft = i === 0 ? '0' : '-20px';
        el.style.zIndex = i;
        conteneurPli.appendChild(el);
    });
}

// ═══════════════════════════════════════════════════
// LOGIQUE DE JEU (identique)
// ═══════════════════════════════════════════════════
function getForce(carte) {
    return valeurs.indexOf(carte.valeur);
}

function coupEstValide(cartesJouees) {
    if (!cartesJouees.every(c => c.carte.valeur === cartesJouees[0].carte.valeur)) return false;
    if (dernierCoup.length === 0) return true;
    return cartesJouees.length === dernierCoup.length &&
        getForce(cartesJouees[0].carte) >= getForce(dernierCoup[dernierCoup.length - 1].carte);
}

function jouerCoup(cartesJouees) {
    let pliTermine = false;
    dernierCoup = [...cartesJouees];
    nbCartesJouees = cartesJouees.length;

    const valeurActuelle = dernierCoup[0].carte.valeur;
    if (valeurActuelle !== valeurPliActuel) {
        cartesPoseesSurPli = 0;
        valeurPliActuel = valeurActuelle;
    }
    cartesPoseesSurPli += dernierCoup.length;
    if (cartesPoseesSurPli >= 4) pliTermine = true;
    if (dernierCoup[0].carte.valeur === '2') {
        pliTermine = true;
    }
    let partieGagnee = false;
    // Retirer les cartes jouées
    cartesJouees.forEach(({ carte, element }) => {
        if (element) element.remove();
        joueurs[joueurActif].main = joueurs[joueurActif].main.filter(c => c !== carte);
        if (joueurs[joueurActif].main.length === 0) {
            setMessage(`🏆 Joueur ${joueurActif + 1} a gagné !`);
            setStatut(joueurActif === 0 ? 'Tu es Président !' : "L'IA est Présidente !");
            partieTerminer = true;
            president = joueurs[joueurActif];
            trouDuCul = joueurs[(joueurActif + 1) % joueurs.length];
            partieGagnee = true;
        }
    });

    if (partieGagnee) return;

    cartesSelection = [];

    // Afficher le pli
    if (!pliTermine) {
        afficherPli();
        setStatut(`${joueurs[joueurActif].nom} pose ${cartesJouees.length}× ${cartesJouees[0].carte.valeur}`);
    }

    // Changer de joueur ou fermer le pli
    if (!pliTermine) {
        joueurActif = (joueurActif + 1) % joueurs.length;
    }
    if (pliTermine) {
        conteneurPli.innerHTML = '';
        cartesPoseesSurPli = 0;
        valeurPliActuel = '';
        if (dernierCoup[0]?.carte.valeur === '2') {
            setStatut(`${joueurs[joueurActif].nom} joue un 2 — pli fermé !`);
        } else {
            setStatut('4 cartes identiques — pli fermé !');
        }
        dernierCoup = [];
    }

    // Réafficher les mains
    joueurs.forEach((joueur, i) => {
        conteneursJoueur[i].innerHTML = '';
        afficherMain(joueur, conteneursJoueur[i]);
    });

    setIndicateurTour();
    setMessage('');

    if (joueurActif === 1 && !partieTerminer) {
        setTimeout(() => jouerIA(nbCartesJouees), 1500);
    }
}

// ═══════════════════════════════════════════════════
// IA
// ═══════════════════════════════════════════════════
function passerIA() {
    dernierCoup = [];
    cartesPoseesSurPli = 0;
    valeurPliActuel = '';
    joueurActif = (joueurActif + 1) % joueurs.length;
    setStatut("L'IA passe son tour");
    joueurs.forEach((joueur, i) => {
        conteneursJoueur[i].innerHTML = '';
        afficherMain(joueur, conteneursJoueur[i]);
    });
    setIndicateurTour();
}

function jouerIA(nbCartes = 1) {
    const mainTriee = joueurs[1].main.sort((a, b) => getForce(a) - getForce(b));
    let cartesAJouer;

    if (dernierCoup.length === 0) {
        const valeurLaPlusFaible = mainTriee[0].valeur;
        cartesAJouer = mainTriee
            .filter(c => c.valeur === valeurLaPlusFaible)
            .map(c => ({ carte: c, element: null }));
    } else {
        const valeurTrouvee = valeurs.find(valeur =>
            mainTriee.filter(c => c.valeur === valeur).length >= nbCartes
            &&
            valeurs.indexOf(valeur) >= getForce(dernierCoup[dernierCoup.length -1].carte)
        );
        if (!valeurTrouvee) return passerIA();
        const cartesMemValeur = mainTriee.filter(c => c.valeur === valeurTrouvee);
            cartesAJouer = cartesMemValeur.slice(0, nbCartes).map(c => ({ carte: c, element: null }));
        
    }
    jouerCoup(cartesAJouer);
}

// ═══════════════════════════════════════════════════
// ÉCHANGE DE CARTES
// ═══════════════════════════════════════════════════
function echangerCartes() {
    const mainPresidentTriee = president.main.sort((a, b) => getForce(a) - getForce(b));
    const pireCartes = mainPresidentTriee.slice(0, 2);
    const mainTrouDuCulTriee = trouDuCul.main.sort((a, b) => getForce(a) - getForce(b));
    const meilleuresCartes = mainTrouDuCulTriee.slice(-2);
    president.main = president.main.filter(c => !pireCartes.includes(c));
    trouDuCul.main = trouDuCul.main.filter(c => !meilleuresCartes.includes(c));
    president.main.push(...meilleuresCartes);
    trouDuCul.main.push(...pireCartes);
}

// ═══════════════════════════════════════════════════
// INITIALISER PARTIE
// ═══════════════════════════════════════════════════
function initialiserPartie() {
    joueurs[0].main = [];
    joueurs[1].main = [];
    melangerPaquet(paquet);
    distribuerCartes(joueurs);

    if (president !== null) echangerCartes();

    joueurActif = trouDuCul !== null ? joueurs.indexOf(trouDuCul) : 0;
    dernierCoup = [];
    cartesSelection = [];
    cartesPoseesSurPli = 0;
    valeurPliActuel = '';
    partieTerminer = false;

    conteneurPli.innerHTML = '';
    setMessage('');
    setStatut('Nouvelle partie — à toi de jouer !');
    setIndicateurTour();

    joueurs.forEach((joueur, i) => {
        conteneursJoueur[i].innerHTML = '';
        afficherMain(joueur, conteneursJoueur[i]);
    });

    if (joueurActif === 1 && !partieTerminer) {
        setTimeout(() => jouerIA(), 1500);
    }
}

// ═══════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════
document.getElementById('jouer').addEventListener('click', () => {
    if (partieTerminer) return;
    if (cartesSelection.length === 0) {
        setMessage('Sélectionne au moins une carte !');
        return;
    }
    if (!coupEstValide(cartesSelection)) {
        setMessage('Coup invalide — carte trop faible ou nombre incorrect');
        return;
    }
    jouerCoup(cartesSelection);
});

document.getElementById('passer').addEventListener('click', () => {
    if (partieTerminer) return;
    dernierCoup = [];
    cartesPoseesSurPli = 0;
    valeurPliActuel = '';
    conteneurPli.innerHTML = '';
    setStatut('Tu passes ton tour');
    joueurActif = (joueurActif + 1) % joueurs.length;
    joueurs.forEach((joueur, i) => {
        conteneursJoueur[i].innerHTML = '';
        afficherMain(joueur, conteneursJoueur[i]);
    });
    setIndicateurTour();
    if (joueurActif === 1 && !partieTerminer) {
        setTimeout(() => jouerIA(), 1500);
    }
});

document.getElementById('rejouer').addEventListener('click', () => {
    initialiserPartie();
});

// ═══════════════════════════════════════════════════
// LANCEMENT
// ═══════════════════════════════════════════════════
setIndicateurTour();
afficherMain(joueurs[0], conteneurJoueur1);
afficherMain(joueurs[1], conteneurJoueur2);
