export const orderStatusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  AWAITING_PAYMENT: "Aguardando pagamento",
  CONFIRMED: "Confirmado",
  COLLECTION_SCHEDULED: "Coleta agendada",
  DRIVER_EN_ROUTE_COLLECTION: "Motorista a caminho",
  COLLECTED: "Coletado",
  RECEIVED_AT_LAUNDRY: "Recebido na lavanderia",
  IN_PROCESS: "Em processamento",
  READY_FOR_DELIVERY: "Pronto para entrega",
  DELIVERY_SCHEDULED: "Entrega agendada",
  DRIVER_EN_ROUTE_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado"
};

export const statusProgress: Record<string, number> = {
  AWAITING_PAYMENT: 8,
  CONFIRMED: 15,
  COLLECTION_SCHEDULED: 25,
  DRIVER_EN_ROUTE_COLLECTION: 32,
  COLLECTED: 42,
  RECEIVED_AT_LAUNDRY: 52,
  IN_PROCESS: 64,
  READY_FOR_DELIVERY: 76,
  DELIVERY_SCHEDULED: 84,
  DRIVER_EN_ROUTE_DELIVERY: 92,
  DELIVERED: 100,
  CANCELED: 0,
  DRAFT: 0
};
