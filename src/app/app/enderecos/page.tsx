import { auth } from "@/auth";
import { getCustomerAddresses } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { AddressManager } from "@/components/customer/address-manager";
export default async function Page(){const s=await auth();const list=await getCustomerAddresses(s!.user.id);return <div className="page-container"><PageHeader title="Endereços" description="Cadastre locais para coleta e entrega."/><AddressManager addresses={list as any}/></div>}
