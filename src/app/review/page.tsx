import Link from "next/link";
import { verifySession } from "@/lib/auth";
import { listFiles, getFilesContent } from "@/lib/github";
import { parseFrontmatter, extractTitle } from "@/lib/parser";
import { ReviewStats } from "@/app/components/ReviewStats";

interface QueueItem {
  path: string;
  title: string;
  source: string;
  status: string;
  folder: string;
  nextReviewDate?: string;
  reviewCount?: number;
}

async function getReviewItems(): Promise<{
  unreviewed: QueueItem[];
  contested: QueueItem[];
  reviewed: QueueItem[];
  dueForReview: QueueItem[];
}> {
  // List files from tree (1 API call)
  const [ideaPaths, conceptPaths] = await Promise.all([
    listFiles("20 Ideas"),
    listFiles("30 Concept"),
  ]);
  const allPaths = [...ideaPaths, ...conceptPaths];

  // Fetch all content in parallel
  const files = await getFilesContent(allPaths);

  const items: QueueItem[] = [];

  for (const path of allPaths) {
    const file = files.get(path);
    if (!file) continue;

    const { frontmatter, content } = parseFrontmatter(file.content);
    if (!frontmatter.review_status) continue;

    const folder = path.startsWith("20 Ideas") ? "Ideas" : "Concepts";
    const source =
      typeof frontmatter.source === "string"
        ? frontmatter.source.replace(/\[\[|\]\]/g, "").split("/").pop() || ""
        : "";

    items.push({
      path,
      title: extractTitle(content, path),
      source,
      status: frontmatter.review_status as string,
      folder,
      nextReviewDate: frontmatter.next_review_date as string | undefined,
      reviewCount: frontmatter.review_count as number | undefined,
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const reviewed = items.filter((i) => i.status === "reviewed");
  const dueForReview = reviewed.filter(
    (i) => i.nextReviewDate && i.nextReviewDate <= today
  );

  return {
    unreviewed: items.filter((i) => i.status === "unreviewed"),
    contested: items.filter((i) => i.status === "contested"),
    reviewed,
    dueForReview,
  };
}

function buildCardUrl(
  items: QueueItem[],
  index: number,
  total: number,
  mode?: string
): string {
  const item = items[index];
  const params = new URLSearchParams();
  params.set("path", item.path);
  if (index > 0) params.set("prev", items[index - 1].path);
  if (index < items.length - 1) params.set("next", items[index + 1].path);
  params.set("pos", `${index + 1} of ${total}`);
  if (mode) params.set("mode", mode);
  return `/review/card?${params.toString()}`;
}

function ItemRow({
  item,
  index,
  items,
  mode,
}: {
  item: QueueItem;
  index: number;
  items: QueueItem[];
  mode?: string;
}) {
  const href = buildCardUrl(items, index, items.length, mode);
  return (
    <Link
      href={href}
      className="block py-4 border-b border-border hover:bg-card px-2 -mx-2 rounded transition-colors"
    >
      <div className="flex items-baseline">
        <span className="text-sm text-muted tabular-nums w-8 shrink-0 font-mono">
          {index + 1}.
        </span>
        <span className="flex-1 font-medium tracking-tight text-base leading-snug">
          {item.title}
        </span>
      </div>
      <div className="mt-1 pl-8 text-xs text-muted">
        <span>{item.folder}</span>
        {item.source && (
          <>
            <span className="mx-1.5">&middot;</span>
            <span>{item.source}</span>
          </>
        )}
      </div>
    </Link>
  );
}

function Stat({ count, label }: { count: number; label: string }) {
  return (
    <div className="inline-block" style={{ marginRight: "2rem", marginBottom: "0.5rem" }}>
      <div className="text-3xl font-heading leading-none">{count}</div>
      <div className="label mt-1.5">{label}</div>
    </div>
  );
}

function Section({
  title,
  count,
  items,
  mode,
  tone,
}: {
  title: string;
  count: number;
  items: QueueItem[];
  mode?: string;
  tone?: "accent" | "danger" | "muted";
}) {
  const toneStyle =
    tone === "danger"
      ? { color: "var(--danger)" }
      : tone === "muted"
      ? { color: "var(--ink-muted)" }
      : { color: "var(--ink-accent)" };
  return (
    <section>
      <h2 className="label mb-3" style={toneStyle}>
        {title} ({count})
      </h2>
      <div>
        {items.map((item, i) => (
          <ItemRow
            key={item.path}
            item={item}
            index={i}
            items={items}
            mode={mode}
          />
        ))}
      </div>
    </section>
  );
}

export default async function ReviewQueue() {
  const isLoggedIn = await verifySession();

  const { unreviewed, contested, reviewed, dueForReview } =
    await getReviewItems();

  const startHref = isLoggedIn
    ? unreviewed.length > 0
      ? buildCardUrl(unreviewed, 0, unreviewed.length)
      : null
    : "/login";
  const startCta = isLoggedIn ? "Start Reviewing" : "Sign in to review";

  return (
    <div className="space-y-10">
      <header className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-heading tracking-tight">
            Review Queue
          </h1>
          {startHref && (
            <Link
              href={startHref}
              className="btn bg-foreground text-background border-foreground text-sm whitespace-nowrap"
              style={{ marginLeft: "1rem" }}
            >
              {startCta}
            </Link>
          )}
        </div>

        {!isLoggedIn && (
          <p className="text-sm text-muted">
            Browsing as a guest. Queue is read-only — sign in to approve or contest items.
          </p>
        )}

        <div className="flex flex-wrap">
          <Stat count={unreviewed.length} label="unreviewed" />
          {dueForReview.length > 0 && (
            <Stat count={dueForReview.length} label="due again" />
          )}
          <Stat count={contested.length} label="contested" />
          <Stat count={reviewed.length} label="reviewed" />
        </div>
      </header>

      {isLoggedIn && <ReviewStats />}

      {unreviewed.length > 0 && (
        <Section
          title="Needs Review"
          count={unreviewed.length}
          items={unreviewed}
          tone="accent"
        />
      )}

      {dueForReview.length > 0 && (
        <Section
          title="Review Again"
          count={dueForReview.length}
          items={dueForReview}
          mode="rereview"
          tone="accent"
        />
      )}

      {contested.length > 0 && (
        <Section
          title="Contested"
          count={contested.length}
          items={contested}
          tone="danger"
        />
      )}

      {reviewed.length > 0 && (
        <Section
          title="Reviewed"
          count={reviewed.length}
          items={reviewed.slice(0, 10)}
          tone="muted"
        />
      )}

      {unreviewed.length === 0 && contested.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-lg mb-2">All caught up.</p>
          <p className="text-sm">
            Nothing to review. Ingest more sources in Claude Code.
          </p>
        </div>
      )}
    </div>
  );
}
