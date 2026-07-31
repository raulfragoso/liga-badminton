# 🏸 Liga de Badminton — Complexo Esportivo Maylson Campos

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

Aplicação Web Progressiva (PWA) moderna para gestão, acompanhamento e ranqueamento da **Liga de Badminton em Pirâmide** do Complexo Esportivo Maylson Campos.

👉 **Aplicação Oficial:** [https://liga-badminton-six.vercel.app/](https://liga-badminton-six.vercel.app/)

---

## 🌟 Principais Funcionalidades

### 🔺 Visualização e Regulamento da Pirâmide
- **Estrutura por Níveis:** Organização dinâmica dos atletas em níveis da pirâmide (Nível 1 na base de entrada, subindo conforme as vitórias).
- **Cálculo Automático de Níveis:** O nível do atleta é calculado e recalculado estritamente com base no histórico real de partidas, sem edições manuais inconsistentes.

### 🏆 Ranqueamento e Liderança Inteligente
- **Líder Atual da Liga:** Apresentado no topo do painel principal.
- **Desempate por Saldo de Pontos:** Em caso de empate no número de vitórias (*jogos ganhos*), o critério de desempate é o **saldo de pontos acumulados** nos sets disputados (`pontos marcados - pontos sofridos`).

### 🔐 Autenticação Privada e Segura (Supabase Auth)
- **Área Restrita (Lock Screen):** O sistema possui um bloqueio rígido que impede a visualização da pirâmide e das estatísticas para usuários não logados.
- **Login Seguro via GoTrue:** Senhas criptografadas nativamente com `bcrypt` e validação pelo próprio servidor do Supabase.
- **Geração de Senha Aleatória:** Administradores podem gerar novas senhas provisórias seguras com apenas um clique.
- **Integração com WhatsApp:** Envio automatizado da nova senha provisória diretamente para o WhatsApp do atleta.

### 📱 Notificações via WhatsApp
- **Envio de Desafios:** Geração instantânea de mensagens formatadas no WhatsApp para notificar atletas desafiados.
- **Link Oficial Integrado:** Link direto para acesso rápido à liga (`https://liga-badminton-six.vercel.app/`).

### 🏸 UX/UI e Design Premium
- **Peteca Animada (Shuttlecock SVG):** Design visual rico com vetorizações animadas (flutuando e girando) em telas de carregamento, bloqueio e estados vazios.
- **Histórico Preciso:** O histórico de partidas exibe não apenas a data, mas a hora exata da conclusão do desafio.

### ☁️ Sincronização em Nuvem em Tempo Real (Supabase)
- **Supabase Realtime:** Atualizações instantâneas entre computadores e celulares sem necessidade de atualizar a página.
- **Persistência de Dados:** Atletas, histórico de partidas e configurações da temporada são mantidos no Supabase e em cache local (`localStorage`).

### 📲 PWA (Progressive Web App)
- Instalável nativamente em dispositivos Android, iOS e Desktop com suporte a acesso offline e inicialização rápida.

---

## 🛠️ Tecnologias Utilizadas

- **Core:** React 18, TypeScript, Vite
- **Estilização:** Tailwind CSS, Glassmorphism, Micro-animações
- **Ícones & Efeitos:** Lucide React, Canvas Confetti
- **Banco de Dados & Nuvem:** Supabase (PostgreSQL + Realtime Channels)
- **PWA:** Vite PWA Plugin, Service Worker
- **Hospedagem:** Vercel

---

## ⚙️ Variáveis de Ambiente

Para o funcionamento correto da sincronização com o banco Supabase, adicione as seguintes variáveis no seu arquivo `.env` local ou no painel da **Vercel**:

```env
# Integração Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-supabase
```
*(As antigas variáveis `VITE_ADMIN_PHONE` e `VITE_ADMIN_PASSWORD` não são mais necessárias devido à forte integração com o sistema nativo Supabase Auth).*

---

## 🗄️ Estrutura do Banco de Dados e Auth (Supabase SQL)

Para criar toda a estrutura de tabelas, regras de segurança RLS (Row Level Security) e injeção do sistema de autenticação, execute o script consolidado disponibilizado em [`supabase-auth-setup.sql`](./supabase-auth-setup.sql) no **SQL Editor** do Supabase:

```sql
-- O script configura automaticamente:
-- 1. Criação do perfil master (Administrador) na auth.users
-- 2. Tabela de Atletas (public.players) com sincronia RLS
-- 3. Tabelas de Desafios e Settings
-- 4. Funções (RPC) seguras para geração e redefinição de senhas
```

---

## 🚀 Como Rodar o Projeto Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/raulfragoso/liga-badminton.git
   cd liga-badminton
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Gere a build de produção:**
   ```bash
   npm run build
   ```

---

## 📋 Regulamento Resumido da Liga

1. **Desafios:** Um atleta pode desafiar um adversário do mesmo nível ou de nível superior.
2. **Frequência:** Limite de 1 desafio ativo por semana por desafiante.
3. **WO e Recusas:** Punição de 2 semanas de suspensão (*cooldown*) para faltas sem aviso prévio.
4. **Premiação Trimestral:** A temporada é dividida em períodos de 3 meses, com premiação e consagração do campeão ao término do período.

---

## 📜 Licença

Desenvolvido para a **Liga de Badminton do Complexo Esportivo Maylson Campos**.
Todos os direitos reservados.
