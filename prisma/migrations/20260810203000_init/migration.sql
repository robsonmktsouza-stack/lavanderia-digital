-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'MANAGER', 'ATTENDANT', 'DRIVER', 'EMPLOYEE');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "ServiceUnit" AS ENUM ('ITEM', 'KG', 'BAG', 'SERVICE');
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'AWAITING_PAYMENT', 'CONFIRMED', 'COLLECTION_SCHEDULED', 'DRIVER_EN_ROUTE_COLLECTION', 'COLLECTED', 'RECEIVED_AT_LAUNDRY', 'IN_PROCESS', 'READY_FOR_DELIVERY', 'DELIVERY_SCHEDULED', 'DRIVER_EN_ROUTE_DELIVERY', 'DELIVERED', 'CANCELED');
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD', 'DEBIT_CARD');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'IN_ANALYSIS', 'DECLINED', 'CANCELED', 'REFUNDED');
CREATE TYPE "RouteType" AS ENUM ('COLLECTION', 'DELIVERY');
CREATE TYPE "RouteStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');
CREATE TYPE "ProofType" AS ENUM ('COLLECTION_PHOTO', 'DELIVERY_PHOTO', 'SIGNATURE', 'CUSTOMER_CONFIRMATION', 'OTHER');
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');
CREATE TYPE "LockerStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'DISABLED');
CREATE TYPE "LockerAuthorizationStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'USED', 'EXPIRED', 'REVOKED', 'ERROR');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'STATUS_CHANGE', 'ASSIGN', 'PAYMENT_UPDATE', 'LOCKER_AUTHORIZE', 'LOCATION_UPDATE');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "cpf" TEXT,
  "phone" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "avatarUrl" TEXT,
  "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastLoginAt" TIMESTAMP(3),
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StaffProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "document" TEXT,
  "vehicle" TEXT,
  "plate" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Address" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'Principal',
  "recipient" TEXT,
  "postalCode" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "complement" TEXT,
  "district" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7),
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Service" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "unit" "ServiceUnit" NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "minimumQty" DECIMAL(12,2) NOT NULL DEFAULT 1,
  "estimatedHours" INTEGER NOT NULL DEFAULT 48,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceRegion" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postalCodeFrom" TEXT,
  "postalCodeTo" TEXT,
  "collectionFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "deliveryFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "minOrderValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceRegion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AvailabilitySlot" (
  "id" TEXT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "intervalMin" INTEGER NOT NULL DEFAULT 60,
  "capacity" INTEGER NOT NULL DEFAULT 10,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Coupon" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "type" "DiscountType" NOT NULL,
  "value" DECIMAL(12,2) NOT NULL,
  "minOrder" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "maxUses" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "startsAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "collectionAddressId" TEXT NOT NULL,
  "deliveryAddressId" TEXT NOT NULL,
  "assignedEmployeeId" TEXT,
  "couponId" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
  "collectionAt" TIMESTAMP(3) NOT NULL,
  "deliveryExpectedAt" TIMESTAMP(3) NOT NULL,
  "collectedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "notes" TEXT,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "collectionFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "deliveryFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(12,2) NOT NULL,
  "pieceCount" INTEGER NOT NULL DEFAULT 0,
  "volumeCount" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "serviceName" TEXT NOT NULL,
  "unit" "ServiceUnit" NOT NULL,
  "quantity" DECIMAL(12,2) NOT NULL,
  "unitPrice" DECIMAL(12,2) NOT NULL,
  "total" DECIMAL(12,2) NOT NULL,
  "notes" TEXT,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(12,2) NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'PAGBANK',
  "providerOrderId" TEXT,
  "providerChargeId" TEXT,
  "providerTransactionId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "pixQrCodeText" TEXT,
  "pixQrCodeImageUrl" TEXT,
  "paidAt" TIMESTAMP(3),
  "rawResponse" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Voucher" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "qrPayload" TEXT NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryRoute" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "type" "RouteType" NOT NULL,
  "status" "RouteStatus" NOT NULL DEFAULT 'PENDING',
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DeliveryRoute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DriverLocation" (
  "id" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "routeId" TEXT NOT NULL,
  "latitude" DECIMAL(10,7) NOT NULL,
  "longitude" DECIMAL(10,7) NOT NULL,
  "accuracy" DECIMAL(10,2),
  "heading" DECIMAL(10,2),
  "speed" DECIMAL(10,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DriverLocation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryProof" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "type" "ProofType" NOT NULL,
  "fileUrl" TEXT,
  "fileData" BYTEA,
  "mimeType" TEXT,
  "fileName" TEXT,
  "textValue" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeliveryProof_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderStatusHistory" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "actorId" TEXT,
  "fromStatus" "OrderStatus",
  "toStatus" "OrderStatus" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Locker" (
  "id" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "locationName" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "compartment" TEXT,
  "status" "LockerStatus" NOT NULL DEFAULT 'AVAILABLE',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Locker_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LockerAuthorization" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "lockerId" TEXT NOT NULL,
  "status" "LockerAuthorizationStatus" NOT NULL DEFAULT 'PENDING',
  "accessCode" TEXT,
  "validFrom" TIMESTAMP(3) NOT NULL,
  "validUntil" TIMESTAMP(3) NOT NULL,
  "controllerRef" TEXT,
  "errorMessage" TEXT,
  "authorizedAt" TIMESTAMP(3),
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LockerAuthorization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" "AuditAction" NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SystemSetting" (
  "id" TEXT NOT NULL DEFAULT 'main',
  "storeName" TEXT NOT NULL DEFAULT 'Lavanderia Digital',
  "phone" TEXT,
  "whatsapp" TEXT,
  "supportEmail" TEXT,
  "pixEnabled" BOOLEAN NOT NULL DEFAULT true,
  "creditCardEnabled" BOOLEAN NOT NULL DEFAULT true,
  "debitCardEnabled" BOOLEAN NOT NULL DEFAULT false,
  "defaultDeliveryHours" INTEGER NOT NULL DEFAULT 48,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- Unique indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
CREATE UNIQUE INDEX "StaffProfile_userId_key" ON "StaffProfile"("userId");
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");
CREATE UNIQUE INDEX "Voucher_orderId_key" ON "Voucher"("orderId");
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");
CREATE UNIQUE INDEX "Locker_externalId_key" ON "Locker"("externalId");
CREATE UNIQUE INDEX "LockerAuthorization_orderId_key" ON "LockerAuthorization"("orderId");

-- Secondary indexes
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");
CREATE INDEX "Address_userId_isDefault_idx" ON "Address"("userId", "isDefault");
CREATE INDEX "AvailabilitySlot_weekday_active_idx" ON "AvailabilitySlot"("weekday", "active");
CREATE INDEX "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");
CREATE INDEX "Order_status_collectionAt_idx" ON "Order"("status", "collectionAt");
CREATE INDEX "Order_assignedEmployeeId_status_idx" ON "Order"("assignedEmployeeId", "status");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "Payment_orderId_status_idx" ON "Payment"("orderId", "status");
CREATE INDEX "Payment_providerOrderId_idx" ON "Payment"("providerOrderId");
CREATE INDEX "Payment_providerChargeId_idx" ON "Payment"("providerChargeId");
CREATE INDEX "DeliveryRoute_driverId_status_idx" ON "DeliveryRoute"("driverId", "status");
CREATE INDEX "DeliveryRoute_orderId_type_idx" ON "DeliveryRoute"("orderId", "type");
CREATE INDEX "DriverLocation_routeId_createdAt_idx" ON "DriverLocation"("routeId", "createdAt");
CREATE INDEX "DeliveryProof_orderId_createdAt_idx" ON "DeliveryProof"("orderId", "createdAt");
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_entity_entityId_createdAt_idx" ON "AuditLog"("entity", "entityId", "createdAt");

-- Foreign keys
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_collectionAddressId_fkey" FOREIGN KEY ("collectionAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DriverLocation" ADD CONSTRAINT "DriverLocation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DriverLocation" ADD CONSTRAINT "DriverLocation_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "DeliveryRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryProof" ADD CONSTRAINT "DeliveryProof_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryProof" ADD CONSTRAINT "DeliveryProof_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LockerAuthorization" ADD CONSTRAINT "LockerAuthorization_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LockerAuthorization" ADD CONSTRAINT "LockerAuthorization_lockerId_fkey" FOREIGN KEY ("lockerId") REFERENCES "Locker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
