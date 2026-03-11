# Herbarius — site statique

Site vitrine du jardin botanique médiéval [Herbarius](https://herbarius.fr), à Planguenoual (Côtes-d'Armor).

Migration complète depuis Drupal 7 vers un site 100 % statique.

> Ce dépôt contient le code source d'un site privé. Il n'est pas prévu pour être réutilisé tel quel.

## Parti pris

- **Zéro framework JS.** Le site est entièrement en HTML sémantique, CSS moderne et JS vanilla. Pas de React, pas de jQuery, pas de bundle. Le navigateur suffit.
- **Eleventy (11ty) v3** comme générateur statique — configuration minimale, contrôle total sur le markup.
- **Bilingue FR/EN** avec un layout Nunjucks partagé et des contenus séparés par langue. Les traductions d'interface vivent dans un seul fichier JSON.
- **Pas de dépendances runtime.** Deux devDependencies : Eleventy et Cheerio (pour les tests).
- **Tests HTML** automatisés : validation de la structure des pages générées.
- **Déploiement continu** via GitHub Actions → FTP sur push.

## Structure

```
src/
  fr/, en/        Pages par langue (Nunjucks)
  _includes/      Layout partagé
  _data/           Traductions, computed data
  css/, js/        Assets (passthrough copy)
public/            Sortie de build
tests/             Tests sur le HTML généré
```

## Commandes

```sh
npm run dev       # Serveur local avec hot-reload
npm run build     # Génération dans public/
npm run test      # Build + validation HTML
npm run clean     # Nettoyage
```
