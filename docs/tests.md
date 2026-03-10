# Tests — Herbarius Static

## Prérequis

- Node.js 22+ (un fichier `.nvmrc` est présent à la racine)

```bash
nvm use
```

## Lancer les tests

```bash
npm test
```

Cette commande :
1. Build le site avec Eleventy (`public/`)
2. Exécute les tests sur le HTML généré

## Outil

Les tests utilisent le test runner natif de Node.js (`node:test`) et [cheerio](https://github.com/cheeriojs/cheerio) pour parser le HTML. Aucun framework de test externe n'est nécessaire.

Fichier de tests : `tests/html.test.mjs`

## Ce qui est testé

### 1. Existence des fichiers
- Vérifie que chaque page attendue (FR et EN) existe dans `public/`
- Vérifie que `public/index.html` (redirect racine) existe

### 2. Structure des pages
Pour chaque page de contenu (hors redirections) :
- Attribut `lang` correct sur `<html>` (`fr` ou `en`)
- `<title>` non vide
- `<meta viewport>` présent
- `<meta description>` présent et non vide
- Présence des éléments `<header>`, `<nav>`, `<footer>`
- Lien vers le favicon
- Référence à `style.css` et `main.js`

### 3. Navigation
- Tous les liens de navigation attendus sont présents (accueil, programme, activités, hébergements, visite virtuelle, contact)
- Les liens de navigation ont un texte non vide
- Le lien de changement de langue pointe vers l'autre langue

### 4. Internationalisation (i18n)
- Chaque page FR a son équivalent EN (et inversement)
- Les balises `<link hreflang="fr">` et `<link hreflang="en">` sont présentes et pointent vers les bons préfixes

### 5. Liens internes
- Tous les liens internes (`<a href="...">`) pointent vers des fichiers qui existent dans `public/`
- Les liens externes, mailto, tel et ancres sont ignorés

### 6. Assets
- `public/css/style.css` existe
- `public/js/main.js` existe
- `public/favicon.ico` existe

### 7. Footer
- Le footer contient les infos de contact (email, téléphone, herbarius.net)
- Les liens du footer pointent vers des fichiers existants

## Ajouter une page

Si une nouvelle page est ajoutée au site, l'ajouter dans la liste `CONTENT_PAGES` (ou `REDIRECT_PAGES` pour une redirection) en haut de `tests/html.test.mjs`. Les tests vérifieront automatiquement sa structure, ses liens et sa traduction.
