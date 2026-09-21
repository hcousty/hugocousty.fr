# hugocousty.fr

Site vitrine one page de Hugo Cousty, consultant marketing freelance.
HTML, CSS et JavaScript natifs : aucun framework, aucune dépendance, aucune étape de build.

> **État actuel : design system branché, contenus visuels à venir.**
> Les tokens du projet Claude Design « Hugo Cousty Design System » sont intégrés dans
> `assets/css/tokens.css`. Les images sont encore des réservés gris qui nomment l'image attendue.

---

## Structure

```
/
├── index.html                  One page (toutes les sections)
├── agences/index.html          Page vide (lien "Vous êtes une agence ?" du footer)
├── agences-suisse/index.html   Page vide (non liée pour l'instant)
├── mentions-legales/index.html Page vide
├── confidentialite/index.html  Page vide
├── assets/
│   ├── css/
│   │   ├── tokens.css          Toutes les valeurs visuelles (variables CSS)
│   │   ├── base.css            Reset, typo, layout, composants communs, header, footer
│   │   └── sections.css        Styles propres à chaque section du one page
│   ├── js/main.js              Burger, header au scroll, apparition, slider, barre CTA mobile
│   ├── fonts/                  Police Geist (woff2 + licence OFL)
│   └── img/                    Images (grain.png du design system)
└── README.md
```

Les pages secondaires sont en `noindex` tant qu'elles n'ont pas de contenu. Il faudra retirer la balise `<meta name="robots" content="noindex">` quand elles seront rédigées.

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
| 1 | Hero | `#top` |
| 2 | Logos | – |
| 3 | Expertises | `#expertises` (menu) |
| 4 | Méthode + encart IA | `#methode` (menu) |
| 5 | Chiffres clés | `#chiffres` |
| 6 | Réalisations (Harmony à la une + slider) | `#realisations` (menu) |
| 7 | Témoignages (**placeholders**) | `#temoignages` |
| 8 | À propos | `#a-propos` (menu) |
| 9 | Travailler ensemble | `#travailler-ensemble` |
| 10 | FAQ | `#faq` (menu) |
| 11 | Contact (emplacement Calendly) | `#contact` : cible de tous les boutons « Réserver un appel » et « En parler » |
| 12 | Footer | – |

### Conventions

- **Mobile first** : les styles de base visent un écran de 375 px. Les `@media (min-width: 48em)` (768 px) et `@media (min-width: 64em)` (1024 px) enrichissent pour la tablette et le desktop.
- **Nommage BEM léger** : `.bloc`, `.bloc__element`, `.bloc--variante`.
- **Les `id` servent aux ancres**, jamais au style. Le JS cible des attributs `data-*` (`data-slider`, `data-nav-toggle`…) : on peut renommer une classe CSS sans rien casser.

### Tâches courantes

- **Remplacer un placeholder par une image** : remplacer le `<div class="placeholder" role="img" aria-label="…">…</div>` par
  `<img src="/assets/img/photo-hugo.webp" alt="…" width="…" height="…" loading="lazy">`
  (sans `loading="lazy"` pour la photo du hero, qui doit s'afficher tout de suite).
- **Ajouter un projet au slider** : dupliquer un `<li class="project-card">` dans `.slider__track`. Les flèches s'adaptent seules.
- **Changer le nombre de cartes visibles** : modifier `--slides-visible` dans `sections.css`, section 6b (1.5 sur mobile, 2.3 sur tablette, 3.35 sur desktop).
- **Ajouter une question à la FAQ** : dupliquer un bloc `<details class="faq__item">`.
- **Remplacer les témoignages** : section 7 de `index.html`. Le texte actuel est un placeholder.
- **Image de partage LinkedIn** : décommenter la balise `og:image` dans le `<head>` et déposer une image de 1200 × 627 px dans `/assets/img/`.

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

- **Thème inverse** : `data-theme="inverse"` sur un bloc bascule tous les alias de couleur (texte blanc, boutons blancs…). Utilisé sur l'en-tête, le panneau du hero et le footer.
- **En-tête** : pilule de verre flottante (56 px, à 20 px du haut, dégradé d'encre + flou), seule surface en verre.
- **Boutons** : `primary` en aplat encre qui passe au bleu au survol, avec la flèche ↗ intégrée (dessinée en CSS, aucune modification du HTML) ; `secondary` en contour qui se remplit au survol.
- **Surtitres** numérotés automatiquement (01, 02…) par un compteur CSS, suivis d'un filet.
- **Un seul grand aplat encre** : le footer, plus le panneau du hero comme bloc encre autorisé.
- **Pas d'animation d'entrée au défilement**, pas d'emoji, pas d'ombre sur les cartes.

### Fichiers du design system dans le repo

- **Police Geist** (v1.7.2, licence OFL) : `/assets/fonts/` — Regular, Medium, SemiBold, et `OFL.txt`. Hébergée sur le site, sans Google Fonts. La graisse Regular est préchargée dans le `<head>` de chaque page.
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

Le site est 100 % statique : il suffit de copier les fichiers dans le dossier `www/` de l'hébergement.

### Option A : FTP (le plus simple)

1. Dans l'espace client OVH : **Web Cloud → Hébergements → votre hébergement → onglet FTP-SSH**. Noter le serveur FTP, le login, et définir un mot de passe.
2. Se connecter avec un client FTP (FileZilla, Cyberduck, Transmit), en **SFTP** de préférence.
3. Copier le contenu du repo dans `www/` : `index.html`, `assets/`, `agences/`, `agences-suisse/`, `mentions-legales/`, `confidentialite/`.
   **Ne pas envoyer** `.git/` ni `README.md`.
4. Vérifier que le domaine `hugocousty.fr` pointe bien sur le dossier `www/` (onglet **Multisite**).
5. Activer le **certificat SSL** gratuit (Let's Encrypt, onglet Multisite ou Informations générales), puis forcer le HTTPS (voir ci-dessous).

### Option B : déploiement depuis GitHub

Dans l'onglet **Multisite**, OVH propose sur certaines offres de relier un domaine à un dépôt Git. Chaque push sur la branche choisie déploie le site automatiquement. Si l'option n'est pas disponible sur l'offre, on peut utiliser une GitHub Action (par exemple `SamKirkland/FTP-Deploy-Action`). Les identifiants FTP sont alors stockés dans les **Secrets** du repo, jamais dans le code.

### Forcer le HTTPS et gérer le cache

Créer un fichier `.htaccess` à la racine de `www/` :

```apache
# Redirection vers HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Cache navigateur pour les fichiers statiques
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
```

Avec un cache d'un mois sur le CSS et le JS, les modifications peuvent mettre du temps à s'afficher chez les visiteurs réguliers. Pour forcer la mise à jour, versionner les fichiers dans le HTML :
`/assets/css/base.css?v=2`.

---

## À faire (hors wireframe)

- [x] Brancher le design system (`tokens.css`)
- [x] Ajouter les fichiers de police Geist et la tuile `grain.png`
- [ ] Remplacer les placeholders d'images (photo Hugo, logos clients, visuel Harmony)
- [ ] Remplacer les témoignages placeholders par les vrais textes
- [ ] Intégrer Calendly **après consentement cookies** (voir le commentaire dans la section Contact de `index.html`)
- [ ] Bandeau de consentement cookies, puis GA4 avec suivi des prises de RDV Calendly
- [ ] Image de partage `og:image` (1200 × 627 px)
- [ ] Favicon
- [ ] Contenu des pages `agences`, `agences-suisse`, `mentions-legales` et `confidentialite`
