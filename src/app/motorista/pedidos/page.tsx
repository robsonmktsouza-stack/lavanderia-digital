import Link from "next/link";
import { auth } from "@/auth";
import { getDriverOrders } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dateTime } from "@/lib/utils";

export default async function Page(){
  const s=await auth();
  const orders=await getDriverOrders(s!.user.id);
  return <div className="page-container">
    <PageHeader title="Pedidos atribuídos" description="Pedidos atuais e histórico sob sua responsabilidade."/>
    <div className="grid gap-3 md:grid-cols-2">{orders.map((order:any)=>{const route=order.routes?.[0];return <Card key={order.id} className="p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><strong>{order.number}</strong><Badge>{order.status}</Badge>{route&&<Badge variant={route.status==="COMPLETED"?"success":"secondary"}>{route.type==="COLLECTION"?"Coleta":"Entrega"} · {route.status}</Badge>}</div>
        <p className="mt-1 text-sm text-slate-600">{order.customer.name}</p>
        <p className="mt-1 text-xs text-slate-500">{route?.type==="COLLECTION"?"Coleta":"Entrega"} · {dateTime(route?.type==="COLLECTION"?order.collectionAt:order.deliveryExpectedAt)}</p>
      </div><Button asChild size="sm"><Link href={`/motorista/pedidos/${order.id}`}>Abrir</Link></Button></div>
    </Card>})}</div>
  </div>;
}
