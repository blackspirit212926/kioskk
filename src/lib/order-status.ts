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
