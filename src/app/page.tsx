import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  WashingMachine,
} from "lucide-react";

const services = [
  ["Lavagem & Dobra", "Roupas do dia a dia lavadas, secas e dobradas com cuidado profissional.", "A partir de R$ 18,90/kg"],
  ["Passadoria", "Camisas, calças e peças sociais prontas para vestir ou guardar.", "A partir de R$ 8,90/peça"],
  ["Edredons & Cobertores", "Higienização de peças volumosas com secagem completa e acabamento impecável.", "A partir de R$ 39,90"],
];

const testimonials = [
  ["Mariana A.", "A coleta foi pontual e recebi tudo dobrado, cheiroso e organizado. Economizou meu fim de semana."],
  ["Paulo R.", "Agendei pelo celular e acompanhei todo o pedido. Muito mais simples do que levar roupa até a lavanderia."],
  ["Camila S.", "Atendimento excelente e entrega dentro do horário. A experiência parece de aplicativo grande."],
];

export default function HomePage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Lavanderia Digital";

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#13212d]">
      <section
        className="relative min-h-[760px] overflow-hidden bg-[#102332] text-white lg:min-h-[820px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(6,20,31,.88) 0%,rgba(9,29,42,.72) 43%,rgba(9,29,42,.22) 76%,rgba(9,29,42,.12) 100%),url('https://images.pexels.com/photos/7310204/pexels-photo-7310204.jpeg?auto=compress&cs=tinysrgb&w=1800')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <header className="relative z-20 border-b border-white/15">
          <div className="mx-auto flex h-[74px] w-[min(1240px,calc(100%-32px))] items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
              <span className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur">
                <WashingMachine className="size-5" />
              </span>
              {appName}
            </Link>

            <nav className="hidden items-center gap-7 text-sm font-semibold text-white/90 md:flex">
              <a href="#servicos" className="hover:text-white">Serviços</a>
              <a href="#como-funciona" className="hover:text-white">Como funciona</a>
              <a href="#precos" className="hover:text-white">Preços</a>
              <a href="#avaliacoes" className="hover:text-white">Avaliações</a>
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/entrar" className="hidden px-3 py-2 text-sm font-semibold text-white sm:inline-flex">Entrar</Link>
              <Link href="/cadastro" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-bold text-[#17374f] transition hover:bg-[#f5f2ec]">
                Agendar agora
              </Link>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[686px] w-[min(1240px,calc(100%-32px))] items-center py-16 lg:min-h-[746px]">
          <div className="max-w-[760px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3.5 py-2 text-xs font-bold uppercase tracking-[.16em] text-white/90 backdrop-blur">
              <Sparkles className="size-3.5" /> Coleta e entrega na sua porta
            </div>

            <h1 className="max-w-[760px] text-[48px] font-black leading-[.96] tracking-[-.055em] sm:text-[64px] lg:text-[78px]">
              A gente cuida da roupa.
              <span className="block text-white/72">Você aproveita o tempo.</span>
            </h1>

            <p className="mt-6 max-w-[610px] text-base leading-7 text-white/82 sm:text-lg">
              Buscamos suas roupas, cuidamos de cada peça e entregamos tudo limpo, dobrado e pronto para usar — sem você sair de casa.
            </p>

            <form action="/cadastro" className="mt-8 max-w-[650px] rounded-2xl bg-white p-2.5 text-[#13212d] shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:flex sm:items-center">
              <div className="flex flex-1 items-center gap-3 px-3 py-2.5">
                <MapPin className="size-5 shrink-0 text-[#254e70]" />
                <div className="min-w-0 flex-1">
                  <label htmlFor="cep" className="block text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">Onde vamos buscar?</label>
                  <input id="cep" name="cep" inputMode="numeric" placeholder="Digite seu CEP" className="mt-0.5 w-full bg-transparent text-[15px] font-semibold outline-none placeholder:text-slate-400" />
                </div>
              </div>
              <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#254e70] px-6 text-sm font-bold text-white transition hover:bg-[#17374f] sm:w-auto">
                Agendar coleta <ArrowRight className="size-4" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/90">
              <div className="flex items-center gap-1 text-[#ffd56a]">{[1,2,3,4,5].map(i => <Star key={i} className="size-4 fill-current" />)}</div>
              <span className="font-semibold">Clientes satisfeitos com coleta, cuidado e entrega</span>
              <span className="hidden h-4 w-px bg-white/25 sm:block" />
              <span className="text-white/70">Pagamento por PIX ou cartão</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#ded8cf] bg-[#f7f4ef] py-6">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] grid-cols-1 divide-y divide-[#ded8cf] md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            [Clock3, "Ganhe tempo", "Agende a coleta em poucos minutos."],
            [ShieldCheck, "Cuidado profissional", "Tratamento adequado para cada peça."],
            [Truck, "Busca e entrega", "Acompanhamento do pedido pelo celular."],
          ].map(([Icon,title,text]: any) => (
            <div key={title} className="flex gap-4 px-0 py-5 md:px-8">
              <Icon className="mt-0.5 size-6 shrink-0 text-[#254e70]" />
              <div><h2 className="font-extrabold">{title}</h2><p className="mt-1 text-sm leading-6 text-[#65717a]">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="servicos" className="bg-white py-20 sm:py-24">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_.65fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#254e70]">Lavanderia feita para a vida real</p>
              <h2 className="mt-4 max-w-[780px] text-4xl font-black leading-[1.02] tracking-[-.045em] sm:text-5xl">Tudo que você precisa para nunca mais perder tempo com roupa acumulada.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#65717a] lg:justify-self-end">Escolha o serviço, informe a quantidade e agende a coleta. O restante é com a gente.</p>
          </div>

          <div className="mt-12 grid overflow-hidden rounded-[28px] bg-[#17374f] text-white lg:grid-cols-[1.08fr_.92fr]">
            <div className="min-h-[430px] bg-cover bg-center" style={{backgroundImage:"url('https://images.pexels.com/photos/31266419/pexels-photo-31266419/free-photo-of-man-doing-laundry-in-laundromat-smiling.jpeg?auto=compress&cs=tinysrgb&w=1400')"}} />
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
              <span className="text-xs font-black uppercase tracking-[.18em] text-white/55">Lavagem & dobra</span>
              <h3 className="mt-4 text-4xl font-black tracking-[-.04em]">Roupa limpa sem interromper sua semana.</h3>
              <p className="mt-5 text-base leading-7 text-white/75">Separamos, lavamos, secamos e dobramos suas roupas para que elas voltem organizadas e prontas para guardar.</p>
              <ul className="mt-7 space-y-3 text-sm font-semibold text-white/90">
                {["Coleta agendada na sua casa", "Lavagem profissional e cuidadosa", "Entrega organizada e rastreável"].map(item => <li key={item} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-white/10"><Check className="size-3.5" /></span>{item}</li>)}
              </ul>
              <Link href="/cadastro" className="mt-8 inline-flex w-fit items-center gap-2 border-b border-white/70 pb-1 text-sm font-black">Agendar este serviço <ArrowRight className="size-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-[#f7f4ef] py-20 sm:py-24">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <div className="max-w-[760px]">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#254e70]">Simples do começo ao fim</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">Sua primeira coleta em três passos.</h2>
          </div>
          <div className="mt-12 grid gap-0 border-y border-[#d8d1c8] md:grid-cols-3 md:divide-x md:divide-[#d8d1c8]">
            {[
              ["01", "Agende", "Escolha os serviços, seu endereço e o melhor horário para a coleta."],
              ["02", "A gente cuida", "Seu pedido entra em processamento e você acompanha cada mudança de status."],
              ["03", "Receba", "O motorista devolve suas roupas limpas no endereço combinado."],
            ].map(([n,title,text]) => (
              <div key={n} className="py-9 md:px-8 md:py-12 first:md:pl-0 last:md:pr-0">
                <span className="text-sm font-black text-[#254e70]">{n}</span>
                <h3 className="mt-8 text-2xl font-black">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#65717a]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="bg-white py-20 sm:py-24">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#254e70]">Serviços e preços</p><h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">Escolha só o que precisa.</h2></div>
            <Link href="/cadastro" className="inline-flex items-center gap-2 text-sm font-black text-[#254e70]">Ver todos os serviços <ChevronRight className="size-4" /></Link>
          </div>

          <div className="mt-10 divide-y divide-[#e6e1da] border-y border-[#e6e1da]">
            {services.map(([title,text,price]) => (
              <div key={title} className="grid gap-4 py-7 md:grid-cols-[.8fr_1.4fr_.55fr] md:items-center">
                <h3 className="text-xl font-black">{title}</h3>
                <p className="max-w-2xl text-sm leading-6 text-[#65717a]">{text}</p>
                <strong className="text-sm md:text-right">{price}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="avaliacoes" className="bg-[#17374f] py-20 text-white sm:py-24">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="flex gap-1 text-[#ffd56a]">{[1,2,3,4,5].map(i => <Star key={i} className="size-4 fill-current" />)}</div><h2 className="mt-5 max-w-2xl text-4xl font-black leading-[1.02] tracking-[-.045em] sm:text-5xl">Uma lavanderia que cabe na rotina.</h2></div>
            <p className="max-w-md text-sm leading-6 text-white/65">Experiência pensada para quem quer praticidade sem abrir mão do cuidado com as roupas.</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {testimonials.map(([name,text]) => (
              <article key={name} className="rounded-2xl border border-white/12 bg-white/[.06] p-6">
                <div className="flex gap-1 text-[#ffd56a]">{[1,2,3,4,5].map(i => <Star key={i} className="size-3.5 fill-current" />)}</div>
                <p className="mt-5 text-[15px] leading-7 text-white/88">“{text}”</p>
                <p className="mt-7 text-sm font-black">{name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e9dfd1] py-20 sm:py-24">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-10 lg:grid-cols-[1fr_.85fr] lg:items-center">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#254e70]">Pronto para testar?</p><h2 className="mt-4 max-w-[760px] text-4xl font-black leading-[1.02] tracking-[-.05em] sm:text-6xl">Tire a lavanderia da sua lista de tarefas.</h2><p className="mt-5 max-w-xl text-base leading-7 text-[#596873]">Faça seu cadastro, escolha a coleta e acompanhe tudo pelo celular.</p></div>
          <div className="rounded-[24px] bg-white p-4 shadow-[0_20px_60px_rgba(22,43,58,.10)] sm:p-6">
            <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#eef4f7] text-[#254e70]"><PackageCheck className="size-5" /></span><div><p className="font-black">Sua coleta começa aqui</p><p className="mt-1 text-sm leading-6 text-[#65717a]">Crie sua conta e monte seu primeiro pedido em poucos minutos.</p></div></div>
            <Link href="/cadastro" className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#254e70] px-6 text-sm font-black text-white hover:bg-[#17374f]">Agendar minha coleta <ArrowRight className="size-4" /></Link>
            <Link href="/entrar" className="mt-2 flex h-11 items-center justify-center text-sm font-bold text-[#254e70]">Já sou cliente</Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#102332] py-10 text-white/70">
        <div className="mx-auto flex w-[min(1240px,calc(100%-32px))] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 font-bold text-white"><WashingMachine className="size-5" /> {appName}</div>
          <div className="flex flex-wrap gap-5 text-xs font-semibold"><a href="#servicos">Serviços</a><a href="#como-funciona">Como funciona</a><a href="#precos">Preços</a><Link href="/entrar">Entrar</Link></div>
        </div>
      </footer>
    </main>
  );
}
