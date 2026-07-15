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
    {nom: "Joueur 1", main: []},
    {nom: "Joueur 2", main: []}
]
let cartesSelection = [];
const message = document.createElement('p');
const conteneurJoueur1 = document.getElementById('main-joueur1');
const conteneurJoueur2 = document.getElementById('main-joueur2');
const conteneursJoueur = [conteneurJoueur1, conteneurJoueur2];
const conteneurPli = document.getElementById('pli');
let joueurActif = 0;
let cartesPoseesSurPli = 0;
let valeurPliActuel = '';
let partieTerminer = false;
let president =null;
let trouDuCul = null;




couleurs.forEach((couleur) => {
    valeurs.forEach((valeur) => {
            paquet.push({ couleur, valeur });
        })
});

function melangerPaquet(paquet) {
    for (let i = paquet.length - 1; i >= 1; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = paquet[i];
        paquet[i] = paquet[j];
        paquet[j] = temp;
    }
}
melangerPaquet(paquet);

// Fonction qui distribue toutes les cartes du paquet aux joueurs, une par une à tour de rôle
function distribuerCartes(joueurs) {
    paquet.forEach((carte, i) => { // on parcourt chaque carte du paquet avec son index i
        joueurs[i % joueurs.length].main.push(carte); // le modulo alterne entre les joueurs pour distribuer à tour de rôle
    });
}

distribuerCartes(joueurs); // on appelle la fonction pour remplir la main de chaque joueur

function afficherMain(joueur, conteneur) {
    joueur.main.forEach((carte) => {
        const carteElement = document.createElement('div');
        carteElement.classList.add('carte'); // Ajoute une classe CSS pour styliser la carte .add: ajoute une classe CSS pour styliser la carte
        if (joueurs.indexOf(joueur) === joueurActif) {
            const info = symboles[carte.couleur];
            carteElement.innerHTML = `
                <div class="carte-coin">${carte.valeur}<br>${info.symbole}</div>
                <div class="carte-centre">${info.symbole}</div>
            `;
            if (info.couleur === 'rouge') carteElement.classList.add('carte-rouge');
        } else {
            carteElement.classList.add('carte-dos');
        }
        conteneur.appendChild(carteElement);
        carteElement.addEventListener('click', function(){
            if (joueurs.indexOf(joueur) !== joueurActif) {
                return
            }
            if (carteElement.classList.contains('selection')) {
                cartesSelection = cartesSelection.filter(c =>c.carte !== carte);
                carteElement.classList.remove ('selection');
            } else {
                carteElement.classList.add('selection');
                cartesSelection.push({carte, element: carteElement});
            } 
        })
    });  
};
afficherMain(joueurs[0], conteneurJoueur1);
afficherMain(joueurs[1], conteneurJoueur2);


function getForce(carte) {
    return valeurs.indexOf(carte.valeur);
}


function coupEstValide(cartesJouees) {
    if(!cartesJouees.every(carte => carte.carte.valeur === cartesJouees[0].carte.valeur)) {
        return false;
    }
    if (dernierCoup.length === 0) {
        return true;  
    }
    return cartesJouees.length === dernierCoup.length && getForce(cartesJouees[0].carte) >= getForce(dernierCoup
        [dernierCoup.length - 1].carte);
}

