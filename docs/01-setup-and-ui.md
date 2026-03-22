# Phase 1: Initial Setup & UI Configuration

## 1. Installation of Next.js
The project is built using the Next.js App Router for modern server-rendered React applications.

To initialize the project:
```bash
npx create-next-app@latest lms --typescript --tailwind --eslint --app
```

Dependencies installed:
- `next`: ^16.2.1
- `react` & `react-dom`: ^19.2.4

## 2. Configuration of Tailwind v4 and Shadcn UI
We use Tailwind CSS v4 and `shadcn/ui` for accessible, robust, and cleanly styled components.

### Tailwind CSS v4
Tailwind v4 is configured via `@tailwindcss/postcss`. The global CSS variables and theme configurations are set up in `app/globals.css`.

### Shadcn UI
Shadcn UI was initialized using the v4 CLI:
```bash
npx shadcn@latest init
```
- `components.json` is configured to use the `radix-nova` style with CSS variables.
- The base color is set to `neutral`.
- Components are easily scaffolded into the project via:
  `npx shadcn@latest add <component>`