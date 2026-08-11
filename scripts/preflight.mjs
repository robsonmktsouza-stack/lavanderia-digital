const required=["AUTH_SECRET","DATABASE_URL","NEXT_PUBLIC_APP_URL"];
const payment=["PAGBANK_TOKEN","NEXT_PUBLIC_PAGBANK_PUBLIC_KEY"];
const missing=required.filter(k=>!process.env[k]);
const missingPayment=payment.filter(k=>!process.env[k]);
if(missing.length){console.error(`Variáveis obrigatórias ausentes: ${missing.join(", ")}`);process.exit(1)}
if(missingPayment.length)console.warn(`PagBank ficará indisponível sem: ${missingPayment.join(", ")}`);
if((process.env.LOCKER_MODE??"mock")==="api"&&!process.env.LOCKER_API_URL){console.error("LOCKER_MODE=api exige LOCKER_API_URL");process.exit(1)}
console.log("Preflight OK");
