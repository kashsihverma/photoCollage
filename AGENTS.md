# Project Instructions

Read this file before working on any prompt in this project.

## Project Context

- This is an Astro photo collage editor for `onlinephotocollage.com`.
- The product should feel like a clean, premium, Canva-like collage editor with Vercel-style polish.
- Use `DESIGN.md` as the main design reference before making UI changes.
- Keep the interface light, neutral, modern, and product-focused. Avoid dark/orange Cloudflare-style branding unless the user explicitly asks for it.

## Required Skills And Docs

- For Astro implementation details, use the Astro skill and Astro Docs MCP server when available.
- For Tailwind CSS v4 work, use the `tailwind-4-docs` skill.
- For UI, layout, visual quality, spacing, typography, and accessibility, use the `web-design-guidelines` skill.

## Important Files

- `src/pages/index.astro` - main editor markup.
- `src/styles/global.css` - main UI styling.
- `src/scripts/collage-studio.ts` - editor behavior and interactions.
- `src/lib/collage/templates.ts` - collage templates, backgrounds, stickers, and template metadata.
- `src/lib/collage/canvas.ts` - high-resolution export rendering.

## Design Rules

- Match the rest of the website before adding new visual styles.
- Keep the top horizontal bar light and neutral unless requested otherwise.
- Prefer compact, polished product UI over landing-page style sections.
- Buttons should be rounded rectangles with smooth edges, not overly large pills, where the UI is tool-like.
- Keep layouts responsive for desktop, tablet, and mobile.
- Do not add duplicate controls or unused sidebar items.
- Do not copy competitor UI exactly; use references only for ideas.

## Engineering Rules

- Keep code reusable and scalable so more templates and assets can be added later.
- Preserve existing features unless the user asks to remove them.
- Use `apply_patch` for manual file edits.
- Do not revert user changes.
- Avoid unrelated refactors.

## Verification

After UI or behavior changes, run:

```bash
npm run check
npm run build
```

For visible UI changes, also inspect the page in desktop and mobile viewports before finishing.
