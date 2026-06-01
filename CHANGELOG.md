# 📋 Histórico de evolução — Bella Gravidez

App de acompanhamento de gestação. Web + PWA (instalável no celular), com
Firebase (login Google + Firestore em tempo real).

🌐 Produção: https://bella-gravidez.web.app
📦 Repositório: https://github.com/emanuelmelo87/bella-gravidez

---

## Visão geral das funcionalidades

### Autenticação e contas
- Login com **Google** (popup no desktop; redirect como reserva)
- Perfil do usuário salvo no Firestore (nome, email, foto)
- Botão **Sair** nas Configurações
- **Exclusão de conta e de todos os dados** (LGPD)
- **Onboarding**: no 1º acesso pergunta se é **Mãe** (cria a gestação) ou
  **Pai** (entra com link de convite)

### Perfis e permissões
- 4 perfis: **Mãe (admin da gestação)**, **Pai**, **Doula**, **Obstetra**
- **Convite por link** (validade de 7 dias), um por perfil
- **Permissões por seção** definidas pela mãe (sem acesso / ver / editar)
- **Visibilidade por item e por pessoa**: a mãe escolhe quem vê cada
  anotação, foto, sintoma, consulta (Diário, Saúde, Fotos)
- Vários profissionais por gestação (doula + backup, troca de obstetra)

### Seções do app
- **Início** — semana atual, progresso, tamanho do bebê, datas, dica
- **Diário** — humor + texto, com visibilidade por pessoa
- **Bebê** — contador de chutes (incremento atômico, tempo real) + tamanho/semana
- **Contrações** — cronômetro ao vivo, intensidade em barras, timeline com
  intervalo (h:mm:ss), estatísticas da última hora, alerta de frequência.
  Tempo real: pai registra; doula e obstetra acompanham ao vivo
- **Trabalho de Parto** — timeline colaborativa de marcos (tampão, bolsa,
  dilatação, nascimento…) + resumo do parto
- **Plano de Parto** — preferências por seção + observações + **exportar PDF**
- **Saúde** — consultas, medicamentos, sintomas (com visibilidade por pessoa)
- **Dicas** — criadas só por **Doula, Obstetra e Admin**; mãe e pai só veem;
  com agendamento por semana
- **Mais** — enxoval (checklist), **playlist comunal do YouTube**
  (todos os membros incluem links de música/playlist), fotos

### Personalização
- 5 temas de cores + apelido do bebê
- Header mostra o **ícone da Bella + nome do bebê**

### Painel Admin (master)
- Acesso restrito (email dono + coleção `platformAdmins`)
- **Métricas**: gestações, usuários, membros, **acessos, ativos hoje/7 dias**
- **Usuários**: lista todos, busca, **tornar/remover admin**
- **Gestações**: anônimas (sem nome do bebê/DPP) — respeita privacidade
- **Marcos do parto**: cadastrar/editar/ativar
- **Ver como perfil** (só master): assume Mãe/Pai/Doula/Obstetra para teste

### Privacidade
- Admin **nunca vê** dados pessoais (diário, saúde, fotos, nome do bebê)
- Regras do Firestore isolam cada gestação ao dono e aos membros
- Conteúdo sensível em subcoleções, inacessível ao admin

### Infraestrutura
- **PWA** instalável + offline (service worker)
- **Firestore** em tempo real, regras de segurança por gestação
- **Capacitor** configurado para gerar apps Android/iOS (ver `MOBILE.md`)
- Deploy no **Firebase Hosting**
- Ícone próprio (silhueta de grávida com coração)

---

## Notas técnicas
- Stack: React + Vite, Firebase (Auth + Firestore + Hosting)
- Layout responsivo: coluna única padronizada no celular/tablet
- `scripts/icon-source.png` é a fonte do ícone — rode `npm run icons` para
  regenerar favicon e ícones do app

## Pendências / próximos passos possíveis
- Login com **Apple** (necessário para a App Store)
- Notificações push
- Gerar os apps nativos Android/iOS via Capacitor (precisa de Android Studio/Xcode)
- (Opcional) Criptografia ponta-a-ponta dos campos sensíveis
