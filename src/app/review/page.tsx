import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/auth";
import { listFiles, getFileContent } from "@/lib/github";
import { parseFrontmatter, extractTitle } from "@/lib/parser";

interface QueueItem {
  path: string;
  title: string;
  source: string;
  status: string;
  folder: string;
}

async function getReviewItems(): Promise<{
  unreviewed: QueueItem[];
  contested: QueueItem[];
  reviewed: QueueItem[];
}> {
  const dirs = ["20 Ideas", "30 Concept"];
  const allPaths: string[] = [];

  for (const dir of dirs) {
    const paths = await listFiles(dir);
    allPaths.push(...paths);
  }

  const items: QueueItem[] = [];

  for (const path of allPaths) {
    const file = await getFileContent(path);
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
    });
  }

  return {
    unreviewed: items.filter((i) => i.status === "unreviewed"),
    contested: items.filter((i) => i.status === "contested"),
    reviewed: items.filter((i) => i.status === "reviewed"),
  };
}

function buildCardUrl(items: QueueItem[], index: number, total: number): string {
  const item = items[index];
  const params = new URLSearchParams();
  params.set("path", item.path);
  if (index > 0) params.set("prev", items[index - 1].path);
  if (index < items.length - 1) params.set("next", items[index + 1].path);
  params.set("pos", `${index + 1} of ${total}`);
  return `/review/card?${params.toString()}`;
}

function ItemRow({ item, index, items }: { item: QueueItem; index: number; items: QueueItem[] }) {
  const href = buildCardUrl(items, index, items.length);
  return (
    <Link
      href={href}
      className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 py-3 border-b border-border hover:bg-card px-2 -mx-2 rounded transition-colors"
    >
      <span className="text-sm text-muted tabular-nums w-8 shrink-0">
        {index + 1}
      </span>
      <span className="flex-1 font-medium tracking-tight">{item.title}</span>
      <span className="text-sm text-muted">{item.folder}</span>
      {item.source && (
        <span className="text-xs text-muted truncate max-w-[200px]">
          {item.source}
        </span>
      )}
    </Link>
  );
}

export default async function ReviewQueue() {
  const isLoggedIn = await verifySession();
  if (!isLoggedIn) redirect("/login");

  const { unreviewed, contested, reviewed } = await getReviewItems();
  const firstUnreviewed = unreviewed[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading tracking-tight">Review Queue</h1>
        {unreviewed.length > 0 && (
          <Link
            href={buildCardUrl(unreviewed, 0, unreviewed.length)}
            className="btn bg-foreground text-background border-foreground text-sm"
          >
            Start Reviewing
          </Link>
        )}
      </div>

      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-2xl font-heading">{unreviewed.length}</span>
          <span className="text-muted ml-1">unreviewed</span>
        </div>
        <div>
          <span className="text-2xl font-heading">{contested.length}</span>
          <span className="text-muted ml-1">contested</span>
        </div>
        <div>
          <span className="text-2xl font-heading">{reviewed.length}</span>
          <span className="text-muted ml-1">reviewed</span>
        </div>
      </div>

      {unreviewed.length > 0 && (
        <div>
          <h2 className="label text-accent mb-3">
            Needs Review ({unreviewed.length})
          </h2>
          <div>
            {unreviewed.map((item, i) => (
              <ItemRow key={item.path} item={item} index={i} items={unreviewed} />
            ))}
          </div>
        </div>
      )}

      {contested.length > 0 && (
        <div>
          <h2 className="label text-danger mb-3">
            Contested ({contested.length})
          </h2>
          <div>
            {contested.map((item, i) => (
              <ItemRow key={item.path} item={item} index={i} items={contested} />
            ))}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <h2 className="label text-muted mb-3">
            Reviewed ({reviewed.length})
          </h2>
          <div>
            {reviewed.slice(0, 10).map((item, i) => (
              <ItemRow key={item.path} item={item} index={i} items={reviewed.slice(0, 10)} />
            ))}
          </div>
        </div>
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
