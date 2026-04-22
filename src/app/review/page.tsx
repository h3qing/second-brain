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

interface SourceGroup {
  source: string;
  type: "book" | "podcast" | "concept";
  items: QueueItem[];
}

async function getReviewItems(): Promise<{
  unreviewed: QueueItem[];
  contested: QueueItem[];
  reviewed: QueueItem[];
  dueForReview: QueueItem[];
}> {
  const [ideaPaths, conceptPaths] = await Promise.all([
    listFiles("20 Ideas"),
    listFiles("30 Concept"),
  ]);
  const allPaths = [...ideaPaths, ...conceptPaths];

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

function groupBySource(items: QueueItem[]): SourceGroup[] {
  const groups = new Map<string, SourceGroup>();

  for (const item of items) {
    const key = item.source || "Concepts";
    const type: SourceGroup["type"] =
      item.folder === "Concepts"
        ? "concept"
        : item.path.includes("Podcasts/")
          ? "podcast"
          : "book";

    if (!groups.has(key)) {
      groups.set(key, { source: key, type, items: [] });
    }
    groups.get(key)!.items.push(item);
  }

  return [...groups.values()].sort((a, b) => {
    if (a.type === "concept") return 1;
    if (b.type === "concept") return -1;
    if (a.type === "podcast" && b.type !== "podcast") return -1;
    if (a.type !== "podcast" && b.type === "podcast") return 1;
    return b.items.length - a.items.length;
  });
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

function Stat({ count, label }: { count: number; label: string }) {
  return (
    <div className="inline-block" style={{ marginRight: "2rem", marginBottom: "0.5rem" }}>
      <div className="text-3xl font-heading leading-none">{count}</div>
      <div className="label mt-1.5">{label}</div>
    </div>
  );
}

const SOURCE_ICONS: Record<string, string> = {
  podcast: "\uD83C\uDF99",
  book: "\uD83D\uDCD6",
  concept: "\uD83D\uDCDD",
};

function CardSection({
  title,
  groups,
  allItems,
  mode,
  tone,
}: {
  title: string;
  groups: SourceGroup[];
  allItems: QueueItem[];
  mode?: string;
  tone?: "accent" | "danger" | "muted";
}) {
  const totalCount = groups.reduce((sum, g) => sum + g.items.length, 0);
  const toneStyle =
    tone === "danger"
      ? { color: "var(--danger)" }
      : tone === "muted"
        ? { color: "var(--ink-muted)" }
        : { color: "var(--ink-accent)" };

  return (
    <section>
      <h2 className="label mb-4" style={toneStyle}>
        {title} ({totalCount})
      </h2>
      <div className="rq-breakout">
        <div className="rq-inner">
          {groups.map((group) => (
            <div key={group.source} className="rq-source-group">
              <div className="rq-source-header">
                <span>{SOURCE_ICONS[group.type] || "\uD83D\uDCD6"}</span>
                <span className="rq-source-name">{group.source}</span>
                <span className="rq-source-count">{group.items.length}</span>
              </div>
              <div className="rq-card-grid">
                {group.items.map((item) => {
                  const globalIndex = allItems.indexOf(item);
                  const href = buildCardUrl(
                    allItems,
                    globalIndex,
                    allItems.length,
                    mode
                  );
                  return (
                    <Link
                      key={item.path}
                      href={href}
                      className={`rq-card rq-card-${group.type}`}
                    >
                      <span className="rq-card-title">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
        <CardSection
          title="Needs Review"
          groups={groupBySource(unreviewed)}
          allItems={unreviewed}
          tone="accent"
        />
      )}

      {dueForReview.length > 0 && (
        <CardSection
          title="Review Again"
          groups={groupBySource(dueForReview)}
          allItems={dueForReview}
          mode="rereview"
          tone="accent"
        />
      )}

      {contested.length > 0 && (
        <CardSection
          title="Contested"
          groups={groupBySource(contested)}
          allItems={contested}
          tone="danger"
        />
      )}

      {reviewed.length > 0 && (
        <CardSection
          title="Reviewed"
          groups={groupBySource(reviewed)}
          allItems={reviewed}
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
