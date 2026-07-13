## Plan: Extensions Kiosk — Versements, Soldes, Timeline, Codes Promo, Achat Groupé

Ajouts à l'existant, dans le respect du design system (navy/amber/crème, Cabinet Grotesk + Plus Jakarta Sans, navbar pilule, cartes glass, BottomNav capsule).

### 1. Backend — nouvelles tables et colonnes (1 migration)

**Nouvelle table `order_payments`** (versements par commande)
- Champs : `order_id`, `kind` (`deposit` | `balance` | `full`), `amount_xof`, `method` (wave/om/free/cash), `proof_url`, `status` (`pending` | `confirmed` | `rejected`), `confirmed_at`, `admin_note`.
- RLS : le client voit/insère les versements de ses commandes ; admin/staff voient/modifient tout ; GRANT complet.
- Migration douce des `orders.payment_proof_url` existants → une ligne `order_payments` (kind = `full` ou `deposit` selon `payment_type`).

**Nouvelle table `promo_codes`**
- Champs : `code` (unique, upper), `discount_type` (`percent`|`fixed`), `discount_value`, `min_subtotal_xof`, `max_uses`, `used_count`, `expires_at`, `active`.
- Table `promo_redemptions` (order_id, code_id, amount_saved_xof) pour tracer.
- RLS : lecture publique des codes actifs (validation côté serveur), écriture admin uniquement.

**Achat groupé : nouvelles colonnes sur `products`**
- `group_buy_enabled` (bool), `group_buy_threshold` (int), `group_buy_deadline` (timestamptz), `group_buy_current` (int, dénormalisé, incrémenté par trigger sur order_items confirmés).

**Codes promo sur `orders`** : `promo_code`, `discount_xof`.

**Fonction RPC `apply_promo_code(_code, _subtotal_xof)`** → renvoie `{valid, discount_xof, reason}`.

### 2. Suivi de versements 50/50 par commande

- **Checkout (`/checkout`)** : quand `payment_type = split_50_50`, l'upload de preuve devient l'upload du versement d'**acompte** uniquement. Crée `orders` + une ligne `order_payments` kind=`deposit`. Message clair : « Solde de X FCFA à régler à l'arrivée en entrepôt Dakar. »
- **Page commande (`/compte/commandes/$id`)** : nouvelle carte « Versements » listant chaque `order_payments` (acompte / solde) avec montant, méthode, statut (badge), preuve téléchargeable. Bouton « Uploader preuve du solde » disponible dès que le statut est `arrived` et que le solde n'est pas encore payé. Upload → insert `order_payments` kind=`balance` status=`pending`.

### 3. « Mon solde » côté client

- Nouvelle route `/compte/solde` (ajoutée dans la sidebar `AccountLayout`).
- Liste des commandes non livrées avec : total, payé (somme des versements confirmés), reste dû, prochaine action (uploader preuve, en attente confirmation admin, tout est réglé).
- KPI global en haut : « Total dû à ce jour ».

### 4. Dashboard admin « Soldes clients »

- Nouvelle route `/admin/soldes` (ou intégrée à l'admin existant s'il existe déjà — sinon créer un layout admin minimal réservé aux rôles `admin`/`staff` via `has_role`).
- Tableau : client, email/téléphone, nb commandes en cours, total payé, total dû, dernière activité — triable par montant dû décroissant.
- Vue basée sur une requête agrégée `orders` × `order_payments` filtrée sur statuts non finaux.

### 5. Timeline de statut visible

- Vérifier `order_status_history` — actuellement l'écran commande affiche `STATUS_TIMELINE` statique. La remplacer / compléter par la vraie timeline lue depuis `order_status_history` (fallback statique si vide) avec date et note admin pour chaque étape franchie.

### 6. Codes promo au checkout

- Étape 2 du checkout : champ « Code promo » + bouton **Appliquer**. Appelle la RPC ; si valide, affiche la remise, met à jour le total (subtotal - discount + shipping). Persiste `promo_code` + `discount_xof` sur `orders` à la création, insère `promo_redemptions`.
- Affichage de la remise dans le récap commande et sur la page détail commande.

### 7. Achat groupé

- **Fiche produit** : quand `group_buy_enabled`, afficher un bloc dédié au-dessus du CTA :
  - Barre de progression amber (`group_buy_current / group_buy_threshold`).
  - Texte : « 12/20 précommandes · date limite dans 3 jours ».
  - CTA change : **« Rejoindre l'achat groupé »** au lieu de « Ajouter au panier ».
  - Mention : « Votre paiement n'est débité que si le seuil est atteint le [date]. »
- **Panier / checkout** : ligne annotée « Achat groupé » ; l'ordre est créé avec un statut `pending_payment` classique mais marqué `is_group_buy` (colonne optionnelle sur order_items) pour permettre le suivi.
- Job cron pg_cron (une fois par jour) : à l'expiration d'un groupe, marque comme `cancelled` les commandes non atteintes et notifie ; sinon passe à `payment_confirmed`. (Livré comme SQL scheduled task.)
- Trigger sur `orders` (statut `payment_confirmed`) : incrémente `group_buy_current`.

### 8. Délais selon `shipping_mode`

- Audit rapide de `product-card.tsx` et `produit.$slug.tsx` : s'assurer que `estimated_delivery_days_min/max` provient bien du produit et pas d'une valeur générique. Si nécessaire, dériver l'affichage depuis `shipping_mode` (`sea` → 45–60, `air` → 10–30) quand les valeurs produit sont nulles.

### 9. Contraintes de ton

- Audit rapide des chaînes FR : supprimer toute occurrence de « expertise », « accompagnement », « formation », « mise en relation ». Reformuler en langage précommande / import direct.

### Périmètre exclu (à confirmer sinon reporté)
- Pas de refonte visuelle : on garde navy/amber/crème, Cabinet Grotesk, Plus Jakarta Sans, navbar pilule dark, BottomNav capsule, cartes glass.
- Pas de nouvelle intégration paiement — on continue à s'appuyer sur les preuves manuelles Wave/OM/Free/Cash.
- L'admin complet (produits CRUD, commandes kanban…) reste hors périmètre de ce lot ; on livre uniquement « Soldes clients » comme demandé, sur un layout admin minimal si aucun n'existe.

### Ordre d'exécution
1. Migration DB (tables + colonnes + RPC + trigger group buy + cron).
2. Backfill des `order_payments` depuis les preuves existantes.
3. Frontend : checkout (versements + promo), page commande (versements + timeline réelle), route `/compte/solde`, fiche produit (achat groupé + délais), audit ton, `/admin/soldes`.
4. Vérification build + smoke test navigation.

Réponds **go** pour lancer, ou indique les points à ajuster (par ex. si un admin existe déjà, ou si tu veux exclure l'achat groupé de ce lot).