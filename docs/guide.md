# Herbarius — Guide du site

## En bref

Le site est généré par **Eleventy** (un générateur de sites statiques). On écrit les
pages dans des fichiers templates (`.njk`), et Eleventy produit du HTML pur dans `public/`.

Le site existe en **deux langues** : français (`/fr/`) et anglais (`/en/`).
Le header, la navigation et le footer sont écrits **une seule fois** dans un layout
partagé. Seul le contenu des pages est dupliqué par langue.

---

## Commandes

```bash
# Installer les dépendances (à faire une seule fois, ou après un git clone)
npm install

# Générer le site (les fichiers HTML apparaissent dans public/)
npm run build

# Lancer un serveur local avec rechargement automatique
# Le site est accessible sur http://localhost:8080
npm run dev

# Supprimer les fichiers générés (public/fr/, public/en/)
npm run clean
```

---

## Structure des fichiers

```
src/                          ← Tout ce qu'on modifie est ici
│
├── _includes/
│   └── layout.njk            ← Layout commun (header, nav, footer)
│
├── _data/
│   ├── i18n.json              ← Traductions partagées (nav, footer)
│   └── eleventyComputed.js    ← Helper technique (ne pas toucher)
│
├── fr/                        ← Pages françaises
│   ├── fr.json                ← Config commune aux pages FR
│   ├── index.njk              ← Accueil
│   ├── ateliers.njk           ← Ateliers
│   ├── programme.njk          ← Programme
│   └── ...
│
├── en/                        ← Pages anglaises (même structure)
│   ├── en.json
│   ├── index.njk
│   ├── ateliers.njk
│   └── ...
│
├── css/
│   └── style.css              ← Feuille de style unique
│
├── js/
│   └── main.js                ← JavaScript (menu mobile, lightbox…)
│
├── favicon.ico
└── index.njk                  ← Redirige / vers /fr/index.html

public/                        ← Sortie générée (ne pas modifier à la main)
├── fr/*.html
├── en/*.html
├── css/style.css
├── js/main.js
└── index.html
```

---

## Tâches courantes

### Modifier le contenu d'une page

1. Ouvrir le fichier dans `src/fr/` (ou `src/en/` pour l'anglais).
2. Le contenu HTML est entre le bloc `---` (front matter) et la fin du fichier.
3. Modifier le HTML comme d'habitude.
4. Lancer `npm run build` (ou laisser tourner `npm run dev`).

**Exemple** — modifier la page Ateliers en français :
→ Éditer `src/fr/ateliers.njk`, section `<main>`.

### Modifier la navigation ou le footer

Ces éléments sont dans deux endroits :

- **Structure HTML** : `src/_includes/layout.njk`
- **Textes traduits** (labels) : `src/_data/i18n.json`

Si on ajoute un lien dans la nav, il faut :
1. Ajouter l'item dans le tableau `navItems` de `layout.njk`.
2. Ajouter le label FR et EN correspondant dans `i18n.json` → `nav`.

### Ajouter une nouvelle page

1. Créer le fichier dans `src/fr/` (ex: `src/fr/nouveau.njk`).
2. Mettre ce front matter en haut :

```
---
layout: layout.njk
title: "Titre de la page — Herbarius"
description: "Description pour le SEO."
navCurrent: ""
---
```

3. Écrire le contenu HTML en dessous.
4. Créer la version anglaise dans `src/en/nouveau.njk` avec le même nom de fichier.
5. Si la page doit apparaître dans la navigation, modifier `layout.njk` et `i18n.json`.

**`navCurrent`** sert à surligner l'item actif dans la nav. Valeurs possibles :
`"index"`, `"programme"`, `"activites"`, `"hebergements"`, `"visite-virtuelle"`,
`"contact"`, ou `""` (aucun item actif).

### Modifier le CSS

Éditer `src/css/style.css`. Le fichier est copié tel quel dans `public/css/`.

### Modifier le JavaScript

Éditer `src/js/main.js`. Même principe.

---

## Comment ça marche (en bref)

### Eleventy

Eleventy lit les fichiers `.njk` dans `src/`, applique le layout, et écrit du HTML
dans `public/`. C'est un outil Node.js, configuré dans `.eleventy.js`.

### Templates Nunjucks (.njk)

Nunjucks est un langage de templates. Ce qu'il faut retenir :

- `{{ variable }}` → affiche une variable
- `{% if condition %}...{% endif %}` → condition
- `{% for item in liste %}...{% endfor %}` → boucle
- `{{ content | safe }}` → insère le contenu de la page dans le layout

### Le système i18n

Chaque dossier de langue (`src/fr/`, `src/en/`) contient un fichier JSON
(`fr.json`, `en.json`) qui définit :

```json
{
  "lang": "fr",
  "otherLang": "en",
  "permalink": "/fr/{{ page.fileSlug }}.html"
}
```

Ces valeurs sont automatiquement disponibles dans tous les templates du dossier.
Le layout utilise `lang` pour :
- Mettre `<html lang="fr">` ou `<html lang="en">`
- Choisir les bons textes dans `i18n.json` (ex: `i18n[lang].nav.index`)
- Générer les liens internes avec le bon préfixe (`/fr/` ou `/en/`)
- Afficher le lien vers l'autre langue

### Les liens

Tous les liens internes utilisent des chemins absolus avec préfixe de langue :
- `/fr/ateliers.html` (pas `ateliers.html`)
- `/en/ateliers.html`

Les liens externes (images sur herbarius.net, PDF, etc.) restent inchangés.

---

## Déploiement

Le dossier `public/` contient le site complet, prêt à déployer.
Il suffit de servir ce dossier avec n'importe quel hébergement statique
(Netlify, Cloudflare Pages, serveur Apache/Nginx…).

La racine `/` redirige automatiquement vers `/fr/index.html`.

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `npm run build` échoue | Vérifier que `npm install` a été fait |
| Une page n'apparaît pas | Vérifier qu'elle a le front matter `---` en haut |
| La nav ne s'affiche pas bien | Vérifier `layout.njk` et `i18n.json` |
| Les images ne s'affichent pas | Les images sont sur herbarius.net, vérifier que le serveur est en ligne |
| Le language switcher pointe au mauvais endroit | Les fichiers FR et EN doivent avoir le **même nom** |
