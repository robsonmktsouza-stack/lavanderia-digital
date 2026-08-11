export const demoServices = [
  { id: "svc-kg", name: "Lavagem por kg", description: "Lavadas, secas e dobradas", unit: "KG", price: 17.9, estimatedHours: 24 },
  { id: "svc-shirt", name: "Camisa social", description: "Lavagem e passadoria", unit: "ITEM", price: 14.9, estimatedHours: 48 },
  { id: "svc-suit", name: "Terno completo", description: "Higienização especializada", unit: "ITEM", price: 49.9, estimatedHours: 72 },
  { id: "svc-duvet", name: "Edredom casal", description: "Lavagem de edredom", unit: "ITEM", price: 39.9, estimatedHours: 72 },
  { id: "svc-iron", name: "Passadoria", description: "Passadoria profissional", unit: "ITEM", price: 8.9, estimatedHours: 24 }
];

export const demoOrders = [
  { id: "demo-001", number: "LAV-20260810-01A2B3", status: "IN_PROCESS", total: 82.5, collectionAt: new Date("2026-08-10T14:00:00-03:00"), deliveryExpectedAt: new Date("2026-08-12T17:00:00-03:00"), customer: { name: "Cliente Demonstração" } },
  { id: "demo-002", number: "LAV-20260803-44C8F1", status: "DELIVERED", total: 49.9, collectionAt: new Date("2026-08-03T10:00:00-03:00"), deliveryExpectedAt: new Date("2026-08-05T15:00:00-03:00"), customer: { name: "Cliente Demonstração" } }
];

export const demoDrivers = [
  { id: "driver-1", name: "Carlos Motorista", phone: "11999990000", staffProfile: { vehicle: "Fiat Fiorino", plate: "ABC1D23" } }
];
