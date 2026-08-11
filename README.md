# Lavanderia Digital

Plataforma completa e responsiva para lavanderias: pedido online, agenda de coleta/entrega, PagBank, voucher, rastreamento do motorista, armários, painel administrativo e área exclusiva do motorista.

## Stack

A base técnica replica o Reforma Aberta: **Next.js 16.2.12 + React 19.2.8 + TypeScript + Prisma 7.9.1 + Neon PostgreSQL + NextAuth 5 + Vercel**, usando componentes no padrão **shadcn/ui + Tailwind CSS 4**. O visual deste projeto é SaaS limpo e comercial; não utiliza ribbon, grade de planilha nem estilo Excel/industrial.

## Áreas do sistema

### Cliente
- cadastro com nome, CPF, telefone, e-mail, senha e endereço principal;
- recuperação de senha com token de uso único e validade de 30 minutos;
- múltiplos endereços, endereço padrão, edição e exclusão segura;
- catálogo de serviços por peça, kg, volume ou serviço;
- agenda gerada a partir dos horários/capacidades cadastrados no painel;
- coleta e previsão de entrega;
- cotação automática no servidor com regiões de coleta/entrega, taxas, pedido mínimo e cupom;
- PIX, crédito e débito 3DS via PagBank;
- histórico e acompanhamento do pedido;
- motorista responsável e contato;
- rastreamento em mapa durante rota ativa;
- voucher em tela, impressão, QR Code e PDF;
- atendimento via WhatsApp;
- opção de armário vinculada ao pedido.

### Administração
- dashboard operacional e financeiro condicionado a permissões;
- pedidos, status e atribuição de motorista;
- agenda/capacidade;
- clientes e bloqueio de acesso;
- funcionários e motoristas;
- perfis/permissões granulares;
- serviços e preços;
- cupons;
- regiões, pedido mínimo e taxas;
- rotas;
- financeiro por período;
- formas de pagamento;
- cadastro e situação de armários;
- trilha de auditoria das ações administrativas.

### Motorista
- login separado e navegação exclusiva;
- somente pedidos/rotas atribuídos;
- dados necessários do cliente e endereço;
- ligar, WhatsApp e abrir destino no mapa;
- iniciar/finalizar coleta ou entrega;
- geolocalização enviada enquanto a rota está ativa;
- foto/comprovante, confirmação textual e assinatura desenhada na tela;
- sem acesso a financeiro, configurações ou outros funcionários.

## Banco de dados

O `prisma/schema.prisma` contém usuários, perfis, endereços, serviços, regiões, agenda, cupons, pedidos, itens, pagamentos, vouchers, rotas, geolocalizações, comprovantes, histórico de status, armários, autorizações, auditoria e configurações.

## PagBank

A integração está em `src/lib/pagbank.ts` e usa a API de Pedidos. O fluxo foi separado em:
- PIX: cria pedido e QR Code; confirmação final ocorre pelo webhook;
- crédito: cartão é criptografado no navegador pelo SDK do PagBank e somente o criptograma chega ao backend;
- débito: criptografia + sessão/autenticação 3DS antes da cobrança;
- `x-idempotency-key` por criação de pagamento;
- webhook em `/api/webhooks/pagbank` valida `x-authenticity-token` usando SHA-256 com o corpo bruto antes de alterar a transação.

Configure no PagBank a URL pública:

`https://SEU-DOMINIO/api/webhooks/pagbank`

## Armários

`src/lib/locker.ts` possui dois modos:

- `LOCKER_MODE=mock`: desenvolvimento sem controladora;
- `LOCKER_MODE=api`: chama `POST {LOCKER_API_URL}/access/authorize` com `lockerId`, `orderId`, `validFrom`, `validUntil` e `accessCode`.

A autorização só é enviada após pagamento confirmado. Como cada fabricante/controladora possui contrato próprio, adapte apenas o payload/endpoint desse arquivo quando receber a documentação da API específica. Todo o restante do fluxo já está pronto.

## Configuração local

Requisitos: Node 22+, Neon PostgreSQL e credenciais PagBank para pagamentos reais.

```bash
cp .env.example .env.local
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

A migration inicial já está versionada em `prisma/migrations/20260810203000_init`, pronta para `prisma migrate deploy`. Use `db:push` apenas em desenvolvimento descartável.

## Contas de demonstração

Após `npm run db:seed`:

- Administrador: `admin@lavanderia.local` / `Admin@123`
- Motorista: `motorista@lavanderia.local` / `Motorista@123`
- Cliente: `cliente@lavanderia.local` / `Cliente@123`

Sem `DATABASE_URL`, o frontend também possui fallback de demonstração para facilitar inspeção visual.

## Variáveis principais

Veja `.env.example`.

- `DATABASE_URL`: URL pooled do Neon em runtime;
- `DATABASE_URL_UNPOOLED`: URL direta para migrations;
- `AUTH_SECRET`;
- `NEXT_PUBLIC_APP_URL`;
- `PAGBANK_ENV=sandbox|production`;
- `PAGBANK_TOKEN`;
- `NEXT_PUBLIC_PAGBANK_PUBLIC_KEY`;
- `LOCKER_MODE=mock|api`;
- `LOCKER_API_URL` e `LOCKER_API_TOKEN`;
- bridge opcional de e-mail para recuperação de senha.

## Validação antes do deploy

```bash
npm run typecheck
npm test
npm run build
npm run preflight
```

## Vercel

1. Crie o banco Neon e configure as variáveis do `.env.example` no projeto Vercel.
2. Aplique o schema/migrations no banco.
3. Faça deploy normalmente com `npm run build`.
4. Cadastre no PagBank a URL de webhook do domínio final.
5. Somente mude `LOCKER_MODE` para `api` após configurar a controladora.

## Segurança implementada

- senha com bcrypt;
- sessão JWT via NextAuth;
- status de conta ativo/desativado;
- autorização por papel e permissões;
- consultas do motorista limitadas às rotas atribuídas;
- consultas do cliente limitadas aos próprios pedidos/endereço;
- preço, cupom, região, disponibilidade e capacidade validados no servidor;
- cartão sem PAN/CVV persistido;
- webhook PagBank autenticado;
- comprovantes privados, liberados apenas para usuários relacionados;
- histórico de status e auditoria administrativa.
