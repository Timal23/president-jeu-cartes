# 🃏 Jeu de Carte — Le Président

> Un jeu de Président en HTML/CSS/JS, construit from scratch parce que je ne l'avais jamais trouvé en ligne.

**[▶ Jouer maintenant](https://timal23.github.io/president-jeu-cartes/)**

---

## À propos

Le Président est un jeu de cartes populaire en France, mais introuvable en version web jouable directement dans le navigateur. J'ai donc décidé de le construire moi-même, étape par étape, en pur HTML/CSS/JS — sans framework, sans bibliothèque externe.

---

## Règles du jeu

- 2 joueurs (extensible)
- On pose des cartes de **même valeur** ou **plus forte** que le dernier coup
- Le **2** est la carte la plus forte — jouer un 2 ferme automatiquement le pli
- **4 cartes identiques** posées = le pli se ferme automatiquement
- Premier à vider sa main = **Président** 👑
- Dernier avec des cartes = **Trou du cul** 💩
- À la partie suivante : le Trou du cul donne ses **2 meilleures cartes** au Président, qui lui rend ses **2 pires cartes**

---

## Fonctionnalités

- 🃏 Génération et mélange du paquet (algorithme Fisher-Yates)
- 🎴 Affichage des cartes avec symboles (♥ ♦ ♣ ♠) et couleurs rouge/noir
- 🔒 Main de l'adversaire cachée (dos de carte)
- ✅ Validation des coups (même valeur, force supérieure ou égale)
- 🔄 Alternance des tours
- ⏭️ Bouton Passer
- 🏆 Détection de fin de partie
- 🔁 Bouton Rejouer avec échange de cartes entre parties
- 🎨 Thème visuel "bar speakeasy" (bois sombre, cuivre, typographie rétro)

---

## Technologies

- **HTML5** — structure
- **CSS3** — flexbox, variables CSS, animations, Google Fonts
- **JavaScript Vanilla** — logique de jeu, manipulation du DOM

Aucun framework, aucune dépendance externe.

---

## Lancer le projet en local

```bash
git clone https://github.com/Timal23/president-jeu-cartes.git
cd president-jeu-cartes
# Ouvrir index.html dans un navigateur
```

---

## Ce que j'ai appris

Ce projet m'a permis de pratiquer concrètement :
- La manipulation de tableaux d'objets JS (génération, tri, filtrage)
- L'algorithme de mélange Fisher-Yates
- La gestion d'état d'une application (tours, pli, fin de partie)
- La manipulation dynamique du DOM (createElement, appendChild, remove)
- La logique de comparaison personnalisée (force des cartes)
- Le déploiement sur GitHub Pages

---

*Projet personnel — développé dans le cadre d'une reconversion web/game dev.*
