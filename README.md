# hugocousty.fr

Site vitrine one page de Hugo Cousty, consultant marketing freelance.
HTML, CSS et JavaScript natifs : aucun framework, aucune dépendance, aucune étape de build.

> **État actuel : structure, design system, sous-pages et déploiement en place.**
> Il reste les contenus visuels (photos, logos), les vrais témoignages, et les champs
> surlignés en jaune dans les mentions légales et la politique de confidentialité.

---

## Structure

```
/
├── index.html                  One page (toutes les sections)
├── agences/index.html          Landing page agences : hero photo, expertises, formats, témoignages, réalisations, contact
├── agences-suisse/index.html   Même landing page, angle Suisse romande, Harmony à la une
├── mentions-legales/index.html Mentions légales (champs à compléter surlignés)
├── confidentialite/index.html  Politique de confidentialité (état actuel : aucun traceur)
├── merci/index.html            Confirmation après envoi du formulaire (noindex, lien LinkedIn)
├── .htaccess                   HTTPS forcé, www → nu, cache, compression (déployé tel quel)
├── .github/workflows/deploy.yml  Déploiement SFTP vers OVH (manuel, pour la mise en ligne finale)
├── assets/
│   ├── css/
│   │   ├── tokens.css          Toutes les valeurs visuelles (variables CSS)
│   │   ├── base.css            Reset, typo, layout, composants communs, header, footer
│   │   └── sections.css        Styles propres à chaque section, et aux pages secondaires (section 12)
│   ├── js/main.js              Burger, barre CTA mobile
│   ├── fonts/                  Police Inter (woff2 + licence OFL)
│   └── img/                    grain.png, og-image.jpg
└── README.md
```

