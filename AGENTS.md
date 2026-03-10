# Herbarius Static

## Projet
Conversion du site Drupal 7 herbarius.net en site statique HTML/CSS/JS moderne.
- **Domaines** : herbarius.net / herbarius.fr (même site, redirection DNS)
- **Langues** : Français (principal) + English
- **Propriétaire** : Florence GOULLEY — Herbarius, jardin botanique médiéval à Planguenoual (22)

## Architecture cible
- Site 100% statique (HTML, CSS, JS vanilla ou minimal)
- Pas de framework JS lourd — performance et simplicité
- Hébergement statique (Netlify, Cloudflare Pages, ou serveur simple)
- SSL valide obligatoire

## Pages identifiées (depuis Drupal)
| Slug | Titre | Status |
|------|-------|--------|
| accueil | Accueil | OK |
| a-la-une | Programme / Prochains événements | OK |
| activités | Activités | OK |
| infos-pratiques | Infos pratiques | OK |
| node/29 | Visite virtuelle | OK |
| contact | Contact | OK |
| visites-botaniques | Visites botaniques | OK |
| ateliers | Ateliers | OK |
| conferences | Conférences | OK |
| conception | Conception de jardins médiévaux | OK |
| vente-plantes | Vente de plantes | OK |
| liste-tomates | Liste tomates | OK |
| cabane-tarifs | Cabane - Tarifs | OK |
| cabane-photos | Cabane - Photos | OK |
| cabane-infos | Cabane - Nous joindre | OK |
| cabane-activités | Cabane - Activités | ? (HTTP 400) |
| accueil-groupes | Accueil de groupes | OK |
| qui-sommes-nous | Qui sommes nous ? | OK |

## Stack technique
- **SSG** : Eleventy (11ty) v3
- HTML5 sémantique avec templates Nunjucks (.njk)
- CSS moderne (variables CSS, flexbox/grid)
- JS vanilla minimal (pas de framework)
- **i18n** : FR + EN, layout partagé, contenus séparés par langue

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
public/                     # Sortie (générée par eleventy)
  fr/*.html
  en/*.html
  index.html                # Redirect → /fr/index.html
```

## Commandes
- `npm run build` — génère le site dans public/
- `npm run dev` — serveur de dev avec hot-reload
- `npm run clean` — supprime les fichiers générés

## Conventions
- Langue du code et des commits : français pour le contenu, anglais pour le code
- Encodage : UTF-8
- Images/docs : restent hébergées sur herbarius.net, liens conservés — le propriétaire modifiera si besoin

## Fonctionnalités dynamiques à remplacer
- **Recherche Drupal** → recherche statique côté client (lunr.js ou similaire) ou suppression
- **Formulaire de contact** → mailto: link ou service tiers (Formspree, etc.)
- **Slideshow** (views_slideshow) → CSS/JS simple

## Agents
Ce projet utilise les agents bmad-bmm pour le workflow de développement.
