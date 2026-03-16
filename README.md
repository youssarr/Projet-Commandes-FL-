# Commande de Fruits et Légumes

Application web de commande en ligne de fruits et légumes, développée en JavaScript vanilla avec le patron de conception SAM (State-Action-Model).

## Fonctionnalités

- Affichage des articles en vue **grille** ou **liste**
- **Filtres** par catégorie (fruits, légumes) et par origine
- **Recherche** par nom d'article
- **Pagination** configurable (nombre de lignes par page)
- Ajout au **panier** avec gestion des quantités
- Tri du panier par nom ou par prix
- **Thème sombre** (dark mode)
- Interface responsive (adaptation à la largeur du navigateur)

## Structure du projet

```
Projet_Commande_ARRIM/
├── commande.xhtml       # Page principale (HTML)
├── commande.js          # Logique de l'application (pattern SAM)
├── commande.css         # Styles et thèmes
├── donnees/
│   ├── artiPart1.js     # Données : prix, quantités, unités
│   └── artiPart2.js     # Données : noms, catégories, images
└── images/              # Photos des fruits et légumes
```

## Technologies utilisées

- HTML / CSS / JavaScript (ES6+)
- [BeerCSS](https://www.beercss.com/) — framework UI Material Design
- Patron de conception [SAM](http://sam.js.org/) (State-Action-Model)

## Lancement

Ouvrir le fichier `commande.xhtml` dans un navigateur web.

> Aucune installation requise, aucune dépendance externe à installer.

## Auteur

**ARRIM Youssef**
