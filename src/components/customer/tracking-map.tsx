"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

export function TrackingMap({ orderId, initial }:{orderId:string;initial?:{latitude:number;longitude:number}|null}){
  const el=useRef<HTMLDivElement|null>(null); const map=useRef<maplibregl.Map|null>(null); const marker=useRef<maplibregl.Marker|null>(null); const[pos,setPos]=useState(initial??null);
  useEffect(()=>{if(!el.current||map.current)return;const p=pos??{latitude:-23.5614,longitude:-46.6559};map.current=new maplibregl.Map({container:el.current,style:process.env.NEXT_PUBLIC_MAP_STYLE_URL??"https://demotiles.maplibre.org/style.json",center:[p.longitude,p.latitude],zoom:13});marker.current=new maplibregl.Marker().setLngLat([p.longitude,p.latitude]).addTo(map.current);return()=>{map.current?.remove();map.current=null;};},[]);
  useEffect(()=>{if(pos&&marker.current&&map.current){marker.current.setLngLat([pos.longitude,pos.latitude]);map.current.easeTo({center:[pos.longitude,pos.latitude]});}},[pos]);
  useEffect(()=>{const load=async()=>{const r=await fetch(`/api/orders/${orderId}/tracking`,{cache:"no-store"});if(r.ok){const d=await r.json();if(d.location)setPos(d.location);}};load();const id=setInterval(load,10000);return()=>clearInterval(id);},[orderId]);
  return <div><div ref={el} className="map-shell"/><p className="mt-2 text-[10px] text-slate-400">A localização é atualizada enquanto o motorista mantém o acompanhamento ativo.</p></div>;
}
