"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LocateFixed, Play, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RouteControls({routeId,status,type}:{routeId:string;status:string;type:string}){
  const router=useRouter();const[busy,setBusy]=useState(false);const[tracking,setTracking]=useState(status==="IN_PROGRESS");const[error,setError]=useState("");const watch=useRef<number|null>(null);const last=useRef(0);
  async function action(a:"start"|"complete"){setBusy(true);setError("");const r=await fetch(`/api/driver/routes/${routeId}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({action:a})});const d=await r.json();setBusy(false);if(!r.ok){setError(d.error??"Falha ao atualizar rota");return;}setTracking(a==="start");router.refresh();}
  useEffect(()=>{if(!tracking||!navigator.geolocation)return;watch.current=navigator.geolocation.watchPosition(async p=>{const now=Date.now();if(now-last.current<10000)return;last.current=now;await fetch("/api/driver/location",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({routeId,latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy,heading:p.coords.heading,speed:p.coords.speed})}).catch(()=>null);},()=>setError("Permita o acesso à localização para compartilhar a rota."),{enableHighAccuracy:true,maximumAge:5000,timeout:15000});return()=>{if(watch.current!==null)navigator.geolocation.clearWatch(watch.current)}},[tracking,routeId]);
  if(status==="COMPLETED")return <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-4"/>Rota concluída</div>;
  return <div className="space-y-2">{status==="PENDING"?<Button className="w-full" onClick={()=>action("start")} disabled={busy}><Play className="size-4"/>{busy?"Iniciando...":`Iniciar ${type==="COLLECTION"?"coleta":"entrega"}`}</Button>:<><div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs font-medium text-[var(--brand)]"><LocateFixed className="size-4 animate-pulse"/>Localização sendo compartilhada com o cliente.</div><Button variant="outline" className="w-full" onClick={()=>action("complete")} disabled={busy}><StopCircle className="size-4"/>{busy?"Concluindo...":`Concluir ${type==="COLLECTION"?"coleta":"entrega"}`}</Button></>}{error&&<p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}</div>;
}
