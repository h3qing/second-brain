# Building a Second Brain

A system for turning what I read into what I think -- and eventually, what I write.

I read books, listen to podcasts, and collect articles. An AI pipeline extracts atomic ideas from each source, synthesizes them into cross-source concepts, and surfaces them for spaced repetition review. I review everything, edit what matters, and write from the compounded knowledge.

**Live:** [secondbrain.heqinghuang.com](https://secondbrain.heqinghuang.com)

## The Pipeline

```
 Read              Extract            Synthesize          Write
 ----              -------            ----------          -----
 Kindle books  -->  Atomic        -->  Concept       -->  Published
 Podcasts           ideas              pages               essays
 Articles           (AI-generated)     (cross-source)     (human voice)
```

**Sources go in. Ideas come out. Concepts compound. Writing happens.**

Every idea links back to its source. Every concept pulls from multiple sources. The graph grows denser with each book I read.

## How It Works

### 1. Capture
Raw sources land in an Obsidian vault and are never modified. Kindle highlights sync automatically. Podcast transcripts are pulled via yt-dlp. Articles are fetched as markdown.

### 2. Extract
An LLM reads each source and pulls 3-10 atomic ideas -- one idea per file, with a direct quote or timestamp linking back to the original.

### 3. Review
I review every AI-generated idea before it counts. Approve, contest, or edit. Approved ideas enter a spaced repetition cycle (Leitner system: Easy 3x / Medium 2x / Hard 1x interval scaling, capped at 180 days). Nothing gets marked "reviewed" without me reading it.

### 4. Synthesize
Concepts are lean hub nodes -- a one-sentence definition, tensions between sources, and links to related concepts. A concept like "decision" pulls from 7 different books and podcasts.

### 5. Write
Original essays are written in my voice, informed by the concept graph but never generated from it. Published at [heqinghuang.com](https://heqinghuang.com).

## What's Extracted So Far

**Books:** Atomic Habits, Never Split the Difference, Getting Things Done, Good Strategy Bad Strategy, The Psychology of Money, Skin in the Game, Essentialism, Four Thousand Weeks, Who Really Matters, Cheatsheet for Life, Who - A Method for Hiring, The Cold Start Problem

**Podcasts (3):** Jensen Huang on Dwarkesh Patel, Ferrari on Acquired, on Xiaoyuzhou FM

**Concepts (50):** decision, strategy, clarity, focus, habits, identity, trust, negotiation, leadership, productivity, scarcity, brand, grief, happiness, growth, relationships, and 34 more

## Key Design Decisions

- **AI extracts, human reviews.** Every idea starts as `unreviewed`. The human is the bottleneck on purpose -- internalization requires friction.
- **Atomic ideas, not summaries.** Each idea file is one insight, not a book summary. This makes cross-source synthesis possible.
- **Concepts are hub nodes, not content pages.** Backlinks do the heavy lifting. Concept pages stay under 20 lines.
- **Sources are immutable.** Raw notes are never modified after capture. The extracted layer is where interpretation lives.
- **Spaced repetition for retention.** Reviewed ideas resurface on a schedule so knowledge compounds instead of fading.

## Architecture

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

| Layer | What | Tech |
|-------|------|------|
| Source of truth | Obsidian vault in iCloud | Markdown + YAML frontmatter |
| AI pipeline | Extraction, synthesis, spaced repetition | Claude Code |
| Sync | Auto-push to GitHub (hourly cron) | Git + cron |
| Web app | Public graph + private review | Next.js 15, Vercel |
| Data | Read vault, write review decisions | GitHub REST API |
| Auth | PIN-protected review pages | bcrypt + HMAC sessions |

## Pages

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Knowledge graph, pipeline diagram, activity feed |
| `/concepts/[slug]` | Public | Rendered concept page with wikilinks |
| `/ideas/[slug]` | Public | Rendered idea page with source context |
| `/review` | Private | Review queue dashboard |
| `/review/card` | Private | Card-based Kindle-friendly review |

## Setup (for forking)

### 1. Clone and install

```bash
git clone https://github.com/h3qing/building-a-second-brain.git
cd building-a-second-brain
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

```bash
GITHUB_TOKEN=ghp_...              # needs repo scope for private vaults
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=your-vault-repo
AUTH_PIN_HASH=$2b$10$...           # node -e "require('bcryptjs').hash('your-pin', 10).then(console.log)"
REVALIDATE_SECRET=your-secret
```

### 3. Run

```bash
npm run dev
```

### 4. Deploy

Push to GitHub, connect to Vercel, add env vars, done.

## Vault Schema

The app expects an Obsidian vault following the [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f):

```
00 Meta/           Schema, log, index, review queue
10 Notes/          Raw sources (immutable)
20 Ideas/          Atomic ideas (AI-generated, human-reviewed)
30 Concept/        Cross-source synthesis (lean hub nodes)
40 Write/          Human writing and publishing
```

Ideas have frontmatter with `review_status: unreviewed | reviewed | contested` and spaced repetition fields (`review_count`, `review_interval`, `next_review_date`, `difficulty`).

## Inspired By

- [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) for the vault pattern
- [Zettelkasten method](https://zettelkasten.de/introduction/) for atomic notes and cross-linking
- [Leitner system](https://en.wikipedia.org/wiki/Leitner_system) for spaced repetition
- [Obsidian](https://obsidian.md) for local-first knowledge management
- [Claude Code](https://claude.ai/claude-code) for AI-assisted extraction and synthesis

## License

MIT
