# Second Brain

A personal knowledge base web app that turns 150+ books into a connected, reviewable knowledge graph. Built with Next.js, powered by Obsidian + Claude Code.

**Live:** [second-brain.heqinghuang.com](https://second-brain.heqinghuang.com)

## How it works

```
Kindle / Articles / Podcasts
        |
        v
  Obsidian Vault (iCloud)        Claude Code extracts atomic ideas
  10 Notes/  (raw sources)  ---> 20 Ideas/  (one idea per file)
  00 Meta/   (schema + log)      30 Concept/ (cross-source wiki)
        |                               |
        v                               v
     GitHub (private repo)        secondbrain.heqinghuang.com
        ^                          /            \
        |                      PUBLIC        PRIVATE
        +--- review decisions   Graph +      Review queue
             committed back     Feed         on Kindle
```

1. **Read** a book, article, or podcast. Highlights land in `10 Notes/`.
2. **Extract** atomic ideas using Claude Code. Each idea is one file in `20 Ideas/`.
3. **Synthesize** cross-source concepts in `30 Concept/`. Ideas from multiple sources connect.
4. **Review** on your Kindle or phone. Approve or contest each AI-extracted idea.
5. **Publish** approved content to the public knowledge graph.

The vault syncs to GitHub automatically. The web app reads from GitHub via API. Review decisions commit back. The loop closes.

## Architecture

| Layer | What | Where |
|-------|------|-------|
| Source of truth | Obsidian vault in iCloud | `~/Documents/Obsidian Vault/` |
| Git database | Separated from iCloud to prevent corruption | `~/media/second-brain/.git` |
| Sync | Auto-push to GitHub (hourly cron) | `sync.sh` |
| Web app | Next.js 15 on Vercel | This repo |
| Data | GitHub REST API (read vault, write reviews) | `src/lib/github.ts` |
| Auth | PIN with bcrypt + HMAC sessions | `src/lib/auth.ts` |

## Pages

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Landing page with knowledge graph, pipeline diagram, activity feed |
| `/concepts/[slug]` | Public | Rendered concept page with wikilinks |
| `/ideas/[slug]` | Public | Rendered idea page with source highlight |
| `/login` | Public | PIN entry (static, instant load) |
| `/review` | Private | Review queue dashboard |
| `/review/card` | Private | Card-based Kindle-friendly review |
| `/api/revalidate` | Webhook | ISR revalidation on vault push |

## Design

Follows the [Ink & Parchment](https://heqinghuang.com) design system:

- **Fonts:** Cormorant Garamond (headings) + Crimson Pro (body)
- **Palette:** Warm earth tones, `#b8845a` accent
- **Dark mode:** Automatic via `prefers-color-scheme`
- **Kindle-optimized:** 52px+ touch targets, no canvas on review pages, single-column layout

## Setup

### 1. Clone and install

```bash
git clone https://github.com/h3qing/second-brain.git
cd second-brain
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Your GitHub personal access token (needs repo scope for private vaults)
GITHUB_TOKEN=ghp_...

# Your vault repo
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=your-vault-repo

# Generate: node -e "require('bcryptjs').hash('your-pin', 10).then(console.log)"
AUTH_PIN_HASH=$2b$10$...

# Any random string for webhook security
REVALIDATE_SECRET=your-secret
```

### 3. Run

```bash
npm run dev
```

### 4. Deploy

Push to GitHub, connect to Vercel, add env vars, done.

## Vault schema

The app expects an Obsidian vault following the [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f):

```
00 Meta/           Schema, log, index, review queue
10 Notes/          Raw sources (Kindle highlights, articles, podcasts)
20 Ideas/          Atomic ideas extracted per source
30 Concept/        Cross-source concept synthesis
40 Write/          Human writing and publishing
CLAUDE.md          Schema definition for Claude Code
```

Each idea file has frontmatter with `review_status: unreviewed | reviewed | contested`. The web app filters by this field.

## Inspired by

- [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) for the vault pattern
- [Obsidian](https://obsidian.md) for local-first knowledge management
- [Claude Code](https://claude.ai) for AI-assisted extraction and synthesis

## License

MIT
