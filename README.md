# ⚽ FIFA FAR PLAY

Aplicativo web (PWA) para gerenciar partidas de FIFA entre amigos — amistosos, torneios, ranking e times. Construído como uma Single Page Application em HTML/CSS/JS puro com **Firebase** (Firestore, Auth e Storage) como backend.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Autenticação](#autenticação)
- [Funcionalidades](#funcionalidades)
  - [Home (Dashboard)](#home-dashboard)
  - [Jogadores](#jogadores)
  - [Amistosos](#amistosos)
  - [Torneios (Campeonatos)](#torneios-campeonatos)
  - [Ranking](#ranking)
  - [Times](#times)
- [Controle de Acesso](#controle-de-acesso)
- [Sistema de Sorteio Balanceado](#sistema-de-sorteio-balanceado)
- [Compartilhamento via WhatsApp](#compartilhamento-via-whatsapp)
- [Interface e UX](#interface-e-ux)

---

## Visão Geral

O **FIFA FAR PLAY** é um aplicativo mobile-first que permite:

- Cadastrar jogadores que participam das partidas
- Sortear times de forma balanceada para amistosos e torneios
- Registrar placares e acompanhar resultados
- Visualizar rankings separados de amistosos e torneios
- Gerenciar um catálogo de clubes e seleções com atributos do EA FC 25

## Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML/CSS/JS** | Frontend — tudo em um único arquivo `index.html` |
| **Firebase Auth** | Login com Google e Apple |
| **Cloud Firestore** | Banco de dados (jogadores, amistosos, campeonatos, times) |
| **Firebase Storage** | Upload de fotos de avatar dos jogadores |
| **Service Worker** | Suporte offline (PWA) |
| **Web App Manifest** | Instalação como aplicativo nativo |

---

## Autenticação

### `fazerLogin(provider, btnId)`
Realiza login via popup (Google ou Apple). Se o popup for bloqueado, tenta redirect como fallback.

### `onAuthStateChanged`
Ao detectar usuário logado:
1. Exibe a interface principal e oculta a tela de login
2. Carrega dados de times, jogadores, amistosos e campeonatos
3. Executa auto-cadastro do jogador (`_autoCadastrarJogador`)
4. Aplica controle de acesso na UI (`_aplicarControleAcesso`)

### `_autoCadastrarJogador(u)`
No primeiro login, cria automaticamente um registro de jogador no Firestore com os dados do perfil do usuário (nome, e-mail, foto).

---

## Funcionalidades

### Home (Dashboard)

A tela inicial exibe:

- **Botão "+ CRIAR"** (somente para usuário master) — dropdown com opções de criar Jogador, Amistoso ou Torneio
- **Amistosos em andamento** — cards das partidas sem placar registrado, com inputs para registrar o resultado direto
- **Torneios em andamento** — cards dos torneios ativos com barra de progresso e próximos jogos pendentes
- **Ranking Amistosos** — top 5 jogadores por pontuação em amistosos
- **Ranking Torneios** — top 5 jogadores por pontuação em torneios

Função principal: `atualizarDash()` — recalcula rankings e atualiza todos os blocos da home.

---

### Jogadores

#### Cadastro — `salvarJogador()`
Cria um novo jogador com:
- **Nome** (obrigatório, sem duplicados)
- **E-mail** (opcional, sem duplicados)
- **Celular** (opcional, sem duplicados)
- **Foto** (upload com compactação automática via Canvas — máx. 200×200px, JPEG 0.7)
- **Flag Master** — define o jogador como administrador do app

#### Edição — `editarJogador(id)` / `salvarEdicaoJogador(id)`
Abre tela fullscreen para editar todos os campos. Ao marcar como master, o master anterior é automaticamente desmarcado.

#### Exclusão — `excluirJogador(id)` / `confirmarExcluirJog(id)`
Remove o jogador e todas suas referências:
- Remove de `jogadoresIds` nos amistosos
- Remove de participantes, membros e partidas nos campeonatos
- Exibe modal de confirmação com aviso de ação irreversível

#### Avatar — `compactarImagem(file, maxSize, quality)`
Compacta imagens de avatar usando Canvas antes do upload para o Firebase Storage (redimensiona para 200×200px e converte para JPEG com qualidade 0.7).

#### Renderização — `renderJogadores()`
Lista todos os jogadores em cards com nome, e-mail, celular, tag MASTER e avatar. Suporta swipe-to-delete no mobile (somente para o usuário master).

---

### Amistosos

#### Criar Amistoso — fluxo completo

1. **Seleção de tipo** — `toggleTipoAmi(tipo)`: Clubes, Seleções ou ambos (toggle multi-seleção)
2. **Modo Dupla (2v2)** — `toggleModoDupla(ativo)`: exige exatamente 4 jogadores
3. **Seleção de jogadores** — busca com autocomplete, tags removíveis, pré-preenchimento do último jogo (`_preencherUltimoJogo`)
4. **Sorteio automático ou manual**:
   - **Automático** — `sortearAmistoso()`: sorteia times balanceados e distribui jogadores aleatoriamente
   - **Manual** — `toggleSorteioAuto()`: cada jogador escolhe seu time via dropdown com busca
5. **Filtro de eficiência** — `htmlEficFiltro()`: filtra o pool de times por eficiência (Ruim/Moderado/Bom)
6. **Compartilhar no WhatsApp** — botão para enviar o sorteio formatado
7. **Salvar** — `salvarAmistoso()`: persiste no Firestore (máximo de 5 amistosos abertos simultâneos)

#### Registrar Placar

- **Placar direto** — `salvarPlacarDireto(id, btn)`: inputs numéricos diretamente no card da partida (botão "FIM" / "OK")
- **Modal de placar** — `abrirPlacar(id)` / `salvarPlacar(id)`: modal com inputs grandes para registrar resultado

#### Edição — `editarAmistoso(id)`
- **Em andamento**: abre o formulário completo para editar jogadores, re-sortear times ou escolher times manualmente
- **Finalizado**: permite apenas editar o placar

#### Edição rápida de time — `editarTimeRapido(timeId, timeNome, tipoT)`
Ao clicar no badge do time durante o sorteio, abre modal para alterar eficiência ou marcar como inativo. Se o time for inativado, o sorteio é refeito automaticamente.

#### Exclusão — `confirmarExcluirAmistoso(id)`
Modal de confirmação. Ao excluir um amistoso finalizado, avisa que o ranking será recalculado.

#### Filtros e paginação — `renderAmistosos()`
- Amistosos agrupados em "Em Andamento" e "Finalizados" (accordions colapsáveis)
- Finalizados possuem filtros por tipo (Clubes/Seleções), por jogador e paginação (10 por página)

---

### Torneios (Campeonatos)

#### Criar Torneio — `criarCampeonato()`

1. **Formato** — `selCampTipo(k, el)`: 6 formatos disponíveis:
   | Formato | Tipo | Descrição |
   |---|---|---|
   | Champions League | Clubes | Fase de grupos + eliminatórias |
   | Libertadores | Clubes | Fase de grupos + oitavas |
   | Brasileirão | Clubes | Todos contra todos (pontos corridos) |
   | Paulistão | Clubes | 4 grupos + quartas/semi/final |
   | Copa do Brasil | Clubes | Eliminatório direto |
   | Copa do Mundo | Clubes* | Fase de grupos + eliminatórias |

   *\*Copa do Mundo: configurado como tipo "Clubes" no sistema, mas pode ser jogado com times ou seleções.*

2. **Nome do torneio** — auto-preenchido com base no formato selecionado
3. **Seleção de participantes** — busca com autocomplete e tags
4. **Sorteio de times** — automático (balanceado) ou manual (cada jogador escolhe seu time)
5. **Geração de grupos** — `gerarGrupos()`: distribui participantes em grupos com tabela de partidas

#### Visualizar Torneio — `abrirCampeonato(id)`
Exibe tela fullscreen com:
- Informações gerais (formato, status, participantes, jogos registrados)
- **Seção "Como Funciona"** — accordion com regras do formato
- **Times sorteados** — grid com badge do time, eficiência e nome do jogador
- **Grupos** — tabela de classificação (POS, J, V, E, D, SG, PTS) e lista de jogos
- **Botão "Sortear Times / Adicionar Jogadores"** — `ressortearCampeonato(id)`: disponível apenas antes do início
- **Botão "Reiniciar Torneio"** — `confirmarReiniciarTorneio(id)`: zera resultados mantendo times
- **Botão "Excluir Torneio"** — `excluirCampeonato(id)`: apenas antes do início

#### Registrar Partida de Torneio

- **Placar direto no card** — `salvarPartidaDireta(cid, gi, j1Id, j2Id, btnEl)`: inputs inline no card do jogo
- **Modal de placar** — `regPartida(cid, gi, j1Id, j2Id)` / `salvarPartida(cid, gi)`: modal com badges dos times

Ao registrar partida, a tabela do grupo é atualizada automaticamente (pontos, vitórias, empates, derrotas, gols pró/contra).

---

### Ranking

O sistema mantém **dois rankings independentes**:

#### Ranking de Amistosos — `calcularRankingAmistosos()`
Calcula pontuação com base em todos os amistosos finalizados:
- **3 pontos** por vitória
- **1 ponto** por empate
- **0 pontos** por derrota
- Desempate: saldo de gols → gols pró

#### Ranking de Torneios — `calcularRankingTorneios()`
Agrega estatísticas dos membros de todos os grupos de todos os campeonatos.

#### Renderização — `renderRankRow(p, i)`
Card do jogador no ranking com: posição (🥇🥈🥉), avatar, nome, V/D/E, GF/GS.

#### Histórico do Jogador — `abrirHistoricoJogador(jogadorId, nome)`
Ao clicar em um jogador no ranking, abre tela com:
- **Filtros**: tipo (Amistoso/Torneio/Clube/Seleção), adversário, ordenação, período
- **Resumo**: total de jogos, vitórias, derrotas, empates, gols
- **Lista de jogos**: cards individuais com placar, tipo, resultado e data
- **Paginação**: 100 jogos por página

---

### Times

#### Base de Dados Pré-carregada
O app inclui uma base de dados com atributos do **EA FC 25**:

- **Clubes** (`CLUBES_DEFAULT`): 35 clubes de 10 ligas (La Liga, Premier League, Bundesliga, Serie A, Ligue 1, etc.)
- **Seleções** (`SELECOES_DEFAULT`): 29 seleções nacionais
- Cada time possui: `ataque`, `meio`, `defesa` → `forca` = média dos três

#### Dados Visuais — `TEAM_DATA` / `SELECAO_PAIS`
Brasões reais via CDN `crests.football-data.org`, bandeiras via `flagcdn.com`, cores e abreviações para badges visuais.

#### Gerenciamento de Times — `renderTimesEdit()`
- **Abas**: Clubes / Seleções
- **Filtro por país** (apenas clubes)
- **Editar time** — `editarTime(id)`: alterar eficiência (Ruim/Moderado/Bom) e marcar como inativo
- **Adicionar time** — `abrirModalAddTime(tipo)`:
  - **Clube**: país + nome + brasão (upload opcional) + eficiência
  - **Seleção**: buscar país na lista FIFA + eficiência
- **Excluir time** — `excluirTime(id)`: marca como `_deleted` no Firestore (soft delete)
- **Inativar/Reativar** — `toggleInativoTime(id, novoInativo)`: times inativos não aparecem nos sorteios

---

## Controle de Acesso

### Usuário Master — `temPermissao()` / `_aplicarControleAcesso()`

O sistema identifica o jogador com flag `master: true` como administrador. Regras:

| Funcionalidade | Master | Não-Master |
|---|---|---|
| Criar jogadores/amistosos/torneios | ✅ | ❌ |
| Registrar placares | ✅ | ❌ (vê "EM ANDAMENTO") |
| Editar jogadores | ✅ | ❌ (somente leitura) |
| Excluir (swipe-to-delete) | ✅ | ❌ |
| Botão "+ CRIAR" na home | ✅ Visível | ❌ Oculto |
| Visualizar amistosos | ✅ Editar | 👁️ Somente leitura |
| Visualizar ranking | ✅ | ✅ |
| Ver home filtrada | Todos os jogos | Apenas seus jogos |

Se nenhum jogador tiver flag master, todos os usuários têm permissão total.

---

## Sistema de Sorteio Balanceado

### `sortearBalanceado(pool, historicoIds, tipo)`
Algoritmo principal para amistosos:

1. **Filtra times inativos** do pool
2. **Evita times recentes**: exclui times usados nos últimos N amistosos (metade do pool)
3. **30 tentativas** de sorteio aleatório:
   - Primeiras 15: evita pares já sorteados (memória anti-repetição no `localStorage`)
   - Primeiras 20: respeita regra de paridade de eficiência (Ruim×Ruim, Ruim×Moderado, Moderado×Moderado, Moderado×Bom, Bom×Bom)
   - Aceita se discrepância de força ≤ 50% da média
4. **Fallback**: busca exhaustiva do par com menor discrepância respeitando eficiência
5. **Registra na memória** anti-repetição (`localStorage`) os últimos 10 pares

### `distribuirTimesBalanceados(participantes, pool, usados)`
Para torneios — usa **draft serpentina**:
1. Seleciona `2×N` times aleatórios do pool
2. Ordena por força (decrescente)
3. Distribui alternadamente entre participantes embaralhados

### Filtro de Eficiência — `filtrarPoolEfic(pool)`
O usuário pode filtrar times por eficiência (Ruim, Moderado, Bom) antes do sorteio. A preferência é salva no `localStorage`.

---

## Compartilhamento via WhatsApp

### `compartilharWhatsApp(sorteio)`
Gera mensagem formatada com:
- Emoji de bandeira/logo de cada time
- Nomes dos jogadores de cada lado
- Força dos times
- Nível de equilíbrio da partida (Equilibrado / Levemente desigual / Desigual)

Abre `wa.me` com o texto pré-preenchido.

---

## Interface e UX

### Navegação
- **Menu Hamburger** — acesso a todas as telas: Home, Amistosos, Torneios, Ranking, Jogadores, Times
- **Breadcrumbs** — navegação hierárquica em todas as telas
- **Fullscreen overlay** — formulários de cadastro/edição abrem em tela cheia sobre o conteúdo

### Componentes UI
- **Modal** — `modal(html)` / `fecharModal()`: para confirmações e formulários rápidos
- **Fullscreen** — `fullscreen(title, html)` / `fecharFullscreen()`: para cadastros completos
- **Toast** — `toast(msg, tipo)`: notificações temporárias (sucesso/erro) por 3 segundos
- **Swipe-to-delete** — `initSwipe(container, tipo)`: gesto iOS-style para excluir cards no mobile
- **Accordions** — `toggleGrupo(el)`: seções colapsáveis (grupos, finalizados, "como funciona")

### Visual
- **Tema escuro** com gradientes roxo/ciano
- **Cards glassmorphism** com backdrop blur
- **Badges de times** com brasões reais e bandeiras
- **Badges de eficiência** com cores (verde=Bom, amarelo=Moderado, vermelho=Ruim)
- **Animações** de transição entre telas (`anim-up`)
- **Anti-duplo-clique** — `_lockBtn(el, ms)`: bloqueia botões por 1 segundo após clique

### PWA
- **Service Worker** (`sw.js`) com atualização a cada 12 horas
- **Manifest** (`manifest.json`) para instalação como app
- **Suporte Apple**: meta tags para web app capable, ícone e cor de status bar
