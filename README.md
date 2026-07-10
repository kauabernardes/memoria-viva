# Memória Viva

MVP mobile-first para registrar, localizar e preservar memórias, patrimônios e territórios culturais. A SPA foi desenhada para navegador móvel e para o componente WebViewer do MIT App Inventor.

## Executar localmente

Requisitos: Node.js 20.19+ e npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Sem preencher o `.env.local`, a aplicação entra automaticamente em **Modo demonstração**. Nesse modo, use qualquer e-mail válido e senha com pelo menos 6 caracteres.

Comandos de qualidade:

```bash
npm run lint
npm run build
npm run preview
```

## Supabase

1. Crie ou abra um projeto Supabase.
2. Para um projeto novo, execute [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor. O arquivo corresponde ao schema adotado pelo projeto e habilita RLS.
3. Em **Authentication > URL Configuration**, configure a URL do site e as URLs de redirecionamento do ambiente publicado.
4. Copie `.env.example` para `.env.local` e informe apenas:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

Nunca use `service_role` no frontend. Após mudar variáveis de ambiente, reinicie o Vite. O cadastro envia `username` e `description` como metadados; o trigger cria o perfil associado. Login, logout e sessão persistida usam Supabase Auth quando essas variáveis existem.

## Rotas

- `/` — abertura institucional
- `/login` e `/cadastro` — autenticação
- `/mapa` — filtros, OpenStreetMap, marcadores e lugares próximos
- `/registros` — pesquisa, destaque, criadores e arquivo de histórias
- `/historias/:id` — detalhe, narração visual e favorito
- `/novo-registro` — formulário de criação
- `/menu` — conta e opções
- `/perfil` — perfil do usuário autenticado, edição e criações
- `/perfis/:id` — perfil público e criações de outra pessoa
- `/favoritos` — arquivo de histórias favoritas

## Deploy

Gere a pasta estática com `npm run build`. Publique o conteúdo de `dist/` em um host HTTPS.

- **Netlify:** `public/_redirects` já gera o fallback `/* /index.html 200`.
- **Vercel:** `vercel.json` já reescreve as rotas para `index.html`.
- **Outro host:** configure toda rota desconhecida para servir `/index.html` com status 200. Isso é obrigatório para recarregar `/mapa` ou `/historias/:id` sem 404.

Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` às variáveis do provedor antes do build. Não publique `.env.local`.

## MIT App Inventor WebViewer

1. Faça deploy em HTTPS e copie a URL pública.
2. Adicione um `WebViewer` à tela e defina `HomeUrl` para essa URL.
3. Ative JavaScript e mantenha `FollowLinks` dentro do WebViewer.
4. Use o evento `WebViewStringChange` para ouvir:
   - `LOGIN_SUCCESS`
   - `OPEN_MEMORY:<id>`
   - `NEW_MEMORY_CREATED`
5. No botão Voltar do Android, chame `WebViewer.GoBack` quando houver histórico; caso contrário, volte para a tela principal do app.

A integração `window.AppInventor?.setWebViewString(...)` é opcional e protegida: em um navegador comum, a aplicação funciona normalmente.

## Implementado

- Interface responsiva escura, otimizada para 360×800 e toque.
- Navegação SPA com rotas carregadas sob demanda e fallback de rota.
- Login, cadastro, logout e persistência de sessão.
- Modo demonstração automático, com sessão, favoritos e novos registros no `localStorage`.
- Mapa React Leaflet/OpenStreetMap, filtros, busca, marcadores por categoria e detalhe clicável.
- Pesquisa de histórias, destaque selecionável, criadores e cartões.
- Detalhe com imagem resiliente, autor, categorias, favorito, texto e player visual.
- Detalhe com mapa da localização, comunidade e acesso ao perfil da autoria.
- Novo registro com validação, URL ou upload de imagem e seleção da localização diretamente no mapa.
- Perfis próprios e públicos, edição de nome/descrição/foto, estatísticas e lista de criações.
- Página de favoritos integrada ao Supabase e ao modo demonstração.
- Estados de carregamento, erro, vazio, imagem quebrada e ErrorBoundary.
- Labels, foco visível, texto alternativo e navegação por teclado.
- Serviços tipados para Supabase e RLS no SQL.

## Simulado no MVP

- A narração de áudio é visual; o botão anima o progresso, mas não toca arquivo.
- Geolocalização pode marcar o ponto no formulário; ainda não recalcula distâncias da listagem.
- Distâncias, coordenadas, autores e narrativas dos mocks são demonstrativos.
- “Privacidade e segurança”, “Preferências” e “Autoria das imagens” mostram feedback interno, sem telas próprias.
- Imagens de demonstração usam URLs públicas; há fallback quando a rede ou a origem falha.
- Upload no modo Supabase envia a imagem como data URL no campo `image_url`; em produção, prefira Supabase Storage.

## Teste manual

1. Abra `/` em viewport 360×800 e confirme ausência de rolagem horizontal.
2. Clique em **Acessar**, tente e-mail inválido e senha curta, depois faça login válido.
3. Recarregue `/mapa`; confirme sessão, mapa, tiles, filtros, busca e marcadores.
4. Negue a geolocalização e confirme que mapa/lista continuam funcionando.
5. Abra um marcador e uma memória; teste voltar, favorito e player visual.
6. Em `/registros`, pesquise, altere o destaque e abra um cartão.
7. Crie um registro com campos inválidos; depois preencha tudo e publique.
8. Recarregue o novo detalhe no modo demonstração e confirme a persistência local.
9. Saia pelo menu e confirme o retorno ao login.
10. Com Supabase configurado, repita cadastro, login, criação e favorito verificando as tabelas e políticas RLS.

## Estrutura principal

```text
src/
  components/  componentes compartilhados, mapa e navegação
  contexts/    provedor de autenticação
  data/        seis memórias demonstrativas
  hooks/       acesso à sessão e aos dados
  pages/       telas por rota
  services/    cliente Supabase e repositório com fallback
  types/       tipos de domínio
  utils/       ponte opcional do App Inventor
supabase/
  schema.sql
```
