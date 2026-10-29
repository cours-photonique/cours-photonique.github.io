# Carnets scientifiques

Site statique de cours de physique en français. Première thématique : la photonique intégrée (6 pages de cours, 3 exercices et problèmes corrigés, 7 labos interactifs, 1 fiche de révision).

Aucun outil de compilation n'est nécessaire : ce sont des fichiers HTML, CSS et JavaScript prêts à être servis tels quels. Le site ne fait appel à aucun service extérieur (polices et MathJax sont dans `assets/`).

## Avant de publier

Les mentions légales (`a-propos.html`) sont rédigées pour un éditeur non professionnel anonyme. Pour que ce soit vrai :

- choisissez un **nom d'utilisateur GitHub qui ne vous identifie pas** : il apparaît dans l'adresse du site (`pseudo.github.io`) ;
- l'anonymat suppose que **l'hébergeur connaisse votre identité** : renseignez vos vrais nom et coordonnées dans les informations privées de votre compte GitHub, pas sur votre profil public.

Le lien « dépôt GitHub du site » de la page À propos pointe tout seul vers l'onglet *Issues* du dépôt une fois le site en ligne sur GitHub Pages (vérifiez que les *Issues* sont activées dans **Settings → General → Features**). Si vous créez un jour une adresse e-mail dédiée, vous pouvez l'ajouter dans la section « Signaler une erreur ».

## Mettre le site en ligne avec GitHub Pages (gratuit)

1. Créez un compte sur [github.com](https://github.com) si besoin.
2. Créez un nouveau dépôt **public**, par exemple `cours`.
3. Dans le dépôt, cliquez sur **Add file → Upload files**, puis glissez-déposez **tout le contenu** de ce dossier (le fichier `.nojekyll` compris ; s'il n'apparaît pas dans votre explorateur, affichez les fichiers cachés). Validez avec **Commit changes**.
4. Dans **Settings → Pages**, choisissez **Deploy from a branch**, la branche `main` et le dossier `/ (root)`, puis **Save**.
5. Après une à deux minutes, le site est en ligne à l'adresse `https://VOTRE-PSEUDO.github.io/cours/`.

Pour un nom de domaine personnel (par exemple `cours-photonique.fr`), achetez-le chez un registraire, puis renseignez-le dans **Settings → Pages → Custom domain**.

## Être trouvé par les moteurs de recherche

1. Déclarez le site dans [Google Search Console](https://search.google.com/search-console).
2. Une fois l'adresse définitive connue, créez un fichier `sitemap.xml` à la racine (modèle ci-dessous, à adapter) et ajoutez la ligne `Sitemap: https://VOTRE-ADRESSE/sitemap.xml` à `robots.txt`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://VOTRE-ADRESSE/index.html</loc></url>
  <url><loc>https://VOTRE-ADRESSE/photonique-integree/index.html</loc></url>
  <url><loc>https://VOTRE-ADRESSE/photonique-integree/equations-propagation.html</loc></url>
  <url><loc>https://VOTRE-ADRESSE/photonique-integree/guide-plan.html</loc></url>
  <url><loc>https://VOTRE-ADRESSE/photonique-integree/guide-canal-indice-effectif.html</loc></url>
  <url><loc>https://VOTRE-ADRESSE/photonique-integree/proprietes-des-modes.html</loc></url>
  <url><loc>https://VOTRE-ADRESSE/photonique-integree/coupleur-directionnel.html</loc></url>
  <url><loc>https://VOTRE-ADRESSE/photonique-integree/modulateur-electro-optique.html</loc></url>
  <url><loc>https://VOTRE-ADRESSE/photonique-integree/fiche.html</loc></url>
  <url><loc>https://VOTRE-ADRESSE/photonique-integree/labos.html</loc></url>
  <url><loc>https://VOTRE-ADRESSE/a-propos.html</loc></url>
</urlset>
```

## Prévisualiser sur votre ordinateur

Le plus fidèle est de lancer un petit serveur dans ce dossier, puis d'ouvrir `http://localhost:8000` :

```
python3 -m http.server 8000
```

Ouvrir directement `index.html` par double-clic fonctionne aussi dans la plupart des navigateurs.

## Organisation des fichiers

```
index.html                     accueil
a-propos.html                  projet, licence, mentions légales, données personnelles
photonique-integree/
  index.html                   sommaire du thème, prérequis, notations, légende des encadrés
  equations-propagation.html   chapitre 1
  guide-plan.html              chapitre 2 (labos 1 à 3)
  guide-canal-indice-effectif.html  chapitre 3 (exercices 1 et 2, labo 4)
  proprietes-des-modes.html    chapitre 4 (labo 5)
  coupleur-directionnel.html   chapitre 5 (labo 6)
  modulateur-electro-optique.html   problème de synthèse (labo 7)
  fiche.html                   fiche de révision
  labos.html                   les 7 labos sur une page
assets/
  css/site.css                 styles communs (couleurs en jetons, thème sombre, impression)
  js/physique.js               solveurs numériques (guide plan, abaque b-V, EIM, coupleur, recouvrement)
  js/trace.js                  tracé des courbes, cartes de champ, construction des labos
  js/figures.js                toutes les figures, dessinées seulement si leur conteneur est dans la page
  js/labos.js                  les 7 labos
  js/site.js                   sommaire de page, bouton de thème, mise en route
  js/mathjax-config.js         macros LaTeX (\neff, \nsub, \nsup, \asub…)
  fonts/, vendor/mathjax/      polices et MathJax hébergés localement
```

## Ajouter une page ou une thématique

- **Une page dans un thème existant** : copiez une page de chapitre, remplacez le contenu de `<div class="col">` (titre, objectifs, sections, « Testez-vous », liens précédent/suivant), puis ajoutez la page dans la liste latérale `<ol class="course">` de chaque page du thème.
- **Un nouveau thème** : copiez le dossier `photonique-integree/`, videz-le de ses chapitres, et ajoutez une carte sur l'accueil (`index.html`, bloc `theme-card`) et un lien dans la barre du haut.
- **Une figure ou un labo** : écrivez la fonction dans `figures.js` ou `labos.js`, ajoutez-la à la table `FIGURES` (ou à la liste des labos dans `site.js`), et placez dans la page un conteneur avec le même `id`.
- **Les formules** s'écrivent en LaTeX entre `$…$` (dans le texte) ou `$$…$$` (centrées).

## Licences

Voir `LICENCE.md` : textes et figures sous CC BY-NC-SA 4.0, code sous licence MIT, MathJax sous Apache 2.0, polices sous SIL OFL 1.1.