document.body.appendChild(message);
document.querySelector('#jouer').addEventListener('click', function(){
    if (partieTerminer) return;
    if(cartesSelection.length === 0) {
        message.textContent = "Sélectionner au moins une carte";
    } else if (coupEstValide(cartesSelection)) {
        let pliTermine = false
        dernierCoup = [...cartesSelection];
        const valeurActuelle = dernierCoup[0].carte.valeur;
        if(valeurActuelle !== valeurPliActuel) {
            cartesPoseesSurPli = 0;
            valeurPliActuel = valeurActuelle;
        } 
        cartesPoseesSurPli += dernierCoup.length;
        if (cartesPoseesSurPli >=4) {
            pliTermine = true;
        }
        
        if (dernierCoup[0].carte.valeur === '2') {
            dernierCoup = [];
            pliTermine = true
        }
       

        cartesSelection.forEach(({carte, element}) => {
            element.remove();
            joueurs[joueurActif].main = joueurs[joueurActif].main.filter(c => c !== carte);
            if (joueurs[joueurActif].main.length ===0){
                message.textContent = `Joueur ${joueurActif +1}  a gagné!`
                partieTerminer =true;
                president = joueurs[joueurActif];
                trouDuCul = joueurs[(joueurActif + 1) % joueurs.length];
            }
        });  
        cartesSelection =[];
        conteneurPli.innerHTML ='';
        dernierCoup.forEach((carte) => {
            const carteElement = document.createElement('div');
            carteElement.classList.add('carte');                              
            const info = symboles[carte.carte.couleur];
            carteElement.innerHTML = `
                <div class="carte-coin">${carte.carte.valeur}<br>${info.symbole}</div>
                <div class="carte-centre>${info.symbole}</div>
            `;
            if (info.couleur === 'rouge') carteElement.classList.add('carte-rouge');
            conteneurPli.appendChild(carteElement);  
        })
        if (!pliTermine) {
            joueurActif = (joueurActif + 1) % joueurs.length;
        }
         if (pliTermine) {
            conteneurPli.innerHTML ='';
            cartesPoseesSurPli = 0;
            valeurPliActuel = '';
            dernierCoup = [];
        }
        joueurs.forEach((joueur, i) => {
            conteneursJoueur[i].innerHTML ="";
            afficherMain(joueur, conteneursJoueur[i]);
        });
        
    } else {
        message.textContent = "Carte jouées non valide";
    }
})

document.getElementById('passer').addEventListener('click', function() {
    if(partieTerminer)return
    dernierCoup = [];
    joueurActif = (joueurActif + 1) % joueurs.length;
    joueurs.forEach((joueur, i) => {
        conteneursJoueur[i].innerHTML = "";
        afficherMain(joueur, conteneursJoueur[i]);
    })
})



function initialiserPartie(){
    joueurs[0].main = [];
    joueurs[1].main = [];
    melangerPaquet(paquet);
    distribuerCartes(joueurs);
    if (president !==null) {
        echangerCartes();
    }
    joueurActif = 0;
    dernierCoup = [];
    cartesSelection = [];
    cartesPoseesSurPli =0;
    valeurPliActuel ='';
    partieTerminer = false;
    conteneurJoueur1.innerHTML = '';
    conteneurJoueur2.innerHTML = '';
    conteneurPli.innerHTML ='';
    message.textContent = '';
    afficherMain(joueurs[0], conteneurJoueur1);
    afficherMain(joueurs[1], conteneurJoueur2);
}

document.getElementById('rejouer').addEventListener('click', function() {
    initialiserPartie();
})

function echangerCartes() {
    const mainPresidentTriee = president.main.sort((a, b) => getForce(a) - getForce(b));
    const pireCartes = mainPresidentTriee.slice(0 ,2)
    const mainTrouDuCulTriee = trouDuCul.main.sort((a, b) => getForce(a) - getForce(b));
    const meilleuresCartes = mainTrouDuCulTriee.slice(-2)

    console.log("Pires cartes du président:", pireCartes);
    console.log("Meilleures cartes du trou du cul:", meilleuresCartes);
    president.main = president.main.filter(c => !pireCartes.includes(c)); // Retirer les pires cartes du président
    trouDuCul.main = trouDuCul.main.filter(c => !meilleuresCartes.includes(c)); // celle du trou du cul
    president.main.push(...meilleuresCartes);
    trouDuCul.main.push(...pireCartes);


    console.log("Main du président après échange:", president.main);
    console.log("Main du trou du cul après échange:", trouDuCul.main);
}