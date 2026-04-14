import Link from "next/link";
import { buildGraphData } from "@/lib/graph";
import { parsePipelineFeed } from "@/lib/content";
import GraphSection from "./components/GraphSection";
import PipelineDiagram from "./components/PipelineDiagram";

export const revalidate = 900; // ISR: 15 minutes

export default async function Home() {
  const [graphData, feedEntries] = await Promise.all([
    buildGraphData(),
    parsePipelineFeed(),
  ]);

  const reviewedCount = graphData.nodes.length;
  const totalLinks = graphData.stats.totalLinks;

  return (
    <div className="space-y-8">
      <div>
        <p className="label mb-2">Second Brain</p>
        <h1 className="text-3xl font-heading tracking-tight">
          Heqing&apos;s Knowledge Base
        </h1>
        <p className="text-muted text-sm mt-2">
          150+ books processed through an AI-assisted extraction pipeline.
          Human-reviewed.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-2xl font-heading text-accent">
            {reviewedCount}
          </span>
          <span className="text-muted ml-1">reviewed</span>
        </div>
        <div>
          <span className="text-2xl font-heading text-accent">
            {totalLinks}
          </span>
          <span className="text-muted ml-1">connections</span>
        </div>
      </div>

      {/* Knowledge Graph */}
      <GraphSection data={graphData} />

      {/* Pipeline Feed */}
      {feedEntries.length > 0 && (
        <div>
          <p className="label mb-3">Pipeline Feed</p>
          <div className="space-y-0">
            {feedEntries.map((entry, i) => (
              <div key={i} className="py-3 border-b border-border">
                <span className="text-xs text-muted font-mono">
                  {entry.date}
                </span>
                <div className="text-sm mt-1">
                  {entry.text}
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block ml-2 text-xs px-1.5 py-0.5 border border-border rounded text-muted font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Architecture */}
      <div>
        <p className="label mb-3">How It Works</p>
        <PipelineDiagram />
      </div>

      {/* Footer links */}
      <div className="border-t border-border pt-4 text-sm text-muted space-x-4">
        <Link
          href="/login"
          className="hover:text-foreground transition-colors"
        >
          Review Mode
        </Link>
        <a
          href="https://heqinghuang.com"
          className="hover:text-foreground transition-colors"
        >
          Blog
        </a>
      </div>
    </div>
  );
}
