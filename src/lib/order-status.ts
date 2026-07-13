export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "En attente de paiement",
  payment_confirmed: "Paiement confirmé",
  sourcing: "Sourcing en cours",
  purchased: "Achat effectué",
  in_transit: "En transit",
  arrived: "Arrivé à Dakar",
  out_for_delivery: "En livraison",
  delivered: "Livré",
  cancelled: "Annulé",
  refunded: "Remboursé",
};

export const STATUS_TIMELINE = [
  "pending_payment",
  "payment_confirmed",
  "sourcing",
  "purchased",
  "in_transit",
  "arrived",
  "out_for_delivery",
  "delivered",
] as const;

export const PAYMENT_KIND_LABELS: Record<string, string> = {
  deposit: "Acompte",
  balance: "Solde",
  full: "Paiement complet",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "En vérification",
  confirmed: "Confirmé",
  rejected: "Rejeté",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  wave: "Wave",
  orange_money: "Orange Money",
  free_money: "Free Money",
  cash_on_delivery: "Cash à la livraison",
};
