import { listFiles, getFileContent } from "./github";
import { parseFrontmatter, extractTitle } from "./parser";

export interface GraphNode {
  id: string;
  title: string;
  tags: string[];
  excerpt: string;
  folder: string;
  linkCount: number;
  isOrphan: boolean;
  color: string;
  slug: string;
  type: "concept" | "idea";
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  stats: {
    totalNotes: number;
    totalLinks: number;
    orphanCount: number;
    tagCounts: Record<string, number>;
  };
}

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function buildGraphData(): Promise<GraphData> {
  // Fetch concept and idea files
  const conceptPaths = await listFiles("30 Concept", "force-cache");
  const ideaPaths = await listFiles("20 Ideas", "force-cache");

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const tagCounts: Record<string, number> = {};
  const fileIndex = new Map<string, string>(); // filename -> node id

  // Process concepts — always public (structural wiki pages, not AI-generated)
  for (const path of conceptPaths) {
    const file = await getFileContent(path, "force-cache");
    if (!file) continue;

    const { frontmatter, content } = parseFrontmatter(file.content);

    const title = extractTitle(content, path);
    const filename = path.split("/").pop()?.replace(".md", "") || "";
    const id = `concept:${slugify(filename)}`;
    const slug = slugify(filename);

    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }

    const excerpt = content
      .replace(/^#.+$/m, "")
      .replace(/---[\s\S]*?---/, "")
      .trim()
      .slice(0, 120);

    nodes.push({
      id,
      title,
      tags,
      excerpt,
      folder: "Concepts",
      linkCount: 0,
      isOrphan: true,
      color: "",
      slug,
      type: "concept",
    });

    fileIndex.set(filename.toLowerCase(), id);
  }

  // Process ideas (only reviewed)
  for (const path of ideaPaths) {
    const file = await getFileContent(path, "force-cache");
    if (!file) continue;

    const { frontmatter, content } = parseFrontmatter(file.content);

    if (frontmatter.review_status !== "reviewed") {
      continue;
    }

    const title = extractTitle(content, path);
    const filename = path.split("/").pop()?.replace(".md", "") || "";
    const id = `idea:${slugify(filename)}`;
    const slug = slugify(filename);

    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }

    const excerpt = content
      .replace(/^#.+$/m, "")
      .trim()
      .slice(0, 120);

    nodes.push({
      id,
      title,
      tags,
      excerpt,
      folder: "Ideas",
      linkCount: 0,
      isOrphan: true,
      color: "",
      slug,
      type: "idea",
    });

    fileIndex.set(filename.toLowerCase(), id);
  }

  // Extract wikilinks and build edges
  const allPaths = [...conceptPaths, ...ideaPaths];
  for (const path of allPaths) {
    const file = await getFileContent(path, "force-cache");
    if (!file) continue;

    const filename = path.split("/").pop()?.replace(".md", "") || "";
    const sourceId = fileIndex.get(filename.toLowerCase());
    if (!sourceId) continue;

    let match;
    WIKILINK_RE.lastIndex = 0;
    while ((match = WIKILINK_RE.exec(file.content)) !== null) {
      const linkTarget = match[1].split("/").pop() || match[1];
      const targetId = fileIndex.get(linkTarget.toLowerCase());
      if (targetId && targetId !== sourceId) {
        links.push({ source: sourceId, target: targetId });
      }
    }
  }

  // Update link counts and orphan status
  const linkCountMap = new Map<string, number>();
  for (const link of links) {
    linkCountMap.set(link.source, (linkCountMap.get(link.source) || 0) + 1);
    linkCountMap.set(link.target, (linkCountMap.get(link.target) || 0) + 1);
  }

  for (const node of nodes) {
    node.linkCount = linkCountMap.get(node.id) || 0;
    node.isOrphan = node.linkCount === 0;
  }

  const orphanCount = nodes.filter((n) => n.isOrphan).length;

  return {
    nodes,
    links,
    stats: {
      totalNotes: nodes.length,
      totalLinks: links.length,
      orphanCount,
      tagCounts,
    },
  };
}
