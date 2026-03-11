# Herbarius Static

## Projet
Site statique herbarius.net — jardin botanique médiéval à Planguenoual (22).
- **Domaines** : herbarius.net / herbarius.fr (même site, redirection DNS)
- **Langues** : Français (principal) + English
- **Propriétaire** : Florence GOULLEY

## Stack technique
- **SSG** : Eleventy (11ty) v3
- HTML5 sémantique avec templates Nunjucks (.njk)
- CSS moderne (variables CSS, flexbox/grid, design tokens)
- JS vanilla minimal (pas de framework)
- **i18n** : FR + EN, layout partagé, contenus séparés par langue
- **Hébergement** : FTP sur webmo.fr (user p6691)
- **CI/CD** : GitHub Actions (deploy.yml + update-programme.yml)

## Architecture i18n
```
src/
  _data/i18n.json          # Traductions nav/footer/UI commune
  _data/eleventyComputed.js # Slug helper
  _includes/layout.njk     # Layout unique (header/nav/footer)
  fr/*.njk                  # Pages françaises (contenu)
  en/*.njk                  # Pages anglaises (contenu)
  css/style.css             # CSS partagé
  js/main.js                # JS partagé
  images/                   # Images en local
public/                     # Sortie (générée par eleventy)
  fr/*.html
  en/*.html
  index.html                # Redirect → /fr/index.html
```

## Pages
| Page | Description | Notes |
|------|-------------|-------|
| index | Accueil | Hero + sections |
| programme | Programme / événements | Généré depuis Excel |
| activites | Toutes les activités | Page mono, sections : visites, ateliers, conférences, conception, pépinière |
| hebergements | Hébergements | Cabane, tente, camping |
| visite-virtuelle | Visite virtuelle | Iframe vidéo |
| contact | Contact et infos pratiques | Coordonnées, horaires, plan d'accès |
| cabane | Cabane dans les arbres | Détails et photos |
| qui-sommes-nous | À propos | Présentation |
| liste-tomates | Liste des tomates | Catalogue |
| infos-pratiques | Redirection → contact | Meta refresh, pas de layout |

Pages historiques conservées (sous-pages de l'ancien site, redirigent ou sont autonomes) :
visites-botaniques, ateliers, conferences, conception, vente-plantes

## Commandes
- `npm run build` — génère le site dans public/
- `npm run dev` — serveur de dev avec hot-reload
- `npm run clean` — supprime les fichiers générés

## Conventions CSS
- Préfixes par page : `.act-*` (activités), `.heb-*` (hébergements), `.prog-*` (programme), `.ct-*` (contact)
- Classes communes : `.section`, `.section--white`, `.section--cream`, `.section-title`, `.section-subtitle`, `.container`
- Hero pages : `.hero`, `.hero--compact`, `.hero--full` (générique) ou préfixé par page (`.act-hero`, `.heb-hero`)
- Design tokens dans `:root` (couleurs, typo, espacements)

## Pipeline Excel → Programme
- **Script** : `scripts/generate-programme.mjs`
- **Excel** : `data/programme.xlsx` (onglets "Config" + "Événements")
- **Workflow** : `update-programme.yml` — parse Excel → commit FR+EN → test → deploy
- Traduction automatique via DeepL API (secret `DEEPL_API_KEY`)

## Conventions de code
- Langue du contenu : français
- Langue du code / commits : anglais ou français selon contexte
- Encodage : UTF-8
- Images : en local dans `src/images/`
