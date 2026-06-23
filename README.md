# TeamOS

Team management web app built with [OpenCode](https://opencode.ai) and [DeepSeek V4 Flash Free](https://deepseek.com).

## Stack

| Layer      | Tech |
|------------|------|
| Frontend   | React 19, Vite, TanStack Router, TanStack Query |
| Backend    | Hono (Cloudflare Workers) |
| UI         | shadcn/ui (base-ui), Tailwind CSS v4 |
| Icons      | lucide-react |
| Deploy     | Cloudflare Workers |

## Scripts

```bash
pnpm dev       # Start dev server
pnpm build     # Typecheck + build
pnpm deploy    # Deploy to Cloudflare Workers
pnpm lint      # Run ESLint
```

## Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/login` | Login |
| `/signup` | Sign up |
| `/about` | About |
