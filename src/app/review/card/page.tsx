import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/auth";
import { getFileContent } from "@/lib/github";
import { parseReviewItem } from "@/lib/parser";
import { reviewAction } from "@/app/review/action";

export default async function CardReview({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; next?: string; prev?: string; pos?: string }>;
}) {
  const isLoggedIn = await verifySession();
  if (!isLoggedIn) redirect("/login");

  const params = await searchParams;
  const currentPath = params.path;

  if (!currentPath) redirect("/review");

  const file = await getFileContent(currentPath);
  if (!file) redirect("/review");

  const item = await parseReviewItem(currentPath, file.sha, file.content);

  // Navigation comes from query params (set by the review queue page)
  const nextPath = params.next || null;
  const prevPath = params.prev || null;
  const position = params.pos || "";

  const nextForAction = nextPath
    ? `/review/card?path=${encodeURIComponent(nextPath)}`
    : "/review";

  const pathParts = currentPath.split("/");
  const folder =
    pathParts.length >= 3 ? pathParts.slice(0, -1).join(" / ") : pathParts[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/review"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          &larr; Queue
        </Link>
        {position && (
          <span className="text-sm text-muted tabular-nums font-mono">
            {position}
          </span>
        )}
      </div>

      {/* Card */}
      <div className="border border-border rounded-lg p-6 space-y-5">
        <div className="text-xs text-muted tracking-wide">{folder}</div>

        <h1 className="text-2xl font-heading tracking-tight leading-tight">
          {item.title}
        </h1>

        {/* Original Highlights — first, so you read the source before the insight */}
        {item.sourceHighlights.length > 0 && (
          <div className="space-y-3">
            <h2 className="label">Original Highlight</h2>
            {item.sourceHighlights.map((h, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-accent pl-4 py-2"
                style={{ background: "var(--highlight)" }}
              >
                <p className="text-sm italic leading-relaxed">{h.text}</p>
                {h.location && (
                  <p className="text-xs text-muted mt-1 font-mono">
                    {h.location}
                  </p>
                )}
              </blockquote>
            ))}
          </div>
        )}

        {/* Insight — the AI-extracted interpretation */}
        <div className="border-t border-border pt-5 text-foreground leading-relaxed space-y-3">
          <h2 className="label">Insight</h2>
          {item.content
            .replace(/^#\s+.+$/m, "")
            .replace(/##\s*Source\s*Highlights?[\s\S]*?(?=\n##|$)/i, "")
            .replace(/##\s*Related\s*Concepts?[\s\S]*?(?=\n##|$)/i, "")
            .replace(/!\[\[.*?\]\]/g, "")
            .trim()
            .split("\n")
            .filter((line) => line.trim() !== "" && !line.startsWith("## "))
            .map((line, i) => (
              <p key={i} className="text-sm leading-relaxed">
                {line.replace(/^[-*]\s*/, "")}
              </p>
            ))}
        </div>

        {/* Related Concepts */}
        {item.relatedConcepts.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {item.relatedConcepts.map((concept) => (
              <span
                key={concept}
                className="text-xs px-2 py-1 border border-border text-muted rounded-sm"
              >
                {concept}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons — pass SHA + rawContent so action skips the API read */}
      <div className="flex gap-3">
        <form action={reviewAction} className="flex-1">
          <input type="hidden" name="path" value={currentPath} />
          <input type="hidden" name="action" value="approve" />
          <input type="hidden" name="returnTo" value={nextForAction} />
          <input type="hidden" name="sha" value={item.sha} />
          <input type="hidden" name="rawContent" value={item.rawContent} />
          <button type="submit" className="btn btn-approve w-full text-lg">
            Approve
          </button>
        </form>

        <form action={reviewAction} className="flex-1">
          <input type="hidden" name="path" value={currentPath} />
          <input type="hidden" name="action" value="contest" />
          <input type="hidden" name="returnTo" value={nextForAction} />
          <input type="hidden" name="sha" value={item.sha} />
          <input type="hidden" name="rawContent" value={item.rawContent} />
          <button type="submit" className="btn btn-contest w-full text-lg">
            Contest
          </button>
        </form>
      </div>

      {nextPath && (
        <div className="text-center">
          <Link
            href={`/review/card?path=${encodeURIComponent(nextPath)}`}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Skip for now &rarr;
          </Link>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        {prevPath ? (
          <Link
            href={`/review/card?path=${encodeURIComponent(prevPath)}`}
            className="btn btn-nav"
          >
            &larr; Prev
          </Link>
        ) : (
          <div />
        )}
        {nextPath ? (
          <Link
            href={`/review/card?path=${encodeURIComponent(nextPath)}`}
            className="btn btn-nav"
          >
            Next &rarr;
          </Link>
        ) : (
          <Link href="/review" className="btn btn-nav">
            Done
          </Link>
        )}
      </div>
    </div>
  );
}