Les pages légales restent en `noindex` (pas d'intérêt SEO). Les pages agences sont indexables.

### Image de partage

- `assets/img/og-image.jpg` (1200 × 627 px) est l'aperçu des liens partagés (LinkedIn, Slack, iMessage…). Elle reprend le titre et le chapô du hero. Pour la régénérer après un changement de texte : page HTML aux couleurs des tokens, capturée à 1200 × 627 avec un navigateur headless (Playwright). Pour tester l'aperçu : [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).

### Les 3 fichiers CSS

Ils sont chargés dans cet ordre, et l'ordre compte :

| Fichier | Contient | Quand le modifier |
|---|---|---|
| `tokens.css` | Couleurs, typos, tailles, espacements, rayons, ombres, durées d'animation | Pour changer **l'apparence** du site (design system) |
| `base.css` | Reset, titres, `.container`, `.section`, `.btn`, `.tag`, `.eyebrow`, `.placeholder`, header, nav, footer, barre CTA mobile | Pour changer un composant utilisé partout |
| `sections.css` | Hero, Logos, Expertises, Méthode, Chiffres, Réalisations, Témoignages, À propos, Offres, FAQ, Contact | Pour changer la mise en page d'une section |

**Règle d'or :** `base.css` et `sections.css` ne contiennent **aucune** couleur, taille ou marge en dur. Ils utilisent uniquement des `var(--…)` définies dans `tokens.css`.

### Sections du one page

Chaque section est encadrée par un commentaire `<!-- ===== N. NOM ===== -->` dans `index.html`, et par le même numéro dans `sections.css`.

| # | Section | Ancre |
|---|---|---|
| 1 | Hero (photo plein écran, texte posé dessus) | `#top` |
| 2 | Logos | – |
| 3 | Expertises | `#expertises` (menu) |
| 4 | Méthode | `#methode` |
| 5 | Chiffres clés | `#chiffres` |
| 6 | Réalisations (Harmony à la une + grille de 6 projets) | `#realisations` (menu) |
| 7 | Témoignages, 1 principal + 3 courts (**placeholders**) | `#temoignages` |
| 8 | À propos + encart IA | `#a-propos` (menu) |
| 9 | Travailler ensemble | `#travailler-ensemble` (menu, libellé « Formats ») |
| 10 | FAQ | `#faq` (menu) |
| 11 | Contact (calendrier Calendly intégré + formulaire) | `#contact` : cible de tous les boutons « Réserver un appel de 20 min », « Parlons de votre projet » et « Demander un devis » |
| 12 | Footer | – |

### Conventions

- **Mobile first** : les styles de base visent un écran de 375 px. Les `@media (min-width: 48em)` (768 px) et `@media (min-width: 64em)` (1024 px) enrichissent pour la tablette et le desktop.
- **Nommage BEM léger** : `.bloc`, `.bloc__element`, `.bloc--variante`.
- **Les `id` servent aux ancres**, jamais au style. Le JS cible des attributs `data-*` (`data-nav-toggle`, `data-sticky-cta-hide`…) : on peut renommer une classe CSS sans rien casser.

### Tâches courantes

- **Mettre la photo dans l'en-tête** : remplacer `<span class="avatar avatar--placeholder">HC</span>` par `<img class="avatar" src="/assets/img/avatar.webp" alt="" width="64" height="64">` (image carrée, 64 px suffisent) dans les 5 pages.
- **Remplacer un placeholder par une image** : remplacer le `<div class="placeholder" role="img" aria-label="…">…</div>` par
  `<img src="/assets/img/photo-hugo.webp" alt="…" width="…" height="…" loading="lazy">`
  (sans `loading="lazy"` pour la photo du hero, qui doit s'afficher tout de suite). Pour le hero, garder la classe `hero__photo` sur l'`<img>` : elle remplit tout le cadre arrondi (`object-fit: cover`). Prévoir une image d'au moins 2000 px de large, cadrée pour laisser le bas gauche assez calme (le texte se pose dessus, avec un voile sombre).
- **Ajouter un projet** : dupliquer un `<li class="project-card">` dans `.projects`. La grille (1, 2 puis 3 colonnes) s'adapte seule. Rester sur un multiple de 3 pour une dernière ligne complète sur desktop.
- **Brancher Calendly** : section 11 de `index.html`, l'`<iframe>` portant l'attribut `data-calendly-url`. Remplacer le début du `src` par l'URL publique de l'événement (ex. `https://calendly.com/ton-compte/20min`) en gardant les paramètres après le `?` (couleurs du site). Hauteur réglable avec le token `--calendly-height`.
- **Brancher le formulaire de contact** : le site est statique, l'envoi passe par un service de formulaire. Créer un formulaire chez [Formspree](https://formspree.io) (gratuit jusqu'à 50 envois par mois) ou [Web3Forms](https://web3forms.com), puis remplacer l'URL de l'attribut `action` du `<form>` dans `index.html` (section 11). Les champs `_subject` et `_next` (redirection vers `/merci/`) suivent la convention Formspree ; les adapter si un autre service est choisi. Le champ masqué `site-web` est un piège à robots. Tester un envoi avant de mettre en ligne.
- **Ajouter une question à la FAQ** : dupliquer un bloc `<details class="faq__item">`.
- **Remplacer les témoignages** : section 7 de `index.html`. Le texte actuel est un placeholder.
- **Compléter les mentions légales** : les champs à remplir sont dans des `<span class="todo">` (surlignés en jaune). Supprimer le `<span>` une fois le champ rempli. Idem pour les prestataires dans la politique de confidentialité.
- **Activer GA4** : la politique de confidentialité contient le paragraphe correspondant en commentaire HTML, à décommenter en même temps que le bandeau de consentement.

---

## Design system (Claude Design)

Source : projet Claude Design **« Hugo Cousty Design System »** (readme + dossier `tokens/`).

### Organisation de `tokens.css`

- **Partie A — Design system** : copie des fichiers `tokens/*.css` du projet (police, couleurs, typographie, espacements, surfaces, mouvement, grain). **Mêmes noms, mêmes valeurs.** `base.css` et `sections.css` utilisent directement ces noms (`--text-primary`, `--surface-page`, `--space-3`, `--radius-md`…).
- **Partie B — Site** : quelques tokens propres au site (hauteur de la pilule d'en-tête, barre CTA mobile, focus, profondeur), toujours dérivés de la partie A.

### Mettre à jour après une modification dans Claude Design

1. Dans Claude Design, ouvrir le fichier modifié dans `tokens/` et copier son contenu.
2. Remplacer le bloc correspondant dans la partie A de `tokens.css` (les blocs portent le nom du fichier source, ex. `A2. Couleurs (tokens/colors.css)`).
3. Si un token est **renommé** ou **supprimé** dans le design system, chercher son nom dans `base.css` et `sections.css` et l'adapter.
4. Si ce sont les **règles** qui changent (composant, comportement), les appliquer dans `base.css` (composants communs) ou `sections.css`.

### Règles du design system appliquées dans le code

- **Thème inverse** : `data-theme="inverse"` sur un bloc bascule tous les alias de couleur (texte blanc, boutons blancs…). Utilisé sur l'en-tête, le hero (texte sur la photo) et le footer.
- **En-tête** : pilule de verre flottante (56 px, à 20 px du haut, dégradé d'encre + flou), seule surface en verre. À gauche, la photo ronde (réservé « HC » en attendant) et le statut « Disponible » avec un point vert ; pour passer en indisponible, ajouter la classe `status--off` au `<span class="status">` et changer le texte.
- **Boutons** : `primary` en aplat encre qui passe au bleu au survol, avec la flèche ↗ intégrée (dessinée en CSS, aucune modification du HTML) ; `secondary` en contour qui se remplit au survol.
- **Surtitres** en capitales espacées, sans numéro ni filet. Aucun trait de séparation décoratif sur le site : les blocs sont séparés par l'espace, les cartes gardent leur contour.
- **Un seul grand aplat encre** : le footer. Le hero n'a plus de panneau encre : la photo remplit l'écran (léger retrait `--hero-inset`, rayon `--hero-radius`) et le texte est posé dessus, lisible grâce à un voile encre dégradé en bas de la photo.
- **Pas d'animation d'entrée au défilement**, pas d'emoji, pas d'ombre sur les cartes.

### Fichiers du design system dans le repo

- **Police Inter** (v4.1, licence OFL, sous-ensemble latin) : `/assets/fonts/` — Regular, Medium, SemiBold, et `OFL.txt`. Hébergée sur le site, sans Google Fonts. La graisse Regular est préchargée dans le `<head>` de chaque page.
- **Grain** : `/assets/img/grain.png`, copié depuis `assets/grain.png` du design system.
- **Contrastes** à revérifier si la palette change : au moins 4,5:1 pour le texte ; ne jamais mettre de bleu sur l'encre.

---

## Travailler en local

Les chemins sont absolus (`/assets/…`, `/mentions-legales/`) : ils fonctionnent tels quels sur OVH. En local, il faut donc un petit serveur HTTP. Un double-clic sur `index.html` ne suffit pas :

```bash
python3 -m http.server 8000
```

Ouvrir ensuite http://localhost:8000.

---

## Déployer sur OVH (hébergement web mutualisé)

Le site est 100 % statique : il suffit de copier les fichiers dans le dossier `www/` de l'hébergement. Le `.htaccess` à la racine du repo part avec le reste (HTTPS forcé, `www.` redirigé vers le domaine nu, cache, compression).

### Préparer l'hébergement (une seule fois)

1. Espace client OVH : **Web Cloud → Hébergements → votre hébergement → onglet FTP-SSH**. Noter le serveur (`ftp.cluster0XX.hosting.ovh.net`) et le login, définir un mot de passe, et **activer SFTP** (colonne SFTP / SSH selon l'offre). Le mutualisé OVH ne propose pas de FTPS : c'est SFTP (chiffré, port 22) ou FTP simple (port 21).
2. Onglet **Multisite** : vérifier que `hugocousty.fr` et `www.hugocousty.fr` pointent sur le dossier `www/`, puis activer le **certificat SSL** Let's Encrypt. Le `.htaccess` ne force le HTTPS que si le certificat existe.

### Préprod : Vercel

Le dépôt GitHub est connecté à Vercel. Chaque push sur `main` redéploie la préprod, et chaque autre branche reçoit une URL de prévisualisation. Aucun réglage dans le repo : site statique, pas de build.

### Mise en ligne : OVH, depuis GitHub

Le workflow `.github/workflows/deploy.yml` envoie le site en SFTP chez OVH. Il se déclenche **à la main** uniquement (onglet **Actions → Déployer sur OVH → Run workflow**), pour que rien ne parte chez OVH tant que le site vit sur Vercel. Le jour de la mise en ligne, on peut l'automatiser à chaque push sur `main` (voir le commentaire en tête du fichier).

Dans GitHub : **Settings → Secrets and variables → Actions**, créer trois secrets :

| Secret | Valeur |
|---|---|
| `FTP_SERVER` | le serveur de l'onglet FTP-SSH, ex. `ftp.cluster0XX.hosting.ovh.net` |
| `FTP_USERNAME` | le login FTP principal |
| `FTP_PASSWORD` | le mot de passe FTP |

Si SFTP n'est pas disponible sur l'offre, créer une **variable** (onglet Variables, pas Secrets) `DEPLOY_PROTOCOL` avec la valeur `ftp`.

Le workflow n'envoie que les fichiers plus récents que ceux du serveur et ne supprime rien : un fichier retiré du repo reste en ligne tant qu'on ne l'efface pas à la main. `.git`, `.github` et les `.md` ne partent jamais.

### Variante : FTP à la main

Se connecter avec FileZilla, Cyberduck ou Transmit (en SFTP), et copier dans `www/` : `index.html`, `.htaccess`, `assets/`, `agences/`, `agences-suisse/`, `mentions-legales/`, `confidentialite/`. **Ne pas envoyer** `.git/`, `.github/` ni `README.md`.

### Cache

Avec un cache d'un mois sur le CSS et le JS, les modifications peuvent mettre du temps à s'afficher chez les visiteurs réguliers. Pour forcer la mise à jour, versionner les fichiers dans le HTML :
`/assets/css/base.css?v=2`.

---

## À faire (hors wireframe)

- [x] Brancher le design system (`tokens.css`)
- [x] Ajouter les fichiers de police Inter et la tuile `grain.png`
- [ ] Remplacer les placeholders d'images (photo Hugo, logos clients, visuel Harmony)
- [ ] Remplacer les témoignages placeholders par les vrais textes
- [ ] Compléter les champs surlignés des mentions légales et de la politique de confidentialité
- [ ] Relire les pages `agences` et `agences-suisse` (premier jet à valider)
- [ ] Jour de la mise en ligne : renseigner les secrets FTP dans GitHub, activer SFTP chez OVH, lancer le workflow
- [ ] Renseigner l'URL de l'événement Calendly dans l'iframe de la section Contact
- [ ] Brancher le formulaire de contact sur Formspree ou Web3Forms et tester un envoi
- [ ] Bandeau de consentement cookies si GA4 est ajouté (le calendrier Calendly affiche son propre bandeau dans son cadre)
- [x] Image de partage `og:image` (1200 × 627 px)
- [ ] Favicon (retiré pour l'instant, à refaire avec la nouvelle identité)
- [x] Contenu des pages `agences`, `agences-suisse`, `mentions-legales` et `confidentialite`
- [x] Déploiement OVH (workflow SFTP + `.htaccess`)

---

## Inventaire des composants (pour la maquette Figma)

Tout le site se construit avec ces composants. Chacun existe en version claire et, pour ceux marqués ★, en thème inverse (sur encre ou sur photo). Les tailles d'écran à maquetter : mobile 375 px et desktop 1280 px (la tablette dérive des deux).

| Composant | Classe | Variantes et états |
|---|---|---|
| Bouton | `.btn` | primary ★ (avec flèche ↗), secondary ★, small (en-tête), block (barre mobile) · survol, actif, focus |
| Surtitre | `.eyebrow` | ★ |
| Tag | `.tag` | un seul style |
| Carte | `.card` | expertise, offre (`.offer` : pitch, format, bouton), contact (`.contact__path`) |
| Carte projet | `.project-card` | avec ou sans ligne « En agence (…) » |
| Projet à la une | `.featured` | visuel 4:3 + texte, 2 colonnes sur desktop |
| Témoignage | `.testimonial` | principal (en grand) et court |
| Étape | `.step` | numéro bleu, titre, texte avec « Livrable » |
| Chiffre clé | `.stat` | avec ou sans préfixe « jusqu'à » |
| Régie | `.network` | nom + formats |
| Liste de points | `.points__item` | titre à gauche, texte à droite sur desktop |
| Question FAQ | `.faq__item` | fermée, ouverte (fond gris clair), signe + qui pivote |
| Champ de formulaire | `.field` | texte, email, zone de texte · repos, survol, focus, erreur native, note |
| Faits | `.hero__proofs`, `.about__facts` | liste « Libellé : valeur » ★ |
| Logo client | `.logos__item` | 6 par ligne (accueil), 5 par ligne (agences) |
| Réservé d'image | `.placeholder` | à remplacer par les vraies images |
| En-tête | `.site-header` ★ | pilule de verre, identité (photo ronde + statut « Disponible » / `.status--off`), liens, bouton, burger · menu mobile ouvert |
| Hero | `.hero` ★ | photo plein écran avec retrait et rayon, voile encre, texte posé dessus |
| Encart IA | `.ai-box` | fond bleu très clair, 2 colonnes sur desktop |
| Mise en avant finale | `.page-cta` ★ | bloc encre avec titre, texte, boutons (pages secondaires) |
| Barre CTA mobile | `.sticky-cta` | collée en bas, masquée quand un bouton « Réserver » est visible |
| Pied de page | `.site-footer` ★ | liste de liens, grain |
| Calendrier intégré | `.calendly__frame` | cadre Calendly, hauteur `--calendly-height` |

Les valeurs (couleurs, typo, espacements, rayons) sont toutes dans `tokens.css`. Si Figma utilise des variables avec les mêmes noms, l'intégration des maquettes se fait en une passe.
