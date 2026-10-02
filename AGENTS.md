<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Website workflow: Opus design, Sol implementation, OpenAI images

- Claude Opus 5.5 owns website visual design: art direction, layouts, typography, color, spacing, responsive behavior, animations, and polished frontend presentation. Opus may implement the visual frontend to preserve design quality.
- GPT-6.1 Sol is the workhorse for supporting implementation, integrations, backend logic, routine fixes, tests, and verification. Preserve the design choices established by Opus.
- Generate and edit photos, illustrations, and other raster assets with OpenAI image generation through ChatGPT/Codex when available. Claude should write the asset brief and hand it off; do not substitute HTML/SVG drawings for requested generated photography or illustrations. If image generation is unavailable in Conductor, use ChatGPT/Codex separately and import the resulting assets. Use subscription logins; do not introduce API billing without the user's instruction.
- Before a handoff, update HANDOFF.md with the goal, design decisions, relevant files, asset briefs or paths, completed checks, unresolved issues, and the next action. Both agents read it before continuing.
- Do not assume selecting a model automatically launches the other agent. Use a separate chat in the same workspace for handoffs; only one agent edits shared files at a time. Use separate workspaces for independent parallel tasks.
- Opus reviews the finished visual result; Sol applies scoped supporting fixes and verifies the site. Do not redesign the interface during routine implementation unless requested.
