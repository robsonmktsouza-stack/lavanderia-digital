import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole, ServiceUnit, DiscountType, LockerStatus } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL ?? process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) throw new Error("Configure DATABASE_URL para executar o seed.");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const driverPassword = await bcrypt.hash("Motorista@123", 12);
  const customerPassword = await bcrypt.hash("Cliente@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lavanderia.local" },
    update: {},
    create: { name: "Administrador", email: "admin@lavanderia.local", passwordHash: adminPassword, role: UserRole.ADMIN, permissions: ["*"] }
  });

  const driver = await prisma.user.upsert({
    where: { email: "motorista@lavanderia.local" },
    update: {},
    create: { name: "Carlos Motorista", email: "motorista@lavanderia.local", passwordHash: driverPassword, role: UserRole.DRIVER, phone: "11999990000" }
  });
  await prisma.staffProfile.upsert({
    where: { userId: driver.id },
    update: {},
    create: { userId: driver.id, vehicle: "Fiat Fiorino", plate: "ABC1D23" }
  });

  const customer = await prisma.user.upsert({
    where: { email: "cliente@lavanderia.local" },
    update: {},
    create: { name: "Cliente Demonstração", email: "cliente@lavanderia.local", passwordHash: customerPassword, role: UserRole.CUSTOMER, cpf: "12345678909", phone: "11988887777" }
  });
  await prisma.address.upsert({
    where: { id: "demo-address" },
    update: {},
    create: { id: "demo-address", userId: customer.id, label: "Casa", postalCode: "01310100", street: "Avenida Paulista", number: "1000", district: "Bela Vista", city: "São Paulo", state: "SP", isDefault: true }
  });

  const services = [
    ["Lavagem por kg", "Roupas do dia a dia lavadas, secas e dobradas.", ServiceUnit.KG, 17.9, 24],
    ["Camisa social", "Lavagem e passadoria individual.", ServiceUnit.ITEM, 14.9, 48],
    ["Terno completo", "Higienização especializada de paletó e calça.", ServiceUnit.ITEM, 49.9, 72],
    ["Edredom casal", "Lavagem de edredom tamanho casal.", ServiceUnit.ITEM, 39.9, 72],
    ["Passadoria", "Passadoria profissional por peça.", ServiceUnit.ITEM, 8.9, 24]
  ] as const;

  for (let i = 0; i < services.length; i++) {
    const [name, description, unit, price, estimatedHours] = services[i];
    const existing = await prisma.service.findFirst({ where: { name } });
    if (!existing) await prisma.service.create({ data: { name, description, unit, price, estimatedHours, sortOrder: i } });
  }

  if (!(await prisma.serviceRegion.findFirst({ where: { name: "São Paulo - Centro expandido" } }))) {
    await prisma.serviceRegion.create({ data: { name: "São Paulo - Centro expandido", city: "São Paulo", state: "SP", collectionFee: 7.9, deliveryFee: 7.9, minOrderValue: 25 } });
  }

  for (const weekday of [1,2,3,4,5,6]) {
    const exists = await prisma.availabilitySlot.findFirst({ where: { weekday } });
    if (!exists) await prisma.availabilitySlot.create({ data: { weekday, startTime: "08:00", endTime: weekday === 6 ? "14:00" : "18:00", intervalMin: 60, capacity: 8 } });
  }

  await prisma.coupon.upsert({ where: { code: "BEMVINDO10" }, update: {}, create: { code: "BEMVINDO10", description: "10% na primeira experiência", type: DiscountType.PERCENT, value: 10, active: true } });
  await prisma.locker.upsert({ where: { externalId: "LOCKER-001" }, update: {}, create: { externalId: "LOCKER-001", name: "Armário 01", locationName: "Unidade Centro", address: "São Paulo - SP", compartment: "A01", status: LockerStatus.AVAILABLE } });
  await prisma.systemSetting.upsert({ where: { id: "main" }, update: {}, create: { id: "main", storeName: "Lavanderia Digital", whatsapp: "5511999999999" } });

  console.log("Seed concluído.", { admin: admin.email, driver: driver.email, customer: customer.email });
}

main().finally(() => prisma.$disconnect());
