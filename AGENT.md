# AGENT.md - Loop Agent Development Guide

## Commands
- **Development**: `npm run dev` (starts dev server on localhost:3000)
- **Build**: `npm run build` 
- **Lint**: `npm run lint`
- **Type Check**: `npx tsc --noEmit`

## Architecture
- **Framework**: Next.js 15 with TypeScript, App Router
- **UI**: React 19, Tailwind CSS, shadcn/ui components, Lucide icons
- **AI**: Anthropic Claude SDK for tool-calling agent
- **Structure**: 
  - `src/app/` - Next.js app router pages
  - `src/components/` - React components (UI components in `ui/`)
  - `src/lib/` - Utilities and tools for AI agent
  - `src/hooks/` - Custom React hooks

## Code Style
- **Imports**: Use `@/` alias for all internal imports
- **Components**: Function components with TypeScript, prefer named exports
- **Styling**: Tailwind CSS with `cn()` utility for conditional classes
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Types**: Explicit TypeScript types, interfaces in `src/lib/types.ts`
- **Files**: kebab-case for component files, camelCase for utilities
- **Client/Server**: Mark client components with `'use client'` directive
