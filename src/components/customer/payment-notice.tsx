"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

type Payment={status?:string;method?:string;pixQrCodeText?:string|null;pixQrCodeImageUrl?:string|null};
export function PaymentNotice({orderId,payment}:{orderId:string;payment?:Payment|null}){
 const router=useRouter();const[data,setData]=useState<Payment|null>(payment??null);const[copied,setCopied]=useState(false);
 useEffect(()=>{try{const raw=sessionStorage.getItem(`payment:${orderId}`);if(raw){const fresh=JSON.parse(raw);setData((prev:any)=>({...prev,...fresh}));}}catch{}},[orderId]);
 useEffect(()=>{if(!data||["PAID","DECLINED","CANCELED","REFUNDED"].includes(data.status??""))return;let active=true;const check=async()=>{const r=await fetch(`/api/orders/${orderId}/payment`,{cache:"no-store"});if(!r.ok)return;const next=await r.json();if(!active||!next)return;setData(next);if(["PAID","DECLINED","CANCELED","REFUNDED"].includes(next.status??""))router.refresh()};const id=setInterval(check,5000);return()=>{active=false;clearInterval(id)}},[orderId,data?.status,router]);
 if(!data)return null;const paid=data.status==="PAID";const failed=["DECLINED","CANCELED"].includes(data.status??"");const pix=data.method==="PIX"||!!data.pixQrCodeText;
 return <div className={`mb-5 rounded-xl border p-4 ${paid?"border-emerald-200 bg-emerald-50":failed?"border-red-200 bg-red-50":"border-blue-200 bg-blue-50"}`}><div className="flex items-start gap-3">{paid?<CheckCircle2 className="mt-0.5 size-5 text-emerald-600"/>:failed?<AlertCircle className="mt-0.5 size-5 text-red-600"/>:<QrCode className="mt-0.5 size-5 text-[var(--brand)]"/>}<div className="min-w-0 flex-1"><strong className="text-sm">{paid?"Pagamento confirmado":failed?"Pagamento não aprovado":pix?"Finalize o pagamento via PIX":"Pagamento em processamento"}</strong>{pix&&!paid&&!failed&&<div className="mt-3 grid gap-3 sm:grid-cols-[110px_minmax(0,1fr)]">{data.pixQrCodeImageUrl&&<img src={data.pixQrCodeImageUrl} alt="QR Code PIX do pedido" className="size-[110px] rounded-lg border bg-white object-contain p-1"/>}<div className="min-w-0">{data.pixQrCodeText&&<><div className="flex gap-2"><code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-[11px]">{data.pixQrCodeText}</code><Button type="button" variant="outline" size="icon" onClick={async()=>{await navigator.clipboard.writeText(data.pixQrCodeText!);setCopied(true);setTimeout(()=>setCopied(false),1800)}}><Copy className="size-4"/></Button></div>{copied&&<p className="mt-1 text-[10px] font-medium text-emerald-700">PIX copiado.</p>}</>}</div></div>}</div></div></div>
}
