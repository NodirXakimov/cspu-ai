# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (proxies `/api` to the ngrok backend in `vite.config.ts`)
- `npm run build` — type-check with `vue-tsc -b`, build with Vite, then copy `dist/index.html` to `dist/404.html` (SPA fallback for GitHub Pages)
- `npm run preview` — preview the production build locally

There is no test runner and no lint script configured.

## Deployment

`.github/workflows` deploys `dist/` to GitHub Pages on every push to `main`. `vite.config.ts` sets `base: '/cspu-ai/'`, so all asset paths assume that subpath. The `404.html` copy is what makes client-side routes resolve on GitHub Pages refreshes.

## Architecture

Vue 3 + TypeScript + Vite 8 + Tailwind v4. UI is in **Uzbek** — preserve Uzbek strings when editing user-visible text. Shadcn-Vue (style `reka-nova`) on top of Reka UI headless primitives; component aliases live in `components.json` (`@/components`, `@/lib/utils`, etc.).

### State and data flow

`src/composables/useChats.ts` is the single source of truth for chat state. It uses **module-level refs** (not per-instance state) so every component that calls `useChats()` sees the same `chats`, `activeChatId`, `isStreaming`, etc. `activeChatId` is persisted with `useLocalStorage`; chat content itself is fetched from the backend.

`src/lib/api.ts` wraps all backend calls. `API_BASE` is `'/api'` in dev (proxied by Vite) and a hardcoded production ngrok URL otherwise — **this URL must be updated when the ngrok tunnel rotates**, both in `src/lib/api.ts` (`PROD_API`) and in `vite.config.ts` (`server.proxy['/api'].target`). All requests send `ngrok-skip-browser-warning: 'true'`.

Backend endpoints used:
- `GET /sessions`, `GET /sessions/:id`, `POST /sessions`, `DELETE /sessions/:id`
- `POST /ask/stream` — SSE stream, response lines are `data: {"content": "..."}`
- `POST /ask-voice` — multipart audio upload, returns `{ question, answer }`

### Routing

`src/router.ts` uses `createWebHistory(import.meta.env.BASE_URL)` so routes are scoped under `/cspu-ai/`. Two routes: `/` (ChatPage) and `/late-teachers` (LateTeachersPage). Unknown paths redirect to `/`.

### Component layout

- `App.vue` — root shell (sidebar + active page)
- `pages/ChatPage.vue` — chat UI; composes `ChatSidebar` + `ChatView`
- `components/ChatView.vue` — message list + `PromptInput`
- `components/MessageItem.vue` — single message with attachments and copy action
- `components/ai-elements/` — chat-specific primitives (`conversation`, `message`, `prompt-input`, `shimmer`, `suggestion`)
- `components/ui/` — generic shadcn-vue components

### Notable libraries

- `vue-stream-markdown` renders streaming assistant output
- `vue-stick-to-bottom` auto-scrolls the conversation
- `@vueuse/core` (`useLocalStorage`) for persistence
- `motion-v` for animations, `lucide-vue-next` for icons
- The `ai` package is used only for the `FileUIPart` type, not the full Vercel AI SDK
