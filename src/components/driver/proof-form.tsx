"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Eraser, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SignaturePad({onReady}:{onReady:(getBlob:()=>Promise<Blob|null>,clear:()=>void)=>void}){
 const ref=useRef<HTMLCanvasElement|null>(null);const drawing=useRef(false);const touched=useRef(false);
 useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ratio=Math.max(window.devicePixelRatio||1,1);const rect=canvas.getBoundingClientRect();canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(150*ratio);const ctx=canvas.getContext("2d")!;ctx.scale(ratio,ratio);ctx.lineWidth=2;ctx.lineCap="round";ctx.strokeStyle="#1f2937";const clear=()=>{ctx.clearRect(0,0,canvas.width/ratio,canvas.height/ratio);touched.current=false};const getBlob=()=>new Promise<Blob|null>(resolve=>{if(!touched.current){resolve(null);return}canvas.toBlob(resolve,"image/png")});onReady(getBlob,clear)},[onReady]);
 function pos(e:React.PointerEvent<HTMLCanvasElement>){const c=ref.current!;const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 function down(e:React.PointerEvent<HTMLCanvasElement>){drawing.current=true;touched.current=true;e.currentTarget.setPointerCapture(e.pointerId);const c=ref.current!,ctx=c.getContext("2d")!,p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)}
 function move(e:React.PointerEvent<HTMLCanvasElement>){if(!drawing.current)return;const ctx=ref.current!.getContext("2d")!,p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke()}
 function up(){drawing.current=false}
 return <canvas ref={ref} className="h-[150px] w-full touch-none rounded-lg border bg-white" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}/>;
}

export function ProofForm({orderId,routeType}:{orderId:string;routeType:string}){
 const router=useRouter();const[msg,setMsg]=useState("");const[error,setError]=useState("");const[busy,setBusy]=useState(false);const[mode,setMode]=useState<"PHOTO"|"SIGNATURE"|"CONFIRMATION">("PHOTO");const getSignature=useRef<()=>Promise<Blob|null>>(async()=>null);const clearSignature=useRef<()=>void>(()=>{});
 const basePhotoType=routeType==="COLLECTION"?"COLLECTION_PHOTO":"DELIVERY_PHOTO";
 const signatureReady=useCallback((getBlob:()=>Promise<Blob|null>,clear:()=>void)=>{getSignature.current=getBlob;clearSignature.current=clear},[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");setMsg("");const fd=new FormData(e.currentTarget);if(mode==="SIGNATURE"){const blob=await getSignature.current();if(!blob){setBusy(false);setError("Colete a assinatura antes de salvar.");return}fd.set("type","SIGNATURE");fd.set("file",new File([blob],"assinatura.png",{type:"image/png"}))}else if(mode==="CONFIRMATION"){fd.set("type","CUSTOMER_CONFIRMATION");fd.delete("file");if(!String(fd.get("textValue")??"").trim()){setBusy(false);setError("Informe quem confirmou o recebimento.");return}}else fd.set("type",basePhotoType);const r=await fetch(`/api/driver/orders/${orderId}/proof`,{method:"POST",body:fd});const d=await r.json();setBusy(false);if(!r.ok){setError(d.error??"Falha ao enviar comprovante");return}setMsg("Comprovante registrado.");(e.currentTarget as HTMLFormElement).reset();clearSignature.current();router.refresh()}
 return <form className="space-y-3" onSubmit={submit}><div className="grid grid-cols-3 gap-1.5"><Button type="button" size="sm" variant={mode==="PHOTO"?"default":"outline"} onClick={()=>setMode("PHOTO")}><Camera className="size-3.5"/>Foto</Button><Button type="button" size="sm" variant={mode==="SIGNATURE"?"default":"outline"} onClick={()=>setMode("SIGNATURE")}><PenLine className="size-3.5"/>Assinar</Button><Button type="button" size="sm" variant={mode==="CONFIRMATION"?"default":"outline"} onClick={()=>setMode("CONFIRMATION")}>Confirmar</Button></div>
 {mode==="PHOTO"&&<div className="space-y-1.5"><Label>Foto / comprovante</Label><Input name="file" type="file" accept="image/*" capture="environment" required/></div>}
 {mode==="SIGNATURE"&&<div className="space-y-2"><div className="flex items-center justify-between"><Label>Assinatura do cliente</Label><Button type="button" size="sm" variant="ghost" onClick={()=>clearSignature.current()}><Eraser className="size-3.5"/>Limpar</Button></div><SignaturePad onReady={signatureReady}/><p className="text-[10px] text-slate-500">Assine com o dedo ou caneta digital dentro da área.</p></div>}
 <div className="space-y-1.5"><Label>{mode==="CONFIRMATION"?"Quem confirmou":"Observação"}</Label><Input name="textValue" placeholder={mode==="CONFIRMATION"?"Ex.: Maria Silva, cliente / portaria":"Ex.: recebido por Maria / portaria"}/></div>
 <Button variant="outline" className="w-full" disabled={busy}>{mode==="SIGNATURE"?<PenLine className="size-4"/>:<Camera className="size-4"/>}{busy?"Salvando...":"Registrar comprovante"}</Button>{msg&&<p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700"><Check className="size-3.5"/>{msg}</p>}{error&&<p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}</form>
}
