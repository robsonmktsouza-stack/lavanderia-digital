import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

const env = process.env.PAGBANK_ENV ?? "sandbox";
const base = env === "production" ? "https://api.pagseguro.com" : "https://sandbox.api.pagseguro.com";
const sdkBase = env === "production" ? "https://sdk.pagseguro.com" : "https://sandbox.sdk.pagseguro.com";

function token() { if (!process.env.PAGBANK_TOKEN) throw new Error("PAGBANK_TOKEN não configurado."); return process.env.PAGBANK_TOKEN; }
function cents(value: number) { return Math.round(value * 100); }
function cleanPhone(phone?: string | null) { const d=(phone??"").replace(/\D/g,""); const local=d.startsWith("55")?d.slice(2):d; return { country:"55", area:local.slice(0,2)||"11", number:local.slice(2)||"999999999", type:"MOBILE" }; }

export async function create3DSSession() {
  if (!process.env.PAGBANK_TOKEN) return { session: "DEMO_3DS_SESSION", env: env === "production" ? "PROD" : "SANDBOX", demo: true };
  const r = await fetch(`${sdkBase}/checkout-sdk/sessions`, { method:"POST", headers:{ Authorization:`Bearer ${token()}`, accept:"application/json" }, cache:"no-store" });
  const data = await r.json(); if(!r.ok) throw new Error(data?.error_messages?.[0]?.description ?? data?.message ?? "Falha ao criar sessão 3DS.");
  return { session: data.session ?? data.id ?? data, env: env === "production" ? "PROD" : "SANDBOX" };
}

export async function createPagBankPayment(input: {
  order: any;
  method: "PIX" | "CREDIT_CARD" | "DEBIT_CARD";
  encryptedCard?: string;
  holderName?: string;
  holderTaxId?: string;
  installments?: number;
  threeDSId?: string;
}) {
  const idempotencyKey = randomUUID();
  if (!prisma) return { status:"PAID", providerOrderId:`ORDE_DEMO_${Date.now()}`, providerChargeId:`CHAR_DEMO_${Date.now()}`, providerTransactionId:`TX_DEMO_${Date.now()}`, idempotencyKey, pixQrCodeText: input.method === "PIX" ? "00020101021226820014BR.GOV.BCB.PIX2560demo.lavanderia.local/pix" : null, pixQrCodeImageUrl:null, rawResponse:{demo:true} };

  const amount = Number(input.order.total);
  const customer = input.order.customer;
  const address = input.order.deliveryAddress ?? input.order.collectionAddress;
  const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/pagbank`;
  const common:any = {
    reference_id: input.order.number,
    customer: { name: customer.name, email: customer.email, tax_id: customer.cpf?.replace(/\D/g,"") || undefined, phones: [cleanPhone(customer.phone)] },
    shipping: { address: { street:address.street, number:address.number, complement:address.complement || undefined, locality:address.district, city:address.city, region_code:address.state, country:"BRA", postal_code:address.postalCode.replace(/\D/g,"") } },
    notification_urls: [notificationUrl]
  };

  if (input.method === "PIX") {
    common.qr_codes = [{ amount: { value: cents(amount) } }];
  } else {
    if (!input.encryptedCard) throw new Error("Cartão criptografado não informado.");
    common.charges = [{
      reference_id:`PAY-${input.order.number}`,
      description:`Pedido ${input.order.number}`,
      amount:{ value:cents(amount), currency:"BRL" },
      payment_method:{
        type:input.method,
        installments: input.method === "CREDIT_CARD" ? (input.installments ?? 1) : 1,
        capture:true,
        card:{ encrypted:input.encryptedCard, holder:{ name:input.holderName || customer.name, tax_id:(input.holderTaxId || customer.cpf || "").replace(/\D/g,"") } },
        ...(input.threeDSId ? { authentication_method:{ type:"THREEDS", id:input.threeDSId } } : {})
      }
    }];
  }

  const response = await fetch(`${base}/orders`, { method:"POST", headers:{ Authorization:`Bearer ${token()}`, "Content-Type":"application/json", accept:"application/json", "x-idempotency-key":idempotencyKey }, body:JSON.stringify(common), cache:"no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error_messages?.[0]?.description ?? data?.message ?? `PagBank HTTP ${response.status}`);
  const charge = data.charges?.[0];
  const qr = data.qr_codes?.[0];
  const qrImage = qr?.links?.find((l:any)=>l.media === "image/png" || l.rel === "QRCODE.PNG")?.href ?? qr?.links?.[0]?.href;
  return { status: charge?.status ?? (input.method === "PIX" ? "PENDING" : "PENDING"), providerOrderId:data.id, providerChargeId:charge?.id, providerTransactionId:charge?.payment_response?.reference, idempotencyKey, pixQrCodeText:qr?.text, pixQrCodeImageUrl:qrImage, rawResponse:data };
}

export function mapPaymentStatus(status?: string) {
  if (["PAID"].includes(status??"")) return "PAID";
  if (["AUTHORIZED"].includes(status??"")) return "AUTHORIZED";
  if (["IN_ANALYSIS"].includes(status??"")) return "IN_ANALYSIS";
  if (["DECLINED"].includes(status??"")) return "DECLINED";
  if (["CANCELED"].includes(status??"")) return "CANCELED";
  if (["REFUNDED"].includes(status??"")) return "REFUNDED";
  return "PENDING";
}
